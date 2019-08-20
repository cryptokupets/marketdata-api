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
const mongodb_1 = require("mongodb");
const odata_v4_server_1 = require("odata-v4-server");
const connect_1 = __importDefault(require("../connect"));
const Backtest_1 = require("../engine/Backtest");
const Exchange_1 = require("../engine/Exchange");
const Indicators_1 = require("../engine/Indicators");
const BalanceItem_1 = require("../models/BalanceItem");
const Indicator_1 = require("../models/Indicator");
const IndicatorRow_1 = require("../models/IndicatorRow");
const Trade_1 = require("../models/Trade");
const BacktestOutput_1 = require("./BacktestOutput");
const Exchange_2 = require("./Exchange");
const collectionName = "backtest";
class Backtest {
    constructor(data) {
        Object.assign(this, data);
    }
    run(result) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _id: key } = result;
            // tslint:disable-next-line: variable-name
            const _id = new mongodb_1.ObjectID(key);
            const db = yield connect_1.default();
            const backtest = new Backtest(yield db.collection(collectionName).findOne({ _id }));
            const { assetKey, currencyKey, exchangeKey, timeframe, start, end, initialBalance, strategyIndicators, strategyParameters, strategyCode, stoplossEnabled, stopLossLevel, fee } = backtest;
            // добавить свечи
            // UNDONE нужно взять период с запасом
            const candles = yield Exchange_1.ExchangeEngine.getCandles({
                exchange: exchangeKey,
                currency: currencyKey,
                asset: assetKey,
                timeframe,
                start,
                end
            });
            // добавить индикаторы
            const indicators = yield Promise.all(JSON.parse(strategyIndicators).map(input => Indicators_1.IndicatorsEngine.getIndicator(candles, input).then(output => new Indicator_1.Indicator({
                name: input.name,
                options: input.options,
                output: output.map(o => new IndicatorRow_1.IndicatorRow(o.time, o.values))
            }))));
            // добавить сигналы и изменение баланса
            const advices = yield Backtest_1.BacktestEngine.getAdvices({
                strategyFunction: new Function("indicators", strategyCode),
                candles,
                indicators,
                parameters: JSON.parse(strategyParameters)
            });
            // сделки
            // перебор по советам
            // при изменении совета происходит сделка
            const trades = [];
            let positionOpen = false; // изначально закрыта
            let stopLossPrice;
            let advice;
            for (const { time, close } of candles) {
                // позиция закрыта или открыта
                if (!positionOpen) {
                    // если позиция закрыта, то ожидается сигнал на покупку
                    advice = advices.find(e => e.time === time);
                    if (advice && advice.value === 1) {
                        trades.push(new Trade_1.Trade({
                            time,
                            side: "buy",
                            price: close
                        }));
                        if (stoplossEnabled) {
                            stopLossPrice = close * stopLossLevel;
                        }
                        positionOpen = true;
                    }
                }
                else {
                    // если позиция открыта, то ожидается сигнал на продажу или стоп-лосс
                    if (stoplossEnabled) {
                        if (close < stopLossPrice) {
                            trades.push(new Trade_1.Trade({
                                time,
                                side: "sell",
                                price: stopLossPrice
                            }));
                            positionOpen = false;
                        }
                        else {
                            stopLossPrice = Math.max(stopLossPrice, close * stopLossLevel);
                        }
                    }
                    else {
                        advice = advices.find(e => e.time === time);
                        if (advice && advice.value === -1) {
                            trades.push(new Trade_1.Trade({
                                time,
                                side: "sell",
                                price: close
                            }));
                            positionOpen = false;
                        }
                    }
                }
            }
            // пройти по всем свечам
            // при наличии сделки менять баланс
            let prevBalanceItem = new BalanceItem_1.BalanceItem({
                time: candles[0].time,
                currencyAmount: initialBalance,
                assetAmount: 0,
                estimateAmount: 0
            });
            const balance = candles.map(candle => {
                // если нет сделок - то брать предыдущий
                // estimate вычислить на основе нового курса
                // если есть сделка - то переводить
                const { currencyAmount, assetAmount } = prevBalanceItem;
                const { time, close } = candle;
                const balanceItem = new BalanceItem_1.BalanceItem({ time });
                const trade = trades.find(e => e.time === time);
                if (trade) {
                    const { price } = trade;
                    if (trade.side === "buy") {
                        balanceItem.currencyAmount = 0;
                        balanceItem.assetAmount = (currencyAmount * (1 - fee)) / price;
                        balanceItem.estimateAmount = currencyAmount * (1 - fee);
                    }
                    else {
                        balanceItem.assetAmount = 0;
                        balanceItem.currencyAmount = assetAmount * price * (1 - fee);
                        balanceItem.estimateAmount = assetAmount * price * (1 - fee);
                    }
                }
                else {
                    Object.assign(balanceItem, {
                        currencyAmount,
                        assetAmount,
                        estimateAmount: currencyAmount || assetAmount * close * (1 - fee)
                    });
                }
                prevBalanceItem = balanceItem;
                return balanceItem;
            });
            const finalBalance = balance[balance.length - 1].estimateAmount;
            const profit = finalBalance - initialBalance;
            const delta = {
                finalBalance,
                profit
            };
            return (yield connect_1.default())
                .collection(collectionName)
                .updateOne({ _id }, { $set: delta })
                .then(r => r.modifiedCount);
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
], Backtest.prototype, "strategyIndicators", void 0);
__decorate([
    odata_v4_server_1.Edm.String
], Backtest.prototype, "strategyParameters", void 0);
__decorate([
    odata_v4_server_1.Edm.String
], Backtest.prototype, "strategyCode", void 0);
__decorate([
    odata_v4_server_1.Edm.Boolean
], Backtest.prototype, "stoplossEnabled", void 0);
__decorate([
    odata_v4_server_1.Edm.Double
], Backtest.prototype, "stopLossLevel", void 0);
__decorate([
    odata_v4_server_1.Edm.Double
], Backtest.prototype, "fee", void 0);
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
    odata_v4_server_1.Edm.EntityType(odata_v4_server_1.Edm.ForwardRef(() => Exchange_2.Exchange))
], Backtest.prototype, "Exchange", void 0);
__decorate([
    odata_v4_server_1.Edm.EntityType(odata_v4_server_1.Edm.ForwardRef(() => BacktestOutput_1.BacktestOutput))
], Backtest.prototype, "Output", void 0);
__decorate([
    odata_v4_server_1.Edm.Action,
    __param(0, odata_v4_server_1.odata.result)
], Backtest.prototype, "run", null);
exports.Backtest = Backtest;
//# sourceMappingURL=Backtest.js.map