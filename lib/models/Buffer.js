"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const odata_v4_server_1 = require("odata-v4-server");
const Candle_1 = require("./Candle");
const Indicator_1 = require("./Indicator");
class Buffer {
    constructor({ assetKey, currencyKey, exchangeKey, timeframe, start, end, candles, indicatorInputs, indicatorOutputs }) {
        Object.assign(this, {
            assetKey,
            currencyKey,
            exchangeKey,
            timeframe,
            start,
            end,
            candles,
            indicatorInputs,
            indicatorOutputs
        });
    }
}
__decorate([
    odata_v4_server_1.Edm.Key,
    odata_v4_server_1.Edm.String
], Buffer.prototype, "assetKey", void 0);
__decorate([
    odata_v4_server_1.Edm.Key,
    odata_v4_server_1.Edm.String
], Buffer.prototype, "currencyKey", void 0);
__decorate([
    odata_v4_server_1.Edm.Key,
    odata_v4_server_1.Edm.String
], Buffer.prototype, "exchangeKey", void 0);
__decorate([
    odata_v4_server_1.Edm.Key,
    odata_v4_server_1.Edm.String
], Buffer.prototype, "timeframe", void 0);
__decorate([
    odata_v4_server_1.Edm.Key,
    odata_v4_server_1.Edm.String
], Buffer.prototype, "start", void 0);
__decorate([
    odata_v4_server_1.Edm.Key,
    odata_v4_server_1.Edm.String
], Buffer.prototype, "end", void 0);
__decorate([
    odata_v4_server_1.Edm.Key,
    odata_v4_server_1.Edm.String
], Buffer.prototype, "indicatorInputs", void 0);
__decorate([
    odata_v4_server_1.Edm.Collection(odata_v4_server_1.Edm.EntityType(odata_v4_server_1.Edm.ForwardRef(() => Candle_1.Candle)))
], Buffer.prototype, "candles", void 0);
__decorate([
    odata_v4_server_1.Edm.Collection(odata_v4_server_1.Edm.EntityType(odata_v4_server_1.Edm.ForwardRef(() => Indicator_1.Indicator)))
], Buffer.prototype, "indicatorOutputs", void 0);
exports.Buffer = Buffer;
//# sourceMappingURL=Buffer.js.map