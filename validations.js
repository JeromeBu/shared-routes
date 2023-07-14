"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInputParams = exports.validateSchemaWithExplictError = void 0;
var explicitError = function (_a) {
    var route = _a.route, error = _a.error, adapterName = _a.adapterName, checkedSchema = _a.checkedSchema, statusCode = _a.statusCode;
    var newError = new Error([
        "Shared-route schema '".concat(checkedSchema, "' was not respected in adapter '").concat(adapterName, "'."),
        checkedSchema === "responses" &&
            "Received status: ".concat(statusCode, ". Handled statuses: ").concat(Object.keys(route.responses).join(", "), "."),
        "Route: ".concat(route.method.toUpperCase(), " ").concat(route.url),
    ]
        .filter(Boolean)
        .join("\n"));
    newError.cause = error;
    return newError;
};
var validateSchemaWithExplictError = function (_a) {
    var checkedSchema = _a.checkedSchema, _b = _a.params, params = _b === void 0 ? {} : _b, route = _a.route, adapterName = _a.adapterName, responseStatus = _a.responseStatus;
    try {
        if (checkedSchema === "responses") {
            if (!responseStatus)
                throw new Error("a response status is required when validating responses");
            var schema = route[checkedSchema][responseStatus];
            if (!schema)
                throw new Error("No schema found for this status.");
            return schema.parse(params);
        }
        return route[checkedSchema].parse(params);
    }
    catch (error) {
        throw explicitError({
            route: route,
            error: error,
            adapterName: adapterName,
            checkedSchema: checkedSchema,
            statusCode: responseStatus,
        });
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