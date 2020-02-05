import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { Candle } from "./Candle";
import { DateRange } from "./DateRange";

export class MarketData {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  // tslint:disable-next-line: variable-name
  public _id: ObjectID;

  @Edm.Key
  @Edm.String
  public asset: string;

  @Edm.Key
  @Edm.String
  public currency: string;

  @Edm.Key
  @Edm.Double
  public period: number;

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Candle)))
  public Candles: Candle[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => DateRange)))
  public Ranges: DateRange[];

  constructor(data: any) {
    Object.assign(this, data);
  }
}
