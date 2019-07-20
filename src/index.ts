"use strict";

import express from "express";
import { ExchangeEngine } from "./engine/Exchange";
import { MarketDataServer } from "./odata/server";

const app = express();
const port = 8080; // default port to listen

app.use(express.static(__dirname + "/static"));

app.use("/odata", MarketDataServer.create());

app.get("/api/symbols/:exchange", async (req, res) => {
  const { exchange } = req.params;
  res.json(await ExchangeEngine.getSymbols(exchange));
});

app.get("/api/timeframes/:exchange", async (req, res) => {
  const { exchange } = req.params;
  res.json(await ExchangeEngine.getTimeframes(exchange));
});

app.get(
  "/api/candles/:exchange/:currency/:asset/:timeframe",
  async (req, res) => {
    const { exchange, currency, asset, timeframe } = req.params;
    const { start, end } = req.query;
    res.json(
      await ExchangeEngine.getCandles({
        exchange,
        currency,
        asset,
        timeframe,
        start,
        end
      })
    );
  }
);

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
