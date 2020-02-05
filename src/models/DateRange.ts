import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server;
import { streamCandle } from "get-candles";

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
  public status: bool; // загружены или нет данные

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
      start,
      end,
      parentId,
      status
    } = await collection.findOne({ _id });

  	// запускать только если !status
  	if (!status) return 0;

  	// получить список всех диапазонов набора со статусом true
  	const ranges = _(await collection
        .find({ $and: [{ parentId }, { status: true }] }) // TODO добавить условие по дате
        .map(e => moment.range(e.begin, e.end)))
        .reduce((accumulator, value) => accumulator 
        	.map(e => e.substract(value))
        	.filter(e => e)
        	.flatten()
        	.toArray(), [moment.range(begin, end)]);
  	// из текущего диапазона исключить все пересечения
  	// для каждого полученного элемента если исходный массив не нулевой
  	// из каждого элемента исходного массива исключить полученный
  	
  	// для каждого элемента исходного массива выполнить запрос к источнику данных
  	// после успешного получения сохранить в базе данных, изменить статус на true
  	// вернуть положительный результат
  	const collectionCandle = db.collection("candle");
  	for (let i = 0; i < ranges.length; i++) {
  		 await new Promise(resolve => {
	  		let rs = streamCandle({
			  exchange: "hitbtc",
			  currency,
			  asset,
			  period,
			  start: ranges[i].begin,
			  end: ranges[i].end
			}).pipe(es.map((chunk: any, next: any) => {
	    		const candle: any = JSON.parse(chunk);
	    		collectionCandle.insertOne(candle, next);
			}));
			
			rs.on("end", () => resolve());
  		 });
  	}

	// сохранить в бд
    return collection.updateOne({ _id }, { $set: { status: true })
    	.then(result => result.modifiedCount);
	// const range_ab = moment.range(a, b);
	// const range_bc = moment.range(b, c);
	// const range_cd = moment.range(c, d);
	// const range_ad = moment.range(a, d);
	// range_ad.subtract(range_bc); // [moment.range(a, b) moment.range(c, d)]
	// range_ac.subtract(range_bc); // [moment.range(a, b)]
	// range_ab.subtract(range_cd); // [moment.range(a, b)]
	// range_bc.subtract(range_bd); // [null]

  }
}
