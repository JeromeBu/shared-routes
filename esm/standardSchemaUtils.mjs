export var standardValidate = function (schema, input) {
    var result = schema["~standard"].validate(input);
    if (result instanceof Promise)
        throw new TypeError("Schema validation must be synchronous");
    return result;
};
//# sourceMappingURL=standardSchemaUtils.mjs.map