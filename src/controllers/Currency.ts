import _ from "lodash";
import { Edm, odata, ODataController } from "odata-v4-server";
import { ExchangeEngine } from "../engine/Exchange";
import { Asset } from "../models/Asset";
import { Currency } from "../models/Currency";

@odata.type(Currency)
@Edm.EntitySet("Currency")
export class CurrencyController extends ODataController {
  @odata.GET
  public getById(
    @odata.key key: string,
    @odata.key exchangeKey: string
  ): Currency {
    return new Currency({
      key,
      exchangeKey
    });
  }

  @odata.GET("Assets")
  public async getAssets(@odata.result result: any): Promise<Asset[]> {
    const { key: currencyKey, exchangeKey } = result;
    const mSymbols = _.filter(
      await ExchangeEngine.getSymbols(exchangeKey),
      e => e.currency === currencyKey
    );
    return mSymbols.map(
      e => new Asset({ key: e.asset, exchangeKey, currencyKey })
    );
  }
}
