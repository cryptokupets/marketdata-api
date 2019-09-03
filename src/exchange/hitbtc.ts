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

  public async getTimeframes(): Promise<number[]> {
    return [1, 3, 5, 15, 30, 60, 240];
  }

  public getTimeframe(period: number): string {
    let timeframe;
    switch (period) {
      case 1:
        timeframe = "M1";
        break;

      case 3:
        timeframe = "M3";
        break;

      case 5:
        timeframe = "M5";
        break;

      case 15:
        timeframe = "M15";
        break;

      case 30:
        timeframe = "M30";
        break;

      case 60:
        timeframe = "H1";
        break;

      case 240:
        timeframe = "H4";
        break;

      default:
        timeframe = "M1";
        break;
    }

    return timeframe;
  }

  public async getCandles({
    currency,
    asset,
    period,
    start,
    end
  }: {
    currency: string;
    asset: string;
    period: number;
    start: string;
    end: string;
  }): Promise<ICandle[]> {
    const CANDLES_LIMIT = 1000;
    const limit = Math.min(
      Math.floor(moment.utc(end).diff(moment.utc(start), "m") / period) + 1,
      CANDLES_LIMIT
    );

    const options = {
      baseUrl: BASE_URL,
      url: `public/candles/${asset.toUpperCase()}${currency.toUpperCase()}`,
      qs: {
        period: this.getTimeframe(period),
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
