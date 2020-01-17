"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const perf_hooks_1 = require("perf_hooks");
Object.prototype.trace = function (label) {
    console.log(label + ":" + JSON.stringify(this));
    return this;
};
exports.trace = (v) => {
    console.log(v);
    return v;
};
exports.trace_l = (label, v) => {
    console.log(`${label}:${JSON.stringify(v)}`);
    return v;
};
exports.trace_t = (label, f) => {
    const start = perf_hooks_1.performance.now();
    const result = f();
    const timespan = perf_hooks_1.performance.now() - start;
    console.log(`${label}:${JSON.stringify(result)} within ${timespan}ms`);
    return result;
};
