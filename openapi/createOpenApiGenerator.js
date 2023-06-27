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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOpenApiGenerator = void 0;
var __1 = require("..");
var zod_to_json_schema_1 = require("zod-to-json-schema");
var createOpenApiGenerator = function (sharedRoutesByTag, openApiRootDoc) { return function (extraDataByRoute) { return (__assign(__assign({}, openApiRootDoc), { paths: (0, __1.keys)(sharedRoutesByTag).reduce(function (rootAcc, tag) {
        var sharedRoutes = sharedRoutesByTag[tag];
        return __assign(__assign({}, rootAcc), (0, __1.keys)(sharedRoutes).reduce(function (acc, routeName) {
            var _a, _b;
            var _c, _d;
            var route = sharedRoutes[routeName];
            var _e = (_d = (_c = extraDataByRoute[tag]) === null || _c === void 0 ? void 0 : _c[routeName]) !== null && _d !== void 0 ? _d : {}, extraDocs = _e.extraDocs, extraDataForRoute = __rest(_e, ["extraDocs"]);
            var _f = extractFromUrl(route.url), formattedUrl = _f.formattedUrl, pathParams = _f.pathParams;
            var parameters = __spreadArray(__spreadArray(__spreadArray([], __read((pathParams.length > 0 ? pathParams : [])), false), __read((!isShapeObjectEmpty(route.queryParamsSchema)
                ? zodObjectToParameters(route.queryParamsSchema, "query", extraDocs === null || extraDocs === void 0 ? void 0 : extraDocs.queryParams)
                : [])), false), __read((!isShapeObjectEmpty(route.headersSchema)
                ? zodObjectToParameters(route.headersSchema, "header", extraDocs === null || extraDocs === void 0 ? void 0 : extraDocs.headerParams)
                : [])), false);
            return __assign(__assign({}, acc), (_a = {}, _a[formattedUrl] = __assign(__assign({}, acc[formattedUrl]), (_b = {}, _b[route.method] = __assign(__assign(__assign(__assign(__assign({}, extraDataForRoute), { tags: [tag] }), (parameters.length > 0 && {
                parameters: parameters,
            })), (!isShapeObjectEmpty(route.requestBodySchema) && {
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: __assign(__assign({}, extraDocs === null || extraDocs === void 0 ? void 0 : extraDocs.body), zodToOpenApi(route.requestBodySchema)),
                        },
                    },
                },
            })), { responses: (0, __1.keys)(route.responses).reduce(function (acc, status) {
                    var _a;
                    var _b;
                    var responseSchema = zodToOpenApi(route.responses[status]);
                    var responseSchemaType = responseSchema.type;
                    return __assign(__assign({}, acc), (_a = {}, _a[status.toString()] = __assign(__assign({}, (_b = extraDocs === null || extraDocs === void 0 ? void 0 : extraDocs.responses) === null || _b === void 0 ? void 0 : _b[status]), (responseSchemaType !== undefined && {
                        content: {
                            "application/json": {
                                schema: responseSchema,
                            },
                        },
                    })), _a));
                }, {}) }), _b)), _a));
        }, {}));
    }, {}) })); }; };
exports.createOpenApiGenerator = createOpenApiGenerator;
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
    var _a = (0, zod_to_json_schema_1.zodToJsonSchema)(schema), $schema = _a.$schema, rest = __rest(_a, ["$schema"]);
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
//# sourceMappingURL=createOpenApiGenerator.js.map