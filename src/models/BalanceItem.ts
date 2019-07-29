import { Edm } from "odata-v4-server";

export class BalanceItem {
  @Edm.String
  public time: string;

  @Edm.Double
  public currencyAmount: number;

  @Edm.Double
  public assetAmount: number;

  @Edm.Double
  public estimateAmount: number;

  constructor({
    time,
    currencyAmount,
    assetAmount,
    estimateAmount
  }: {
    time?: string;
    currencyAmount?: number;
    assetAmount?: number;
    estimateAmount?: number;
  }) {
    Object.assign(this, {
      time,
      currencyAmount,
      assetAmount,
      estimateAmount
    });
  }
}
