"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const odata_v4_server_1 = require("odata-v4-server");
const Advice_1 = require("./Advice");
const BalanceItem_1 = require("./BalanceItem");
const Candle_1 = require("./Candle");
const Indicator_1 = require("./Indicator");
const Trade_1 = require("./Trade");
class Backtest {
    constructor({ _id, assetKey, currencyKey, exchangeKey, timeframe, start, end, strategyCode, initialBalance, finalBalance, profit, result, indicatorInputs, candles, indicators, advices, trades, balance }) {
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
            indicatorInputs,
            candles,
            indicators,
            advices,
            trades,
            balance
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
    odata_v4_server_1.Edm.Collection(odata_v4_server_1.Edm.EntityType(odata_v4_server_1.Edm.ForwardRef(() => Candle_1.Candle)))
], Backtest.prototype, "candles", void 0);
__decorate([
    odata_v4_server_1.Edm.Collection(odata_v4_server_1.Edm.EntityType(odata_v4_server_1.Edm.ForwardRef(() => Indicator_1.Indicator)))
], Backtest.prototype, "indicators", void 0);
__decorate([
    odata_v4_server_1.Edm.Collection(odata_v4_server_1.Edm.EntityType(odata_v4_server_1.Edm.ForwardRef(() => Advice_1.Advice)))
], Backtest.prototype, "advices", void 0);
__decorate([
    odata_v4_server_1.Edm.Collection(odata_v4_server_1.Edm.EntityType(odata_v4_server_1.Edm.ForwardRef(() => Trade_1.Trade)))
], Backtest.prototype, "trades", void 0);
__decorate([
    odata_v4_server_1.Edm.Collection(odata_v4_server_1.Edm.EntityType(odata_v4_server_1.Edm.ForwardRef(() => BalanceItem_1.BalanceItem)))
], Backtest.prototype, "balance", void 0);
exports.Backtest = Backtest;
//# sourceMappingURL=Backtest.js.map