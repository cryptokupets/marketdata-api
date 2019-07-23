import { Edm } from "odata-v4-server";
import { IndicatorRow } from "./IndicatorRow";

export class Indicator {
  @Edm.String
  public name: string;

  @Edm.Collection(Edm.Double)
  public options: number[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => IndicatorRow)))
  public output: IndicatorRow[];

  constructor({
    name,
    options,
    output
  }: {
    name: string;
    options: number[];
    output: IndicatorRow[];
  }) {
    Object.assign(this, { name, options, output });
  }
}
