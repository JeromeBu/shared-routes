"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToFormData = void 0;
var convertToFormData = function (params) {
    return Object.entries(params)
        .filter(function (_a) {
        var _b = __read(_a, 2), _ = _b[0], value = _b[1];
        return value !== undefined;
    })
        .map(function (_a) {
        var _b = __read(_a, 2), key = _b[0], value = _b[1];
        return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(String(value)));
    })
        .join("&");
};
exports.convertToFormData = convertToFormData;
//# sourceMappingURL=convertToFormData.js.map