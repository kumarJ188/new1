const express = require('express');
const path = require('path');
const multer = require('multer');
const { authRequired } = require('../middleware/auth');
const { listCommunityEvents, createEvent, rsvp, volunteer } = require('../controllers/eventController');

const router = express.Router({ mergeParams: true });

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (_req, file, cb) {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({ storage });

router.use(authRequired);

router.get('/', listCommunityEvents);
router.post('/', upload.single('image'), createEvent);
router.post('/:eventId/rsvp', rsvp);
router.post('/:eventId/volunteer', volunteer);

module.exports = router;
