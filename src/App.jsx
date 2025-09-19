import React, { useEffect, useMemo, useState } from "react";
import {
  AppBar, Box, Button, Card, CardContent, Container,
  Grid, IconButton, Stack, TextField, Toolbar, Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const pad = (n) => String(n).padStart(2, "0");

function diffParts(targetIso) {
  const now = new Date().getTime();
  const target = new Date(targetIso).getTime();
  const ms = Math.max(target - now, 0);
  const sec = Math.floor(ms / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  return { ms, days, hours, minutes, seconds };
}

const loadEvents = () => {
  try { return JSON.parse(localStorage.getItem("events") || "[]"); }
  catch { return []; }
};
const saveEvents = (events) =>
  localStorage.setItem("events", JSON.stringify(events));

export default function App() {
  const [events, setEvents] = useState(loadEvents);
  const [name, setName] = useState("");
  const [when, setWhen] = useState("");
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => saveEvents(events), [events]);

  const upcoming = useMemo(
    () => [...events].sort(
      (a, b) => new Date(a.datetime) - new Date(b.datetime)
    ),
    [events]
  );

  const addEvent = () => {
    if (!name.trim()) return alert("Please enter an event name.");
    if (!when) return alert("Please choose date & time.");
    const iso = new Date(when).toISOString();
    setEvents((e) => [...e, { id: crypto.randomUUID(), name: name.trim(), datetime: iso }]);
    setName(""); setWhen("");
  };

  const removeEvent = (id) => setEvents((e) => e.filter((x) => x.id !== id));

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f7f7f7" }}>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Event Countdown App
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ pt: 4, pb: 6 }}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Create a countdown
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="Event name" value={name}
                onChange={(e) => setName(e.target.value)} fullWidth />
              <TextField label="Date & time" type="datetime-local" value={when}
                onChange={(e) => setWhen(e.target.value)}
                InputLabelProps={{ shrink: true }} fullWidth />
              <Button variant="contained" size="large" onClick={addEvent} sx={{ minWidth: 160 }}>
                Add
              </Button>
            </Stack>
            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
              Tip: data is saved in your browser (localStorage).
            </Typography>
          </CardContent>
        </Card>

        {upcoming.length === 0 ? (
          <Typography color="text.secondary">
            No countdowns yet. Add your first event above.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {upcoming.map((ev) => {
              const { days, hours, minutes, seconds, ms } = diffParts(ev.datetime);
              const past = ms === 0;
              return (
                <Grid item xs={12} sm={6} md={4} key={ev.id}>
                  <Card>
                    <CardContent>
                      <Stack direction="row" alignItems="start" justifyContent="space-between">
                        <Box>
                          <Typography variant="h6">{ev.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(ev.datetime).toLocaleString()}
                          </Typography>
                        </Box>
                        <IconButton aria-label="delete" onClick={() => removeEvent(ev.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>

                      <Box sx={{ mt: 2 }}>
                        {past ? (
                          <Typography variant="h5" color="success.main">🎉 It’s time!</Typography>
                        ) : (
                          <Stack direction="row" spacing={2}>
                            <TimeBox label="Days" value={days} />
                            <TimeBox label="Hours" value={pad(hours)} />
                            <TimeBox label="Min" value={pad(minutes)} />
                            <TimeBox label="Sec" value={pad(seconds)} />
                          </Stack>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

function TimeBox({ label, value }) {
  return (
    <Box sx={{ textAlign: "center", px: 2, py: 1, borderRadius: 2, bgcolor: "grey.100", minWidth: 70 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
  );
}
