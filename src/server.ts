import { odata, ODataServer } from "odata-v4-server";
import { BufferController } from "./controllers/Buffer";
import { CurrencyController } from "./controllers/Currency";
import { ExchangeController } from "./controllers/Exchange";

@odata.cors
@odata.namespace("MarketData")
@odata.controller(BufferController, true)
@odata.controller(CurrencyController, true)
@odata.controller(ExchangeController, true)
export class MarketDataServer extends ODataServer {}
