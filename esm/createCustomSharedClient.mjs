import { configureCreateHttpClient } from "./configureCreateHttpClient.mjs";
export var createCustomSharedClient = function (sharedRoutes, customHandlers) {
    var createHttpClient = configureCreateHttpClient(function (routeName) {
        return customHandlers[routeName];
    });
    return createHttpClient(sharedRoutes);
};
//# sourceMappingURL=createCustomSharedClient.mjs.map