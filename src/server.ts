import { odata, ODataServer } from "odata-v4-server";
import { BacktestController } from "./controllers/Backtest";
import { BufferController } from "./controllers/Buffer";
import { ChartController } from "./controllers/Chart";
import { CurrencyController } from "./controllers/Currency";
import { ExchangeController } from "./controllers/Exchange";
import { SeriesController } from "./controllers/Series";
import { ViewController } from "./controllers/View";

@odata.cors
@odata.namespace("MarketData")
@odata.controller(BacktestController, true)
@odata.controller(BufferController, true)
@odata.controller(ChartController, true)
@odata.controller(CurrencyController, true)
@odata.controller(ExchangeController, true)
@odata.controller(ViewController, true)
@odata.controller(SeriesController, true)
export class MarketDataServer extends ODataServer {}
