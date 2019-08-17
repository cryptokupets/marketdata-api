import { Edm, odata } from "odata-v4-server";
import { ExchangeEngine, ICandle } from "../engine/Exchange";
import { IndicatorsEngine } from "../engine/Indicators";
import { Indicator } from "../models/Indicator";
import { IndicatorRow } from "../models/IndicatorRow";
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

  @Edm.Function
  @Edm.String
  public async getMarketData(
    @odata.body body: any,
    @odata.result result: any
  ): Promise<any> {
    const {
      currency,
      asset,
      timeframe,
      start,
      end,
      indicatorInputs
    } = body;

    const candles = await ExchangeEngine.getCandles({
      exchange: result.key,
      currency,
      asset,
      timeframe,
      start,
      end
    });

    const inputs = JSON.parse(indicatorInputs) as Array<{
      name: string;
      options: number[];
    }>;

    return Promise.all(
      inputs.map(input =>
        IndicatorsEngine.getIndicator(candles, input).then(
          output =>
            new Indicator({
              name: input.name,
              options: input.options,
              output: output.map(o => new IndicatorRow(o.time, o.values))
            })
        )
      )
    ).then(indicators => [{
      candles,
      indicators
    }]);
  }
}
