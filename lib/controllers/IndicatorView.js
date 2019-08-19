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
const IndicatorView_1 = require("../models/IndicatorView");
const collectionName = "indicatorView";
let IndicatorViewController = class IndicatorViewController extends odata_v4_server_1.ODataController {
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
                    .map(e => new IndicatorView_1.IndicatorView(e))
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
            return new IndicatorView_1.IndicatorView(yield db.collection(collectionName).findOne({ _id }, { projection }));
        });
    }
    post(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = new IndicatorView_1.IndicatorView(body);
            item.marketDataViewId = new mongodb_1.ObjectID(body.marketDataViewId);
            item._id = (yield (yield connect_1.default())
                .collection(collectionName)
                .insertOne(item)).insertedId;
            return item;
        });
    }
    patch(key, delta) {
        return __awaiter(this, void 0, void 0, function* () {
            if (delta._id) {
                delete delta._id;
            }
            if (delta.marketDataViewId) {
                delta.marketDataViewId = new mongodb_1.ObjectID(delta.marketDataViewId);
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
};
__decorate([
    odata_v4_server_1.odata.GET,
    __param(0, odata_v4_server_1.odata.query)
], IndicatorViewController.prototype, "get", null);
__decorate([
    odata_v4_server_1.odata.GET,
    __param(0, odata_v4_server_1.odata.key),
    __param(1, odata_v4_server_1.odata.query)
], IndicatorViewController.prototype, "getById", null);
__decorate([
    odata_v4_server_1.odata.POST,
    __param(0, odata_v4_server_1.odata.body)
], IndicatorViewController.prototype, "post", null);
__decorate([
    odata_v4_server_1.odata.PATCH,
    __param(0, odata_v4_server_1.odata.key),
    __param(1, odata_v4_server_1.odata.body)
], IndicatorViewController.prototype, "patch", null);
__decorate([
    odata_v4_server_1.odata.DELETE,
    __param(0, odata_v4_server_1.odata.key)
], IndicatorViewController.prototype, "remove", null);
IndicatorViewController = __decorate([
    odata_v4_server_1.odata.type(IndicatorView_1.IndicatorView),
    odata_v4_server_1.Edm.EntitySet("IndicatorView")
], IndicatorViewController);
exports.IndicatorViewController = IndicatorViewController;
//# sourceMappingURL=IndicatorView.js.map