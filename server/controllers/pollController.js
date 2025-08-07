const Poll = require('../models/pollModel');
const Vote = require('../models/voteModel');

/**
 * @desc    Create a new poll
 * @route   POST /api/polls
 * @access  Private (Faculty only)
 */
exports.createPoll = async (req, res) => {
  const { question, options, pollType } = req.body;
  try {
    const newPoll = new Poll({
      question,
      options: options.map(optionText => ({ optionText, votes: 0 })),
      createdBy: req.user.id,
      pollType, // Can be 'SINGLE_CHOICE' or 'MULTIPLE_CHOICE'
    });
    const poll = await newPoll.save();
    res.status(201).json(poll);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get all polls with user's vote status
 * @route   GET /api/polls
 * @access  Private
 */
exports.getAllPolls = async (req, res) => {
  try {
    // .lean() returns plain JS objects, which is faster for read-only operations
    const polls = await Poll.find().sort({ createdAt: -1 }).populate('createdBy', 'name').lean();

    // Find all votes cast by the current user
    const userVotes = await Vote.find({ user: req.user.id });
    
    // Create a Set of poll IDs for quick O(1) lookup
    const votedPollIds = new Set(userVotes.map(vote => vote.poll.toString()));

    // Add a `hasVoted` property to each poll object
    const pollsWithVoteStatus = polls.map(poll => ({
      ...poll,
      hasVoted: votedPollIds.has(poll._id.toString()),
    }));

    res.json(pollsWithVoteStatus);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get a single poll by ID
 * @route   GET /api/polls/:id
 * @access  Private
 */
exports.getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate('createdBy', 'name');
    if (!poll) {
      return res.status(404).json({ msg: 'Poll not found' });
    }

    // Find the specific vote for this user and this poll
    const vote = await Vote.findOne({ user: req.user.id, poll: req.params.id });

    // Return the poll and an array of selected option IDs if the user has voted
    res.json({ poll, userVote: vote ? vote.selectedOptions : [] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Vote on a poll
 * @route   POST /api/polls/:id/vote
 * @access  Private (Students only)
 */
exports.voteOnPoll = async (req, res) => {
  // Expects an array of option IDs, e.g., { optionIds: ["...", "..."] }
  const { optionIds } = req.body;

  if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
    return res.status(400).json({ msg: 'Please select at least one option.' });
  }

  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ msg: 'Poll not found' });
    }

    // Server-side validation for poll type
    if (poll.pollType === 'SINGLE_CHOICE' && optionIds.length > 1) {
      return res.status(400).json({ msg: 'Only one option is allowed for this poll type.' });
    }

    // Check if user has already voted
    const alreadyVoted = await Vote.findOne({ user: req.user.id, poll: req.params.id });
    if (alreadyVoted) {
      return res.status(400).json({ msg: 'You have already voted on this poll.' });
    }

    // Create the new vote record
    const newVote = new Vote({
      user: req.user.id,
      poll: req.params.id,
      selectedOptions: optionIds,
    });
    await newVote.save();

    // Increment the vote count for each selected option in the poll document
    optionIds.forEach(optionId => {
      const option = poll.options.id(optionId);
      if (option) {
        option.votes += 1;
      }
    });
    
    await poll.save();
    
    res.json(poll);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Delete a poll
 * @route   DELETE /api/polls/:id
 * @access  Private (Admin or Poll Creator)
 */
exports.deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ msg: 'Poll not found' });
    }

    // Authorization check: User must be an admin or the person who created the poll
    if (req.user.role !== 'admin' && poll.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Delete the poll itself
    await poll.deleteOne();
    
    // IMPORTANT: Also delete all votes associated with this poll to keep DB clean
    await Vote.deleteMany({ poll: req.params.id });

    res.json({ msg: 'Poll and associated votes removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get the voting history for the logged-in user
 * @route   GET /api/polls/history/my-votes
 * @access  Private (Students only)
 */
exports.getMyVoteHistory = async (req, res) => {
  try {
    const votes = await Vote.find({ user: req.user.id })
      .populate({
          path: 'poll',
          select: 'question options',
      })
      .sort({_id: -1});

    // Format the response to be easy for the frontend to consume
    const history = votes.map(vote => {
      const poll = vote.poll;
      // Handle cases where the poll might have been deleted after the vote was cast
      if (!poll) {
        return {
          pollQuestion: 'This poll has been deleted.',
          votedFor: 'N/A',
          pollId: vote.poll // will be the ID
        };
      }
      
      // Map over the array of selected options to get their text
      const votedForTexts = vote.selectedOptions.map(votedId => {
        const selectedOption = poll.options.find(opt => opt._id.equals(votedId));
        return selectedOption ? selectedOption.optionText : '[Deleted Option]';
      });

      return {
        pollQuestion: poll.question,
        votedFor: votedForTexts.join(', '), // Join multiple answers with a comma
        pollId: poll._id
      }
    });

    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};