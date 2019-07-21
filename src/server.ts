import { odata, ODataServer } from "odata-v4-server";
import { CurrencyController } from "./controllers/Currency";
import { ExchangeController } from "./controllers/Exchange";

@odata.cors
@odata.namespace("MarketData")
@odata.controller(ExchangeController, true)
@odata.controller(CurrencyController, true)
export class MarketDataServer extends ODataServer {}
