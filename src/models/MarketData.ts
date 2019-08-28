import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { Candle } from "./Candle";
import { Exchange } from "./Exchange";
import { IndicatorView } from "./IndicatorView";

export interface IMarketData {
  exchange: string;
  currency: string;
  asset: string;
  timeframe: string;
  start: string;
  end: string;
}

export class MarketData implements IMarketData {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  // tslint:disable-next-line: variable-name
  public _id: ObjectID;

  @Edm.String
  public asset: string;

  @Edm.String
  public currency: string;

  @Edm.String
  public exchange: string;

  @Edm.String
  public timeframe: string;

  @Edm.String
  public start: string;

  @Edm.String
  public end: string;

  @Edm.EntityType(Edm.ForwardRef(() => Exchange))
  public Exchange: Exchange;

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Candle)))
  public Candles: Candle[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => IndicatorView)))
  public Indicators: IndicatorView[];

  constructor(data: any) {
    Object.assign(this, data);
  }
}
