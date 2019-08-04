import { Edm } from "odata-v4-server";

export class Timeframe {
  @Edm.Key
  @Edm.String
  public key: string;

  @Edm.Double
  public minutes: number;

  constructor({ key, minutes }: { key: string; minutes: number }) {
    Object.assign(this, { key, minutes });
  }
}
