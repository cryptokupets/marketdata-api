import { Edm } from "odata-v4-server";

export class IndicatorRow {
  @Edm.String
  public time: string;

  @Edm.Collection(Edm.Double)
  public values: number[];

  constructor(time: string, values: number[]) {
    Object.assign(this, { time, values });
  }
}
