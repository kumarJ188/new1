import { Alert, Box, Button, Divider, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  useCreateEventMutation,
  useCreatePostMutation,
  useLikePostMutation,
  useListEventsQuery,
  useListPostsQuery,
  useRsvpMutation,
  useVolunteerMutation,
} from "@state/api";

function TabPanel({ value, index, children }) {
  if (value !== index) return null;
  return <Box mt={2}>{children}</Box>;
}

export default function CommunityDetail() {
  const { id: communityId } = useParams();
  const [tab, setTab] = useState(0);

  const postsQ = useListPostsQuery(communityId);
  const eventsQ = useListEventsQuery(communityId);

  const [createPost] = useCreatePostMutation();
  const [likePost] = useLikePostMutation();

  const [createEvent] = useCreateEventMutation();
  const [rsvp] = useRsvpMutation();
  const [volunteer] = useVolunteerMutation();

  const [postText, setPostText] = useState("");

  const [eventTitle, setEventTitle] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventDate, setEventDate] = useState("");

  const postsError = postsQ.error?.data?.message;
  const eventsError = eventsQ.error?.data?.message;

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={700}>Community</Typography>
      <Typography variant="body2" color="text.secondary">Community ID: {communityId}</Typography>

      <Box mt={2}>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)}>
          <Tab label="Posts" />
          <Tab label="Events" />
        </Tabs>
        <Divider />

        <TabPanel value={tab} index={0}>
          {postsError ? <Alert severity="warning" sx={{ mb: 2 }}>{postsError}</Alert> : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mb={2}>
            <TextField
              fullWidth
              label="Write a post"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={async () => {
                await createPost({ communityId, text: postText }).unwrap();
                setPostText("");
              }}
              disabled={!postText.trim()}
            >
              Post
            </Button>
          </Stack>

          <Stack spacing={2}>
            {(postsQ.data?.posts || []).map((p) => (
              <Box key={p._id} p={2} borderRadius={2} bgcolor="background.alt">
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography fontWeight={700}>{p.author?.name || "Unknown"}</Typography>
                  <Typography variant="caption" color="text.secondary">{new Date(p.createdAt).toLocaleString()}</Typography>
                </Stack>
                <Typography whiteSpace="pre-wrap">{p.text}</Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  <Button size="small" variant="outlined" onClick={() => likePost({ communityId, postId: p._id })}>
                    Like ({p.likes?.length || 0})
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          {eventsError ? <Alert severity="warning" sx={{ mb: 2 }}>{eventsError}</Alert> : null}

          <Box p={2} borderRadius={2} bgcolor="background.alt" mb={2}>
            <Typography fontWeight={700} mb={1}>Create event</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mb={1}>
              <TextField fullWidth label="Title" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
              <TextField fullWidth label="Venue" value={eventVenue} onChange={(e) => setEventVenue(e.target.value)} />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                fullWidth
                label="Date/Time (ISO or any date string)"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={async () => {
                  await createEvent({
                    communityId,
                    payload: { title: eventTitle, venue: eventVenue, date: eventDate },
                  }).unwrap();
                  setEventTitle("");
                  setEventVenue("");
                  setEventDate("");
                }}
                disabled={!eventTitle.trim() || !eventVenue.trim() || !eventDate.trim()}
              >
                Create
              </Button>
            </Stack>
          </Box>

          <Stack spacing={2}>
            {(eventsQ.data?.events || []).map((ev) => (
              <Box key={ev._id} p={2} borderRadius={2} bgcolor="background.alt">
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography fontWeight={700}>{ev.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{new Date(ev.date).toLocaleString()}</Typography>
                </Stack>
                <Typography>{ev.venue}</Typography>
                {ev.description ? <Typography mt={1}>{ev.description}</Typography> : null}
                <Stack direction="row" spacing={1} mt={1}>
                  <Button size="small" variant="outlined" onClick={() => rsvp({ communityId, eventId: ev._id })}>
                    RSVP ({ev.attendees?.length || 0})
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => volunteer({ communityId, eventId: ev._id })}>
                    Volunteer ({ev.volunteers?.length || 0})
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </TabPanel>
      </Box>
    </Box>
  );
}
