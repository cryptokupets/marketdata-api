import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { IndicatorView } from "./IndicatorView";

export class MarketDataView {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  // tslint:disable-next-line: variable-name
  public _id: ObjectID;

  @Edm.String
  public assetKey: string;

  @Edm.String
  public currencyKey: string;

  @Edm.String
  public exchangeKey: string;

  @Edm.String
  public timeframe: string;

  @Edm.String
  public start: string;

  @Edm.String
  public end: string;

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => IndicatorView)))
  public Indicators: IndicatorView[];

  constructor(data: any) {
    Object.assign(this, data);
  }
}
