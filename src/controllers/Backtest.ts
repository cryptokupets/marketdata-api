import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { Backtest } from "../models/Backtest";

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
    initialBalance
  }: {
    assetKey?: string;
    currencyKey?: string;
    exchangeKey?: string;
    timeframe?: string;
    start?: string;
    end?: string;
    strategyCode?: string;
    initialBalance?: number;
  }): Promise<Backtest> {
    const backtest = new Backtest({
      assetKey,
      currencyKey,
      exchangeKey,
      timeframe,
      start,
      end,
      strategyCode,
      initialBalance
    });
    backtest._id = (await (await connect())
      .collection(collectionName)
      .insertOne(backtest)).insertedId;
    return backtest;
  }

  @odata.PATCH
  public async patch(
    @odata.key key: string,
    @odata.body
    {
      assetKey,
      currencyKey,
      exchangeKey,
      timeframe,
      start,
      end,
      strategyCode,
      initialBalance
    }: {
      assetKey?: string;
      currencyKey?: string;
      exchangeKey?: string;
      timeframe?: string;
      start?: string;
      end?: string;
      strategyCode?: string;
      initialBalance?: number;
    }
  ): Promise<number> {
    const delta = new Backtest({
      assetKey,
      currencyKey,
      exchangeKey,
      timeframe,
      start,
      end,
      strategyCode,
      initialBalance
    });

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
