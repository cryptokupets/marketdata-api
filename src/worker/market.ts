import _ from "lodash";
import moment from "moment";
import cron from "node-cron";
import { parentPort, workerData } from "worker_threads";
import { ExchangeEngine } from "../engine/Exchange";

// tslint:disable-next-line: no-var-requires
require("moment-round");
let lastUpdate = moment()
  .floor(1, "minutes")
  .add(-1, "m");

cron.schedule("1 * * * * *", async () => {
  const options = Object.assign(workerData, {
    start: moment(lastUpdate)
      .add(1, "m")
      .toISOString(),
    end: moment()
      .floor(1, "minutes")
      .add(-1, "m")
      .toISOString()
  });
  const candles = await ExchangeEngine.getCandles(options);
  parentPort.postMessage(JSON.stringify(candles));
  lastUpdate = moment.utc(
    _.maxBy(candles, e => moment.utc(e.time).unix()).time
  );
});
