const express = require('express');
const router = express.Router();
const { handleVote } = require('../controllers/votesController');
const { voteLimiter } = require('../middleware/rateLimiter');
const { checkIPLimit } = require('../middleware/ipTracker');

router.post('/vote', voteLimiter, checkIPLimit, handleVote);

module.exports = router;
