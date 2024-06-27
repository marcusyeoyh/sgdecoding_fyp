const express = require("express");
const cors = require("cors");
const axios = require("axios").default;
const compression = require("compression");
const User = require("./models/user.model");

const app = express();

const corsOptions = {
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(compression());
app.use(require('./routes'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.post("/add_user", async (request, response) => {

  const user = new User(request.body);
  try {
    await user.save();
    response.send(user);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.get("/users", async (request, response) => {

  const users = await User.find({});
  try {
    response.send(users);
  } catch (error) {
    response.status(500).send(error);
  }
});


app.get("/files/:id/download", async (req, res) => {

  const { id } = req.params;

  await axios
    .get(
      `${process.env.GATEWAY_URL}/files/${id}/download`,
      {
        headers: {
          Authorization: `${req.headers.authorization}`,
        },
      },
      { responseType: "json" }
    )
    .then((response) => {
      res.status(200).json(response.data);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ msg: "Something went wrong with your request!" });
    });
});

module.exports = app;
