import _ from "lodash";
import moment = require("moment");
import { Edm, odata } from "odata-v4-server";
import { ExchangeEngine, ICandle } from "../engine/Exchange";
import { IndicatorsEngine } from "../engine/Indicators";
import { Indicator } from "../models/Indicator";
import { IndicatorRow } from "../models/IndicatorRow";
import { Candle } from "./Candle";
import { Currency } from "./Currency";
import { MarketData } from "./MarketData";
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
    @odata.body body: any,
    @odata.result result: any
  ): Promise<ICandle[]> {
    const options = body || {
      currency,
      asset,
      timeframe,
      start,
      end
    };
    options.exchange = result.key;
    return ExchangeEngine.getCandles(options);
  }
}
