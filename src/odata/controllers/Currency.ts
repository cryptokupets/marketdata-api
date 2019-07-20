import _ from "lodash";
import { Edm, odata, ODataController } from "odata-v4-server";
import { ExchangeEngine } from "../../engine/Exchange";
import { AssetModel } from "../models/Asset";
import { CurrencyModel } from "../models/Currency";

@odata.type(CurrencyModel)
@Edm.EntitySet("Currency")
export class CurrencyController extends ODataController {
  @odata.GET
  public getById(
    @odata.key key: string,
    @odata.key exchangeKey: string
  ): CurrencyModel {
    return new CurrencyModel({
      key,
      exchangeKey
    });
  }

  @odata.GET("Assets")
  public async getAssets(@odata.result result: any): Promise<AssetModel[]> {
    const { key, exchangeKey } = result;
    const mSymbols = _.filter(
      await ExchangeEngine.getSymbols(exchangeKey),
      e => e.currency === key
    );
    return mSymbols.map(e => new AssetModel(e.asset));
  }
}
