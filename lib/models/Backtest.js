"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const odata_v4_server_1 = require("odata-v4-server");
const BacktestOutput_1 = require("./BacktestOutput");
const Currency_1 = require("./Currency");
const Exchange_1 = require("./Exchange");
class Backtest {
    constructor({ _id, assetKey, currencyKey, exchangeKey, timeframe, start, end, strategyCode, initialBalance, finalBalance, profit, result, indicatorInputs }) {
        Object.assign(this, {
            _id,
            assetKey,
            currencyKey,
            exchangeKey,
            timeframe,
            start,
            end,
            strategyCode,
            initialBalance,
            finalBalance,
            profit,
            result,
            indicatorInputs
        });
    }
}
__decorate([
    odata_v4_server_1.Edm.Key,
    odata_v4_server_1.Edm.Computed,
    odata_v4_server_1.Edm.String
], Backtest.prototype, "_id", void 0);
__decorate([
    odata_v4_server_1.Edm.String
], Backtest.prototype, "exchangeKey", void 0);
__decorate([
    odata_v4_server_1.Edm.String
], Backtest.prototype, "currencyKey", void 0);
__decorate([
    odata_v4_server_1.Edm.String
], Backtest.prototype, "assetKey", void 0);
__decorate([
    odata_v4_server_1.Edm.String
], Backtest.prototype, "timeframe", void 0);
__decorate([
    odata_v4_server_1.Edm.String
], Backtest.prototype, "start", void 0);
__decorate([
    odata_v4_server_1.Edm.String
], Backtest.prototype, "end", void 0);
__decorate([
    odata_v4_server_1.Edm.String
], Backtest.prototype, "strategyCode", void 0);
__decorate([
    odata_v4_server_1.Edm.Double
], Backtest.prototype, "initialBalance", void 0);
__decorate([
    odata_v4_server_1.Edm.Double
], Backtest.prototype, "finalBalance", void 0);
__decorate([
    odata_v4_server_1.Edm.Double
], Backtest.prototype, "profit", void 0);
__decorate([
    odata_v4_server_1.Edm.Double
], Backtest.prototype, "result", void 0);
__decorate([
    odata_v4_server_1.Edm.String
], Backtest.prototype, "indicatorInputs", void 0);
__decorate([
    odata_v4_server_1.Edm.EntityType(odata_v4_server_1.Edm.ForwardRef(() => Currency_1.Currency))
], Backtest.prototype, "Currency", void 0);
__decorate([
    odata_v4_server_1.Edm.EntityType(odata_v4_server_1.Edm.ForwardRef(() => Exchange_1.Exchange))
], Backtest.prototype, "Exchange", void 0);
__decorate([
    odata_v4_server_1.Edm.EntityType(odata_v4_server_1.Edm.ForwardRef(() => BacktestOutput_1.BacktestOutput))
], Backtest.prototype, "Output", void 0);
exports.Backtest = Backtest;
//# sourceMappingURL=Backtest.js.map