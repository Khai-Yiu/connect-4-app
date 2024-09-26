"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function deepClone(value, visited = new WeakMap()) {
    if (!(value instanceof Object) || typeof value === 'function') {
        return value;
    }
    if (visited.has(value)) {
        return visited.get(value);
    }
    const clone = Array.isArray(value) ? [] : {};
    const objOrArrayValue = value;
    const stringAndSymbolKeys = [
        ...Object.keys(objOrArrayValue),
        ...Object.getOwnPropertySymbols(objOrArrayValue)
    ];
    visited.set(value, clone);
    for (const key of stringAndSymbolKeys) {
        clone[key] = deepClone(objOrArrayValue[key], visited);
    }
    return clone;
}
exports.default = deepClone;
