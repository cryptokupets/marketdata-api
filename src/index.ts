"use strict";

import express from "express";
import { ExchangeEngine } from "./engine/Exchange";

const app = express();
const port = 8080; // default port to listen

app.use(express.static(__dirname + "/static"));

app.get("/api/candles/:exchange/:currency/:asset/:timeframe", async (req, res) => {
  const { exchange, currency, asset, timeframe } = req.params;
  const { start, end, limit } = req.query;
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
