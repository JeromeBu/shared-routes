"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keys = exports.replaceParamsInUrl = void 0;
var replaceParamsInUrl = function (url, params) {
    if (params === void 0) { params = {}; }
    var paramNames = (0, exports.keys)(params);
    if (paramNames.length === 0)
        return url;
    return paramNames.reduce(function (acc, paramName) { return acc.replace(":".concat(paramName.toString()), params[paramName]); }, url);
};
exports.replaceParamsInUrl = replaceParamsInUrl;
var keys = function (obj) {
    return Object.keys(obj);
};
exports.keys = keys;
//# sourceMappingURL=pathParameters.js.map