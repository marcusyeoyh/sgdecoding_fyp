import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  stages: [
    { duration: "5m", target: 150 }, // Increase to 100 users
    { duration: "5m", target: 150 }, // Sustain 100 users
    { duration: "5m", target: 300 }, // Increase to 200 users
    { duration: "5m", target: 300 }, // Sustain 200 users
    { duration: "5m", target: 450 }, // Increase to 300 users
    { duration: "5m", target: 450 }, // Sustain 300 users
    { duration: "5m", target: 600 }, // Increase to 300 users
    { duration: "5m", target: 600 }, // Sustain 300 users
    { duration: "5m", target: 750 }, // Increase to 300 users
    { duration: "5m", target: 750 }, // Sustain 300 users
    { duration: "5m", target: 900 }, // Increase to 300 users
    { duration: "5m", target: 900 }, // Sustain 300 users
    { duration: "5m", target: 1000 }, // Increase to 300 users
    { duration: "5m", target: 1000 }, // Sustain 300 users
    { duration: "10m", target: 0 }, // Cooldown
  ],
};

function logError(response, message) {
  console.error(
    `🚨 ${message} - Status: ${response.status}, Body: ${response.body}`
  );
}

export default function () {
  // ===== 1. LOGIN WITH EXPONENTIAL BACKOFF =====
  let maxRetries = 5;
  let retryDelay = 2;
  let loginRes;
  let success = false;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    loginRes = http.post(
      "http://a83add0e498624482aea58e7c6947c08-652731971.ap-southeast-1.elb.amazonaws.com/auth/login",
      JSON.stringify({
        email: "marcus_fyp@speechlab.sg",
        password: "M@cus_202425FYP",
      }),
      { headers: { "Content-Type": "application/json" } }
    );

    if (check(loginRes, { "✅ Login successful": (r) => r.status === 201 })) {
      success = true;
      break;
    } else {
      logError(loginRes, `LOGIN FAILED (Attempt ${attempt + 1})`);
      sleep(retryDelay);
      retryDelay *= 2; // Exponential backoff
    }
  }

  if (!success) {
    console.error("🚨 LOGIN FAILED after multiple attempts, skipping user.");
    return;
  }

  // Extract authentication token
  let authToken = loginRes.json().accessToken;
  let authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  };

  // ===== 2. LOAD HOMEPAGE (Send Statistics Request) =====
  sleep(2);
  let statsPayload = JSON.stringify({ userID: "66de4bc2d8d049003171bbd1" });
  let statsRes = http.post(
    "http://a83add0e498624482aea58e7c6947c08-652731971.ap-southeast-1.elb.amazonaws.com/users/statistics",
    statsPayload,
    { headers: authHeaders }
  );
  check(statsRes, { "📊 Statistics loaded": (r) => r.status === 200 });

  // Simulated User Session (15 minutes)
  let sessionStart = new Date().getTime();
  while (new Date().getTime() - sessionStart < 15 * 60 * 1000) {
    // ===== 3. LOAD NOTES PAGE =====
    let notesPayload = JSON.stringify({ userEmail: "marcus_fyp@speechlab.sg" });
    let notesRes = http.post(
      "http://a83add0e498624482aea58e7c6947c08-652731971.ap-southeast-1.elb.amazonaws.com/notes",
      notesPayload,
      { headers: authHeaders }
    );
    check(notesRes, { "📝 Notes page loaded": (r) => r.status === 200 });

    // ===== 4. CREATE NOTE (~every 1-2 minutes) =====
    sleep(Math.random() * 60 + 60);
    let newNote = JSON.stringify({
      title: "testNote",
      content: "test content",
    });
    let createNote = http.get(
      "http://a83add0e498624482aea58e7c6947c08-652731971.ap-southeast-1.elb.amazonaws.com/notes/edit/a83c4c5c-a97c-4be1-bf40-f12d670de30b",
      newNote,
      { headers: authHeaders }
    );
    check(createNote, { "✏️ Note edited": (r) => r.status === 200 });

    // ===== 5. Share NOTE (~every 3-4 minutes) =====
    sleep(Math.random() * 120 + 180);
    let sharePayload = JSON.stringify({
      userEmail: "ivan_fyp@speechlab.sg",
      id: "f79b517c-9387-4504-9078-f4a8b43b1d16",
    });
    let shareRes = http.post(
      "http://a83add0e498624482aea58e7c6947c08-652731971.ap-southeast-1.elb.amazonaws.com/sharedNotes/new",
      sharePayload,
      { headers: authHeaders }
    );
    check(shareRes, { "📄 Note shared": (r) => r.status === 200 });
  }
}
