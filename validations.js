"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInputParams = exports.validateSchemaWithExplictError = void 0;
var explicitError = function (_a) {
    var route = _a.route, error = _a.error, adapterName = _a.adapterName, checkedSchema = _a.checkedSchema;
    var newError = new Error([
        checkedSchema,
        "was not respected for route",
        route.method.toUpperCase(),
        route.url,
        "in shared-routes",
        adapterName,
        "adapter",
    ].join(" "));
    newError.cause = error;
    return newError;
};
var validateSchemaWithExplictError = function (_a) {
    var checkedSchema = _a.checkedSchema, _b = _a.params, params = _b === void 0 ? {} : _b, route = _a.route, adapterName = _a.adapterName;
    try {
        return route[checkedSchema].parse(params);
    }
    catch (error) {
        throw explicitError({ route: route, error: error, adapterName: adapterName, checkedSchema: checkedSchema });
    }
};
exports.validateSchemaWithExplictError = validateSchemaWithExplictError;
var validateInputParams = function (route, params, adapterName) {
    var queryParams = (0, exports.validateSchemaWithExplictError)({
        adapterName: adapterName,
        checkedSchema: "queryParamsSchema",
        params: params.queryParams,
        route: route,
    });
    var body = (0, exports.validateSchemaWithExplictError)({
        adapterName: adapterName,
        checkedSchema: "requestBodySchema",
        params: params.body,
        route: route,
    });
    // we validate headers separately because we don't want to re-affect req.headers parsed value
    // because we don't want to lose all other headers
    (0, exports.validateSchemaWithExplictError)({
        adapterName: adapterName,
        checkedSchema: "headersSchema",
        params: params.headers,
        route: route,
    });
    return { queryParams: queryParams, body: body, headers: params.headers };
};
exports.validateInputParams = validateInputParams;
//# sourceMappingURL=validations.js.map