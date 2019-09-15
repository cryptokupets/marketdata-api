import { ObjectID } from "mongodb";
import { Edm, odata } from "odata-v4-server";
import connect from "../connect";
import { MarketDataEngine } from "../engine/MarketData";
import { Candle } from "./Candle";
import { Exchange } from "./Exchange";
import { IndicatorView } from "./IndicatorView";

export interface IMarketData {
  exchange: string;
  currency: string;
  asset: string;
  period: number;
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

  @Edm.Double
  public period: number;

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

  @Edm.Action
  public async start1(@odata.result result: any): Promise<void> {
    const { _id: key } = result;
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    const db = await connect();
    const collectionName = "marketData";
    const { exchange, currency, asset, period } = new MarketData(
      await db.collection(collectionName).findOne({ _id })
    );
    MarketDataEngine.start({ exchange, currency, asset, period });
  }
}
