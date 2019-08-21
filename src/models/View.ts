import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { Asset } from "./Asset";
import { Chart } from "./Chart";
import { Currency } from "./Currency";
import { Timeframe } from "./Timeframe";

export class View {
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

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Currency)))
  public Currencies: Currency[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Timeframe)))
  public Timeframes: Timeframe[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Asset)))
  public Assets: Asset[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Chart)))
  public Indicators: Chart[];

  constructor(data: any) {
    Object.assign(this, data);
  }
}
