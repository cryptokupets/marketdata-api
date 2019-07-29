import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { BacktestEngine } from "../engine/Backtest";
import { ExchangeEngine } from "../engine/Exchange";
import { IndicatorsEngine } from "../engine/Indicators";
import { Backtest } from "../models/Backtest";
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
    const backtest = new Backtest(
      await db.collection(collectionName).findOne({ _id }, { projection })
    );
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
    } = backtest;

    // добавить свечи
    const candles = await ExchangeEngine.getCandles({
      exchange: exchangeKey,
      currency: currencyKey,
      asset: assetKey,
      timeframe,
      start,
      end
    });

    backtest.candles = candles;

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

    backtest.indicators = indicators;
    // добавить сигналы и изменение баланса

    const advices = await BacktestEngine.getAdvices({
      strategyFunction: new Function("indicator", strategyCode),
      indicator: indicators[0]
    });

    backtest.advices = advices;

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

    backtest.trades = trades;

    return backtest;
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
}
