const Community = require('../models/Community');
const Membership = require('../models/Membership');

async function requestJoin(req, res) {
  const { communityId } = req.body;
  if (!communityId) return res.status(400).json({ message: 'communityId required' });

  const community = await Community.findById(communityId);
  if (!community) return res.status(404).json({ message: 'Community not found' });
  if (community.status !== 'approved') return res.status(403).json({ message: 'Community not approved' });

  const existing = await Membership.findOne({ user: req.auth.sub, community: communityId });
  if (existing?.status === 'approved') return res.json({ membership: existing });
  if (existing?.status === 'pending') return res.json({ membership: existing });

  const membership = await Membership.create({ user: req.auth.sub, community: communityId, status: 'pending' });
  return res.status(201).json({ membership });
}

async function listMyMemberships(req, res) {
  const memberships = await Membership.find({ user: req.auth.sub }).populate('community');
  return res.json({ memberships });
}

async function listPendingForCommunity(req, res) {
  const community = await Community.findById(req.params.communityId);
  if (!community) return res.status(404).json({ message: 'Community not found' });

  const isSuper = req.auth.role === 'super_admin';
  const isAdmin = community.admins.map(String).includes(String(req.auth.sub));
  const isModerator = community.moderators.map(String).includes(String(req.auth.sub));
  if (!isSuper && !isAdmin && !isModerator) return res.status(403).json({ message: 'Forbidden' });

  const memberships = await Membership.find({ community: community._id, status: 'pending' }).populate('user');
  return res.json({ memberships });
}

async function approveMembership(req, res) {
  const { communityId, memberId } = req.params;
  const community = await Community.findById(communityId);
  if (!community) return res.status(404).json({ message: 'Community not found' });

  const isSuper = req.auth.role === 'super_admin';
  const isAdmin = community.admins.map(String).includes(String(req.auth.sub));
  const isModerator = community.moderators.map(String).includes(String(req.auth.sub));
  if (!isSuper && !isAdmin && !isModerator) return res.status(403).json({ message: 'Forbidden' });

  const membership = await Membership.findOneAndUpdate(
    { user: memberId, community: communityId },
    { $set: { status: 'approved', joinedAt: new Date() } },
    { new: true }
  );
  if (!membership) return res.status(404).json({ message: 'Membership not found' });
  return res.json({ membership });
}

async function rejectMembership(req, res) {
  const { communityId, memberId } = req.params;
  const community = await Community.findById(communityId);
  if (!community) return res.status(404).json({ message: 'Community not found' });

  const isSuper = req.auth.role === 'super_admin';
  const isAdmin = community.admins.map(String).includes(String(req.auth.sub));
  const isModerator = community.moderators.map(String).includes(String(req.auth.sub));
  if (!isSuper && !isAdmin && !isModerator) return res.status(403).json({ message: 'Forbidden' });

  const membership = await Membership.findOneAndUpdate(
    { user: memberId, community: communityId },
    { $set: { status: 'rejected' } },
    { new: true }
  );
  if (!membership) return res.status(404).json({ message: 'Membership not found' });
  return res.json({ membership });
}

module.exports = {
  requestJoin,
  listMyMemberships,
  listPendingForCommunity,
  approveMembership,
  rejectMembership,
};
