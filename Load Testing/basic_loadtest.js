import http from "k6/http";
import { check, sleep } from "k6";

// Define load test parameters
export let options = {
  vus: 5, // 5 virtual users
  duration: "1m", // Run for 1 minute
};

// Function to login and retrieve accessToken
function login() {
  let loginPayload = JSON.stringify({
    email: "marcus_fyp@speechlab.sg",
    password: "M@cus_202425FYP",
  });

  let loginHeaders = { "Content-Type": "application/json" };

  let res = http.post(
    "http://a83add0e498624482aea58e7c6947c08-652731971.ap-southeast-1.elb.amazonaws.com/auth/login",
    loginPayload,
    { headers: loginHeaders }
  );

  check(res, { "Login successful": (r) => r.status === 201 });

  let authToken = res.json("accessToken"); // Extract access token
  return authToken;
}

// Main function for each virtual user (VU)
export default function () {
  let token = login(); // Perform login

  // If login fails, exit
  if (!token) return;

  let authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Simulate loading the homepage
  let statsPayload = JSON.stringify({ userID: "66de4bc2d8d049003171bbd1" });
  let statsRes = http.post(
    "http://a83add0e498624482aea58e7c6947c08-652731971.ap-southeast-1.elb.amazonaws.com/users/statistics",
    statsPayload,
    { headers: authHeaders }
  );
  check(statsRes, { "Statistics loaded": (r) => r.status === 200 });

  // Simulate clicking on the history tab multiple times
  for (let i = 0; i < 3; i++) {
    let historyRes = http.get(
      "http://a83add0e498624482aea58e7c6947c08-652731971.ap-southeast-1.elb.amazonaws.com/speech/history",
      { headers: authHeaders }
    );
    check(historyRes, { "History loaded": (r) => r.status === 200 });

    sleep(1); // Simulate a short delay before next request
  }
}
