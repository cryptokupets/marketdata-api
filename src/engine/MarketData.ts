import { Worker } from "worker_threads";

const workers: any = {};

export class MarketDataEngine {
  public static async start({
    exchange,
    currency,
    asset,
    period
  }: {
    exchange: string;
    currency: string;
    asset: string;
    period: number;
  }) {
    const worker = new Worker("./lib/service/marketData.js", {
      workerData: { exchange, currency, asset, period }
    });
    worker.on("message", e => {
      console.log(`message: ${e}`);
    });
    workers[JSON.stringify({ exchange, currency, asset, period })] = worker;
  }
}
