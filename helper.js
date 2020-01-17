"use strict";
exports.__esModule = true;
var memorize_decorator_1 = require("memorize-decorator");
exports["default"] = memorize_decorator_1["default"];
function compose() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args.reduce(function (prev, current) {
        return function () {
            var values = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                values[_i] = arguments[_i];
            }
            return prev(current.apply(void 0, values));
        };
    });
}
exports.compose = compose;
exports.pipe = function () {
    var funs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        funs[_i] = arguments[_i];
    }
    return function (x) {
        for (var i = 0; i < funs.length; i++) {
            x = funs[i](x);
        }
        return x;
    };
};
exports.curry = function (fn) {
    return function (n1) { return function (n2) { return fn(n1, n2); }; };
};
/**
 * 柯里化函数的第二参数
 */
exports.curry_2 = function (fn) {
    return function (n2) { return function (n1) { return fn(n1, n2); }; };
};
var Writer = /** @class */ (function () {
    function Writer(log, value) {
        this.log = log;
        this.value = value;
    }
    Writer.of = function (log, value) {
        return new Writer(log, value);
    };
    Writer.prototype.flatmap = function (f) {
        var targetResult = f(this.value);
        return Writer.of([this.log, targetResult.log].join(), targetResult.value);
    };
    Writer.prototype.map = function (f) {
        return Writer.of('map', f(this.value));
    };
    return Writer;
}());
exports.Writer = Writer;
var _zip = function (list1, list2) {
    var res = new Array();
    var len = list1.length < list2.length ? list1.length : list2.length;
    var cnt = 0;
    while (cnt < len) {
        res[cnt] = [];
        res[cnt].push(list1[cnt]);
        res[cnt].push(list2[cnt]);
        ++cnt;
    }
    return res;
};
/**
 * 类似于python的zip函数，使用了memorize函数做cache,该函数常被调用，且参数范围小，重复几率大，
 * 做cache能节省相同参数重复运行时间
 */
exports.zip = memorize_decorator_1["default"](_zip);
exports.sequenceOf = function (f, init, end) {
    var res = [];
    var cur = init;
    while (cur != end) {
        res.push(cur);
        cur = f(cur);
    }
    return res;
};
exports.add = function (x, y) { return x + y; };
var _range = function (a, b) { return a < b ? exports.sequenceOf(exports.curry(exports.add)(1), a, b) : exports.sequenceOf(exports.curry(exports.add)(-1), a, b); };
/**
 * 类似于python range函数，返回[a,b)之间的数组，使用了curry函数转换为一元函数，
 * 使得代码本身具有很好的可读性，使用了memorize函数做cache,该函数常被调用，且参数范围小，重复几率大，做cache能节省相同参数重复运行时间
  */
exports.range = memorize_decorator_1["default"](_range);
var Maybe = /** @class */ (function () {
    function Maybe(value) {
        this.value = value;
    }
    Maybe.prototype.map = function (f) {
        return this.value ? Maybe.of(f(this.value)) : Maybe.none();
    };
    Maybe.prototype.flatmap = function (f) {
        return this.value ? f(this.value) : Maybe.none();
    };
    Maybe.some = function (value) {
        if (!value) {
            throw Error("Provided value must not be empty");
        }
        return new Maybe(value);
    };
    Maybe.none = function () {
        return new Maybe(null);
    };
    Maybe.of = function (value) {
        return !value ? Maybe.none() : Maybe.some(value);
    };
    Maybe.prototype.orElse = function (defaultValue) {
        return (!this.value) ? defaultValue : this.value;
    };
    Maybe.prototype.ifPresent = function (f) {
        if (this.value)
            f(this.value);
    };
    Maybe.prototype.filter = function (pred) {
        if (!this.value || !pred(this.value))
            return Maybe.none();
        else
            return this;
    };
    return Maybe;
}());
exports.Maybe = Maybe;
