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
const Currency_1 = require("./Currency");
const Timeframe_1 = require("./Timeframe");
class Exchange {
    constructor(key) {
        Object.assign(this, { key });
    }
    getCandles(currency, asset, timeframe, start, end, result) {
        return __awaiter(this, void 0, void 0, function* () {
            return Exchange_1.ExchangeEngine.getCandles({
                exchange: result.key,
                currency,
                asset,
                timeframe,
                start,
                end
            });
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
    __param(5, odata_v4_server_1.odata.result)
], Exchange.prototype, "getCandles", null);
exports.Exchange = Exchange;
//# sourceMappingURL=Exchange.js.map