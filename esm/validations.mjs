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
var explicitError = function (_a) {
    var _b;
    var route = _a.route, error = _a.error, adapterName = _a.adapterName, checkedSchema = _a.checkedSchema, statusCode = _a.statusCode, withIssuesInMessage = _a.withIssuesInMessage;
    var newError = new Error(__spreadArray([
        "Shared-route schema '".concat(checkedSchema, "' was not respected in adapter '").concat(adapterName, "'."),
        checkedSchema === "responses" &&
            "Received status: ".concat(statusCode, ". Handled statuses: ").concat(Object.keys(route.responses).join(", "), "."),
        "Route: ".concat(route.method.toUpperCase(), " ").concat(route.url)
    ], __read((withIssuesInMessage && ((_b = error === null || error === void 0 ? void 0 : error.issues) === null || _b === void 0 ? void 0 : _b.length)
        ? ["Issues: " + issuesToString(error === null || error === void 0 ? void 0 : error.issues)]
        : [])), false).filter(Boolean)
        .join("\n"));
    newError.cause = error;
    return newError;
};
export var validateSchemaWithExplicitError = function (_a) {
    var checkedSchema = _a.checkedSchema, _b = _a.params, params = _b === void 0 ? {} : _b, route = _a.route, adapterName = _a.adapterName, responseStatus = _a.responseStatus, _c = _a.withIssuesInMessage, withIssuesInMessage = _c === void 0 ? false : _c;
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
            withIssuesInMessage: withIssuesInMessage,
        });
    }
};
export var validateInputParams = function (route, params, adapterName, options) {
    if (options === void 0) { options = {
        withIssuesInMessage: false,
    }; }
    var withIssuesInMessage = options.withIssuesInMessage;
    var queryParams = validateSchemaWithExplicitError({
        adapterName: adapterName,
        checkedSchema: "queryParamsSchema",
        params: params.queryParams,
        route: route,
        withIssuesInMessage: withIssuesInMessage,
    });
    var body = validateSchemaWithExplicitError({
        adapterName: adapterName,
        checkedSchema: "requestBodySchema",
        params: params.body,
        route: route,
        withIssuesInMessage: withIssuesInMessage,
    });
    // we validate headers separately because we don't want to re-affect req.headers parsed value
    // because we don't want to lose all other headers
    validateSchemaWithExplicitError({
        adapterName: adapterName,
        checkedSchema: "headersSchema",
        params: params.headers,
        route: route,
    });
    return { queryParams: queryParams, body: body, headers: params.headers };
};
var issuesToString = function (issues) {
    return issues.map(function (_a) {
        var message = _a.message, path = _a.path;
        return "".concat(path.join("."), ": ").concat(message);
    }).join(" | ");
};
//# sourceMappingURL=validations.mjs.map