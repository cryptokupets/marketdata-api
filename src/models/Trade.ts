import { Edm } from "odata-v4-server";

export class Trade {
  @Edm.String
  public time: string;

  @Edm.Int32
  public side: string;

  @Edm.Int32
  public price: number;

  constructor({
    time,
    side,
    price
  }: {
    time: string;
    side: string;
    price: number;
  }) {
    Object.assign(this, {
      time,
      side,
      price
    });
  }
}
