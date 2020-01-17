"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//f1: b -> Mc , f2: a -> Mb  compose(f2,f1): a -> Mc
function m_compose(f1, f2) {
    return (a) => f2(a).flatmap(x => f1(x));
}
exports.m_compose = m_compose;
function m_compose3(f1, f2, f3) {
    return (a) => f3(a).flatmap(b => f2(b).flatmap(c => f1(c)));
}
exports.m_compose3 = m_compose3;
exports.promiseOf = (v) => {
    if (v)
        return Promise.resolve(v);
    else
        return Promise.reject("null/undefined value accepted");
};
