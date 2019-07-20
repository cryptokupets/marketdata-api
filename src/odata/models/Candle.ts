import { Edm } from "odata-v4-server";
import { ICandle } from "../../engine/Exchange";

export class CandleModel implements ICandle {
  @Edm.String
  public time: string;

  @Edm.Double
  public open: number;

  @Edm.Double
  public high: number;

  @Edm.Double
  public low: number;

  @Edm.Double
  public close: number;

  @Edm.Double
  public volume: number;

  constructor({ time, open, high, low, close, volume }: ICandle) {
    Object.assign(this, { time, open, high, low, close, volume });
  }
}
