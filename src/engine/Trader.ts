// import EventEmitter from "events";
import { ObjectID } from "mongodb";
import { Worker } from "worker_threads";
import connect from "../connect";
import { Trader } from "../models/Trader";

const collectionName = "trader";
const marketWorkers: any = {};

export class TraderEngine {
  public static async onAdvice(event: any): Promise<void> {
    console.log(event);
    // купить или продать
  }

  public static async getAdvice(event: any): Promise<number> {
    console.log(event);
    return 1;
  }

  public static async onCandle(event: any): Promise<void> {
    console.log(event);
    // TODO выполнить расчет индикаторов
    // если есть сигнал, то выполнить что дальше, использовать события нет смсыла, т.к. цепочка заданная
    const currentAdvice: number = 0; // получить текущий, видимо из Trader
    const advice = await TraderEngine.getAdvice(event);
    if (advice !== currentAdvice) {
      await TraderEngine.onAdvice(event);
    }
  }

  public static async startMarket(options: {
    exchange: string;
    currency: string;
    asset: string;
    period: number;
  }): Promise<void> {
    return new Promise(resolve => {
      const marketWorker = new Worker("./lib/worker/market.js", {
        workerData: options
      });
      marketWorker.once("online", resolve);
      marketWorker.on("message", TraderEngine.onCandle);
      marketWorkers[JSON.stringify(options)] = marketWorker;
    });
  }

  public static async start(key: string): Promise<void> {
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    const db = await connect();
    const { exchange, currency, asset, period } = new Trader(
      await db.collection(collectionName).findOne({ _id })
    );
    return TraderEngine.startMarket({ exchange, currency, asset, period });
  }

  public static async stopMarket(options: {
    exchange: string;
    currency: string;
    asset: string;
    period: number;
  }): Promise<void> {
    return new Promise(resolve => {
      const marketWorkerKey = JSON.stringify(options);
      const marketWorker = marketWorkers[marketWorkerKey];
      marketWorker.once("exit", resolve);
      marketWorker.off("message", TraderEngine.onCandle);
      delete marketWorkers[marketWorkerKey];
      marketWorker.terminate();
    });
  }

  public static async stop(key: string): Promise<void> {
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    const db = await connect();
    const { exchange, currency, asset, period } = new Trader(
      await db.collection(collectionName).findOne({ _id })
    );
    return TraderEngine.stopMarket({ exchange, currency, asset, period });
  }
}
