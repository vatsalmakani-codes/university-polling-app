const Poll = require('../models/pollModel');
const Vote = require('../models/voteModel');
const Feedback = require('../models/feedbackModel');

// Helper function to auto-close expired polls
const autoCloseExpiredPolls = async () => {
  const now = new Date();
  await Poll.updateMany(
    { expiresAt: { $lt: now }, status: 'ACTIVE' },
    { $set: { status: 'CLOSED' } }
  );
};

exports.getAllPolls = async (req, res) => {
  try {
    await autoCloseExpiredPolls(); // Auto-close expired polls first
    
    const now = new Date();
    const audienceFilter = ['super-admin', 'sub-admin'].includes(req.user.role)
      ? {}
      : req.user.role === 'student'
      ? { targetAudience: { $in: ['STUDENT', 'ALL'] } }
      : { targetAudience: { $in: ['FACULTY', 'ALL'] } };

    const polls = await Poll.find(audienceFilter).sort({ createdAt: -1 }).populate('createdBy', 'name').lean();
    const userVotes = await Vote.find({ user: req.user.id });
    const votedPollIds = new Set(userVotes.map(vote => vote.poll.toString()));

    const pollsWithVoteStatus = polls.map(poll => {
      const isAdmin = ['super-admin', 'sub-admin'].includes(req.user.role);
      let sanitizedOptions = poll.options;
      if (!isAdmin && !poll.resultsPublished) {
        sanitizedOptions = poll.options.map(opt => ({ _id: opt._id, optionText: opt.optionText }));
      }
      return {
        ...poll,
        options: sanitizedOptions,
        hasVoted: votedPollIds.has(poll._id.toString()),
        isExpired: new Date(poll.expiresAt) < now,
      };
    });
    res.json(pollsWithVoteStatus);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getPollById = async (req, res) => {
  try {
    await autoCloseExpiredPolls(); // Ensure status is up-to-date
    
    const poll = await Poll.findById(req.params.id).populate('createdBy', 'name');
    if (!poll) return res.status(404).json({ msg: 'Poll not found' });

    const [vote, feedback] = await Promise.all([
      Vote.findOne({ user: req.user.id, poll: req.params.id }),
      Feedback.findOne({ user: req.user.id, poll: req.params.id })
    ]);
    const hasSubmittedFeedback = !!feedback;
    
    const isAdmin = ['super-admin', 'sub-admin'].includes(req.user.role);
    if (!isAdmin && !poll.resultsPublished) {
      const pollData = poll.toObject();
      const optionsWithoutVotes = pollData.options.map(({ votes, ...rest }) => rest);
      const sanitizedPoll = { ...pollData, options: optionsWithoutVotes };
      return res.json({ poll: sanitizedPoll, userVote: vote ? vote.selectedOptions : [], resultsHidden: true, hasSubmittedFeedback });
    }
    
    res.json({ poll, userVote: vote ? vote.selectedOptions : [], resultsHidden: false, hasSubmittedFeedback });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};


/**
 * @desc    Cast a vote on a poll
 * @route   POST /api/polls/:id/vote
 */
exports.voteOnPoll = async (req, res) => {
  const { optionIds } = req.body;
  if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
    return res.status(400).json({ msg: 'Please select an option.' });
  }

  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ msg: 'Poll not found' });
    if (poll.status === 'CLOSED') return res.status(400).json({ msg: 'This poll is closed for voting.' });
    if (new Date(poll.expiresAt) < new Date()) return res.status(400).json({ msg: 'The deadline for this poll has passed.' });
    if (poll.pollType === 'SINGLE_CHOICE' && optionIds.length > 1) return res.status(400).json({ msg: 'Only one option is allowed.' });
    if (await Vote.findOne({ user: req.user.id, poll: req.params.id })) return res.status(400).json({ msg: 'You have already voted.' });

    const newVote = new Vote({ user: req.user.id, poll: req.params.id, selectedOptions: optionIds });
    await newVote.save();
    
    poll.options.forEach(opt => {
      if(optionIds.includes(opt._id.toString())) {
        opt.votes += 1;
      }
    });
    await poll.save();
    
    req.io.to(req.params.id).emit('vote-update', poll);
    res.json(poll);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get the voting history for the logged-in student
 * @route   GET /api/polls/history/my-votes
 */
exports.getMyVoteHistory = async (req, res) => {
  try {
    const votes = await Vote.find({ user: req.user.id }).populate('poll', 'question options').sort({_id: -1});
    const history = votes.map(vote => {
      if (!vote.poll) return null;
      const votedForTexts = vote.selectedOptions.map(votedId => {
        const selectedOption = vote.poll.options.find(opt => opt._id.equals(votedId));
        return selectedOption ? selectedOption.optionText : '[Deleted Option]';
      });
      return { pollQuestion: vote.poll.question, votedFor: votedForTexts.join(', '), pollId: vote.poll._id };
    }).filter(Boolean);
    res.json(history);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get all polls created by the logged-in faculty/admin
 * @route   GET /api/polls/history/my-polls
 */
exports.getMyCreatedPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    const formattedPolls = polls.map(p => ({ 
        pollQuestion: p.question, 
        status: p.status, 
        resultsPublished: p.resultsPublished,
        pollId: p._id 
    }));
    res.json(formattedPolls);
  } catch(err) {
    res.status(500).send('Server Error');
  }
};