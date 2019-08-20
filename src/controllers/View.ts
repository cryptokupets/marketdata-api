import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { Chart } from "../models/Chart";
import { Series } from "../models/Series";
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
    const { projection } = createQuery(query);
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    const db = await connect();
    return new View(
      await db.collection(collectionName).findOne({ _id }, { projection })
    );
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
    chart._id = (await db
      .collection("chart")
      .insertOne(chart)).insertedId;

    const collectionSeries = db.collection("series");

    chart.Series = await Promise.all((Series as Series[]).map(async s => {
      s.chartId = chart._id;
      s._id = (await collectionSeries
        .insertOne(s)).insertedId;
      return s;
    }));

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
}
