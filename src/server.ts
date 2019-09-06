import { odata, ODataServer } from "odata-v4-server";
import { BacktestController } from "./controllers/Backtest";
import { CurrencyController } from "./controllers/Currency";
import { ExchangeController } from "./controllers/Exchange";
import { IndicatorViewController } from "./controllers/IndicatorView";
import { MarketDataController } from "./controllers/MarketData";

@odata.cors
@odata.namespace("MarketData")
@odata.controller(BacktestController, true)
@odata.controller(IndicatorViewController, true)
@odata.controller(CurrencyController, true)
@odata.controller(ExchangeController, true)
@odata.controller(MarketDataController, true)
export class MarketDataServer extends ODataServer {}
