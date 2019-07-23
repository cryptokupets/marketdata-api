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
Object.defineProperty(exports, "__esModule", { value: true });
const odata_v4_server_1 = require("odata-v4-server");
const Exchange_1 = require("../engine/Exchange");
const Indicators_1 = require("../engine/Indicators");
const Buffer_1 = require("../models/Buffer");
const Indicator_1 = require("../models/Indicator");
const IndicatorRow_1 = require("../models/IndicatorRow");
let BufferController = class BufferController extends odata_v4_server_1.ODataController {
    getById(assetKey, exchangeKey, currencyKey, timeframe, start, end, indicatorInputs) {
        return __awaiter(this, void 0, void 0, function* () {
            const candles = yield Exchange_1.ExchangeEngine.getCandles({
                exchange: exchangeKey,
                currency: currencyKey,
                asset: assetKey,
                timeframe,
                start,
                end
            });
            // UNDONE передавать набор параметров через пробел, парсить, первое всегда название, далее опции
            // подумать как лучше, можно как раньше через функцию и пост
            // проблема в том, что для одного индикатора набор можно распарсить.
            // но как отделить наборы друг от друга?
            const inputs = indicatorInputs.split(";").map(e => {
                const parsed = e.split(" ");
                return { name: parsed[0], options: parsed.splice(1).map(o => +o) };
            });
            return Promise.all(inputs.map(input => Indicators_1.IndicatorsEngine.getIndicator(candles, input).then(output => new Indicator_1.Indicator({
                name: input.name,
                options: input.options,
                output: output.map(o => new IndicatorRow_1.IndicatorRow(o.time, o.values))
            })))).then(indicatorOutputs => new Buffer_1.Buffer({
                assetKey,
                currencyKey,
                exchangeKey,
                timeframe,
                start,
                end,
                candles,
                indicatorInputs,
                indicatorOutputs
            }));
        });
    }
};
__decorate([
    odata_v4_server_1.odata.GET,
    __param(0, odata_v4_server_1.odata.key),
    __param(1, odata_v4_server_1.odata.key),
    __param(2, odata_v4_server_1.odata.key),
    __param(3, odata_v4_server_1.odata.key),
    __param(4, odata_v4_server_1.odata.key),
    __param(5, odata_v4_server_1.odata.key),
    __param(6, odata_v4_server_1.odata.key)
], BufferController.prototype, "getById", null);
BufferController = __decorate([
    odata_v4_server_1.odata.type(Buffer_1.Buffer),
    odata_v4_server_1.Edm.EntitySet("Buffer")
], BufferController);
exports.BufferController = BufferController;
//# sourceMappingURL=Buffer.js.map