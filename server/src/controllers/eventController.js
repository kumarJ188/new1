const { z } = require('zod');
const Community = require('../models/Community');
const Membership = require('../models/Membership');
const Event = require('../models/Event');

async function requireApprovedMember(userId, communityId) {
  const community = await Community.findById(communityId);
  if (!community) return { ok: false, status: 404, message: 'Community not found' };
  if (community.status !== 'approved') return { ok: false, status: 403, message: 'Community not approved' };
  const membership = await Membership.findOne({ user: userId, community: communityId, status: 'approved' });
  if (!membership) return { ok: false, status: 403, message: 'Membership required' };
  return { ok: true };
}

async function listCommunityEvents(req, res) {
  const { communityId } = req.params;
  const auth = await requireApprovedMember(req.auth.sub, communityId);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  const events = await Event.find({ community: communityId }).sort({ date: 1 }).limit(200);
  return res.json({ events });
}

const createSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(5000).optional().default(''),
  date: z.coerce.date(),
  venue: z.string().min(2).max(300),
  capacity: z.coerce.number().int().min(0).optional().default(0),
});

async function createEvent(req, res) {
  const { communityId } = req.params;
  const auth = await requireApprovedMember(req.auth.sub, communityId);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', errors: parsed.error.issues });

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || '');

  const event = await Event.create({
    community: communityId,
    createdBy: req.auth.sub,
    title: parsed.data.title,
    description: parsed.data.description,
    date: parsed.data.date,
    venue: parsed.data.venue,
    capacity: parsed.data.capacity,
    imageUrl,
    attendees: [],
    volunteers: [],
  });

  return res.status(201).json({ event });
}

async function rsvp(req, res) {
  const { communityId, eventId } = req.params;
  const auth = await requireApprovedMember(req.auth.sub, communityId);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  const event = await Event.findOne({ _id: eventId, community: communityId });
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const uid = String(req.auth.sub);
  const isAttending = event.attendees.map(String).includes(uid);

  if (isAttending) {
    event.attendees = event.attendees.filter((x) => String(x) !== uid);
  } else {
    if (event.capacity > 0 && event.attendees.length >= event.capacity) {
      return res.status(409).json({ message: 'Event capacity reached' });
    }
    event.attendees.push(req.auth.sub);
  }

  await event.save();
  return res.json({ attendeeCount: event.attendees.length, attending: !isAttending });
}

async function volunteer(req, res) {
  const { communityId, eventId } = req.params;
  const auth = await requireApprovedMember(req.auth.sub, communityId);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  const event = await Event.findOne({ _id: eventId, community: communityId });
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const uid = String(req.auth.sub);
  const isVol = event.volunteers.map(String).includes(uid);
  if (isVol) event.volunteers = event.volunteers.filter((x) => String(x) !== uid);
  else event.volunteers.push(req.auth.sub);
  await event.save();

  return res.json({ volunteerCount: event.volunteers.length, volunteering: !isVol });
}

module.exports = { listCommunityEvents, createEvent, rsvp, volunteer };
