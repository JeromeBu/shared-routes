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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { z } from "zod";
export var defineRoute = function (route) {
    var _a;
    return (__assign(__assign({ requestBodySchema: z.object({}).strict(), queryParamsSchema: z.object({}).strict(), responses: { 201: z.void() }, headersSchema: z.object({}) }, route), { responseType: (_a = route.responseType) !== null && _a !== void 0 ? _a : "json" }));
};
var verifyRoutesUniqAndListRoutes = function (routes) {
    var e_1, _a;
    var _b;
    var occurrencesByMethodAndUrl = {};
    try {
        for (var _c = __values(Object.values(routes)), _d = _c.next(); !_d.done; _d = _c.next()) {
            var route = _d.value;
            var name_1 = "".concat(route.method.toUpperCase(), " ").concat(route.url);
            var occurrence = ((_b = occurrencesByMethodAndUrl[name_1]) !== null && _b !== void 0 ? _b : 0) + 1;
            if (occurrence > 1)
                throw new Error("You cannot have several routes with same http method and url, got: ".concat(name_1, " twice (at least)"));
            occurrencesByMethodAndUrl[name_1] = occurrence;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return Object.keys(occurrencesByMethodAndUrl);
};
export var defineRoutes = function (routes) {
    verifyRoutesUniqAndListRoutes(routes);
    return routes;
};
export var listRoutes = function (routes) { return verifyRoutesUniqAndListRoutes(routes); };
//# sourceMappingURL=defineRoutes.mjs.map