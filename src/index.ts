"use strict";

import * as bodyParser from "body-parser";
import express from "express";
import { ExchangeEngine } from "./engine/Exchange";

const app = express();
const port = 8080; // default port to listen

app.use(bodyParser.json());

app.post("/api/candles", async (req, res) => {
  const { exchange, currency, asset, timeframe, start, end, limit } = req.body;
  res.json(
    await ExchangeEngine.getCandles({
      exchange,
      currency,
      asset,
      timeframe,
      start,
      end,
      limit
    })
  );
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
