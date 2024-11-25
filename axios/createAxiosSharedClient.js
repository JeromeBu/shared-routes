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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAxiosSharedClient = exports.createAxiosHandlerCreator = void 0;
var __1 = require("..");
var validations_1 = require("../validations");
var createAxiosHandlerCreator = function (axios, options) {
    return function (routeName, routes, replaceParamsInUrl) {
        return function () {
            var args_1 = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args_1[_i] = arguments[_i];
            }
            return __awaiter(void 0, __spreadArray([], __read(args_1), false), void 0, function (_a) {
                var route, _b, body, headers, queryParams, queryStartTime, _c, data, status, rest, responseBody;
                var _d;
                if (_a === void 0) { _a = {}; }
                var urlParams = _a.urlParams, params = __rest(_a, ["urlParams"]);
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            route = routes[routeName];
                            _b = (options === null || options === void 0 ? void 0 : options.skipInputValidation)
                                ? params
                                : (0, validations_1.validateInputParams)(route, params, "axios", { withIssuesInMessage: true }), body = _b.body, headers = _b.headers, queryParams = _b.queryParams;
                            queryStartTime = Date.now();
                            return [4 /*yield*/, axios.request({
                                    method: route.method,
                                    url: replaceParamsInUrl(route.url, urlParams),
                                    data: body,
                                    params: queryParams,
                                    headers: __assign(__assign({}, axios.defaults.headers), (headers !== null && headers !== void 0 ? headers : {})),
                                })];
                        case 1:
                            _c = _e.sent(), data = _c.data, status = _c.status, rest = __rest(_c, ["data", "status"]);
                            if (options === null || options === void 0 ? void 0 : options.onResponseSideEffect) {
                                options.onResponseSideEffect({
                                    durationInMs: Date.now() - queryStartTime,
                                    response: {
                                        status: status,
                                        body: data,
                                        headers: rest.headers,
                                    },
                                    route: route,
                                    input: {
                                        body: body,
                                        queryParams: queryParams,
                                        urlParams: urlParams,
                                    },
                                });
                            }
                            responseBody = (options === null || options === void 0 ? void 0 : options.skipResponseValidation) ||
                                ((_d = options === null || options === void 0 ? void 0 : options.skipResponseValidationForStatuses) === null || _d === void 0 ? void 0 : _d.includes(status))
                                ? data
                                : (0, validations_1.validateSchemaWithExplicitError)({
                                    adapterName: "axios",
                                    checkedSchema: "responses",
                                    responseStatus: status,
                                    params: data,
                                    route: route,
                                    withIssuesInMessage: true,
                                });
                            return [2 /*return*/, __assign(__assign({}, rest), { status: status, body: responseBody })];
                    }
                });
            });
        };
    };
};
exports.createAxiosHandlerCreator = createAxiosHandlerCreator;
var createAxiosSharedClient = function (sharedRouters, axios, validationOptions) {
    return (0, __1.configureCreateHttpClient)((0, exports.createAxiosHandlerCreator)(axios, validationOptions))(sharedRouters);
};
exports.createAxiosSharedClient = createAxiosSharedClient;
//# sourceMappingURL=createAxiosSharedClient.js.map