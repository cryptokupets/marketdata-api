import { Edm } from "odata-v4-server";
import { Advice } from "./Advice";
import { BalanceItem } from "./BalanceItem";
import { Candle } from "./Candle";
import { Indicator } from "./Indicator";
import { Trade } from "./Trade";

export class BacktestOutput {
  @Edm.Double
  public finalBalance: number;

  @Edm.Double
  public profit: number;

  @Edm.Double
  public result: number;

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Candle)))
  public candles: Candle[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Indicator)))
  public indicators: Indicator[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Advice)))
  public advices: Advice[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Trade)))
  public trades: Trade[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => BalanceItem)))
  public balance: BalanceItem[];

  constructor({
    finalBalance,
    profit,
    result,
    candles,
    indicators,
    advices,
    trades,
    balance
  }: {
    finalBalance?: number;
    profit?: number;
    result?: number;
    candles?: Candle[];
    indicators?: Indicator[];
    advices?: Advice[];
    trades?: Trade[];
    balance?: BalanceItem[];
  }) {
    Object.assign(this, {
      finalBalance,
      profit,
      result,
      candles,
      indicators,
      advices,
      trades,
      balance
    });
  }
}
