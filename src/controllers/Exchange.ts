import _ from "lodash";
import { Edm, odata, ODataController } from "odata-v4-server";
import { ExchangeEngine } from "../engine/Exchange";
import { Currency } from "../models/Currency";
import { Exchange } from "../models/Exchange";
import { Timeframe } from "../models/Timeframe";

@odata.type(Exchange)
@Edm.EntitySet("Exchange")
export class ExchangeController extends ODataController {
  @odata.GET
  public get(): Exchange[] {
    return ExchangeEngine.getExchangeKeys().map(key => new Exchange(key));
  }

  @odata.GET
  public getById(@odata.key key: string): Exchange {
    return new Exchange(key);
  }

  @odata.GET("Currencies")
  public async getSymbols(@odata.result result: any): Promise<Currency[]> {
    const { key: exchangeKey } = result;
    const mSymbols = _.groupBy(
      await ExchangeEngine.getSymbols(exchangeKey),
      e => e.currency
    );
    return _.keys(mSymbols).map(k => {
      return new Currency({
        key: k,
        exchangeKey
      });
    });
  }

  @odata.GET("Periods")
  public async getPeriods(
    @odata.result result: any
  ): Promise<Timeframe[]> {
    const { key } = result;
    return (await ExchangeEngine.getTimeframes(key)).map(
      e => new Timeframe(e)
    );
  }
}
