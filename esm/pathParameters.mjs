export var replaceParamsInUrl = function (url, params) {
    if (params === void 0) { params = {}; }
    var paramNames = keys(params);
    if (paramNames.length === 0)
        return url;
    return paramNames.reduce(function (acc, paramName) { return acc.replace(":".concat(paramName.toString()), params[paramName]); }, url);
};
export var keys = function (obj) {
    return Object.keys(obj);
};
//# sourceMappingURL=pathParameters.mjs.map