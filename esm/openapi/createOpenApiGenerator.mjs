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
import { ZodType, z } from "zod";
import { keys } from "../index.mjs";
var extractFromOpenApiBody = function (openApiRequestBody) {
    if (openApiRequestBody === void 0) { openApiRequestBody = {}; }
    var examples = openApiRequestBody.examples, example = openApiRequestBody.example, rest = __rest(openApiRequestBody, ["examples", "example"]);
    return {
        withRequestBodyExemple: __assign(__assign({}, (example && { example: example })), (examples && { examples: examples })),
        requestBodyDocs: rest,
    };
};
var throwIfNotZodSchema = function (schema) {
    if (!(schema instanceof ZodType))
        throw new Error("Only support Zod schemas are supported for OpenAPI generation");
    return schema;
};
export var createOpenApiGenerator = function (sharedRoutesByTag, openApiRootDoc) { return function (extraDataByRoute) { return (__assign(__assign({}, openApiRootDoc), { paths: keys(sharedRoutesByTag).reduce(function (rootAcc, tag) {
        var sharedRoutes = sharedRoutesByTag[tag];
        return __assign(__assign({}, rootAcc), keys(sharedRoutes).reduce(function (acc, routeName) {
            var _a, _b;
            var _c, _d;
            var route = sharedRoutes[routeName];
            var _e = (_d = (_c = extraDataByRoute[tag]) === null || _c === void 0 ? void 0 : _c[routeName]) !== null && _d !== void 0 ? _d : {}, extraDocs = _e.extraDocs, extraDataForRoute = __rest(_e, ["extraDocs"]);
            var _f = extractFromUrl(route.url, extraDocs === null || extraDocs === void 0 ? void 0 : extraDocs.urlParams), formattedUrl = _f.formattedUrl, pathParams = _f.pathParams;
            var queryParamsZodSchema = throwIfNotZodSchema(route.queryParamsSchema);
            var headerZodSchema = throwIfNotZodSchema(route.headersSchema);
            var parameters = __spreadArray(__spreadArray(__spreadArray([], __read((pathParams.length > 0 ? pathParams : [])), false), __read((shouldSkipParameterExtraction(queryParamsZodSchema)
                ? []
                : zodObjectToParameters(queryParamsZodSchema, "query", extraDocs === null || extraDocs === void 0 ? void 0 : extraDocs.queryParams))), false), __read((shouldSkipParameterExtraction(headerZodSchema)
                ? []
                : zodObjectToParameters(headerZodSchema, "header", extraDocs === null || extraDocs === void 0 ? void 0 : extraDocs.headerParams))), false);
            var _g = extractFromOpenApiBody(extraDocs === null || extraDocs === void 0 ? void 0 : extraDocs.body), withRequestBodyExemple = _g.withRequestBodyExemple, requestBodyDocs = _g.requestBodyDocs;
            var requestBodySchema = throwIfNotZodSchema(route.requestBodySchema);
            return __assign(__assign({}, acc), (_a = {}, _a[formattedUrl] = __assign(__assign({}, acc[formattedUrl]), (_b = {}, _b[route.method] = __assign(__assign(__assign(__assign(__assign(__assign({}, extraDataForRoute), { tags: [tag] }), ((extraDocs === null || extraDocs === void 0 ? void 0 : extraDocs.securitySchemeToApply) &&
                securitySchemeNamesToSecurity(extraDocs.securitySchemeToApply))), (parameters.length > 0 && {
                parameters: parameters,
            })), (!isSchemaEmpty(requestBodySchema) && {
                requestBody: {
                    required: true,
                    content: {
                        "application/json": __assign(__assign({}, withRequestBodyExemple), { schema: __assign(__assign({}, requestBodyDocs), zodToOpenApi(requestBodySchema)) }),
                    },
                },
            })), { responses: keys(route.responses).reduce(function (acc, status) {
                    var _a;
                    var _b, _c;
                    var responseZodSchema = throwIfNotZodSchema(route.responses[status]);
                    var responseSchema = zodToOpenApi(responseZodSchema);
                    var _d = (_c = (_b = extraDocs === null || extraDocs === void 0 ? void 0 : extraDocs.responses) === null || _b === void 0 ? void 0 : _b[status]) !== null && _c !== void 0 ? _c : {}, example = _d.example, examples = _d.examples, responseDoc = __rest(_d, ["example", "examples"]);
                    return __assign(__assign({}, acc), (_a = {}, _a[status.toString()] = __assign(__assign({}, responseDoc), (typeof responseSchema === "object" && {
                        content: {
                            "application/json": __assign(__assign(__assign({}, (example && { example: example })), (examples && { examples: examples })), { schema: responseSchema }),
                        },
                    })), _a));
                }, {}) }), _b)), _a));
        }, {}));
    }, {}) })); }; };
var extractFromUrl = function (url, extraUrlParameters) {
    var pathParams = [];
    var formattedUrl = url.replace(/:(.*?)(\/|$)/g, function (_match, group1, group2) {
        var extraDocForParam = extraUrlParameters === null || extraUrlParameters === void 0 ? void 0 : extraUrlParameters[group1];
        pathParams.push(__assign(__assign({}, extraDocForParam), { name: group1, required: true, schema: { type: "string" }, in: "path" }));
        return "{".concat(group1, "}") + group2;
    });
    return {
        formattedUrl: formattedUrl,
        pathParams: pathParams,
    };
};
var getDef = function (schema) { var _a; return ((_a = schema._zod) === null || _a === void 0 ? void 0 : _a.def) || schema.def; };
var handleVoidUnion = function (options) {
    var hasVoid = options.some(function (option) { return getTypeName(option) === "void"; });
    if (!hasVoid)
        return null;
    var nonVoidOptions = options.filter(function (option) { return getTypeName(option) !== "void"; });
    if (nonVoidOptions.length === 0) {
        return { type: "null" };
    }
    return {
        anyOf: nonVoidOptions.map(function (option) { return zodToOpenApi(option); }),
    };
};
var zodToOpenApi = function (schema) {
    var _a, _b;
    var typeName = getTypeName(schema);
    if (typeName === "void") {
        return { type: "null" };
    }
    if (typeName === "union") {
        var options = ((_a = getDef(schema)) === null || _a === void 0 ? void 0 : _a.options) || [];
        if (options.length === 0) {
            return { type: "object" };
        }
        var voidUnionResult = handleVoidUnion(options);
        if (voidUnionResult) {
            return voidUnionResult;
        }
        return {
            anyOf: options.map(function (option) { return zodToOpenApi(option); }),
        };
    }
    if (typeName === "discriminatedUnion") {
        var options = ((_b = getDef(schema)) === null || _b === void 0 ? void 0 : _b.options) || [];
        if (options.length === 0) {
            return { type: "object" };
        }
        return {
            oneOf: options.map(function (option) { return zodToOpenApi(option); }),
        };
    }
    if (typeName === "intersection") {
        var def = getDef(schema);
        var left = def === null || def === void 0 ? void 0 : def.left;
        var right = def === null || def === void 0 ? void 0 : def.right;
        if (left && right) {
            return {
                allOf: [zodToOpenApi(left), zodToOpenApi(right)],
            };
        }
    }
    try {
        var result = z.toJSONSchema(schema);
        var $schema = result.$schema, rest = __rest(result, ["$schema"]);
        if (rest.type === "object" && rest.additionalProperties === false) {
            rest.additionalProperties = undefined;
        }
        return rest;
    }
    catch (_error) {
        return { type: "object" };
    }
};
var shouldSkipParameterExtraction = function (schema) {
    var typeName = getTypeName(schema);
    if (typeName === "object") {
        var shape = getShape(schema);
        return Object.keys(shape).length === 0;
    }
    if (typeName === "intersection") {
        var def = getDef(schema);
        var left = def === null || def === void 0 ? void 0 : def.left;
        var right = def === null || def === void 0 ? void 0 : def.right;
        if (!left || !right)
            return true;
        return shouldSkipParameterExtraction(left) && shouldSkipParameterExtraction(right);
    }
    return true;
};
var isSchemaEmpty = function (schema) {
    var typeName = getTypeName(schema);
    if (typeName === "object") {
        var shape = getShape(schema);
        return Object.keys(shape).length === 0;
    }
    return false;
};
var mergeIntersectionParameters = function (left, right, paramKind, extraDocumentation) {
    var leftParams = left
        ? zodObjectToParameters(left, paramKind, extraDocumentation)
        : [];
    var rightParams = right
        ? zodObjectToParameters(right, paramKind, extraDocumentation)
        : [];
    var paramMap = new Map();
    __spreadArray(__spreadArray([], __read(leftParams), false), __read(rightParams), false).forEach(function (param) { return paramMap.set(param.name, param); });
    return Array.from(paramMap.values());
};
var zodObjectToParameters = function (schema, paramKind, extraDocumentation) {
    if (extraDocumentation === void 0) { extraDocumentation = {}; }
    var typeName = getTypeName(schema);
    if (typeName === "intersection") {
        var def = getDef(schema);
        return mergeIntersectionParameters(def === null || def === void 0 ? void 0 : def.left, def === null || def === void 0 ? void 0 : def.right, paramKind, extraDocumentation);
    }
    if (typeName !== "object") {
        return [];
    }
    var shape = getShape(schema);
    if (!shape) {
        return [];
    }
    return Object.keys(shape).map(function (paramName) {
        var paramSchema = shape[paramName];
        var extraDoc = extraDocumentation[paramName];
        var initialTypeName = getTypeName(paramSchema);
        var required = initialTypeName !== "optional";
        return __assign(__assign({}, extraDoc), { in: paramKind, name: paramName, required: required, schema: zodToOpenApi(paramSchema) });
    });
};
var getTypeName = function (schema) {
    var _a;
    // In Zod 4, ._def has moved to ._zod.def
    var def = ((_a = schema._zod) === null || _a === void 0 ? void 0 : _a.def) || schema.def;
    return def === null || def === void 0 ? void 0 : def.type;
};
var securitySchemeNamesToSecurity = function (securitySchemeToApply) { return ({
    security: securitySchemeToApply.reduce(function (securityAcc, securitySchemeName) {
        var _a;
        return __spreadArray(__spreadArray([], __read(securityAcc), false), [(_a = {}, _a[securitySchemeName] = [], _a)], false);
    }, []),
}); };
var getShape = function (schema) {
    var _a;
    // In Zod 4, ._def has moved to ._zod.def
    var def = ((_a = schema._zod) === null || _a === void 0 ? void 0 : _a.def) || schema.def;
    return def === null || def === void 0 ? void 0 : def.shape;
};
//# sourceMappingURL=createOpenApiGenerator.mjs.map