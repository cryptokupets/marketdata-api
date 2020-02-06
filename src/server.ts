import { odata, ODataServer } from "odata-v4-server";
import { CandleController } from "./controllers/Candle";

@odata.cors
@odata.namespace("MarketData")
@odata.controller(CandleController, true)
export class MarketDataServer extends ODataServer { }
