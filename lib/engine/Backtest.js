"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Advice_1 = require("../models/Advice");
class BacktestEngine {
    static getAdvices({ strategyFunction, candles, indicators, parameters }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { output } = indicators[0]; // UNDONE сделать для нескольких индикаторов
            // перебор выполнять по свечам
            // лучше с обратной стороны
            // лучше сразу ограничить минимальным набором данных
            return output
                .map((e, index) => {
                return new Advice_1.Advice({
                    time: e.time,
                    value: strategyFunction(output
                        .slice(0, index + 1)
                        .map(e1 => e1.values)
                        .reverse())
                });
            })
                .filter(e => e.value);
        });
    }
}
exports.BacktestEngine = BacktestEngine;
//# sourceMappingURL=Backtest.js.map