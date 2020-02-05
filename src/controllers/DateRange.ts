import _ from "lodash";
import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { DateRange } from "../models/DateRange";

const collectionName = "dateRange";

@odata.type(DateRange)
@Edm.EntitySet("DateRange")
export class DateRangeController extends ODataController {
  @odata.GET
  public async get(@odata.query query: ODataQuery): Promise<DateRange[]> {
    const db = await connect();
    const mongodbQuery = createQuery(query);

    if (mongodbQuery.query._id) {
      mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
    }

    const result: DateRange[] & { inlinecount?: number } =
      typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
        ? []
        : await db
          .collection(collectionName)
          .find(mongodbQuery.query)
          .project(mongodbQuery.projection)
          .skip(mongodbQuery.skip || 0)
          .limit(mongodbQuery.limit || 0)
          .sort(mongodbQuery.sort)
          .map(e => new DateRange(e))
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
  ): Promise<DateRange> {
    const db = await connect();
    const { projection } = createQuery(query);
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(key);
    return new DateRange(
      await db.collection(collectionName).findOne({ _id }, { projection })
    );
  }

  @odata.POST // перенести в MarketData
  public async post(
    @odata.body
    body: any
  ): Promise<DateRange> {
    if (body.parentId) {
      body.parentId = new ObjectID(body.parentId);
    }

    body.status = false;

    const item = new DateRange(body);

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

    if (delta.parentId) {
      delta.parentId = new ObjectID(delta.parentId);
    }

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
