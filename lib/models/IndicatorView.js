"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const odata_v4_server_1 = require("odata-v4-server");
class IndicatorView {
    constructor(data) {
        Object.assign(this, data);
    }
}
__decorate([
    odata_v4_server_1.Edm.Key,
    odata_v4_server_1.Edm.Computed,
    odata_v4_server_1.Edm.String
], IndicatorView.prototype, "_id", void 0);
__decorate([
    odata_v4_server_1.Edm.String
], IndicatorView.prototype, "name", void 0);
__decorate([
    odata_v4_server_1.Edm.String
], IndicatorView.prototype, "marketDataViewId", void 0);
exports.IndicatorView = IndicatorView;
//# sourceMappingURL=IndicatorView.js.map