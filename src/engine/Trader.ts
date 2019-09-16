import EventEmitter from "events";
import { ObjectID } from "mongodb";
import { Worker } from "worker_threads";
import connect from "../connect";
import { Trader } from "../models/Trader";

const collectionName = "trader";
const marketWorkers: any = {};

export class TraderEngine extends EventEmitter {
  public static async onNewCandle(event: any) {
    console.log(event);
  }

  public static async start(key: string): Promise<void> {
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    const db = await connect();
    const { exchange, currency, asset, period } = new Trader(
      await db.collection(collectionName).findOne({ _id })
    );
    return new Promise(resolve => {
      const marketWorker = new Worker("./lib/worker/market.js", {
        workerData: { exchange, currency, asset, period }
      });
      marketWorker.once("online", resolve);
      marketWorker.on("message", TraderEngine.onNewCandle);
      marketWorkers[
        JSON.stringify({ exchange, currency, asset, period })
      ] = marketWorker;
    });
  }

  public static async stop(key: string): Promise<void> {
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    const db = await connect();
    const { exchange, currency, asset, period } = new Trader(
      await db.collection(collectionName).findOne({ _id })
    );

    return new Promise(resolve => {
      const marketWorkerKey = JSON.stringify({
        exchange,
        currency,
        asset,
        period
      });
      const marketWorker = marketWorkers[marketWorkerKey];
      marketWorker.once("exit", resolve);
      marketWorker.off("message", TraderEngine.onNewCandle);
      delete marketWorkers[marketWorkerKey];
      marketWorker.terminate();
    });
  }

  public key: string;
  public asset: string;
  public currency: string;
  public exchange: string;
  public period: number;
  public newCandle: Event;

  constructor(data: any) {
    super();
    Object.assign(this, data);
  }
}
