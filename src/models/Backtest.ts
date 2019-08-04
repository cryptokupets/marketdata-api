import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { BacktestOutput } from "./BacktestOutput";
import { Currency } from "./Currency";
import { Exchange } from "./Exchange";

export class Backtest {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  // tslint:disable-next-line: variable-name
  public _id: ObjectID;

  @Edm.String
  public exchangeKey: string;

  @Edm.String
  public currencyKey: string;

  @Edm.String
  public assetKey: string;

  @Edm.String
  public timeframe: string;

  @Edm.String
  public start: string;

  @Edm.String
  public end: string;

  @Edm.String
  public strategyCode: string;

  @Edm.Double
  public initialBalance: number;

  @Edm.Double
  public finalBalance: number;

  @Edm.Double
  public profit: number;

  @Edm.Double
  public result: number;

  @Edm.String
  public indicatorInputs: string;

  @Edm.EntityType(Edm.ForwardRef(() => Currency))
  public Currency: Currency;

  @Edm.EntityType(Edm.ForwardRef(() => Exchange))
  public Exchange: Exchange;

  @Edm.EntityType(Edm.ForwardRef(() => BacktestOutput))
  public Output: BacktestOutput;

  constructor({
    _id,
    assetKey,
    currencyKey,
    exchangeKey,
    timeframe,
    start,
    end,
    strategyCode,
    initialBalance,
    finalBalance,
    profit,
    result,
    indicatorInputs
  }: {
    _id?: ObjectID;
    assetKey?: string;
    currencyKey?: string;
    exchangeKey?: string;
    timeframe?: string;
    start?: string;
    end?: string;
    strategyCode?: string;
    initialBalance?: number;
    finalBalance?: number;
    profit?: number;
    result?: number;
    indicatorInputs?: string;
  }) {
    Object.assign(this, {
      _id,
      assetKey,
      currencyKey,
      exchangeKey,
      timeframe,
      start,
      end,
      strategyCode,
      initialBalance,
      finalBalance,
      profit,
      result,
      indicatorInputs
    });
  }
}
