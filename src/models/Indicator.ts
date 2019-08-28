import { Edm } from "odata-v4-server";
import { IndicatorRow } from "./IndicatorRow";

export class Indicator {
  @Edm.String
  public name: string;

  @Edm.String
  public options: string;

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => IndicatorRow)))
  public Output: IndicatorRow[];

  constructor(data: any) {
    Object.assign(this, data);
  }
}
