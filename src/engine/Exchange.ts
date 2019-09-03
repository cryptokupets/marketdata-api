import moment from "moment";
import { Hitbtc } from "../exchange/hitbtc";

const exchanges: any = {
  hitbtc: new Hitbtc()
};

export interface IMarketDataSource {
  getSymbols(): Promise<Array<{ currency: string; asset: string }>>;
  getTimeframes(): Promise<number[]>;
  getCandles(options: {
    currency: string;
    asset: string;
    period: number;
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
  public static async getSymbols(
    exchange: string
  ): Promise<Array<{ currency: string; asset: string }>> {
    return await (exchanges[exchange] as IMarketDataSource).getSymbols();
  }

  public static async getTimeframes(exchange: string): Promise<number[]> {
    return await (exchanges[exchange] as IMarketDataSource).getTimeframes();
  }

  public static getExchangeKeys(): string[] {
    return Object.keys(exchanges);
  }

  public static getExchange(exchange: string): IMarketDataSource {
    return exchanges[exchange] as IMarketDataSource;
  }

  public static async getCandles({
    exchange,
    currency,
    asset,
    period,
    start,
    end
  }: {
    exchange: string;
    currency: string;
    asset: string;
    period: number;
    start: string;
    end: string;
  }): Promise<ICandle[]> {
    let startMoment = moment.utc(start);

    const candles: ICandle[] = [];
    let responseLength;

    do {
      const response = await exchanges[exchange].getCandles({
        currency,
        asset,
        period,
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
          .add(period, "m");
      }
    } while (responseLength && startMoment.isSameOrBefore(moment.utc(end)));
    return candles;
  }
}
