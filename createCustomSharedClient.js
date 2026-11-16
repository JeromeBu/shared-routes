"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomSharedClient = void 0;
var configureCreateHttpClient_1 = require("./configureCreateHttpClient");
var createCustomSharedClient = function (sharedRoutes, customHandlers) {
    var createHttpClient = (0, configureCreateHttpClient_1.configureCreateHttpClient)(function (routeName) {
        return customHandlers[routeName];
    });
    return createHttpClient(sharedRoutes);
};
exports.createCustomSharedClient = createCustomSharedClient;
//# sourceMappingURL=createCustomSharedClient.js.map