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
const odata_v4_mongodb_1 = require("odata-v4-mongodb");
const odata_v4_server_1 = require("odata-v4-server");
const connect_1 = __importDefault(require("../connect"));
const Backtest_1 = require("../engine/Backtest");
const Exchange_1 = require("../engine/Exchange");
const Indicators_1 = require("../engine/Indicators");
const Backtest_2 = require("../models/Backtest");
const BacktestOutput_1 = require("../models/BacktestOutput");
const BalanceItem_1 = require("../models/BalanceItem");
const Exchange_2 = require("../models/Exchange");
const Indicator_1 = require("../models/Indicator");
const IndicatorRow_1 = require("../models/IndicatorRow");
const Trade_1 = require("../models/Trade");
const collectionName = "backtest";
let BacktestController = class BacktestController extends odata_v4_server_1.ODataController {
    get(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield connect_1.default();
            const mongodbQuery = odata_v4_mongodb_1.createQuery(query);
            if (mongodbQuery.query._id) {
                mongodbQuery.query._id = new mongodb_1.ObjectID(mongodbQuery.query._id);
            }
            const result = typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : yield db
                    .collection(collectionName)
                    .find(mongodbQuery.query)
                    .project(mongodbQuery.projection)
                    .skip(mongodbQuery.skip || 0)
                    .limit(mongodbQuery.limit || 0)
                    .sort(mongodbQuery.sort)
                    .map(e => new Backtest_2.Backtest(e))
                    .toArray();
            if (mongodbQuery.inlinecount) {
                result.inlinecount = yield db
                    .collection(collectionName)
                    .find(mongodbQuery.query)
                    .project(mongodbQuery.projection)
                    .count(false);
            }
            return result;
        });
    }
    getById(key, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { projection } = odata_v4_mongodb_1.createQuery(query);
            // tslint:disable-next-line: variable-name
            const _id = new mongodb_1.ObjectID(key);
            const db = yield connect_1.default();
            return new Backtest_2.Backtest(yield db.collection(collectionName).findOne({ _id }, { projection }));
        });
    }
    post({ assetKey, currencyKey, exchangeKey, timeframe, start, end, strategyCode, initialBalance, indicatorInputs }) {
        return __awaiter(this, void 0, void 0, function* () {
            const backtest = new Backtest_2.Backtest({
                assetKey,
                currencyKey,
                exchangeKey,
                timeframe,
                start,
                end,
                strategyCode,
                initialBalance,
                indicatorInputs
            });
            backtest._id = (yield (yield connect_1.default())
                .collection(collectionName)
                .insertOne(backtest)).insertedId;
            return backtest;
        });
    }
    patch(key, delta) {
        return __awaiter(this, void 0, void 0, function* () {
            if (delta._id) {
                delete delta._id;
            }
            // tslint:disable-next-line: variable-name
            const _id = new mongodb_1.ObjectID(key);
            return (yield connect_1.default())
                .collection(collectionName)
                .updateOne({ _id }, { $set: delta })
                .then(result => result.modifiedCount);
        });
    }
    remove(key) {
        return __awaiter(this, void 0, void 0, function* () {
            // tslint:disable-next-line: variable-name
            const _id = new mongodb_1.ObjectID(key);
            return (yield connect_1.default())
                .collection(collectionName)
                .deleteOne({ _id })
                .then(result => result.deletedCount);
        });
    }
    getExchange(result) {
        const { exchangeKey } = result;
        return new Exchange_2.Exchange(exchangeKey);
    }
    getOutput(result) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _id: key } = result;
            // tslint:disable-next-line: variable-name
            const _id = new mongodb_1.ObjectID(key);
            const db = yield connect_1.default();
            const { exchangeKey, currencyKey, assetKey, timeframe, start, end, indicatorInputs, strategyCode, initialBalance } = new Backtest_2.Backtest(yield db.collection(collectionName).findOne({ _id }));
            // добавить свечи
            const candles = yield Exchange_1.ExchangeEngine.getCandles({
                exchange: exchangeKey,
                currency: currencyKey,
                asset: assetKey,
                timeframe,
                start,
                end
            });
            // добавить индикаторы
            const indicators = yield Promise.all(indicatorInputs
                .split(";")
                .map(e => {
                const parsed = e.split(" ");
                return { name: parsed[0], options: parsed.splice(1).map(o => +o) };
            })
                .map(input => Indicators_1.IndicatorsEngine.getIndicator(candles, input).then(output => new Indicator_1.Indicator({
                name: input.name,
                options: input.options,
                output: output.map(o => new IndicatorRow_1.IndicatorRow(o.time, o.values))
            }))));
            // добавить сигналы и изменение баланса
            const advices = yield Backtest_1.BacktestEngine.getAdvices({
                strategyFunction: new Function("indicator", strategyCode),
                indicator: indicators[0]
            });
            // сделки
            // перебор по советам
            // при изменении совета происходит сделка
            let lastAdviceValue = -1;
            const trades = [];
            for (const { time, value } of advices) {
                if (value !== lastAdviceValue) {
                    // найти нужную свечу
                    const candle = candles.find(e => e.time === time);
                    trades.push(new Trade_1.Trade({
                        time,
                        side: value > 0 ? "buy" : "sell",
                        price: candle.close
                    }));
                    lastAdviceValue = value;
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
                const { time, close: price } = candle;
                const balanceItem = new BalanceItem_1.BalanceItem({ time });
                const trade = trades.find(e => e.time === time);
                if (trade) {
                    if (trade.side === "buy") {
                        balanceItem.currencyAmount = 0;
                        balanceItem.assetAmount = currencyAmount / price;
                        balanceItem.estimateAmount = currencyAmount;
                    }
                    else {
                        balanceItem.assetAmount = 0;
                        balanceItem.currencyAmount = assetAmount * price;
                        balanceItem.estimateAmount = assetAmount * price;
                    }
                }
                else {
                    Object.assign(balanceItem, {
                        currencyAmount,
                        assetAmount,
                        estimateAmount: currencyAmount || assetAmount * price
                    });
                }
                prevBalanceItem = balanceItem;
                return balanceItem;
            });
            const finalBalance = balance[balance.length - 1].estimateAmount;
            const profit = finalBalance - initialBalance;
            const backtestResult = profit / initialBalance;
            return new BacktestOutput_1.BacktestOutput({
                finalBalance,
                profit,
                result: backtestResult,
                candles,
                indicators,
                advices,
                trades,
                balance
            });
        });
    }
};
__decorate([
    odata_v4_server_1.odata.GET,
    __param(0, odata_v4_server_1.odata.query)
], BacktestController.prototype, "get", null);
__decorate([
    odata_v4_server_1.odata.GET,
    __param(0, odata_v4_server_1.odata.key),
    __param(1, odata_v4_server_1.odata.query)
], BacktestController.prototype, "getById", null);
__decorate([
    odata_v4_server_1.odata.POST,
    __param(0, odata_v4_server_1.odata.body)
], BacktestController.prototype, "post", null);
__decorate([
    odata_v4_server_1.odata.PATCH,
    __param(0, odata_v4_server_1.odata.key),
    __param(1, odata_v4_server_1.odata.body)
], BacktestController.prototype, "patch", null);
__decorate([
    odata_v4_server_1.odata.DELETE,
    __param(0, odata_v4_server_1.odata.key)
], BacktestController.prototype, "remove", null);
__decorate([
    odata_v4_server_1.odata.GET("Exchange"),
    __param(0, odata_v4_server_1.odata.result)
], BacktestController.prototype, "getExchange", null);
__decorate([
    odata_v4_server_1.odata.GET("Output"),
    __param(0, odata_v4_server_1.odata.result)
], BacktestController.prototype, "getOutput", null);
BacktestController = __decorate([
    odata_v4_server_1.odata.type(Backtest_2.Backtest),
    odata_v4_server_1.Edm.EntitySet("Backtest")
], BacktestController);
exports.BacktestController = BacktestController;
//# sourceMappingURL=Backtest.js.map