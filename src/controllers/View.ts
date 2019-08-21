import _ from "lodash";
import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { ExchangeEngine } from "../engine/Exchange";
import { Asset } from "../models/Asset";
import { Chart } from "../models/Chart";
import { Currency } from "../models/Currency";
import { Series } from "../models/Series";
import { Timeframe } from "../models/Timeframe";
import { View } from "../models/View";

const collectionName = "view";

@odata.type(View)
@Edm.EntitySet("View")
export class ViewController extends ODataController {
  @odata.GET
  public async get(@odata.query query: ODataQuery): Promise<View[]> {
    const db = await connect();
    const mongodbQuery = createQuery(query);

    if (mongodbQuery.query._id) {
      mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
    }

    const result: View[] & { inlinecount?: number } =
      typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
        ? []
        : await db
            .collection(collectionName)
            .find(mongodbQuery.query)
            .project(mongodbQuery.projection)
            .skip(mongodbQuery.skip || 0)
            .limit(mongodbQuery.limit || 0)
            .sort(mongodbQuery.sort)
            .map(e => new View(e))
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
  ): Promise<View> {
    const db = await connect();
    if (key) {
      const { projection } = createQuery(query);
      // tslint:disable-next-line: variable-name
      const _id = new ObjectID(key);
      return new View(
        await db.collection(collectionName).findOne({ _id }, { projection })
      );
    } else {
      return new View(
        (await db.collection(collectionName).find().limit(1).toArray())[0]
      );
    }
  }

  @odata.POST
  public async post(
    @odata.body
    body: any
  ): Promise<View> {
    const item = new View(body);
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
  ): Promise<Chart> {
    // tslint:disable-next-line: no-shadowed-variable
    const { Series } = body;
    // item.viewId = new ObjectID(result.viewId);
    const chart = new Chart({
      viewId: new ObjectID(result._id)
    });
    // сразу создаться series
    const db = await connect();
    chart._id = (await db.collection("chart").insertOne(chart)).insertedId;

    const collectionSeries = db.collection("series");

    chart.Series = await Promise.all(
      (Series as Series[]).map(async s => {
        s.chartId = chart._id;
        s._id = (await collectionSeries.insertOne(s)).insertedId;
        return s;
      })
    );

    return chart;
  }

  @odata.GET("Indicators")
  public async getIndicators(
    @odata.result result: View,
    @odata.query query: ODataQuery
  ): Promise<View[]> {
    const db = await connect();
    const collection = db.collection("chart");
    const mongodbQuery = createQuery(query);
    const viewId = new ObjectID(result._id);

    const indicators: any =
      typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
        ? []
        : await collection
            .find({ $and: [{ viewId }, mongodbQuery.query] })
            .project(mongodbQuery.projection)
            .skip(mongodbQuery.skip || 0)
            .limit(mongodbQuery.limit || 0)
            .sort(mongodbQuery.sort)
            .toArray();
    if (mongodbQuery.inlinecount) {
      indicators.inlinecount = await collection
        .find({ $and: [{ viewId }, mongodbQuery.query] })
        .project(mongodbQuery.projection)
        .count(false);
    }
    return indicators;
  }

  @odata.GET("Currencies")
  public async getSymbols(@odata.result result: any): Promise<Currency[]> {
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(result._id);
    const db = await connect();
    const { exchange } = (await db
      .collection(collectionName)
      .findOne({ _id })) as View;

    const mSymbols = _.groupBy(
      await ExchangeEngine.getSymbols(exchange),
      e => e.currency
    );
    return _.keys(mSymbols).map(k => {
      return new Currency({
        key: k,
        exchangeKey: exchange
      });
    });
  }

  @odata.GET("Timeframes")
  public async getTimeframes(@odata.result result: any): Promise<Timeframe[]> {
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(result._id);
    const db = await connect();
    const { exchange } = (await db
      .collection(collectionName)
      .findOne({ _id })) as View;

    return (await ExchangeEngine.getTimeframes(exchange)).map(
      e => new Timeframe(e)
    );
  }

  @odata.GET("Assets")
  public async getAssets(@odata.result result: any): Promise<Asset[]> {
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(result._id);
    const db = await connect();
    const { currency, exchange } = (await db
      .collection(collectionName)
      .findOne({ _id })) as View;

    const mSymbols = _.filter(
      await ExchangeEngine.getSymbols(exchange),
      e => e.currency === currency
    );
    return mSymbols.map(
      e =>
        new Asset({
          key: e.asset,
          exchangeKey: exchange,
          currencyKey: currency
        })
    );
  }
}
