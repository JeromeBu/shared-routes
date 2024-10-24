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
            var zodError = error.cause;
            res.status(400);
            if (options === null || options === void 0 ? void 0 : options.onInputValidationError) {
                var processedError = options.onInputValidationError(zodError, route);
                if (processedError !== zodError) {
                    res.json(JSON.stringify(processedError, null, 2));
                    return;
                }
            }
            res.json({
                status: 400,
                message: error.message,
                issues: Array.from(new Set(zodIssuesToStrings(zodError.issues))),
            });
        }
    };
};
var zodIssuesToStrings = function (zodIssues) {
    return zodIssues.flatMap(function (zodIssue) {
        if (zodIssue.code === "invalid_union") {
            return zodIssue.unionErrors.flatMap(function (_a) {
                var issues = _a.issues;
                return zodIssuesToStrings(issues);
            });
        }
        var message = zodIssue.message, path = zodIssue.path;
        return "".concat(path.join("."), " : ").concat(message);
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