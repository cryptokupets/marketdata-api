"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const moment = require("moment");
const odata_v4_server_1 = require("odata-v4-server");
const Exchange_1 = require("../engine/Exchange");
const Indicators_1 = require("../engine/Indicators");
const Indicator_1 = require("../models/Indicator");
const IndicatorRow_1 = require("../models/IndicatorRow");
const Candle_1 = require("./Candle");
const Currency_1 = require("./Currency");
const MarketData_1 = require("./MarketData");
const Timeframe_1 = require("./Timeframe");
class Exchange {
    constructor(key) {
        Object.assign(this, { key });
    }
    getCandles(currency, asset, timeframe, start, end, body, result) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = body || {
                currency,
                asset,
                timeframe,
                start,
                end
            };
            options.exchange = result.key;
            return Exchange_1.ExchangeEngine.getCandles(options);
        });
    }
    getMarketData(body, result) {
        return __awaiter(this, void 0, void 0, function* () {
            const { currency, asset, timeframe, start, end, indicatorInputs } = body;
            const inputs = JSON.parse(indicatorInputs);
            // расширить диапазон необходимый для прогрева индикаторов
            const indicatorsWarmup = lodash_1.default.max(inputs.map(e => Indicators_1.IndicatorsEngine.getStart(e)));
            const timeframeMinutes = Exchange_1.ExchangeEngine.timeframeToMinutes(timeframe);
            const startWarmup = moment
                .utc(start)
                .add(-indicatorsWarmup * timeframeMinutes, "m")
                .toISOString();
            const candles = yield Exchange_1.ExchangeEngine.getCandles({
                exchange: result.key,
                currency,
                asset,
                timeframe,
                start: startWarmup,
                end
            });
            return Promise.all(inputs.map(input => Indicators_1.IndicatorsEngine.getIndicator(candles, input).then(output => Object.assign(input, {
                output
            })))).then(indicators => new MarketData_1.MarketData({
                candles: candles
                    .filter(e => moment.utc(e.time).isBetween(start, end, "m", "[]"))
                    .map(e => new Candle_1.Candle(e)),
                indicators: indicators.map(indicator => new Indicator_1.Indicator({
                    name: indicator.name,
                    options: indicator.options,
                    output: indicator.output
                        .filter(e => moment.utc(e.time).isBetween(start, end, "m", "[]"))
                        .map(o => new IndicatorRow_1.IndicatorRow(o.time, o.values))
                }))
            }));
        });
    }
}
__decorate([
    odata_v4_server_1.Edm.Key,
    odata_v4_server_1.Edm.String
], Exchange.prototype, "key", void 0);
__decorate([
    odata_v4_server_1.Edm.Collection(odata_v4_server_1.Edm.EntityType(odata_v4_server_1.Edm.ForwardRef(() => Currency_1.Currency)))
], Exchange.prototype, "Currencies", void 0);
__decorate([
    odata_v4_server_1.Edm.Collection(odata_v4_server_1.Edm.EntityType(odata_v4_server_1.Edm.ForwardRef(() => Timeframe_1.Timeframe)))
], Exchange.prototype, "Timeframes", void 0);
__decorate([
    odata_v4_server_1.Edm.Function,
    odata_v4_server_1.Edm.String,
    __param(0, odata_v4_server_1.Edm.String),
    __param(1, odata_v4_server_1.Edm.String),
    __param(2, odata_v4_server_1.Edm.String),
    __param(3, odata_v4_server_1.Edm.String),
    __param(4, odata_v4_server_1.Edm.String),
    __param(5, odata_v4_server_1.odata.body),
    __param(6, odata_v4_server_1.odata.result)
], Exchange.prototype, "getCandles", null);
__decorate([
    odata_v4_server_1.Edm.Function,
    odata_v4_server_1.Edm.EntityType(odata_v4_server_1.Edm.ForwardRef(() => MarketData_1.MarketData)),
    __param(0, odata_v4_server_1.odata.body),
    __param(1, odata_v4_server_1.odata.result)
], Exchange.prototype, "getMarketData", null);
exports.Exchange = Exchange;
//# sourceMappingURL=Exchange.js.map