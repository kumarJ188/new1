const express = require('express');
const { authRequired } = require('../middleware/auth');
const {
  requestJoin,
  listMyMemberships,
  listPendingForCommunity,
  approveMembership,
  rejectMembership,
} = require('../controllers/membershipController');

const router = express.Router();

router.use(authRequired);

router.post('/request', requestJoin);
router.get('/mine', listMyMemberships);

router.get('/community/:communityId/pending', listPendingForCommunity);
router.post('/community/:communityId/member/:memberId/approve', approveMembership);
router.post('/community/:communityId/member/:memberId/reject', rejectMembership);

module.exports = router;
