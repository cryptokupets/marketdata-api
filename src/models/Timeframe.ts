import { Edm } from "odata-v4-server";

export class Timeframe {
  @Edm.Key
  @Edm.Double
  public key: number;

  constructor(key: number) {
    Object.assign(this, { key });
  }
}
