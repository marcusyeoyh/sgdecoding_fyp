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
    { duration: "5m", target: 0 }, // Cool down
  ],
};

function logError(response, message) {
  console.error(
    `🚨 ${message} - Status: ${response.status}, Body: ${response.body}`
  );
}

export default function () {
  // ===== 1. LOGIN WITH RETRIES (Exponential Backoff) =====
  let maxRetries = 5;
  let retryDelay = 2; // Initial delay of 2 seconds
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
      break; // Exit loop if login is successful
    } else {
      logError(loginRes, `LOGIN FAILED (Attempt ${attempt + 1})`);
      sleep(retryDelay); // Wait before retrying
      retryDelay *= 2; // Exponential backoff (2s → 4s → 8s → 16s → 32s)
    }
  }

  if (!success) {
    console.error("🚨 LOGIN FAILED after multiple attempts, skipping user.");
    return; // Stop execution for this user if login fails
  }

  // Extract authentication token
  let authToken = loginRes.json().accessToken;
  let authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  };

  // ===== 2. LOAD HOMEPAGE (Statistics Request) =====
  sleep(1); // Simulate user being redirected to homepage
  let statsPayload = JSON.stringify({ userID: "66de4bc2d8d049003171bbd1" });
  let statsRes = http.post(
    "http://a83add0e498624482aea58e7c6947c08-652731971.ap-southeast-1.elb.amazonaws.com/users/statistics",
    statsPayload,
    { headers: authHeaders }
  );
  check(statsRes, { "📊 Statistics loaded": (r) => r.status === 200 });

  // ===== 3. SIMULATE USER NAVIGATING THE APP =====
  let sessionStart = new Date().getTime();
  while (new Date().getTime() - sessionStart < 15 * 60 * 1000) {
    // Run session for ~15 minutes
    // 3.1 Navigate to Speech History (~every 30-60 seconds)
    let historyRes = http.get(
      "http://a83add0e498624482aea58e7c6947c08-652731971.ap-southeast-1.elb.amazonaws.com/speech/history",
      { headers: authHeaders }
    );
    check(historyRes, { "📜 Fetched history data": (r) => r.status === 200 });

    // 3.2 Occasionally Fetch Transcription (~every 1-2 minutes)
    sleep(Math.random() * 60 + 60);
    let transcriptRes = http.get(
      "http://a83add0e498624482aea58e7c6947c08-652731971.ap-southeast-1.elb.amazonaws.com/speech/67c401aa934eaa002b13753d/result/tojson",
      { headers: authHeaders }
    );
    check(transcriptRes, {
      "📝 Fetched transcription": (r) => r.status === 200,
    });

    // 3.3 Occasionally Download Audio (~every 3-5 minutes)
    sleep(Math.random() * 120 + 180);
    let audioRes = http.get(
      "http://a83add0e498624482aea58e7c6947c08-652731971.ap-southeast-1.elb.amazonaws.com/files/67c401aa934eaa002b13753e/download",
      { headers: authHeaders }
    );
    check(audioRes, { "🔊 Audio downloaded": (r) => r.status === 200 });
  }
}
