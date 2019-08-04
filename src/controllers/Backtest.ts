import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { BacktestEngine } from "../engine/Backtest";
import { ExchangeEngine } from "../engine/Exchange";
import { IndicatorsEngine } from "../engine/Indicators";
import { Backtest } from "../models/Backtest";
import { BacktestOutput } from "../models/BacktestOutput";
import { BalanceItem } from "../models/BalanceItem";
import { Exchange } from "../models/Exchange";
import { Indicator } from "../models/Indicator";
import { IndicatorRow } from "../models/IndicatorRow";
import { Trade } from "../models/Trade";

const collectionName = "backtest";

@odata.type(Backtest)
@Edm.EntitySet("Backtest")
export class BacktestController extends ODataController {
  @odata.GET
  public async get(@odata.query query: ODataQuery): Promise<Backtest[]> {
    const db = await connect();
    const mongodbQuery = createQuery(query);

    if (mongodbQuery.query._id) {
      mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
    }

    const result: Backtest[] & { inlinecount?: number } =
      typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
        ? []
        : await db
            .collection(collectionName)
            .find(mongodbQuery.query)
            .project(mongodbQuery.projection)
            .skip(mongodbQuery.skip || 0)
            .limit(mongodbQuery.limit || 0)
            .sort(mongodbQuery.sort)
            .map(e => new Backtest(e))
            .toArray();

    if (mongodbQuery.inlinecount) {
      result.inlinecount = await db
        .collection(collectionName)
        .find(mongodbQuery.query)
        .project(mongodbQuery.projection)
        .count(false);
    }
    return result;
  }

  @odata.GET
  public async getById(
    @odata.key key: string,
    @odata.query query: ODataQuery
  ): Promise<Backtest> {
    const { projection } = createQuery(query);
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    const db = await connect();
    return new Backtest(
      await db.collection(collectionName).findOne({ _id }, { projection })
    );
  }

  @odata.POST
  public async post(@odata.body
  {
    assetKey,
    currencyKey,
    exchangeKey,
    timeframe,
    start,
    end,
    strategyCode,
    initialBalance,
    indicatorInputs
  }: {
    assetKey?: string;
    currencyKey?: string;
    exchangeKey?: string;
    timeframe?: string;
    start?: string;
    end?: string;
    strategyCode?: string;
    initialBalance?: number;
    indicatorInputs?: string;
  }): Promise<Backtest> {
    const backtest = new Backtest({
      assetKey,
      currencyKey,
      exchangeKey,
      timeframe,
      start,
      end,
      strategyCode,
      initialBalance,
      indicatorInputs
    });
    backtest._id = (await (await connect())
      .collection(collectionName)
      .insertOne(backtest)).insertedId;
    return backtest;
  }

  @odata.PATCH
  public async patch(
    @odata.key key: string,
    @odata.body delta: any
  ): Promise<number> {
    if (delta._id) {
      delete delta._id;
    }
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    return (await connect())
      .collection(collectionName)
      .updateOne({ _id }, { $set: delta })
      .then(result => result.modifiedCount);
  }

  @odata.DELETE
  public async remove(@odata.key key: string): Promise<number> {
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    return (await connect())
      .collection(collectionName)
      .deleteOne({ _id })
      .then(result => result.deletedCount);
  }

  @odata.GET("Exchange")
  public async getExchange(@odata.result result: any): Promise<Exchange> {
    const { _id: key } = result;
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    const db = await connect();
    const { exchangeKey } = new Backtest(
      await db.collection(collectionName).findOne({ _id })
    );
    return new Exchange(exchangeKey);
  }

  @odata.GET("Output")
  public async getOutput(@odata.result result: any): Promise<BacktestOutput> {
    const { _id: key } = result;
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    const db = await connect();
    const {
      exchangeKey,
      currencyKey,
      assetKey,
      timeframe,
      start,
      end,
      indicatorInputs,
      strategyCode,
      initialBalance
    } = new Backtest(await db.collection(collectionName).findOne({ _id }));

    // добавить свечи
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
      indicatorInputs
        .split(";")
        .map(e => {
          const parsed = e.split(" ");
          return { name: parsed[0], options: parsed.splice(1).map(o => +o) };
        })
        .map(input =>
          IndicatorsEngine.getIndicator(candles, input).then(
            output =>
              new Indicator({
                name: input.name,
                options: input.options,
                output: output.map(o => new IndicatorRow(o.time, o.values))
              })
          )
        )
    );

    // добавить сигналы и изменение баланса
    const advices = await BacktestEngine.getAdvices({
      strategyFunction: new Function("indicator", strategyCode),
      indicator: indicators[0]
    });

    // сделки
    // перебор по советам
    // при изменении совета происходит сделка
    let lastAdviceValue = -1;
    const trades: Trade[] = [];

    for (const { time, value } of advices) {
      if (value !== lastAdviceValue) {
        // найти нужную свечу
        const candle = candles.find(e => e.time === time);
        trades.push(
          new Trade({
            time,
            side: value > 0 ? "buy" : "sell",
            price: candle.close
          })
        );
        lastAdviceValue = value;
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
      const { time, close: price } = candle;
      const balanceItem: BalanceItem = new BalanceItem({ time });
      const trade = trades.find(e => e.time === time);
      if (trade) {
        if (trade.side === "buy") {
          balanceItem.currencyAmount = 0;
          balanceItem.assetAmount = currencyAmount / price;
          balanceItem.estimateAmount = currencyAmount;
        } else {
          balanceItem.assetAmount = 0;
          balanceItem.currencyAmount = assetAmount * price;
          balanceItem.estimateAmount = assetAmount * price;
        }
      } else {
        Object.assign(balanceItem, {
          currencyAmount,
          assetAmount,
          estimateAmount: currencyAmount || assetAmount * price
        });
      }
      prevBalanceItem = balanceItem;
      return balanceItem;
    });

    const finalBalance = balance[balance.length - 1].estimateAmount;
    const profit = finalBalance - initialBalance;
    const backtestResult = profit / initialBalance;

    return new BacktestOutput({
      finalBalance,
      profit,
      result: backtestResult,
      candles,
      indicators,
      advices,
      trades,
      balance
    });
  }
}
