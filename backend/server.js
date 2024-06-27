const app = require("./app");
const { setUpdatedFalse } = require("./helpers");
const mongoose = require("mongoose");
const User = require("./models/user.model");
const httpProxy = require("http-proxy");
const jwt_decode = require("jwt-decode");
const Notes = require("./models/notes.model");

require('dotenv').config();

////////////////////////////////////////////////////// Collaborative Editing //////////////////////////////////////////////////////
var http = require('http');
var ShareDB = require('sharedb');
var richText = require('rich-text');
var WebSocket = require('ws');
var WebSocketJSONStream = require('websocket-json-stream');
ShareDB.types.register(richText.type);

const mongoDBUrl = `${process.env.DB_CONNECTION_STRING}`;
const shareMongoDB = require('sharedb-mongo')(mongoDBUrl);

// Create a web server to serve files and listen to WebSocket connections
var backend = new ShareDB({shareMongoDB});
var server = http.createServer(app);
var connection = backend.connect();

// Connect any incoming WebSocket connection to ShareDB
var wss = new WebSocket.Server({server: server});

wss.on('connection', function(ws, req) {
  var stream = new WebSocketJSONStream(ws);
  backend.listen(stream);
});

server.listen(`${process.env.QUILLJS_PORT}`, () => console.log(`quilljs socket listening on port ${process.env.QUILLJS_PORT}`));

app.get('/notes/edit/:id', async (req, res) => {
  console.log("notesid",req.params.id);
  const id = req.params.id;
  var doc = connection.get('collaborative_community', id);
  doc.fetch(async function(err) {
    if (err) throw err;
    if (doc.type === null) {
      const foundNotes = await Notes.findOne({"_id":id});
      doc.create(JSON.parse(foundNotes.text), 'rich-text');
      return res.status(200).send();
    }
    return res.status(200).send();
  });
})

////////////////////////////////////////////////////// Collaborative Editing //////////////////////////////////////////////////////


////////////////////////////////////////////////////// Live Transcribe Proxy //////////////////////////////////////////////////////

var liveJobOpen = false;
var proxyUserID = "";
const proxy = httpProxy
  .createServer({
    target: process.env.GATEWAY_SOCKET_URL,
    changeOrigin: true,
    ws: true,
  })
  .listen(`${process.env.PROXY_PORT}`, () => console.log(`Live Transcribe Proxy Server started on port ${process.env.PROXY_PORT}`));

proxy.on("error", function (err, req, res) {
  res.writeHead(500, {
    "Content-Type": "text/plain",
  });
  res.end("Live Transcribe Connection Failed");
});

proxy.on('proxyReqWs', function(proxyReqWs) {
  const path = proxyReqWs.path;
  const startPos = path.search("accessToken=");
  const endPos = path.search("&model");  
  const proxyToken = path.substring(startPos+12, endPos);
  proxyUserID = jwt_decode(proxyToken).sub;
});

proxy.on("open", function (proxySocket) {
  // listen for messages coming FROM the target here
  console.log("Live Transcribe Connection Open");
  liveJobOpen = true;
  proxySocket.on("data", (buffer) => {
    console.log(buffer.toString());
  });
});

proxy.on("close", function (res, socket, head) {
  // view disconnected websocket connections
  console.log("Live Transcribe Disconnected");
  if (liveJobOpen) {
    setUpdatedFalse(proxyUserID);
    liveJobOpen = false;
  }
});

////////////////////////////////////////////////////// Live Transcribe Proxy //////////////////////////////////////////////////////


////////////////////////////////////////////////////// MongoDB //////////////////////////////////////////////////////

mongoose.connect(mongoDBUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function () {
  console.log("Mongoose Connection Successful (server)!");
});

////////////////////////////////////////////////////// MongoDB //////////////////////////////////////////////////////


app.listen(`${process.env.PORT}`, '0.0.0.0',()=>{
  console.log("server is listening on port " + `${process.env.PORT}`);
});

