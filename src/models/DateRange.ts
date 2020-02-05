import es from "event-stream";
import { streamCandle } from "get-candles";
import _ from "lodash";
import * as Moment from "moment";
import { extendMoment } from "moment-range";
import { ObjectID } from "mongodb";
import { Edm, odata } from "odata-v4-server";
import connect from "../connect";

const moment = extendMoment(Moment);

const collectionName = "dateRange";

export class DateRange {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  // tslint:disable-next-line: variable-name
  public _id: ObjectID;

  @Edm.String
  public parentId: string;

  @Edm.String
  public begin: string;

  @Edm.String
  public end: string;

  @Edm.Boolean
  public status: boolean; // загружены или нет данные

  constructor(data: any) {
    Object.assign(this, data);
  }

  @Edm.Action
  public async importData(@odata.result result: any): Promise<number> {
    // tslint:disable-next-line: variable-name
    const _id = new ObjectID(result._id);
    const db = await connect();
    const collection = db.collection(collectionName);
    const {
      begin,
      end,
      parentId,
      status
    } = await collection.findOne({ _id });

    // запускать только если !status
    if (!status) { return 0; }

    // получить список всех диапазонов набора со статусом true
    const ranges = _.reduce(collection
      .find({ $and: [{ parentId }, { status: true }] }) // TODO добавить условие по дате
      .map(e => {
        return moment.range(e.begin, e.end);
      }), (accumulator, value: any) => _.flatten(accumulator
        .map(e => e.subtract(value))
        .filter(e => e)), [moment.range(begin, end)]);
    // из текущего диапазона исключить все пересечения
    // для каждого полученного элемента если исходный массив не нулевой
    // из каждого элемента исходного массива исключить полученный

    // для каждого элемента исходного массива выполнить запрос к источнику данных
    // после успешного получения сохранить в базе данных, изменить статус на true
    // вернуть положительный результат
    const {
      exchange,
      currency,
      asset,
      period
    } = await collection.findOne({ _id: parentId });

    const collectionCandle = db.collection("candle");
    for (const r of ranges) {
      await new Promise(resolve => {
        const rs = streamCandle({
          exchange,
          currency,
          asset,
          period,
          start: moment.utc(r.start).toISOString(),
          end: moment.utc(r.end).toISOString()
        }).pipe(es.map((chunk: any, next: any) => {
          const candle: any = JSON.parse(chunk);
          collectionCandle.insertOne(candle, next);
        }));

        rs.on("end", () => resolve());
      });
    }

    // сохранить в бд
    return collection.updateOne({ _id }, { $set: { status: true } })
      .then(r => r.modifiedCount);
  }
}
