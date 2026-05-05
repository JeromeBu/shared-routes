"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardValidate = void 0;
var standardValidate = function (schema, input) {
    var result = schema["~standard"].validate(input);
    if (result instanceof Promise)
        throw new TypeError("Schema validation must be synchronous");
    return result;
};
exports.standardValidate = standardValidate;
//# sourceMappingURL=standardSchemaUtils.js.map