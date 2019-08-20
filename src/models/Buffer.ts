import { Edm } from "odata-v4-server";
import { Candle } from "./Candle";
import { Indicator } from "./Indicator";

export class Buffer {
  @Edm.Key
  @Edm.String
  public assetKey: string;

  @Edm.Key
  @Edm.String
  public currencyKey: string;

  @Edm.Key
  @Edm.String
  public exchangeKey: string;

  @Edm.Key
  @Edm.String
  public timeframe: string;

  @Edm.Key
  @Edm.String
  public start: string;

  @Edm.Key
  @Edm.String
  public end: string;

  @Edm.Key
  @Edm.String
  public indicatorInputs: string;

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Candle)))
  public candles: Candle[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Indicator)))
  public indicatorOutputs: Indicator[];

  constructor({
    assetKey,
    currencyKey,
    exchangeKey,
    timeframe,
    start,
    end,
    candles,
    indicatorInputs,
    indicatorOutputs
  }: {
    assetKey: string;
    currencyKey: string;
    exchangeKey: string;
    timeframe: string;
    start: string;
    end: string;
    candles: Candle[];
    indicatorInputs: string;
    indicatorOutputs: Indicator[];
  }) {
    Object.assign(this, {
      assetKey,
      currencyKey,
      exchangeKey,
      timeframe,
      start,
      end,
      candles,
      indicatorInputs,
      indicatorOutputs
    });
  }
}
