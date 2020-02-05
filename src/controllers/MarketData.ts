import _ from "lodash";
import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { Candle } from "../models/Candle";
import { DateRange } from "../models/DateRange";
import { MarketData } from "../models/MarketData";

const collectionName = "marketData";

@odata.type(MarketData)
@Edm.EntitySet("MarketData")
export class MarketDataController extends ODataController {
  @odata.GET
  public async get(@odata.query query: ODataQuery): Promise<MarketData[]> {
    const db = await connect();
    const mongodbQuery = createQuery(query);

    if (mongodbQuery.query._id) {
      mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
    }

    const result: MarketData[] & { inlinecount?: number } =
      typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
        ? []
        : await db
          .collection(collectionName)
          .find(mongodbQuery.query)
          .project(mongodbQuery.projection)
          .skip(mongodbQuery.skip || 0)
          .limit(mongodbQuery.limit || 0)
          .sort(mongodbQuery.sort)
          .map(e => new MarketData(e))
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
  ): Promise<MarketData> {
    const db = await connect();
    const { projection } = createQuery(query);
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    return new MarketData(
      await db.collection(collectionName).findOne({ _id }, { projection })
    );
  }

  @odata.POST
  public async post(
    @odata.body
    body: any
  ): Promise<MarketData> {
    const item = new MarketData(body);
    item._id = (await (await connect())
      .collection(collectionName)
      .insertOne(item)).insertedId;
    return item;
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

  @odata.GET("Ranges")
  public async getRanges(
    @odata.result result: MarketData,
    @odata.query query: ODataQuery
  ): Promise<DateRange[]> {
    const db = await connect();
    const collection = db.collection("dateRange");
    const mongodbQuery = createQuery(query);
    const parentId = new ObjectID(result._id);
    const ranges: any =
      typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
        ? []
        : await collection
          .find({ $and: [{ parentId }, mongodbQuery.query] })
          .project(mongodbQuery.projection)
          .skip(mongodbQuery.skip || 0)
          .limit(mongodbQuery.limit || 0)
          .sort(mongodbQuery.sort)
          .toArray();
    if (mongodbQuery.inlinecount) {
      ranges.inlinecount = await collection
        .find({ $and: [{ parentId }, mongodbQuery.query] })
        .project(mongodbQuery.projection)
        .count(false);
    }
    return ranges;
  }

  @odata.GET("Candles")
  public async getCandles(
    @odata.result result: MarketData,
    @odata.query query: ODataQuery
  ): Promise<Candle[]> {
    const db = await connect();
    const collection = db.collection("candle");
    const mongodbQuery = createQuery(query);
    const parentId = new ObjectID(result._id);
    const candles: any =
      typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
        ? []
        : await collection
          .find({ $and: [{ parentId }, mongodbQuery.query] })
          .project(mongodbQuery.projection)
          .skip(mongodbQuery.skip || 0)
          .limit(mongodbQuery.limit || 0)
          .sort(mongodbQuery.sort)
          .toArray();
    if (mongodbQuery.inlinecount) {
      candles.inlinecount = await collection
        .find({ $and: [{ parentId }, mongodbQuery.query] })
        .project(mongodbQuery.projection)
        .count(false);
    }
    return candles;
  }
}
