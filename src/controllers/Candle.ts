import _ from "lodash";
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

  @Edm.Action
  async import( // стоит ли через body?
    @Edm.String exchange: string,
    @Edm.String currency: string,
    @Edm.String asset: string,
    @Edm.Double period: number,
    @Edm.String begin: string,
    @Edm.String end: string
  ) {
    // удалить все существующие данные этого периода
    // загрузить новые
    const db = await connect();
    const collection = db.collection(collectionName);
    return new Promise(resolve => {
        const rs = streamCandle({
          exchange,
          currency,
          asset,
          period,
          start,
          end
        }).pipe(es.map((chunk: any, next: any) => {
            // добавлять с пропусками?
            // как понять что данные полные? только хранить историю успешшных импортов
          const candle: any = JSON.parse(chunk);
          collection.insertOne(candle, next);
        }));

        rs.on("end", () => resolve());
      });

  }
}
