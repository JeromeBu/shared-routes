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
import { standardValidate } from "./standardSchemaUtils.mjs";
var makeExplicitError = function (_a) {
    var route = _a.route, adapterName = _a.adapterName, checkedSchema = _a.checkedSchema, statusCode = _a.statusCode, withIssuesInMessage = _a.withIssuesInMessage;
    return function (_a) {
        var message = _a.message, _b = _a.issues, issues = _b === void 0 ? [] : _b;
        var error = new Error(__spreadArray(__spreadArray([
            "Shared-route schema '".concat(checkedSchema, "' was not respected in adapter '").concat(adapterName, "'."),
            checkedSchema === "responses" &&
                "Received status: ".concat(statusCode, ". Handled statuses: ").concat(Object.keys(route.responses).join(", "), "."),
            "Route: ".concat(route.method.toUpperCase(), " ").concat(route.url)
        ], __read((message ? ["Message: ".concat(message)] : [])), false), __read((withIssuesInMessage && issues.length
            ? ["Issues: " + issuesToString(issues)]
            : [])), false).filter(Boolean)
            .join("\n"));
        error.issues = issues;
        return error;
    };
};
export var validateSchemaWithExplicitError = function (_a) {
    var checkedSchema = _a.checkedSchema, _b = _a.params, params = _b === void 0 ? {} : _b, route = _a.route, adapterName = _a.adapterName, responseStatus = _a.responseStatus, _c = _a.withIssuesInMessage, withIssuesInMessage = _c === void 0 ? false : _c;
    var explicitError = makeExplicitError({
        route: route,
        adapterName: adapterName,
        checkedSchema: checkedSchema,
        statusCode: responseStatus,
        withIssuesInMessage: withIssuesInMessage,
    });
    if (checkedSchema === "responses") {
        if (!responseStatus)
            throw explicitError({
                message: "a response status is required when validating responses",
            });
        var schema = route[checkedSchema][responseStatus];
        if (!schema)
            throw explicitError({ message: "No schema found for this status." });
        var result_1 = standardValidate(schema, params);
        if (!result_1.issues)
            return result_1.value;
        throw explicitError({
            issues: result_1.issues,
        });
    }
    var result = standardValidate(route[checkedSchema], params);
    if (!result.issues)
        return result.value;
    throw explicitError({
        issues: result.issues,
    });
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
    return issues
        .map(function (_a) {
        var message = _a.message, path = _a.path;
        if (path)
            return "".concat(path.join("."), ": ").concat(message);
        return message;
    })
        .join(" | ");
};
//# sourceMappingURL=validations.mjs.map