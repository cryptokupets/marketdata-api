import { Edm } from "odata-v4-server";

export class Advice {
  @Edm.String
  public time: string;

  @Edm.Int32
  public value: number;

  constructor(time: string, value: number) {
    Object.assign(this, { time, value });
  }
}
