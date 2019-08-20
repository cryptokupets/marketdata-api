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
const Chart_1 = require("../models/Chart");
const View_1 = require("../models/View");
const collectionName = "view";
let ViewController = class ViewController extends odata_v4_server_1.ODataController {
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
                    .map(e => new View_1.View(e))
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
            return new View_1.View(yield db.collection(collectionName).findOne({ _id }, { projection }));
        });
    }
    post(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = new View_1.View(body);
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
    postIndicators(body, result) {
        return __awaiter(this, void 0, void 0, function* () {
            // tslint:disable-next-line: no-shadowed-variable
            const { Series } = body;
            // item.viewId = new ObjectID(result.viewId);
            const chart = new Chart_1.Chart({
                viewId: new mongodb_1.ObjectID(result._id)
            });
            // сразу создаться series
            const db = yield connect_1.default();
            chart._id = (yield db
                .collection("chart")
                .insertOne(chart)).insertedId;
            const collectionSeries = db.collection("series");
            chart.Series = yield Promise.all(Series.map((s) => __awaiter(this, void 0, void 0, function* () {
                s.chartId = chart._id;
                s._id = (yield collectionSeries
                    .insertOne(s)).insertedId;
                return s;
            })));
            return chart;
        });
    }
    getIndicators(result, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield connect_1.default();
            const collection = db.collection("chart");
            const mongodbQuery = odata_v4_mongodb_1.createQuery(query);
            const viewId = new mongodb_1.ObjectID(result._id);
            const indicators = typeof mongodbQuery.limit === "number" && mongodbQuery.limit === 0
                ? []
                : yield collection
                    .find({ $and: [{ viewId }, mongodbQuery.query] })
                    .project(mongodbQuery.projection)
                    .skip(mongodbQuery.skip || 0)
                    .limit(mongodbQuery.limit || 0)
                    .sort(mongodbQuery.sort)
                    .toArray();
            if (mongodbQuery.inlinecount) {
                indicators.inlinecount = yield collection
                    .find({ $and: [{ viewId }, mongodbQuery.query] })
                    .project(mongodbQuery.projection)
                    .count(false);
            }
            return indicators;
        });
    }
};
__decorate([
    odata_v4_server_1.odata.GET,
    __param(0, odata_v4_server_1.odata.query)
], ViewController.prototype, "get", null);
__decorate([
    odata_v4_server_1.odata.GET,
    __param(0, odata_v4_server_1.odata.key),
    __param(1, odata_v4_server_1.odata.query)
], ViewController.prototype, "getById", null);
__decorate([
    odata_v4_server_1.odata.POST,
    __param(0, odata_v4_server_1.odata.body)
], ViewController.prototype, "post", null);
__decorate([
    odata_v4_server_1.odata.PATCH,
    __param(0, odata_v4_server_1.odata.key),
    __param(1, odata_v4_server_1.odata.body)
], ViewController.prototype, "patch", null);
__decorate([
    odata_v4_server_1.odata.DELETE,
    __param(0, odata_v4_server_1.odata.key)
], ViewController.prototype, "remove", null);
__decorate([
    odata_v4_server_1.odata.POST("Indicators"),
    __param(0, odata_v4_server_1.odata.body),
    __param(1, odata_v4_server_1.odata.result)
], ViewController.prototype, "postIndicators", null);
__decorate([
    odata_v4_server_1.odata.GET("Indicators"),
    __param(0, odata_v4_server_1.odata.result),
    __param(1, odata_v4_server_1.odata.query)
], ViewController.prototype, "getIndicators", null);
ViewController = __decorate([
    odata_v4_server_1.odata.type(View_1.View),
    odata_v4_server_1.Edm.EntitySet("View")
], ViewController);
exports.ViewController = ViewController;
//# sourceMappingURL=View.js.map