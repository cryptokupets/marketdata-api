import { Edm } from "odata-v4-server";
import { Candle } from "./Candle";
import { Indicator } from "./Indicator";

export class MarketData {
  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Candle)))
  public candles: Candle[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Indicator)))
  public indicators: Indicator[];

  constructor(data: any) {
    Object.assign(this, data);
  }
}
