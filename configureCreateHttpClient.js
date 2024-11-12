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
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureCreateHttpClient = void 0;
var pathParameters_1 = require("./pathParameters");
var configureCreateHttpClient = function (handlerCreator) {
    return function (routes) {
        return (0, pathParameters_1.keys)(routes).reduce(function (acc, routeName) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[routeName] = handlerCreator(routeName, routes, pathParameters_1.replaceParamsInUrl), _a)));
        }, {});
    };
};
exports.configureCreateHttpClient = configureCreateHttpClient;
//# sourceMappingURL=configureCreateHttpClient.js.map