import { ObjectID } from "mongodb";
import { Edm } from "odata-v4-server";
import { Candle } from "./Candle";
import { DateRange } from "./DateRange";

export class MarketData {
  @Edm.Key
  @Edm.Computed
  @Edm.String
  // tslint:disable-next-line: variable-name
  public _id: ObjectID;

  @Edm.Key
  @Edm.String
  public exchange: string;

  @Edm.Key
  @Edm.String
  public currency: string;

  @Edm.Key
  @Edm.String
  public asset: string;

  @Edm.Key
  @Edm.Double
  public period: number;

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => Candle)))
  public Candles: Candle[];

  @Edm.Collection(Edm.EntityType(Edm.ForwardRef(() => DateRange)))
  public Ranges: DateRange[];
  // заменить на MarketDataImport
  // MarketData вообще не хранить в БД
  // с MarketDataImport работу максимально упростить, для начала просто загружать каждый раз
  // затем проверять на простое совпадение
  // затем на включение
  // добавить операцию расширить до новых дат
  // затем остальные операции, объединить, поглотить, соединить, но сервер по идее может эту логику не выполнять
  // главная задача сервера проинформировать пользователя о наличии данных и обеспечить целостность

  constructor(data: any) {
    Object.assign(this, data);
  }
}
