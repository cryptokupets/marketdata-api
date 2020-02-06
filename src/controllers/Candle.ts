import { ObjectID } from "mongodb";
import { createQuery } from "odata-v4-mongodb";
import { Edm, odata, ODataController, ODataQuery } from "odata-v4-server";
import connect from "../connect";
import { Candle } from "../models/Candle";

const collectionName = "candle";

@odata.type(Candle)
@Edm.EntitySet("Candle")
export class CandleController extends ODataController {
  @odata.GET
  public async get(@odata.query query: ODataQuery): Promise<Candle[]> {
    const db = await connect();
    const mongodbQuery = createQuery(query);

    if (mongodbQuery.query._id) {
      mongodbQuery.query._id = new ObjectID(mongodbQuery.query._id);
    }

    const result: Candle[] & { inlinecount?: number } =
      typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
        ? []
        : await db
          .collection(collectionName)
          .find(mongodbQuery.query)
          .project(mongodbQuery.projection)
          .skip(mongodbQuery.skip || 0)
          .limit(mongodbQuery.limit || 0)
          .sort(mongodbQuery.sort)
          .map(e => new Candle(e))
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
}
