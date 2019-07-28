import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";

export class BacktestRow {
  @Edm.String
  public time: string;

  @Edm.Int32
  public advice: number;

  @Edm.Double
  public balance: number;

  @Edm.String
  public backtestId: ObjectID;

  constructor({
    time,
    advice,
    balance,
    backtestId
  }: {
    time: string;
    advice: number;
    balance: number;
    backtestId: ObjectID;
  }) {
    Object.assign(this, { time, advice, balance, backtestId });
  }
}
