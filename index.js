"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keys = exports.listRoutes = exports.defineRoute = exports.defineRoutes = exports.configureCreateHttpClient = exports.createCustomSharedClient = void 0;
var createCustomSharedClient_1 = require("./createCustomSharedClient");
Object.defineProperty(exports, "createCustomSharedClient", { enumerable: true, get: function () { return createCustomSharedClient_1.createCustomSharedClient; } });
var configureCreateHttpClient_1 = require("./configureCreateHttpClient");
Object.defineProperty(exports, "configureCreateHttpClient", { enumerable: true, get: function () { return configureCreateHttpClient_1.configureCreateHttpClient; } });
var defineRoutes_1 = require("./defineRoutes");
Object.defineProperty(exports, "defineRoutes", { enumerable: true, get: function () { return defineRoutes_1.defineRoutes; } });
Object.defineProperty(exports, "defineRoute", { enumerable: true, get: function () { return defineRoutes_1.defineRoute; } });
Object.defineProperty(exports, "listRoutes", { enumerable: true, get: function () { return defineRoutes_1.listRoutes; } });
var pathParameters_1 = require("./pathParameters");
Object.defineProperty(exports, "keys", { enumerable: true, get: function () { return pathParameters_1.keys; } });
//# sourceMappingURL=index.js.map