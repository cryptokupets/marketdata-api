import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { Advice } from "./Advice";
import { BacktestRow } from "./BacktestRow";
import { Candle } from "./Candle";
import { Indicator } from "./Indicator";

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

  @Edm.String
  public indicatorInputs: string;

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Candle)))
  public candles: Candle[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Indicator)))
  public indicators: Indicator[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Advice)))
  public advices: Advice[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => BacktestRow)))
  public rows: BacktestRow[];

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
    indicatorInputs,
    candles,
    indicators,
    advices,
    rows
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
    indicatorInputs?: string;
    candles?: Candle[];
    indicators?: Indicator[];
    advices?: Advice[];
    rows?: BacktestRow[];
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
      indicatorInputs,
      candles,
      indicators,
      advices,
      rows
    });
  }
}
