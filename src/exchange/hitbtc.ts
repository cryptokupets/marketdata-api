import moment from "moment";
import * as request from "request-promise-native";
import { ExchangeEngine, ICandle, IMarketDataSource } from "../engine/Exchange";

const BASE_URL = "https://api.hitbtc.com/api/2/";

export class Hitbtc implements IMarketDataSource {
  public async getSymbols(): Promise<
    Array<{ currency: string; asset: string }>
  > {
    const options = {
      baseUrl: BASE_URL,
      url: "public/symbol"
    };

    return (JSON.parse(await request.get(options)) as Array<{
      baseCurrency: string;
      quoteCurrency: string;
    }>).map(e => {
      return {
        currency: e.quoteCurrency,
        asset: e.baseCurrency
      };
    });
  }

  public async getTimeframes(): Promise<
    Array<{ key: string; minutes: number }>
  > {
    return [
      { key: "M1", minutes: 1 },
      { key: "M3", minutes: 3 },
      { key: "M5", minutes: 5 },
      { key: "M15", minutes: 15 },
      { key: "M30", minutes: 30 },
      { key: "H1", minutes: 60 },
      { key: "H4", minutes: 240 },
      { key: "D1", minutes: 1440 },
      { key: "D7", minutes: 10080 }
    ];
  }

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
      ? (JSON.parse(await request.get(options)) as Array<{
          timestamp: string;
          open: string;
          max: string;
          min: string;
          close: string;
          volume: string;
        }>).map(e => {
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
