"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const odata_v4_server_1 = require("odata-v4-server");
const Backtest_1 = require("./controllers/Backtest");
const Buffer_1 = require("./controllers/Buffer");
const Chart_1 = require("./controllers/Chart");
const Currency_1 = require("./controllers/Currency");
const Exchange_1 = require("./controllers/Exchange");
const Series_1 = require("./controllers/Series");
const View_1 = require("./controllers/View");
let MarketDataServer = class MarketDataServer extends odata_v4_server_1.ODataServer {
};
MarketDataServer = __decorate([
    odata_v4_server_1.odata.cors,
    odata_v4_server_1.odata.namespace("MarketData"),
    odata_v4_server_1.odata.controller(Backtest_1.BacktestController, true),
    odata_v4_server_1.odata.controller(Buffer_1.BufferController, true),
    odata_v4_server_1.odata.controller(Chart_1.ChartController, true),
    odata_v4_server_1.odata.controller(Currency_1.CurrencyController, true),
    odata_v4_server_1.odata.controller(Exchange_1.ExchangeController, true),
    odata_v4_server_1.odata.controller(View_1.ViewController, true),
    odata_v4_server_1.odata.controller(Series_1.SeriesController, true)
], MarketDataServer);
exports.MarketDataServer = MarketDataServer;
//# sourceMappingURL=server.js.map