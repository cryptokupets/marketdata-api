import { odata, ODataServer } from "odata-v4-server";
import { CandleController } from "./controllers/Candle";
import { DateRangeController } from "./controllers/DateRange";
import { MarketDataController } from "./controllers/MarketData";

@odata.cors
@odata.namespace("MarketData")
@odata.controller(CandleController, true)
@odata.controller(DateRangeController, true)
@odata.controller(MarketDataController, true)
export class MarketDataServer extends ODataServer { }
