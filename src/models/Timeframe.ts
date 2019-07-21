import { Edm } from "odata-v4-server";

export class TimeframeModel {
  @Edm.Key
  @Edm.String
  public key: string;

  constructor(key: string) {
    Object.assign(this, { key });
  }
}
