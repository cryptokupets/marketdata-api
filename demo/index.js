"use strict";

require("dotenv").config();

const express = require("express");
const { MarketDataServer } = require("../lib/server");

const app = express();
const port = process.env.PORT;

app.use(MarketDataServer.create());

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
