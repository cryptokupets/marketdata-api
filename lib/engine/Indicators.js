"use strict";
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
// @ts-ignore
const tulind = __importStar(require("tulind"));
class IndicatorsEngine {
    static getStart({ name, options }) {
        return tulind.indicators[name].start(options);
    }
    static getIndicator(candles, indicator) {
        return __awaiter(this, void 0, void 0, function* () {
            return tulind.indicators[indicator.name].indicator(tulind.indicators[indicator.name].input_names
                .map(e => (e === "real" ? "close" : e))
                .map(e => candles.map(c => c[e])), indicator.options).then(output => {
                const timesReversed = candles.map(e => e.time).reverse();
                return lodash_1.default.unzip(output)
                    .reverse()
                    .map((e, i) => {
                    return { time: timesReversed[i], values: e };
                })
                    .reverse();
            });
        });
    }
}
exports.IndicatorsEngine = IndicatorsEngine;
//# sourceMappingURL=Indicators.js.map