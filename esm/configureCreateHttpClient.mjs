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
import { replaceParamsInUrl, keys, } from "./pathParameters.mjs";
export var configureCreateHttpClient = function (handlerCreator) {
    return function (routes) {
        return keys(routes).reduce(function (acc, routeName) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[routeName] = handlerCreator(routeName, routes, replaceParamsInUrl), _a)));
        }, {});
    };
};
//# sourceMappingURL=configureCreateHttpClient.mjs.map