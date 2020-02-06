import es from "event-stream";
import { streamCandle } from "get-candles";
import { Edm, odata, ODataServer } from "odata-v4-server";
import connect from "./connect";
import { CandleController } from "./controllers/Candle";

@odata.cors
@odata.namespace("MarketData")
@odata.controller(CandleController, true)
export class MarketDataServer extends ODataServer {
  @Edm.ActionImport()
  public async importData(@odata.body body: any): Promise<void> {
    const { exchange, currency, asset, period, begin, end } = body;
    const db = await connect();
    const collection = db.collection("candle");
    return new Promise(resolve => {
      const rs = streamCandle({
        exchange,
        currency,
        asset,
        period,
        start: begin,
        end
      }).pipe(
        es.map((chunk: any, next: any) => {
          const candle: any = JSON.parse(chunk);
          collection.insertMany(candle, next);
        })
      );

      rs.on("end", () => resolve());
    });
  }
}
