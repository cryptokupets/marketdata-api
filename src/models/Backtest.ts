import { ObjectID } from "mongodb";
import { Edm, odata } from "odata-v4-server";
import connect from "../connect";
import { BacktestEngine } from "../engine/Backtest";
import { ExchangeEngine } from "../engine/Exchange";
import { IndicatorsEngine } from "../engine/Indicators";
import { BalanceItem } from "../models/BalanceItem";
import { Indicator } from "../models/Indicator";
import { IndicatorRow } from "../models/IndicatorRow";
import { Trade } from "../models/Trade";
import { BacktestOutput } from "./BacktestOutput";
import { Exchange } from "./Exchange";

const collectionName = "backtest";

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
  public strategyIndicators: string;

  @Edm.String
  public strategyParameters: string;

  @Edm.String
  public strategyCode: string;

  @Edm.Boolean
  public stoplossEnabled: boolean;

  @Edm.Double
  public stopLossLevel: number;

  @Edm.Double
  public fee: number;

  @Edm.Double
  public initialBalance: number;

  @Edm.Double
  public finalBalance: number;

  @Edm.Double
  public profit: number;

  @Edm.EntityType(Edm.ForwardRef(() => Exchange))
  public Exchange: Exchange;

  @Edm.EntityType(Edm.ForwardRef(() => BacktestOutput))
  public Output: BacktestOutput;

  constructor(data: any) {
    Object.assign(this, data);
  }

  @Edm.Action
  public async run(@odata.result result: any): Promise<number> {
    const { _id: key } = result;
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    const db = await connect();
    const backtest = new Backtest(
      await db.collection(collectionName).findOne({ _id })
    );
    const {
      assetKey,
      currencyKey,
      exchangeKey,
      timeframe,
      start,
      end,
      initialBalance,
      strategyIndicators,
      strategyParameters,
      strategyCode,
      stoplossEnabled,
      stopLossLevel,
      fee
    } = backtest;

    // добавить свечи
    // UNDONE нужно взять период с запасом
    const candles = await ExchangeEngine.getCandles({
      exchange: exchangeKey,
      currency: currencyKey,
      asset: assetKey,
      timeframe,
      start,
      end
    });

    // добавить индикаторы
    const indicators = await Promise.all(
      (JSON.parse(strategyIndicators) as Array<{
        name: string;
        options: number[];
      }>).map(input =>
        IndicatorsEngine.getIndicator(candles, input).then(
          output =>
            new Indicator({
              name: input.name,
              options: JSON.stringify(input.options),
              Output: output.map(o => new IndicatorRow(o.time, o.values))
            })
        )
      )
    );

    // добавить сигналы и изменение баланса
    const advices = await BacktestEngine.getAdvices({
      strategyFunction: new Function("indicators", strategyCode),
      candles,
      indicators,
      parameters: JSON.parse(strategyParameters) as number[]
    });

    // сделки
    // перебор по советам
    // при изменении совета происходит сделка
    const trades: Trade[] = [];
    let positionOpen = false; // изначально закрыта
    let stopLossPrice;
    let advice;

    for (const { time, close } of candles) {
      // позиция закрыта или открыта
      if (!positionOpen) {
        // если позиция закрыта, то ожидается сигнал на покупку
        advice = advices.find(e => e.time === time);
        if (advice && advice.value === 1) {
          trades.push(
            new Trade({
              time,
              side: "buy",
              price: close
            })
          );
          if (stoplossEnabled) {
            stopLossPrice = close * stopLossLevel;
          }
          positionOpen = true;
        }
      } else {
        // если позиция открыта, то ожидается сигнал на продажу или стоп-лосс
        if (stoplossEnabled) {
          if (close < stopLossPrice) {
            trades.push(
              new Trade({
                time,
                side: "sell",
                price: stopLossPrice
              })
            );
            positionOpen = false;
          } else {
            stopLossPrice = Math.max(stopLossPrice, close * stopLossLevel);
          }
        } else {
          advice = advices.find(e => e.time === time);
          if (advice && advice.value === -1) {
            trades.push(
              new Trade({
                time,
                side: "sell",
                price: close
              })
            );
            positionOpen = false;
          }
        }
      }
    }

    // пройти по всем свечам
    // при наличии сделки менять баланс
    let prevBalanceItem: BalanceItem = new BalanceItem({
      time: candles[0].time,
      currencyAmount: initialBalance,
      assetAmount: 0,
      estimateAmount: 0
    });

    const balance = candles.map(candle => {
      // если нет сделок - то брать предыдущий
      // estimate вычислить на основе нового курса
      // если есть сделка - то переводить
      const { currencyAmount, assetAmount } = prevBalanceItem;
      const { time, close } = candle;
      const balanceItem: BalanceItem = new BalanceItem({ time });
      const trade = trades.find(e => e.time === time);
      if (trade) {
        const { price } = trade;
        if (trade.side === "buy") {
          balanceItem.currencyAmount = 0;
          balanceItem.assetAmount = (currencyAmount * (1 - fee)) / price;
          balanceItem.estimateAmount = currencyAmount * (1 - fee);
        } else {
          balanceItem.assetAmount = 0;
          balanceItem.currencyAmount = assetAmount * price * (1 - fee);
          balanceItem.estimateAmount = assetAmount * price * (1 - fee);
        }
      } else {
        Object.assign(balanceItem, {
          currencyAmount,
          assetAmount,
          estimateAmount: currencyAmount || assetAmount * close * (1 - fee)
        });
      }
      prevBalanceItem = balanceItem;
      return balanceItem;
    });

    const finalBalance = balance[balance.length - 1].estimateAmount;
    const profit = finalBalance - initialBalance;
    const delta = {
      finalBalance,
      profit
    };

    return (await connect())
      .collection(collectionName)
      .updateOne({ _id }, { $set: delta })
      .then(r => r.modifiedCount);
  }
}
