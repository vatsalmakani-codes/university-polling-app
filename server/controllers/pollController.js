const Poll = require('../models/pollModel');
const Vote = require('../models/voteModel');

/**
 * @desc    Get all polls visible to the current user based on their role
 * @route   GET /api/polls
 */
exports.getAllPolls = async (req, res) => {
  try {
    const now = new Date();
    const audienceFilter = req.user.role === 'student'
      ? { targetAudience: { $in: ['STUDENT', 'ALL'] } }
      : req.user.role === 'faculty'
      ? { targetAudience: { $in: ['FACULTY', 'ALL'] } }
      : {}; // Admins see all polls

    const polls = await Poll.find(audienceFilter).sort({ createdAt: -1 }).populate('createdBy', 'name').lean();
    const userVotes = await Vote.find({ user: req.user.id });
    const votedPollIds = new Set(userVotes.map(vote => vote.poll.toString()));

    const pollsWithVoteStatus = polls.map(poll => ({
      ...poll,
      hasVoted: votedPollIds.has(poll._id.toString()),
      isExpired: new Date(poll.expiresAt) < now,
    }));
    res.json(pollsWithVoteStatus);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get a single poll's details, respecting result publication rules
 * @route   GET /api/polls/:id
 */
exports.getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate('createdBy', 'name');
    if (!poll) {
      return res.status(404).json({ msg: 'Poll not found' });
    }

    const vote = await Vote.findOne({ user: req.user.id, poll: req.params.id });

    // Admins can always see results. Others can only see if results are published.
    if (req.user.role !== 'admin' && !poll.resultsPublished) {
      // Create a plain JavaScript object from the Mongoose document
      const pollData = poll.toObject();

      // Create a new options array that does NOT contain the 'votes' field
      // This uses object destructuring to exclude 'votes' from each option
      const optionsWithoutVotes = pollData.options.map(({ votes, ...rest }) => rest);
      
      // Construct a new poll object to send back, keeping all top-level fields
      // but replacing the original 'options' with our sanitized version.
      const sanitizedPoll = {
        ...pollData, // This includes _id, question, createdBy, pollType, etc.
        options: optionsWithoutVotes, // This overwrites the options with the version without vote counts
      };
      
      return res.json({ 
        poll: sanitizedPoll, 
        userVote: vote ? vote.selectedOptions : [], 
        resultsHidden: true 
      });
    }
    
    // If results are public or user is admin, send the full poll object
    res.json({ poll, userVote: vote ? vote.selectedOptions : [] });
  } catch (err) {
    console.error(err.message);
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
    if (poll.pollType === 'SINGLE_CHOICE' && optionIds.length > 1) return res.status(400).json({ msg: 'Only one option is allowed for this poll type.' });
    if (await Vote.findOne({ user: req.user.id, poll: req.params.id })) return res.status(400).json({ msg: 'You have already voted on this poll.' });

    const newVote = new Vote({
      user: req.user.id,
      poll: req.params.id,
      selectedOptions: optionIds,
    });
    await newVote.save();
    
    const updatedOptions = poll.options.map(opt => {
      if(optionIds.includes(opt._id.toString())) {
        opt.votes += 1;
      }
      return opt;
    });
    poll.options = updatedOptions;
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

      return {
        pollQuestion: vote.poll.question,
        votedFor: votedForTexts.join(', '),
        pollId: vote.poll._id
      }
    }).filter(Boolean);

    res.json(history);
  } catch (err) {
    console.error(err.message);
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
        pollId: p._id 
    }));
    
    res.json(formattedPolls);
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};