// restapi.js
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const PORT = 3000;
const LOCK_TTL_MS = 60 * 1000; // 1 minute lock TTL

/*
 Seat model (in-memory):
  - id: number
  - label: string (e.g., "A1")
  - state: "available" | "locked" | "booked"
  - lock: { userId, expiresAt (ms since epoch), timeoutId } | null
  - bookedBy: userId | null
*/
let seats = [];
const ROWS = 3;
const COLS = 6;
let nextSeatId = 1;

// Initialize seats (for demo)
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    seats.push({
      id: nextSeatId++,
      label: String.fromCharCode(65 + r) + (c + 1),
      state: "available",
      lock: null,
      bookedBy: null,
    });
  }
}

// Helper functions
function findSeat(id) {
  return seats.find((s) => s.id === id);
}

function releaseLock(seat) {
  if (!seat.lock) return;
  if (seat.lock.timeoutId) {
    clearTimeout(seat.lock.timeoutId);
  }
  seat.lock = null;
  if (seat.state === "locked") {
    seat.state = "available";
  }
}

// API Endpoints

// 1) View all seats
app.get("/seats", (req, res) => {
  // Return seat info but don't leak internal timeoutId
  const result = seats.map((s) => ({
    id: s.id,
    label: s.label,
    state: s.state,
    lock: s.lock
      ? { userId: s.lock.userId, expiresAt: s.lock.expiresAt }
      : null,
    bookedBy: s.bookedBy,
  }));
  res.json({ seats: result });
});

// 2) View a specific seat
app.get("/seats/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const seat = findSeat(id);
  if (!seat) return res.status(404).json({ error: "Seat not found." });
  res.json({
    id: seat.id,
    label: seat.label,
    state: seat.state,
    lock: seat.lock ? { userId: seat.lock.userId, expiresAt: seat.lock.expiresAt } : null,
    bookedBy: seat.bookedBy,
  });
});

// 3) Lock a seat temporarily for a user
// body: { userId: "user1" }
app.post("/seats/:id/lock", (req, res) => {
  const id = parseInt(req.params.id);
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required in body." });

  const seat = findSeat(id);
  if (!seat) return res.status(404).json({ error: "Seat not found." });

  // If seat is booked, cannot lock
  if (seat.state === "booked") {
    return res.status(409).json({ error: `Seat ${seat.label} is already booked by '${seat.bookedBy}'.` });
  }

  // If locked by same user, extend lock TTL (optional behavior)
  if (seat.state === "locked") {
    if (seat.lock && seat.lock.userId === userId) {
      // extend lock
      if (seat.lock.timeoutId) clearTimeout(seat.lock.timeoutId);
      seat.lock.expiresAt = Date.now() + LOCK_TTL_MS;
      seat.lock.timeoutId = setTimeout(() => {
        // expire lock
        if (seat.lock && seat.lock.expiresAt <= Date.now()) {
          releaseLock(seat);
          console.log(`Lock expired (auto) for seat ${seat.label}`);
        }
      }, LOCK_TTL_MS);
      return res.json({ message: `Lock extended for seat ${seat.label} by '${userId}'.`, lock: { expiresAt: seat.lock.expiresAt } });
    } else {
      return res.status(409).json({ error: `Seat ${seat.label} is already locked by another user.` });
    }
  }

  // Otherwise lock the seat
  seat.state = "locked";
  seat.lock = {
    userId,
    expiresAt: Date.now() + LOCK_TTL_MS,
    timeoutId: null,
  };
  seat.lock.timeoutId = setTimeout(() => {
    if (seat.lock && seat.lock.expiresAt <= Date.now()) {
      releaseLock(seat);
      console.log(`Lock expired (auto) for seat ${seat.label}`);
    }
  }, LOCK_TTL_MS);

  res.json({
    message: `Seat ${seat.label} locked for user '${userId}' for ${LOCK_TTL_MS / 1000} seconds.`,
    seat: { id: seat.id, label: seat.label, state: seat.state, lock: { userId: seat.lock.userId, expiresAt: seat.lock.expiresAt } },
  });
});

// 4) Confirm booking (finalize) - only by the user who holds lock
// body: { userId: "user1" }
app.post("/seats/:id/confirm", (req, res) => {
  const id = parseInt(req.params.id);
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required in body." });

  const seat = findSeat(id);
  if (!seat) return res.status(404).json({ error: "Seat not found." });

  if (seat.state === "booked") {
    return res.status(409).json({ error: `Seat ${seat.label} is already booked by '${seat.bookedBy}'.` });
  }

  if (seat.state !== "locked" || !seat.lock) {
    return res.status(409).json({ error: `Seat ${seat.label} is not locked. Please lock the seat before confirming.` });
  }

  if (seat.lock.userId !== userId) {
    return res.status(403).json({ error: `You ('${userId}') do not hold the lock for seat ${seat.label}. Locked by '${seat.lock.userId}'.` });
  }

  // Confirm booking
  if (seat.lock.timeoutId) clearTimeout(seat.lock.timeoutId);
  seat.lock = null;
  seat.state = "booked";
  seat.bookedBy = userId;

  res.json({ message: `Seat ${seat.label} successfully booked by '${userId}'.`, seat: { id: seat.id, label: seat.label, state: seat.state, bookedBy: seat.bookedBy } });
});

// 5) Release lock manually (optional) - body: { userId }
app.post("/seats/:id/release", (req, res) => {
  const id = parseInt(req.params.id);
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required in body." });

  const seat = findSeat(id);
  if (!seat) return res.status(404).json({ error: "Seat not found." });

  if (seat.state !== "locked" || !seat.lock) {
    return res.status(409).json({ error: `Seat ${seat.label} is not locked.` });
  }

  if (seat.lock.userId !== userId) {
    return res.status(403).json({ error: `You ('${userId}') do not hold the lock for seat ${seat.label}. Locked by '${seat.lock.userId}'.` });
  }

  releaseLock(seat);
  res.json({ message: `Lock released for seat ${seat.label} by '${userId}'.`, seat: { id: seat.id, label: seat.label, state: seat.state } });
});

// Start server AND optionally run test simulation if "test" argument provided
const server = app.listen(PORT, async () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  if (process.argv[2] === "test") {
    // Wait a small moment for the server to be fully ready, then run simulation
    await new Promise((r) => setTimeout(r, 200));
    simulateConcurrencyTest();
  }
});

/* -----------------------------
   Simulation of concurrent requests
   -----------------------------
   This function demonstrates concurrent clients trying to lock the same seat.
   It will:
    - spawn N "clients" that simultaneously call POST /seats/:id/lock
    - print results showing only one can lock successfully, others get 409
    - then the locking client will confirm (book) the seat
*/
async function simulateConcurrencyTest() {
  console.log("\n--- Running concurrency test simulation ---");

  const fetch = global.fetch || require("node-fetch"); // use global fetch if available (node 18+), else node-fetch if installed
  const seatToTest = seats[0]; // test seat 1
  const seatId = seatToTest.id;
  const clients = ["alice", "bob", "carol", "dave", "eve"];

  console.log(`Attempting to concurrently lock seat ${seatToTest.label} (id ${seatId}) by clients: ${clients.join(", ")}`);

  // Make concurrent lock requests
  const lockPromises = clients.map((userId) =>
    fetch(`http://localhost:${PORT}/seats/${seatId}/lock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then(async (r) => ({ userId, status: r.status, body: await r.json() }))
      .catch((err) => ({ userId, error: err.message }))
  );

  const lockResults = await Promise.all(lockPromises);

  lockResults.forEach((r) => {
    if (r.error) {
      console.log(`[${r.userId}] ERROR: ${r.error}`);
    } else {
      console.log(`[${r.userId}] status=${r.status} response=`, r.body);
    }
  });

  // Find who locked successfully
  const success = lockResults.find((r) => r.status === 200 || r.status === 201);
  if (!success) {
    console.log("No client was able to lock the seat. Perhaps it was already booked/locked.");
    return;
  }
  const lockingUser = success.userId;
  console.log(`\n-> Client '${lockingUser}' acquired the lock. Now confirming the booking...`);

  // Confirm booking by locking user
  const confirmResp = await fetch(`http://localhost:${PORT}/seats/${seatId}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: lockingUser }),
  });
  console.log(`Confirm status=${confirmResp.status} body=`, await confirmResp.json());

  // Show final seat state
  const finalSeat = await (await fetch(`http://localhost:${PORT}/seats/${seatId}`)).json();
  console.log("\nFinal seat state:", finalSeat);

  console.log("\n--- Simulation complete ---\n");
}

/*
 Notes:
  - Locks auto-expire after LOCK_TTL_MS (60 seconds) via setTimeout. When they expire,
    the seat is released to "available".
  - The example simulation runs against the local server (http://localhost:3000).
  - If your Node version is < 18 and you don't have node-fetch installed, install it:
      npm install node-fetch
    Or run the server only and use curl/postman to test.
  - To run only the server: node restapi.js
  - To run server + simulation: node restapi.js test
*/

module.exports = { app, server }; // exported for possible external tests
