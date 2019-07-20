import _ from "lodash";
import { Edm, odata, ODataController } from "odata-v4-server";
import { ExchangeEngine } from "../../engine/Exchange";
import { AssetModel } from "../models/Asset";
import { CurrencyModel } from "../models/Currency";
import { ExchangeModel } from "../models/Exchange";

@odata.type(CurrencyModel)
@Edm.EntitySet("Currency")
export class CurrencyController extends ODataController {
  @odata.GET
  public async getById(
    @odata.key key: string,
    @odata.key exchangeKey: string
  ): Promise<CurrencyModel> {
    const mSymbols = _.filter(
      await ExchangeEngine.getSymbols(exchangeKey),
      e => e.currency === key
    );
    return new CurrencyModel({
      key,
      exchangeKey,
      Assets: mSymbols.map(e => new AssetModel(e.asset))
    });
  }

  @odata.GET("Exchange")
  public getExchange(@odata.result result: any): ExchangeModel {
    const { exchangeKey: key } = result;
    return new ExchangeModel(key);
  }
}
