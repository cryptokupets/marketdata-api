import moment from "moment";
import * as request from "request-promise-native";
import { ExchangeEngine, ICandle, IMarketDataSource } from "../engine/Exchange";

const BASE_URL = "https://api.hitbtc.com/api/2/";

export class Hitbtc implements IMarketDataSource {
  public async getCandles({
    currency,
    asset,
    timeframe,
    start,
    end
  }: {
    currency: string;
    asset: string;
    timeframe: string;
    start: string;
    end: string;
  }): Promise<ICandle[]> {
    const CANDLES_LIMIT = 1000;
    const limit = Math.min(
      Math.floor(
        moment.utc(end).diff(moment.utc(start), "m") /
          ExchangeEngine.timeframeToMinutes(timeframe)
      ) + 1,
      CANDLES_LIMIT
    );

    const options = {
      baseUrl: BASE_URL,
      url: `public/candles/${asset.toUpperCase()}${currency.toUpperCase()}`,
      qs: {
        period: timeframe.toUpperCase(),
        from: moment.utc(start).toISOString(),
        limit
      }
    };

    return limit
      ? (JSON.parse(await request.get(options)) as any[]).map(e => {
          return {
            time: e.timestamp,
            open: +e.open,
            high: +e.max,
            low: +e.min,
            close: +e.close,
            volume: +e.volume
          };
        })
      : [];
  }
}
