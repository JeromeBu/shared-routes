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
import { keys } from "../index.mjs";
import { validateInputParams } from "../validations.mjs";
var makeValidationMiddleware = function (route, options) {
    return function (req, res, next) {
        try {
            if (!options.skipInputValidation) {
                var validatedParams = validateInputParams(route, { body: req.body, headers: req.headers, queryParams: req.query }, "express");
                req.body = validatedParams.body;
                req.query = validatedParams.queryParams;
                req.headers = validatedParams.headers;
            }
            next();
        }
        catch (error) {
            var schemaError = error;
            res.status(400);
            if (options === null || options === void 0 ? void 0 : options.onInputValidationError) {
                var processedError = options.onInputValidationError(schemaError, route);
                if (processedError !== schemaError) {
                    res.json(JSON.stringify(processedError, null, 2));
                    return;
                }
            }
            res.json({
                status: 400,
                message: error.message,
                issues: Array.from(new Set(zodIssuesToStrings(schemaError === null || schemaError === void 0 ? void 0 : schemaError.issues))),
            });
        }
    };
};
var formatPath = function (path, fallback) {
    if (fallback === void 0) { fallback = ""; }
    return (path === null || path === void 0 ? void 0 : path.join(".")) || fallback;
};
var formatIssueString = function (path, message) {
    return "".concat(path, " : ").concat(message);
};
var hasErrorCode = function (issue, code) {
    return "code" in issue && issue.code === code;
};
var zodIssuesToStrings = function (issues) {
    if (issues === void 0) { issues = []; }
    return issues.flatMap(function (issue) {
        var _a;
        var issueData = issue;
        if (hasErrorCode(issue, "invalid_union")) {
            var nestedErrors = (_a = issueData.errors) !== null && _a !== void 0 ? _a : [];
            if (nestedErrors.length > 0) {
                return nestedErrors.flatMap(function (nestedIssues) {
                    return zodIssuesToStrings(nestedIssues);
                });
            }
            var path = formatPath(issue.path, issueData.discriminator);
            var messageParts = [
                issue.message,
                issueData.note,
                issueData.discriminator && "discriminator: ".concat(issueData.discriminator),
            ].filter(Boolean);
            return formatIssueString(path, messageParts.join(" - "));
        }
        if (hasErrorCode(issue, "invalid_union_discriminator")) {
            return formatIssueString(formatPath(issue.path, "discriminator"), issue.message);
        }
        if (Array.isArray(issueData.unionErrors)) {
            return issueData.unionErrors.flatMap(function (unionError) { var _a; return zodIssuesToStrings((_a = unionError === null || unionError === void 0 ? void 0 : unionError.issues) !== null && _a !== void 0 ? _a : []); });
        }
        return formatIssueString(formatPath(issue.path), issue.message);
    });
};
var assignHandlersToExpressRouter = function (expressRouter, route, options) {
    if (options === void 0) { options = {}; }
    var validationMiddleware = makeValidationMiddleware(route, options);
    var url = route.url;
    return function () {
        var handlers = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            handlers[_i] = arguments[_i];
        }
        return expressRouter.route(url)[route.method](validationMiddleware, handlers);
    };
};
export var createExpressSharedRouter = function (sharedRoutes, expressRouter, options) {
    var expressSharedRouter = keys(sharedRoutes).reduce(function (acc, routeName) {
        var _a;
        var route = sharedRoutes[routeName];
        return __assign(__assign({}, acc), (_a = {}, _a[routeName] = assignHandlersToExpressRouter(expressRouter, route, options), _a));
    }, {});
    return expressSharedRouter;
};
//# sourceMappingURL=createExpressSharedRouter.mjs.map