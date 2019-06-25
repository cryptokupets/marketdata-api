import { Hitbtc } from "../exchange/hitbtc";

const exchanges: any = {
  hitbtc: new Hitbtc()
};

export interface IMarketDataSource {
  getCandles(options: {
    currency: string;
    asset: string;
    timeframe: string;
    start?: string;
    end?: string;
  }): Promise<ICandle[]>;
}

export interface ICandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export class ExchangeEngine {
  public static getExchangeKeys(): string[] {
    return Object.keys(exchanges);
  }

  public static getExchange(exchange: string): IMarketDataSource {
    return exchanges[exchange] as IMarketDataSource;
  }

  public static async getCandles(
    exchange: string,
    options: {
      currency: string;
      asset: string;
      timeframe: string;
      start?: string;
      end?: string;
      limit?: number;
    }
  ): Promise<ICandle[]> {
    return exchanges[exchange].getCandles(options); // UNDONE удалять последний элемент
  }
}
