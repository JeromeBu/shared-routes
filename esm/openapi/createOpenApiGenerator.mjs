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
import { keys } from "../index.mjs";
import zodToJsonSchema from "zod-to-json-schema";
export var createOpenApiGenerator = function (sharedRoutes, openApiRootDoc) { return function (extraDataByRoute) { return (__assign(__assign({}, openApiRootDoc), { paths: keys(sharedRoutes).reduce(function (acc, routeName) {
        var _a, _b;
        var _c;
        var route = sharedRoutes[routeName];
        var _d = (_c = extraDataByRoute[routeName]) !== null && _c !== void 0 ? _c : {}, extraDocumentation = _d.extraDocumentation, extraDataForRoute = __rest(_d, ["extraDocumentation"]);
        var responseSchema = zodToOpenApi(route.responseBodySchema);
        var responseSchemaType = responseSchema.type;
        var _e = extractFromUrl(route.url), formattedUrl = _e.formattedUrl, pathParams = _e.pathParams;
        var parameters = __spreadArray(__spreadArray(__spreadArray([], __read((pathParams.length > 0 ? pathParams : [])), false), __read((!isShapeObjectEmpty(route.queryParamsSchema)
            ? zodObjectToParameters(route.queryParamsSchema, "query", extraDocumentation === null || extraDocumentation === void 0 ? void 0 : extraDocumentation.queryParams)
            : [])), false), __read((!isShapeObjectEmpty(route.headersSchema)
            ? zodObjectToParameters(route.headersSchema, "header", extraDocumentation === null || extraDocumentation === void 0 ? void 0 : extraDocumentation.headerParams)
            : [])), false);
        return __assign(__assign({}, acc), (_a = {}, _a[formattedUrl] = __assign(__assign({}, acc[formattedUrl]), (_b = {}, _b[route.method] = __assign(__assign(__assign(__assign({}, extraDataForRoute), (parameters.length > 0 && {
            parameters: parameters,
        })), (!isShapeObjectEmpty(route.bodySchema) && {
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: __assign(__assign({}, extraDocumentation === null || extraDocumentation === void 0 ? void 0 : extraDocumentation.body), zodToOpenApi(route.bodySchema)),
                    },
                },
            },
        })), { responses: {
                "200": __assign({ description: responseSchemaType !== undefined
                        ? "Success"
                        : "Success, with void response" }, (responseSchemaType !== undefined && {
                    content: {
                        "application/json": {
                            schema: responseSchema,
                        },
                    },
                })),
            } }), _b)), _a));
    }, {}) })); }; };
var extractFromUrl = function (url) {
    var pathParams = [];
    var formattedUrl = url.replace(/:(.*?)(\/|$)/g, function (_match, group1, group2) {
        var _a;
        pathParams.push({
            name: group1,
            required: true,
            schema: { type: "string" },
            in: "path",
        });
        return (_a = "{".concat(group1, "}") + group2) !== null && _a !== void 0 ? _a : "";
    });
    return {
        formattedUrl: formattedUrl,
        pathParams: pathParams,
    };
};
var zodToOpenApi = function (schema) {
    var _a = zodToJsonSchema(schema), $schema = _a.$schema, rest = __rest(_a, ["$schema"]);
    return rest;
};
var isShapeObjectEmpty = function (schema) {
    var typeName = getTypeName(schema);
    if (typeName === "ZodObject") {
        var shape = getShape(schema);
        return Object.keys(shape).length === 0;
    }
    return typeName === undefined;
};
var zodObjectToParameters = function (schema, paramKind, extraDocumentation) {
    if (extraDocumentation === void 0) { extraDocumentation = {}; }
    var shape = getShape(schema);
    return Object.keys(shape).reduce(function (acc, paramName) {
        var paramSchema = shape[paramName];
        var extraDoc = extraDocumentation[paramName];
        var initialTypeName = getTypeName(paramSchema);
        var required = initialTypeName !== "ZodOptional";
        var schema = zodToOpenApi(required ? paramSchema : paramSchema._def.innerType);
        return __spreadArray(__spreadArray([], __read(acc), false), [
            __assign(__assign({}, extraDoc), { in: paramKind, name: paramName, required: required, schema: schema }),
        ], false);
    }, []);
};
var getTypeName = function (schema) {
    return schema._def.typeName;
};
var getShape = function (schema) { return schema._def.shape(); };
//# sourceMappingURL=createOpenApiGenerator.mjs.map