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

  @Edm.Function
  @Edm.EntityType(Edm.ForwardRef(() => MarketData))
  public async getMarketData(
    @odata.body body: any,
    @odata.result result: any
  ): Promise<MarketData> {
    const { currency, asset, timeframe, start, end, indicatorInputs } = body;

    const inputs = JSON.parse(indicatorInputs) as Array<{
      name: string;
      options: number[];
    }>;

    // расширить диапазон необходимый для прогрева индикаторов
    const indicatorsWarmup = _.max(
      inputs.map(e => IndicatorsEngine.getStart(e))
    );
    const timeframeMinutes = ExchangeEngine.timeframeToMinutes(timeframe);
    const startWarmup = moment
      .utc(start)
      .add(-indicatorsWarmup * timeframeMinutes, "m")
      .toISOString();

    const candles = await ExchangeEngine.getCandles({
      exchange: result.key,
      currency,
      asset,
      timeframe,
      start: startWarmup,
      end
    });

    return Promise.all(
      inputs.map(input =>
        IndicatorsEngine.getIndicator(candles, input).then(output =>
          Object.assign(input, {
            output
          })
        )
      )
    ).then(
      indicators =>
        new MarketData({
          candles: candles
            .filter(e => moment.utc(e.time).isBetween(start, end, "m", "[]"))
            .map(e => new Candle(e)),
          indicators: indicators.map(
            indicator =>
              new Indicator({
                name: indicator.name,
                options: indicator.options,
                output: indicator.output
                  .filter(e =>
                    moment.utc(e.time).isBetween(start, end, "m", "[]")
                  )
                  .map(o => new IndicatorRow(o.time, o.values))
              })
          )
        })
    );
  }
}
