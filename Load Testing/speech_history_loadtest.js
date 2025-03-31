import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  stages: [
    { duration: "1m", target: 10 }, // Ramp up to 10 users over 1 min
    { duration: "3m", target: 50 }, // Hold at 50 users for 3 mins
    { duration: "1m", target: 100 }, // Ramp up to 100 users over 1 min
    { duration: "5m", target: 100 }, // Hold at 100 users for 5 mins (Traffic Spike)
    { duration: "2m", target: 10 }, // Ramp down to 10 users over 2 mins
    { duration: "1m", target: 0 }, // Cool down
  ],
};

export default function () {
  // Login Request
  let loginRes = http.post(
    "http://a83add0e498624482aea58e7c6947c08-652731971.ap-southeast-1.elb.amazonaws.com/auth/login",
    JSON.stringify({
      email: "marcus_fyp@speechlab.sg",
      password: "M@cus_202425FYP",
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(loginRes, { "Login successful": (r) => r.status === 201 });

  let authToken = loginRes.json().accessToken;

  // Fetch Homepage Statistics
  let statsRes = http.post(
    "http://a83add0e498624482aea58e7c6947c08-652731971.ap-southeast-1.elb.amazonaws.com/users/statistics",
    JSON.stringify({ userID: "66de4bc2d8d049003171bbd1" }),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  check(statsRes, { "Fetched homepage statistics": (r) => r.status === 200 });

  // Simulate visiting history tab multiple times
  for (let i = 0; i < 5; i++) {
    let historyRes = http.get(
      "http://a83add0e498624482aea58e7c6947c08-652731971.ap-southeast-1.elb.amazonaws.com/speech/history",
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    check(historyRes, { "Fetched history data": (r) => r.status === 200 });

    sleep(1); // Simulate user delay between requests
  }
}
