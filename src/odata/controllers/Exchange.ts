import _ from "lodash";
import { Edm, odata, ODataController } from "odata-v4-server";
import { ExchangeEngine } from "../../engine/Exchange";
import { AssetModel } from "../models/Asset";
import { CurrencyModel } from "../models/Currency";
import { ExchangeModel } from "../models/Exchange";
import { TimeframeModel } from "../models/Timeframe";

@odata.type(ExchangeModel)
@Edm.EntitySet("Exchange")
export class ExchangeController extends ODataController {
  @odata.GET
  public get(): ExchangeModel[] {
    return ExchangeEngine.getExchangeKeys().map(
      key => new ExchangeModel(key)
    );
  }

  @odata.GET
  public getById(@odata.key key: string): ExchangeModel {
    return new ExchangeModel(key);
  }

  @odata.GET("Currencies")
  public async getSymbols(@odata.result result: any): Promise<CurrencyModel[]> {
    const { key: exchangeKey } = result;
    const mSymbols = _.groupBy(
      await ExchangeEngine.getSymbols(exchangeKey),
      e => e.currency
    );
    return _.toPairs(mSymbols).map(p => {
      return new CurrencyModel({
        key: p[0],
        exchangeKey,
        Assets: p[1].map(e => new AssetModel(e.asset))
      });
    });
  }

  @odata.GET("Timeframes")
  public async getTimeframes(
    @odata.result result: any
  ): Promise<TimeframeModel[]> {
    const { key } = result;
    return (await ExchangeEngine.getTimeframes(key)).map(
      e => new TimeframeModel(e)
    );
  }
}
