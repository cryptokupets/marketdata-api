import _ from "lodash";
import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { ExchangeEngine } from "../engine/Exchange";
import { IndicatorsEngine } from "../engine/Indicators";
import { IndicatorRow } from "../models/IndicatorRow";
import { IndicatorView } from "../models/IndicatorView";
import { MarketData } from "../models/MarketData";

const collectionName = "indicatorView";

@odata.type(IndicatorView)
@Edm.EntitySet("IndicatorView")
export class IndicatorViewController extends ODataController {
  @odata.GET
  public async get(@odata.query query: ODataQuery): Promise<IndicatorView[]> {
    const db = await connect();
    const mongodbQuery = createQuery(query);

    if (mongodbQuery.query._id) {
      mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
    }

    const result: IndicatorView[] & { inlinecount?: number } =
      typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
        ? []
        : await db
            .collection(collectionName)
            .find(mongodbQuery.query)
            .project(mongodbQuery.projection)
            .skip(mongodbQuery.skip || 0)
            .limit(mongodbQuery.limit || 0)
            .sort(mongodbQuery.sort)
            .map(e => new IndicatorView(e))
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
  ): Promise<IndicatorView> {
    const { projection } = createQuery(query);
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    const db = await connect();
    return new IndicatorView(
      await db.collection(collectionName).findOne({ _id }, { projection })
    );
  }

  @odata.POST
  public async post(
    @odata.body
    body: any
  ): Promise<IndicatorView> {
    const item = new IndicatorView(body);
    item.parentId = new ObjectID(body.parentId);
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
    if (delta.parentId) {
      delta.parentId = new ObjectID(delta.parentId);
    }
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    const db = await connect();
    return db
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

  @odata.GET("Output")
  public async getOutput(@odata.result result: any): Promise<IndicatorRow[]> {
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(result._id);
    const db = await connect();
    const { parentId, name, options } = (await db
      .collection(collectionName)
      .findOne({ _id })) as IndicatorView;

    const marketData = (await db
      .collection("marketData")
      .findOne({ _id: parentId })) as MarketData;

    const candles = await ExchangeEngine.getCandles(marketData);

    return (await IndicatorsEngine.getIndicator(candles, {
      name,
      options: JSON.parse(options)
    })).map(o => new IndicatorRow(o.time, o.values));
  }

  @odata.GET("Parent")
  public async getParent(@odata.result result: any): Promise<MarketData> {
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(result._id);
    const db = await connect();
    const { parentId } = (await db
      .collection(collectionName)
      .findOne({ _id })) as IndicatorView;

    return (await db
      .collection("marketData")
      .findOne({ _id: parentId })) as MarketData;
  }
}
