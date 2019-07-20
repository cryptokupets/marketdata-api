import moment from "moment";
import { Hitbtc } from "../exchange/hitbtc";

const exchanges: any = {
  hitbtc: new Hitbtc()
};

export interface IMarketDataSource {
  getSymbols(): Promise<Array<{ currency: string, asset: string }>>;
  getTimeframes(): Promise<string[]>;
  getCandles(options: {
    currency: string;
    asset: string;
    timeframe: string;
    start: string;
    end: string;
  }): Promise<ICandle[]>;
}

export interface ICandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class ExchangeEngine {
  public static async getSymbols(exchange: string): Promise<Array<{ currency: string, asset: string }>> {
    return await (exchanges[exchange] as IMarketDataSource).getSymbols();
  }

  public static async getTimeframes(exchange: string): Promise<string[]> {
    return await (exchanges[exchange] as IMarketDataSource).getTimeframes();
  }

  public static getExchangeKeys(): string[] {
    return Object.keys(exchanges);
  }

  public static getExchange(exchange: string): IMarketDataSource {
    return exchanges[exchange] as IMarketDataSource;
  }

  public static timeframeToMinutes(timeframe: string): number {
    const d: any = {};
    d[timeframe.slice(0, 1).toLowerCase()] = +timeframe.slice(1);
    return moment.duration(d).asMinutes();
  }

  public static async getCandles({
    exchange,
    currency,
    asset,
    timeframe,
    start,
    end
  }: {
    exchange: string;
    currency: string;
    asset: string;
    timeframe: string;
    start: string;
    end: string;
  }): Promise<ICandle[]> {
    const timeframeMinutes = ExchangeEngine.timeframeToMinutes(timeframe);
    let startMoment = moment.utc(start);

    const candles: ICandle[] = [];
    let responseLength;

    do {
      const response = await exchanges[exchange].getCandles({
        currency,
        asset,
        timeframe,
        start: startMoment.toISOString(),
        end
      });

      responseLength = response.length;
      if (responseLength) {
        for (const candle of response) {
          candles.push(candle);
        }
        startMoment = moment
          .utc(response[responseLength - 1].time)
          .add(timeframeMinutes, "m");
      }
    } while (responseLength && startMoment.isSameOrBefore(moment.utc(end)));
    return candles;
  }
}
