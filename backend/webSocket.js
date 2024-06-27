const express = require("express");
const app = express();

var httpProxy = require("http-proxy");
let isOpen = false;

const proxy = httpProxy
  .createServer({
    target: process.env.GATEWAY_SOCKET_URL,
    changeOrigin: true,
    ws: true,
  })
  .listen(8080);

proxy.on("error", function (err, req, res) {
  res.writeHead(500, {
    "Content-Type": "text/plain",
  });

  res.end("Live Transcribe Connection Failed");
});

proxy.on("open", function (proxySocket) {
  // listen for messages coming FROM the target here
  console.log("Live Transcribe Connection Open");
  isOpen = true;
  proxySocket.on("data", (buffer) => {
    console.log(buffer.toString());
  });

});

proxy.on("close", function (res, socket, head) {
  // view disconnected websocket connections
  console.log("Live Transcribe Disconnected");
  if (isOpen) {
    console.log("live job complete");
    isOpen = false;
  } else {
    console.log("not submitted");
  }
});