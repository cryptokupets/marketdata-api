"use strict";

import * as bodyParser from "body-parser";
import express from "express";

const app = express();
const port = 8080; // default port to listen

app.use(bodyParser.json());

app.post("/api/candles", (req, res) => {
  res.json();
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
