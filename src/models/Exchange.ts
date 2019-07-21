import { Edm, odata } from "odata-v4-server";
import { ExchangeEngine, ICandle } from "../engine/Exchange";
import { Currency } from "./Currency";
import { Timeframe } from "./Timeframe";

export class Exchange {
  @Edm.Key
  @Edm.String
  public key: string;

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Currency)))
  public Currencies: Currency[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Timeframe)))
  public Timeframes: Timeframe[];

  constructor(key: string) {
    Object.assign(this, { key });
  }

  @Edm.Function
  @Edm.String
  public async getCandles(
    @Edm.String currency: string,
    @Edm.String asset: string,
    @Edm.String timeframe: string,
    @Edm.String start: string,
    @Edm.String end: string,
    @odata.result result: any
  ): Promise<ICandle[]> {
    return ExchangeEngine.getCandles({
      exchange: result.key,
      currency,
      asset,
      timeframe,
      start,
      end
    });
  }
}
