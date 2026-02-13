const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");

const app = express();
app.use(bodyParser.json());

const client = twilio("ACCOUNT_SID", "AUTH_TOKEN");

app.post("/sos", (req, res) => {
  const { message, lat, lon } = req.body;

  client.messages.create({
    body: `${message}\nLocation: https://maps.google.com/?q=${lat},${lon}`,
    from: "+1234567890",
    to: "+91XXXXXXXXXX"
  });

  res.send({ status: "SMS sent" });
});

app.listen(3000);
