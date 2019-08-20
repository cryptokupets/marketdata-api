import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { IndicatorView } from "../models/IndicatorView";
import { MarketDataView } from "../models/MarketDataView";

const collectionName = "marketDataView";

@odata.type(MarketDataView)
@Edm.EntitySet("MarketDataView")
export class MarketDataViewController extends ODataController {
  @odata.GET
  public async get(@odata.query query: ODataQuery): Promise<MarketDataView[]> {
    const db = await connect();
    const mongodbQuery = createQuery(query);

    if (mongodbQuery.query._id) {
      mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
    }

    const result: MarketDataView[] & { inlinecount?: number } =
      typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
        ? []
        : await db
            .collection(collectionName)
            .find(mongodbQuery.query)
            .project(mongodbQuery.projection)
            .skip(mongodbQuery.skip || 0)
            .limit(mongodbQuery.limit || 0)
            .sort(mongodbQuery.sort)
            .map(e => new MarketDataView(e))
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
  ): Promise<MarketDataView> {
    const { projection } = createQuery(query);
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    const db = await connect();
    return new MarketDataView(
      await db.collection(collectionName).findOne({ _id }, { projection })
    );
  }

  @odata.POST
  public async post(
    @odata.body
    body: any
  ): Promise<MarketDataView> {
    const item = new MarketDataView(body);
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

  @odata.POST("Indicators")
  public async postIndicators(
    @odata.body body: any,
    @odata.result result: any
  ): Promise<IndicatorView> {
    const item = new IndicatorView(body);
    item.marketDataViewId = new ObjectID(result.marketDataViewId);
    item._id = (await (await connect())
      .collection("indicatorView")
      .insertOne(item)).insertedId;
    return item;
  }

  @odata.GET("Indicators")
  public async getIndicators(
    @odata.result result: MarketDataView,
    @odata.query query: ODataQuery
  ): Promise<IndicatorView[]> {
    const db = await connect();
    const collection = db.collection("indicatorView");
    const mongodbQuery = createQuery(query);
    const marketDataViewId = new ObjectID(result._id);

    const indicators: any =
      typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
        ? []
        : await collection
            .find({ $and: [{ marketDataViewId }, mongodbQuery.query] })
            .project(mongodbQuery.projection)
            .skip(mongodbQuery.skip || 0)
            .limit(mongodbQuery.limit || 0)
            .sort(mongodbQuery.sort)
            .toArray();
    if (mongodbQuery.inlinecount) {
      indicators.inlinecount = await collection
        .find({ $and: [{ marketDataViewId }, mongodbQuery.query] })
        .project(mongodbQuery.projection)
        .count(false);
    }
    return indicators;
  }
}
