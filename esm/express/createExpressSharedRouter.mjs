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
            res.json({
                status: 400,
                message: error.message,
                issues: zodError.issues.map(function (_a) {
                    var message = _a.message, path = _a.path;
                    return "".concat(path.join("."), " : ").concat(message);
                }),
            });
        }
    };
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