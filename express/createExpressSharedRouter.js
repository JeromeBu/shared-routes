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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpressSharedRouter = void 0;
var __1 = require("..");
var validations_1 = require("../validations");
var makeValidationMiddleware = function (route, options) {
    return function (req, res, next) {
        try {
            if (!options.skipInputValidation) {
                var validatedParams = (0, validations_1.validateInputParams)(route, { body: req.body, headers: req.headers, queryParams: req.query }, "express");
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
var createExpressSharedRouter = function (sharedRoutes, expressRouter, options) {
    var expressSharedRouter = (0, __1.keys)(sharedRoutes).reduce(function (acc, routeName) {
        var _a;
        var route = sharedRoutes[routeName];
        return __assign(__assign({}, acc), (_a = {}, _a[routeName] = assignHandlersToExpressRouter(expressRouter, route, options), _a));
    }, {});
    return expressSharedRouter;
};
exports.createExpressSharedRouter = createExpressSharedRouter;
//# sourceMappingURL=createExpressSharedRouter.js.map