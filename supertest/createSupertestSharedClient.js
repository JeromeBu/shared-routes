"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupertestSharedClient = exports.createSupertestHandlerCreator = void 0;
var __1 = require("..");
var supertestRequestToCorrectHttpMethod = function (supertestRequest, method) { return supertestRequest[method]; };
var createSupertestHandlerCreator = function (supertestRequest) {
    return function (routeName, routes, replaceParamsInUrl) {
        var route = routes[routeName];
        return function (_a) {
            var _b = _a === void 0 ? {} : _a, headers = _b.headers, body = _b.body, queryParams = _b.queryParams, urlParams = _b.urlParams;
            return __awaiter(void 0, void 0, void 0, function () {
                var queryParamsWithCorrectArrays, result;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            queryParamsWithCorrectArrays = Object.fromEntries(Object.entries(queryParams !== null && queryParams !== void 0 ? queryParams : {}).map(function (_a) {
                                var _b = __read(_a, 2), key = _b[0], value = _b[1];
                                return [
                                    Array.isArray(value) ? "".concat(key, "[]") : key,
                                    value,
                                ];
                            }));
                            return [4 /*yield*/, supertestRequestToCorrectHttpMethod(supertestRequest, route.method)(replaceParamsInUrl(route.url, urlParams))
                                    .send(body)
                                    .set(headers !== null && headers !== void 0 ? headers : {})
                                    .query(queryParamsWithCorrectArrays)];
                        case 1:
                            result = _c.sent();
                            return [2 /*return*/, __assign(__assign({ status: result.status, body: result.body }, (!Object.keys(route.responses).includes(result.status.toString()) && {
                                    text: result.text,
                                })), { headers: result.headers })];
                    }
                });
            });
        };
    };
};
exports.createSupertestHandlerCreator = createSupertestHandlerCreator;
var createSupertestSharedClient = function (sharedRoutes, supertestRequest) {
    return (0, __1.configureCreateHttpClient)((0, exports.createSupertestHandlerCreator)(supertestRequest))(sharedRoutes);
};
exports.createSupertestSharedClient = createSupertestSharedClient;
//# sourceMappingURL=createSupertestSharedClient.js.map