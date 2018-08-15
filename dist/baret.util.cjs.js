'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var R = require('ramda');
var Atom = _interopDefault(require('bacon.atom'));
var B = require('baconjs');
var B__default = _interopDefault(B);
var infestines = require('infestines');
var L = require('partial.lenses');
var K = require('bacon.combines');
var K__default = _interopDefault(K);
var React = require('baret');
var React__default = _interopDefault(React);
var react = require('react');

var liftStaged = function liftStaged(fn) {
  return K.lift(infestines.pipe2U(fn, K.lift));
};
var template = function template(observables) {
  return K__default(observables, infestines.id);
};

// Bacon

var toUndefined = function toUndefined(_) {};
var toConstant = function toConstant(x) {
  return x instanceof B.Observable ? x : B.constant(x);
};

var debounce = /*#__PURE__*/infestines.curry(function (ms, xs) {
  return toConstant(xs).debounce(ms);
});
var changes = function changes(xs) {
  return toConstant(xs).changes();
};
var parallel = /*#__PURE__*/B__default.mergeAll;
var delay = /*#__PURE__*/infestines.curry(function (ms, xs) {
  return toConstant(xs).delay(ms);
});
var endWith = /*#__PURE__*/infestines.curry(function (v, xs) {
  return toConstant(xs).toEventStream().concat(toConstant(v)).toProperty();
});
var mapValue = /*#__PURE__*/infestines.curry(function (fn, xs) {
  return toConstant(xs).map(fn);
});
var flatMapParallel = /*#__PURE__*/infestines.curry(function (fn, xs) {
  return toConstant(xs).flatMap(infestines.pipe2U(fn, toConstant));
});
var flatMapSerial = /*#__PURE__*/infestines.curry(function (fn, xs) {
  return toConstant(xs).flatMapConcat(infestines.pipe2U(fn, toConstant));
});
var flatMapError = /*#__PURE__*/infestines.curry(function (fn, xs) {
  return toConstant(xs).flatMapError(infestines.pipe2U(fn, toConstant));
});
var flatMapLatest = /*#__PURE__*/infestines.curry(function (fn, xs) {
  return toConstant(xs).flatMapLatest(infestines.pipe2U(fn, toConstant));
});
var foldPast = /*#__PURE__*/infestines.curry(function (fn, s, xs) {
  return toConstant(xs).scan(s, fn);
});
var interval = /*#__PURE__*/infestines.curry(B__default.interval);
var later = /*#__PURE__*/infestines.curry(B__default.later);
var lazy = function lazy(th) {
  return infestines.seq(toProperty(), flatMapLatest(th), toProperty);
};
var never = /*#__PURE__*/B__default.never();
var sampledBy = /*#__PURE__*/infestines.curry(function (es, xs) {
  return toConstant(xs).sampledBy(es);
});
var skipFirst = /*#__PURE__*/infestines.curry(function (n, xs) {
  return toConstant(xs).skip(n);
});
var skipDuplicates = /*#__PURE__*/infestines.curry(function (equals, xs) {
  return toConstant(xs).skipDuplicates(equals);
});
var skipUnless = /*#__PURE__*/infestines.curry(function (p, xs) {
  return toConstant(xs).filter(p);
});
var skipWhen = /*#__PURE__*/infestines.curry(function (p, xs) {
  return toConstant(xs).filter(function (x) {
    return !p(x);
  });
});
var startWith = /*#__PURE__*/infestines.curry(function (x, xs) {
  return toConstant(xs).startWith(x);
});
var sink = /*#__PURE__*/infestines.pipe2U(startWith(undefined), K.lift(toUndefined));
var takeFirst = /*#__PURE__*/infestines.curry(function (n, xs) {
  return toConstant(xs).take(n);
});
var lastEvent = /*#__PURE__*/infestines.curry(function (xs) {
  return toConstant(xs).last();
});
var takeUntil = /*#__PURE__*/infestines.curry(function (ts, xs) {
  return toConstant(xs).takeUntil(ts);
});
var toProperty = function toProperty(xs) {
  return toConstant(xs).toProperty();
};
var throttle = /*#__PURE__*/infestines.curry(function (ms, xs) {
  return toConstant(xs).throttle(ms);
});

var set = /*#__PURE__*/infestines.curry(function (settable, xs) {
  var ss = K__default(xs, function (xs) {
    return settable.set(xs);
  });
  if (ss instanceof B.Observable) return ss.startWith(toUndefined);
});

//

var Bus = B__default.Bus;
var bus = Bus;

//

var refTo = function refTo(settable) {
  return function (elem) {
    if (null !== elem) settable.set(elem);
  };
};

var scope = function scope(fn) {
  return fn();
};

var toPartial = function toPartial(fn) {
  return K.lift(infestines.arityN(fn.length, function () {
    for (var _len = arguments.length, xs = Array(_len), _key = 0; _key < _len; _key++) {
      xs[_key] = arguments[_key];
    }

    return R.all(infestines.isDefined, xs) ? fn.apply(undefined, xs) : undefined;
  }));
};

var show = function show(x) {
  return console.log(x) || x;
};

var staged = function staged(fn) {
  return R.curryN(fn.length, function () {
    var xsN = arguments.length,
        fnN = fn.length,
        n = Math.min(xsN, fnN),
        xs = Array(n);
    for (var i = 0; i < n; ++i) {
      xs[i] = arguments[i];
    }var fnxs = fn.apply(null, xs);
    if (fnN === xsN) return fnxs;

    var m = xsN - n,
        ys = Array(m);
    for (var _i = 0; _i < m; ++_i) {
      ys[_i] = arguments[_i + n];
    }return fnxs.apply(null, ys);
  });
};

//

function setProps(observables) {
  var unsub = void 0;
  return function (e) {
    if (unsub) unsub();
    var observable = template(observables);
    unsub = observable.onValue(function (values) {
      for (var k in values) {
        e[k] = values[k];
      }
    });
  };
}

var getProps = function getProps(template) {
  return function (_ref) {
    var target = _ref.target;

    for (var k in template) {
      template[k].set(target[k]);
    }
  };
};

var bindProps = function bindProps(templateWithRef) {
  var ref = templateWithRef.ref;
  var template = infestines.dissocPartialU("ref", templateWithRef);
  var r = { ref: setProps(template) };
  r[ref] = getProps(template);
  return r;
};

var bind = function bind(template) {
  return infestines.assocPartialU("onChange", getProps(template), template);
};

//

function classesImmediate() {
  var result = "";
  for (var i = 0, n = arguments.length; i < n; ++i) {
    var a = arguments[i];
    if (a) {
      if (result) result += " ";
      result += a;
    }
  }
  return result;
}

function cns() {
  var n = arguments.length,
      xs = Array(n + 1);
  for (var i = 0; i < n; ++i) {
    xs[i] = arguments[i];
  }xs[n] = classesImmediate;
  return K__default.apply(null, xs);
}

var classes = function classes() {
  return { className: cns.apply(undefined, arguments) };
};

//

var mapCachedInit = [{}, []];

var mapCachedStep = function mapCachedStep(fromId) {
  return function (old, ids) {
    var oldIds = old[0],
        oldVs = old[1];
    var newIds = {};
    var n = ids.length;
    var changed = n !== oldVs.length;
    var newVs = Array(n);
    for (var i = 0; i < n; ++i) {
      var _id = ids[i];
      var k = _id.toString();
      var v = void 0;
      if (infestines.hasU(k, newIds)) v = newIds[k];else v = newIds[k] = infestines.hasU(k, oldIds) ? oldIds[k] : fromId(_id);
      newVs[i] = v;
      if (!changed) changed = v !== oldVs[i];
    }
    return changed ? [newIds, newVs] : old;
  };
};

var mapCachedMap = /*#__PURE__*/K.lift1Shallow(function (x) {
  return x[1];
});

var mapCached = /*#__PURE__*/infestines.curryN(2, function (fromId) {
  return infestines.pipe2U(foldPast(mapCachedStep(fromId), mapCachedInit), mapCachedMap);
});

//

var mapIndexed = /*#__PURE__*/infestines.curryN(2, function (xi2y) {
  return K.lift1(function (xs) {
    return xs.map(function (x, i) {
      return xi2y(x, i);
    });
  });
});

var ifteU = function ifteU(b, t, e) {
  return toProperty(flatMapLatest(function (b) {
    return b ? t : e;
  }, b));
};

var ifte = /*#__PURE__*/infestines.curry(ifteU);
var ift = /*#__PURE__*/infestines.arityN(2, ifteU);

function iftes() {
  var n = arguments.length;
  var r = n & 1 ? arguments[--n] : undefined;
  while (0 <= (n -= 2)) {
    r = ifteU(arguments[n], arguments[n + 1], r);
  }return r;
}

//

var view = /*#__PURE__*/infestines.curry(function (l, xs) {
  return xs instanceof B.Observable && infestines.isFunction(xs.view) ? xs.view(l) : K__default(l, xs, L.get);
});

//

var types = { context: react.PropTypes.any };

var Context = /*#__PURE__*/infestines.inherit(function Context(props) {
  Context.childContextTypes = types;
  React__default.Component.call(this, props);
}, React__default.Component, {
  getChildContext: function getChildContext() {
    return { context: this.props.context };
  },
  render: function render() {
    return this.props.children;
  }
});

function withContext(originalFn) {
  var fn = function fn(props, _ref2) {
    var context = _ref2.context;
    return originalFn(props, context);
  };
  fn.contextTypes = types;
  return fn;
}

var WithContext = /*#__PURE__*/withContext(function (_ref3, context) {
  var Do = _ref3.Do;
  return React__default.createElement(Do, context);
});

//

var actionsImmediate = function actionsImmediate() {
  for (var _len2 = arguments.length, fns = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    fns[_key2] = arguments[_key2];
  }

  return function () {
    for (var i = 0, n = fns.length; i < n; ++i) {
      if (fns[i] instanceof Function) fns[i].apply(fns, arguments);
    }
  };
};

var actions = function actions() {
  for (var _len3 = arguments.length, fns = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    fns[_key3] = arguments[_key3];
  }

  return K__default.apply(undefined, fns.concat([actionsImmediate]));
};

//

var string = function string(strings) {
  for (var _len4 = arguments.length, values = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    values[_key4 - 1] = arguments[_key4];
  }

  return K__default.apply(undefined, values.concat([function () {
    for (var _len5 = arguments.length, values = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      values[_key5] = arguments[_key5];
    }

    return String.raw.apply(String, [strings].concat(values));
  }]));
};

//

var atom = function atom(value) {
  return new Atom(value);
};
var variable = function variable() {
  return new Atom();
};

// Ramda

var maybe = function maybe(f) {
  return function (x) {
    return x && f(x);
  };
};

var stageLast1Of2Maybe = /*#__PURE__*/maybe(function (fn) {
  return function (x1) {
    return function (x2) {
      return fn(x1, x2);
    };
  };
});
var stageLast2Of3Maybe = /*#__PURE__*/maybe(function (fn) {
  return function (x1) {
    return function (x2, x3) {
      return fn(x1, x2, x3);
    };
  };
});

var liftMaybe = /*#__PURE__*/maybe(K.lift);
var liftStagedMaybe = /*#__PURE__*/maybe(liftStaged);
var lift1Maybe = /*#__PURE__*/maybe(K.lift1);
var lift1ShallowMaybe = /*#__PURE__*/maybe( /*#__PURE__*/K.lift1Shallow);

//export const bind = /*#__PURE__*/liftMaybe(R.bind)                             -> conflict, useful?
//export const clone = /*#__PURE__*/liftMaybe(R.clone)                           -> useful?
//export const composeK = /*#__PURE__*/liftMaybe(R.composeK)                     -> lift staged, useful?
//export const composeP = /*#__PURE__*/liftMaybe(R.composeP)                     -> lift staged, useful?
//export const forEach = /*#__PURE__*/liftMaybe(R.forEach)                       -> useful?
//export const forEachObjIndexed = = /*#__PURE__*/liftMaybe(R.forEachObjIndexed) -> useful?
//export const lens = /*#__PURE__*/liftMaybe(R.lens)                             -> partial.lenses
//export const lensIndex = /*#__PURE__*/liftMaybe(R.lensIndex)                   -> partial.lenses
//export const lensPath = /*#__PURE__*/liftMaybe(R.lensPath)                     -> partial.lenses
//export const lensProp = /*#__PURE__*/liftMaybe(R.lensProp)                     -> partial.lenses
//export const lift = /*#__PURE__*/liftMaybe(R.lift)                             -> conflict
//export const liftN = /*#__PURE__*/liftMaybe(R.liftN)                           -> conflict
//export const memoize = /*#__PURE__*/liftStagedMaybe(R.memoize)
//export const once = /*#__PURE__*/liftMaybe(R.once)                             -> lift staged, usually wrong thing to do?
//export const over = /*#__PURE__*/liftMaybe(R.over)                             -> partial.lenses
//export const pipeK = /*#__PURE__*/liftMaybe(R.pipeK)                           -> lift staged, useful?
//export const pipeP = /*#__PURE__*/liftMaybe(R.pipeP)                           -> lift staged, useful?
//export const set = /*#__PURE__*/liftMaybe(R.set)                               -> partial.lenses, conflict
//export const view = /*#__PURE__*/liftMaybe(R.view)                             -> partial.lenses, conflict

var F = /*#__PURE__*/R.F;
var T = /*#__PURE__*/R.T;
var __ = /*#__PURE__*/R.__;
var add = /*#__PURE__*/liftMaybe(R.add);
var addIndex = /*#__PURE__*/liftStagedMaybe(R.addIndex);
var adjust = /*#__PURE__*/liftMaybe(R.adjust);
var all = /*#__PURE__*/liftMaybe(R.all);
var allPass = /*#__PURE__*/liftStagedMaybe(R.allPass);
var always = /*#__PURE__*/R.always; // lifting won't really work
var and = /*#__PURE__*/liftMaybe(R.and);
var any = /*#__PURE__*/liftMaybe(R.any);
var anyPass = /*#__PURE__*/liftStagedMaybe(R.anyPass);
var ap = /*#__PURE__*/liftMaybe(R.ap);
var aperture = /*#__PURE__*/liftMaybe(R.aperture);
var append = /*#__PURE__*/liftMaybe(R.append);
var apply = /*#__PURE__*/liftMaybe(R.apply);
var applySpec = /*#__PURE__*/liftMaybe(R.applySpec);
var applyTo = /*#__PURE__*/liftMaybe(R.applyTo);
var ascend = /*#__PURE__*/liftMaybe(stageLast2Of3Maybe(R.ascend));
var assoc = /*#__PURE__*/liftMaybe(R.assoc);
var assocPath = /*#__PURE__*/liftMaybe(R.assocPath);
var binary = /*#__PURE__*/liftStagedMaybe(R.binary);
var both = /*#__PURE__*/liftStagedMaybe(R.both);
var call = /*#__PURE__*/liftStagedMaybe(R.call);
var chain = /*#__PURE__*/liftMaybe(R.chain);
var clamp = /*#__PURE__*/liftMaybe(R.clamp);
var comparator = /*#__PURE__*/liftStagedMaybe(R.comparator);
var complement = /*#__PURE__*/liftStagedMaybe(R.complement);
var compose = /*#__PURE__*/liftStagedMaybe(R.compose);
var concat = /*#__PURE__*/liftMaybe(R.concat);
var cond = /*#__PURE__*/liftStagedMaybe(R.cond);
var construct = /*#__PURE__*/liftStagedMaybe(R.construct);
var constructN = /*#__PURE__*/liftStagedMaybe(R.constructN);
var contains = /*#__PURE__*/liftMaybe(R.contains);
var converge = /*#__PURE__*/liftStagedMaybe(R.converge);
var countBy = /*#__PURE__*/liftMaybe(R.countBy);
var curry = /*#__PURE__*/liftStagedMaybe(R.curry);
var curryN = /*#__PURE__*/liftStagedMaybe(R.curryN);
var dec = /*#__PURE__*/liftMaybe(R.dec);
var defaultTo = /*#__PURE__*/liftMaybe(R.defaultTo);
var descend = /*#__PURE__*/liftMaybe(stageLast2Of3Maybe(R.descend));
var difference = /*#__PURE__*/liftMaybe(R.difference);
var differenceWith = /*#__PURE__*/liftMaybe(R.differenceWith);
var dissoc = /*#__PURE__*/liftMaybe(R.dissoc);
var dissocPath = /*#__PURE__*/liftMaybe(R.dissocPath);
var divide = /*#__PURE__*/liftMaybe(R.divide);
var drop = /*#__PURE__*/liftMaybe(R.drop);
var dropLast = /*#__PURE__*/liftMaybe(R.dropLast);
var dropLastWhile = /*#__PURE__*/liftMaybe(R.dropLastWhile);
var dropRepeats = /*#__PURE__*/liftMaybe(R.dropRepeats);
var dropRepeatsWith = /*#__PURE__*/liftMaybe(R.dropRepeatsWith);
var dropWhile = /*#__PURE__*/liftMaybe(R.dropWhile);
var either = /*#__PURE__*/liftStagedMaybe(R.either);
var empty = /*#__PURE__*/liftMaybe(R.empty);
var endsWith = /*#__PURE__*/liftMaybe(R.endsWith);
var eqBy = /*#__PURE__*/liftMaybe(stageLast2Of3Maybe(R.eqBy));
var eqProps = /*#__PURE__*/liftMaybe(stageLast2Of3Maybe(R.eqProps));
var equals = /*#__PURE__*/liftMaybe(R.equals);
var evolve = /*#__PURE__*/liftMaybe(R.evolve);
var filter = /*#__PURE__*/liftMaybe(R.filter);
var find = /*#__PURE__*/liftMaybe(R.find);
var findIndex = /*#__PURE__*/liftMaybe(R.findIndex);
var findLast = /*#__PURE__*/liftMaybe(R.findLast);
var findLastIndex = /*#__PURE__*/liftMaybe(R.findLastIndex);
var flatten = /*#__PURE__*/liftMaybe(R.flatten);
var flip = /*#__PURE__*/liftStagedMaybe(R.flip);
var fromPairs = /*#__PURE__*/liftMaybe(R.fromPairs);
var groupBy = /*#__PURE__*/liftMaybe(R.groupBy);
var groupWith = /*#__PURE__*/liftMaybe(R.groupWith);
var gt = /*#__PURE__*/liftMaybe(R.gt);
var gte = /*#__PURE__*/liftMaybe(R.gte);
var has = /*#__PURE__*/liftMaybe(R.has);
var hasIn = /*#__PURE__*/liftMaybe(R.hasIn);
var head = /*#__PURE__*/liftMaybe(R.head);
var identical = /*#__PURE__*/liftMaybe(R.identical);
var identity = /*#__PURE__*/R.identity; // lifting won't really work
var ifElse = /*#__PURE__*/liftStagedMaybe(R.ifElse);
var inc = /*#__PURE__*/liftMaybe(R.inc);
var indexBy = /*#__PURE__*/liftMaybe(R.indexBy);
var indexOf = /*#__PURE__*/liftMaybe(R.indexOf);
var init = /*#__PURE__*/liftMaybe(R.init);
var innerJoin = /*#__PURE__*/liftMaybe(R.innerJoin);
var insert = /*#__PURE__*/liftMaybe(R.insert);
var insertAll = /*#__PURE__*/liftMaybe(R.insertAll);
var intersection = /*#__PURE__*/liftMaybe(R.intersection);
var intersperse = /*#__PURE__*/liftMaybe(R.intersperse);
var into = /*#__PURE__*/liftMaybe(R.into);
var invert = /*#__PURE__*/liftMaybe(R.invert);
var invertObj = /*#__PURE__*/liftMaybe(R.invertObj);
var invoker = /*#__PURE__*/liftStagedMaybe(R.invoker);
var is = /*#__PURE__*/liftMaybe(stageLast1Of2Maybe(R.is));
var isEmpty = /*#__PURE__*/liftMaybe(R.isEmpty);
var isNil = /*#__PURE__*/liftMaybe(R.isNil);
var join = /*#__PURE__*/liftMaybe(R.join);
var juxt = /*#__PURE__*/liftStagedMaybe(R.juxt);
var keys = /*#__PURE__*/lift1ShallowMaybe(R.keys);
var keysIn = /*#__PURE__*/liftMaybe(R.keysIn);
var last = /*#__PURE__*/liftMaybe(R.last);
var lastIndexOf = /*#__PURE__*/liftMaybe(R.lastIndexOf);
var length = /*#__PURE__*/lift1ShallowMaybe(R.length);
var lt = /*#__PURE__*/liftMaybe(R.lt);
var lte = /*#__PURE__*/liftMaybe(R.lte);
var map = /*#__PURE__*/liftMaybe(R.map);
var mapAccum = /*#__PURE__*/liftMaybe(R.mapAccum);
var mapAccumRight = /*#__PURE__*/liftMaybe(R.mapAccumRight);
var mapObjIndexed = /*#__PURE__*/liftMaybe(R.mapObjIndexed);
var match = /*#__PURE__*/liftMaybe(R.match);
var mathMod = /*#__PURE__*/liftMaybe(R.mathMod);
var max = /*#__PURE__*/liftMaybe(R.max);
var maxBy = /*#__PURE__*/liftMaybe(R.maxBy);
var mean = /*#__PURE__*/liftMaybe(R.mean);
var median = /*#__PURE__*/liftMaybe(R.median);
var memoizeWith = /*#__PURE__*/liftStagedMaybe(R.memoizeWith);
var merge = /*#__PURE__*/liftMaybe(R.merge);
var mergeAll = /*#__PURE__*/liftMaybe(R.mergeAll);
var mergeDeepLeft = /*#__PURE__*/liftMaybe(R.mergeDeepLeft);
var mergeDeepRight = /*#__PURE__*/liftMaybe(R.mergeDeepRight);
var mergeDeepWith = /*#__PURE__*/liftMaybe(R.mergeDeepWith);
var mergeDeepWithKey = /*#__PURE__*/liftMaybe(R.mergeDeepWithKey);
var mergeWith = /*#__PURE__*/liftMaybe(R.mergeWith);
var mergeWithKey = /*#__PURE__*/liftMaybe(R.mergeWithKey);
var min = /*#__PURE__*/liftMaybe(R.min);
var minBy = /*#__PURE__*/liftMaybe(R.minBy);
var modulo = /*#__PURE__*/liftMaybe(R.modulo);
var multiply = /*#__PURE__*/liftMaybe(R.multiply);
var nAry = /*#__PURE__*/liftStagedMaybe(R.nAry);
var negate = /*#__PURE__*/liftMaybe(R.negate);
var none = /*#__PURE__*/liftMaybe(R.none);
var not = /*#__PURE__*/liftMaybe(R.not);
var nth = /*#__PURE__*/liftMaybe(R.nth);
var nthArg = /*#__PURE__*/liftStagedMaybe(R.nthArg);
var o = /*#__PURE__*/liftMaybe(R.o);
var objOf = /*#__PURE__*/liftMaybe(R.objOf);
var of = /*#__PURE__*/liftMaybe(R.of);
var omit = /*#__PURE__*/liftMaybe(R.omit);
var or = /*#__PURE__*/liftMaybe(R.or);
var pair = /*#__PURE__*/liftMaybe(R.pair);
var partial = /*#__PURE__*/liftStagedMaybe(R.partial);
var partialRight = /*#__PURE__*/liftStagedMaybe(R.partialRight);
var partition = /*#__PURE__*/liftMaybe(R.partition);
var path = /*#__PURE__*/liftMaybe(R.path);
var pathEq = /*#__PURE__*/liftMaybe(R.pathEq);
var pathOr = /*#__PURE__*/liftMaybe(R.pathOr);
var pathSatisfies = /*#__PURE__*/liftMaybe(R.pathSatisfies);
var pick = /*#__PURE__*/liftMaybe(R.pick);
var pickAll = /*#__PURE__*/liftMaybe(R.pickAll);
var pickBy = /*#__PURE__*/liftMaybe(R.pickBy);
var pipe = /*#__PURE__*/liftStagedMaybe(R.pipe);
var pluck = /*#__PURE__*/liftMaybe(R.pluck);
var prepend = /*#__PURE__*/liftMaybe(R.prepend);
var product = /*#__PURE__*/liftMaybe(R.product);
var project = /*#__PURE__*/liftMaybe(R.project);
var prop = /*#__PURE__*/liftMaybe(R.prop);
var propEq = /*#__PURE__*/liftMaybe(R.propEq);
var propIs = /*#__PURE__*/liftMaybe(R.propIs);
var propOr = /*#__PURE__*/liftMaybe(R.propOr);
var propSatisfies = /*#__PURE__*/liftMaybe(R.propSatisfies);
var props = /*#__PURE__*/liftMaybe(R.props);
var range = /*#__PURE__*/liftMaybe(R.range);
var reduce = /*#__PURE__*/liftMaybe(R.reduce);
var reduceBy = /*#__PURE__*/liftMaybe(R.reduceBy);
var reduceRight = /*#__PURE__*/liftMaybe(R.reduceRight);
var reduceWhile = /*#__PURE__*/liftMaybe(R.reduceWhile);
var reduced = /*#__PURE__*/liftMaybe(R.reduced);
var reject = /*#__PURE__*/liftMaybe(R.reject);
var remove = /*#__PURE__*/liftMaybe(R.remove);
var repeat = /*#__PURE__*/liftMaybe(R.repeat);
var replace = /*#__PURE__*/liftMaybe(R.replace);
var reverse = /*#__PURE__*/liftMaybe(R.reverse);
var scan = /*#__PURE__*/liftMaybe(R.scan);
var sequence = /*#__PURE__*/liftMaybe(R.sequence);
var slice = /*#__PURE__*/liftMaybe(R.slice);
var sort = /*#__PURE__*/liftMaybe(R.sort);
var sortBy = /*#__PURE__*/liftMaybe(R.sortBy);
var sortWith = /*#__PURE__*/liftMaybe(R.sortWith);
var split = /*#__PURE__*/liftMaybe(R.split);
var splitAt = /*#__PURE__*/liftMaybe(R.splitAt);
var splitEvery = /*#__PURE__*/liftMaybe(R.splitEvery);
var splitWhen = /*#__PURE__*/liftMaybe(R.splitWhen);
var startsWith = /*#__PURE__*/liftMaybe(R.startsWith);
var subtract = /*#__PURE__*/liftMaybe(R.subtract);
var sum = /*#__PURE__*/liftMaybe(R.sum);
var symmetricDifference = /*#__PURE__*/liftMaybe(R.symmetricDifference);
var symmetricDifferenceWith = /*#__PURE__*/liftMaybe(R.symmetricDifferenceWith);
var tail = /*#__PURE__*/liftMaybe(R.tail);
var take = /*#__PURE__*/liftMaybe(R.take);
var takeLast = /*#__PURE__*/liftMaybe(R.takeLast);
var takeLastWhile = /*#__PURE__*/liftMaybe(R.takeLastWhile);
var takeWhile = /*#__PURE__*/liftMaybe(R.takeWhile);
var tap = /*#__PURE__*/liftMaybe(R.tap);
var test = /*#__PURE__*/liftMaybe(R.test);
var times = /*#__PURE__*/liftMaybe(R.times);
var toLower = /*#__PURE__*/liftMaybe(R.toLower);
var toPairs = /*#__PURE__*/liftMaybe(R.toPairs);
var toPairsIn = /*#__PURE__*/liftMaybe(R.toPairsIn);
var toString = /*#__PURE__*/liftMaybe(R.toString);
var toUpper = /*#__PURE__*/liftMaybe(R.toUpper);
var transduce = /*#__PURE__*/liftMaybe(R.transduce);
var transpose = /*#__PURE__*/liftMaybe(R.transpose);
var traverse = /*#__PURE__*/liftMaybe(R.traverse);
var trim = /*#__PURE__*/liftMaybe(R.trim);
var tryCatch = /*#__PURE__*/liftStagedMaybe(R.tryCatch);
var type = /*#__PURE__*/liftMaybe(R.type);
var unapply = /*#__PURE__*/liftStagedMaybe(R.unapply);
var unary = /*#__PURE__*/liftStagedMaybe(R.unary);
var uncurryN = /*#__PURE__*/liftStagedMaybe(R.uncurryN);
var unfold = /*#__PURE__*/liftMaybe(R.unfold);
var union = /*#__PURE__*/liftMaybe(R.union);
var unionWith = /*#__PURE__*/liftMaybe(R.unionWith);
var uniq = /*#__PURE__*/liftMaybe(R.uniq);
var uniqBy = /*#__PURE__*/liftMaybe(R.uniqBy);
var uniqWith = /*#__PURE__*/liftMaybe(R.uniqWith);
var unless = /*#__PURE__*/liftMaybe(R.unless);
var unnest = /*#__PURE__*/liftMaybe(R.unnest);
var until = /*#__PURE__*/liftMaybe(R.until);
var update = /*#__PURE__*/liftMaybe(R.update);
var useWith = /*#__PURE__*/liftStagedMaybe(R.useWith);
var values = /*#__PURE__*/lift1Maybe(R.values);
var valuesIn = /*#__PURE__*/liftMaybe(R.valuesIn);
var when = /*#__PURE__*/liftMaybe(R.when);
var where = /*#__PURE__*/liftStagedMaybe(stageLast1Of2Maybe(R.where));
var whereEq = /*#__PURE__*/liftStagedMaybe(stageLast1Of2Maybe(R.whereEq));
var without = /*#__PURE__*/liftMaybe(R.without);
var xprod = /*#__PURE__*/liftMaybe(R.xprod);
var zip = /*#__PURE__*/liftMaybe(R.zip);
var zipObj = /*#__PURE__*/liftMaybe(R.zipObj);
var zipWith = /*#__PURE__*/liftMaybe(R.zipWith);

// Math

var abs = /*#__PURE__*/lift1ShallowMaybe(Math.abs);
var acos = /*#__PURE__*/lift1ShallowMaybe(Math.acos);
var acosh = /*#__PURE__*/lift1ShallowMaybe(Math.acosh);
var asin = /*#__PURE__*/lift1ShallowMaybe(Math.asin);
var asinh = /*#__PURE__*/lift1ShallowMaybe(Math.asinh);
var atan = /*#__PURE__*/lift1ShallowMaybe(Math.atan);
var atan2 = /*#__PURE__*/liftMaybe(Math.atan2);
var atanh = /*#__PURE__*/lift1ShallowMaybe(Math.atanh);
var cbrt = /*#__PURE__*/lift1ShallowMaybe(Math.cbrt);
var ceil = /*#__PURE__*/lift1ShallowMaybe(Math.ceil);
var clz32 = /*#__PURE__*/lift1ShallowMaybe(Math.clz32);
var cos = /*#__PURE__*/lift1ShallowMaybe(Math.cos);
var cosh = /*#__PURE__*/lift1ShallowMaybe(Math.cosh);
var exp = /*#__PURE__*/lift1ShallowMaybe(Math.exp);
var expm1 = /*#__PURE__*/lift1ShallowMaybe(Math.expm1);
var floor = /*#__PURE__*/lift1ShallowMaybe(Math.floor);
var fround = /*#__PURE__*/lift1ShallowMaybe(Math.fround);
var hypot = /*#__PURE__*/liftMaybe(Math.hypot);
var imul = /*#__PURE__*/liftMaybe(Math.imul);
var log = /*#__PURE__*/lift1ShallowMaybe(Math.log);
var log10 = /*#__PURE__*/lift1ShallowMaybe(Math.log10);
var log1p = /*#__PURE__*/lift1ShallowMaybe(Math.log1p);
var log2 = /*#__PURE__*/lift1ShallowMaybe(Math.log2);
var pow = /*#__PURE__*/liftMaybe(Math.pow);
var round = /*#__PURE__*/lift1ShallowMaybe(Math.round);
var sign = /*#__PURE__*/lift1ShallowMaybe(Math.sign);
var sin = /*#__PURE__*/lift1ShallowMaybe(Math.sin);
var sinh = /*#__PURE__*/lift1ShallowMaybe(Math.sinh);
var sqrt = /*#__PURE__*/lift1ShallowMaybe(Math.sqrt);
var tan = /*#__PURE__*/lift1ShallowMaybe(Math.tan);
var tanh = /*#__PURE__*/lift1ShallowMaybe(Math.tanh);
var trunc = /*#__PURE__*/lift1ShallowMaybe(Math.trunc);

//

var indices = /*#__PURE__*/infestines.pipe2U(length, K.lift1Shallow(R.range(0)));

//

var mapElems = /*#__PURE__*/infestines.curry(function (xi2y, xs) {
  return infestines.seq(xs, foldPast(function (ysIn, xsIn) {
    var xsN = xsIn.length;
    var ysN = ysIn.length;
    if (xsN === ysN) return ysIn;
    var ys = Array(xsN);
    for (var i = 0; i < xsN; ++i) {
      ys[i] = i < ysN ? ysIn[i] : xi2y(view(i, xs), i);
    }return ys;
  }, []), skipDuplicates(infestines.identicalU));
});

//

var mapElemsWithIds = /*#__PURE__*/infestines.curry(function (idL, xi2y, xs) {
  var id2info = {};
  var idOf = L.get(idL);
  var pred = function pred(x, _, info) {
    return idOf(x) === info.id;
  };
  return infestines.seq(xs, foldPast(function (ysIn, xsIn) {
    var n = xsIn.length;
    var ys = ysIn.length === n ? ysIn : Array(n);
    for (var i = 0; i < n; ++i) {
      var _id2 = idOf(xsIn[i]);
      var info = id2info[_id2];
      if (void 0 === info) {
        info = id2info[_id2] = {};
        info.id = _id2;
        info.hint = i;
        info.elem = xi2y(view(L.find(pred, info), xs), _id2);
      }
      if (ys[i] !== info.elem) {
        info.hint = i;
        if (ys === ysIn) ys = ys.slice(0);
        ys[i] = info.elem;
      }
    }
    if (ys !== ysIn) {
      for (var _id3 in id2info) {
        var _info = id2info[_id3];
        if (ys[_info.hint] !== _info.elem) delete id2info[_id3];
      }
    }
    return ys;
  }, []), skipDuplicates(infestines.identicalU));
});

exports.seq = infestines.seq;
exports.seqPartial = infestines.seqPartial;
exports.lift = K.lift;
exports.lift1 = K.lift1;
exports.lift1Shallow = K.lift1Shallow;
exports.fromBacon = React.fromBacon;
exports.default = K__default;
exports.liftStaged = liftStaged;
exports.template = template;
exports.debounce = debounce;
exports.changes = changes;
exports.parallel = parallel;
exports.delay = delay;
exports.endWith = endWith;
exports.mapValue = mapValue;
exports.flatMapParallel = flatMapParallel;
exports.flatMapSerial = flatMapSerial;
exports.flatMapError = flatMapError;
exports.flatMapLatest = flatMapLatest;
exports.foldPast = foldPast;
exports.interval = interval;
exports.later = later;
exports.lazy = lazy;
exports.never = never;
exports.sampledBy = sampledBy;
exports.skipFirst = skipFirst;
exports.skipDuplicates = skipDuplicates;
exports.skipUnless = skipUnless;
exports.skipWhen = skipWhen;
exports.startWith = startWith;
exports.sink = sink;
exports.takeFirst = takeFirst;
exports.lastEvent = lastEvent;
exports.takeUntil = takeUntil;
exports.toProperty = toProperty;
exports.throttle = throttle;
exports.set = set;
exports.Bus = Bus;
exports.bus = bus;
exports.refTo = refTo;
exports.scope = scope;
exports.toPartial = toPartial;
exports.show = show;
exports.staged = staged;
exports.setProps = setProps;
exports.getProps = getProps;
exports.bindProps = bindProps;
exports.bind = bind;
exports.cns = cns;
exports.classes = classes;
exports.mapCached = mapCached;
exports.mapIndexed = mapIndexed;
exports.ifte = ifte;
exports.ift = ift;
exports.iftes = iftes;
exports.view = view;
exports.Context = Context;
exports.withContext = withContext;
exports.WithContext = WithContext;
exports.actions = actions;
exports.string = string;
exports.atom = atom;
exports.variable = variable;
exports.F = F;
exports.T = T;
exports.__ = __;
exports.add = add;
exports.addIndex = addIndex;
exports.adjust = adjust;
exports.all = all;
exports.allPass = allPass;
exports.always = always;
exports.and = and;
exports.any = any;
exports.anyPass = anyPass;
exports.ap = ap;
exports.aperture = aperture;
exports.append = append;
exports.apply = apply;
exports.applySpec = applySpec;
exports.applyTo = applyTo;
exports.ascend = ascend;
exports.assoc = assoc;
exports.assocPath = assocPath;
exports.binary = binary;
exports.both = both;
exports.call = call;
exports.chain = chain;
exports.clamp = clamp;
exports.comparator = comparator;
exports.complement = complement;
exports.compose = compose;
exports.concat = concat;
exports.cond = cond;
exports.construct = construct;
exports.constructN = constructN;
exports.contains = contains;
exports.converge = converge;
exports.countBy = countBy;
exports.curry = curry;
exports.curryN = curryN;
exports.dec = dec;
exports.defaultTo = defaultTo;
exports.descend = descend;
exports.difference = difference;
exports.differenceWith = differenceWith;
exports.dissoc = dissoc;
exports.dissocPath = dissocPath;
exports.divide = divide;
exports.drop = drop;
exports.dropLast = dropLast;
exports.dropLastWhile = dropLastWhile;
exports.dropRepeats = dropRepeats;
exports.dropRepeatsWith = dropRepeatsWith;
exports.dropWhile = dropWhile;
exports.either = either;
exports.empty = empty;
exports.endsWith = endsWith;
exports.eqBy = eqBy;
exports.eqProps = eqProps;
exports.equals = equals;
exports.evolve = evolve;
exports.filter = filter;
exports.find = find;
exports.findIndex = findIndex;
exports.findLast = findLast;
exports.findLastIndex = findLastIndex;
exports.flatten = flatten;
exports.flip = flip;
exports.fromPairs = fromPairs;
exports.groupBy = groupBy;
exports.groupWith = groupWith;
exports.gt = gt;
exports.gte = gte;
exports.has = has;
exports.hasIn = hasIn;
exports.head = head;
exports.identical = identical;
exports.identity = identity;
exports.ifElse = ifElse;
exports.inc = inc;
exports.indexBy = indexBy;
exports.indexOf = indexOf;
exports.init = init;
exports.innerJoin = innerJoin;
exports.insert = insert;
exports.insertAll = insertAll;
exports.intersection = intersection;
exports.intersperse = intersperse;
exports.into = into;
exports.invert = invert;
exports.invertObj = invertObj;
exports.invoker = invoker;
exports.is = is;
exports.isEmpty = isEmpty;
exports.isNil = isNil;
exports.join = join;
exports.juxt = juxt;
exports.keys = keys;
exports.keysIn = keysIn;
exports.last = last;
exports.lastIndexOf = lastIndexOf;
exports.length = length;
exports.lt = lt;
exports.lte = lte;
exports.map = map;
exports.mapAccum = mapAccum;
exports.mapAccumRight = mapAccumRight;
exports.mapObjIndexed = mapObjIndexed;
exports.match = match;
exports.mathMod = mathMod;
exports.max = max;
exports.maxBy = maxBy;
exports.mean = mean;
exports.median = median;
exports.memoizeWith = memoizeWith;
exports.merge = merge;
exports.mergeAll = mergeAll;
exports.mergeDeepLeft = mergeDeepLeft;
exports.mergeDeepRight = mergeDeepRight;
exports.mergeDeepWith = mergeDeepWith;
exports.mergeDeepWithKey = mergeDeepWithKey;
exports.mergeWith = mergeWith;
exports.mergeWithKey = mergeWithKey;
exports.min = min;
exports.minBy = minBy;
exports.modulo = modulo;
exports.multiply = multiply;
exports.nAry = nAry;
exports.negate = negate;
exports.none = none;
exports.not = not;
exports.nth = nth;
exports.nthArg = nthArg;
exports.o = o;
exports.objOf = objOf;
exports.of = of;
exports.omit = omit;
exports.or = or;
exports.pair = pair;
exports.partial = partial;
exports.partialRight = partialRight;
exports.partition = partition;
exports.path = path;
exports.pathEq = pathEq;
exports.pathOr = pathOr;
exports.pathSatisfies = pathSatisfies;
exports.pick = pick;
exports.pickAll = pickAll;
exports.pickBy = pickBy;
exports.pipe = pipe;
exports.pluck = pluck;
exports.prepend = prepend;
exports.product = product;
exports.project = project;
exports.prop = prop;
exports.propEq = propEq;
exports.propIs = propIs;
exports.propOr = propOr;
exports.propSatisfies = propSatisfies;
exports.props = props;
exports.range = range;
exports.reduce = reduce;
exports.reduceBy = reduceBy;
exports.reduceRight = reduceRight;
exports.reduceWhile = reduceWhile;
exports.reduced = reduced;
exports.reject = reject;
exports.remove = remove;
exports.repeat = repeat;
exports.replace = replace;
exports.reverse = reverse;
exports.scan = scan;
exports.sequence = sequence;
exports.slice = slice;
exports.sort = sort;
exports.sortBy = sortBy;
exports.sortWith = sortWith;
exports.split = split;
exports.splitAt = splitAt;
exports.splitEvery = splitEvery;
exports.splitWhen = splitWhen;
exports.startsWith = startsWith;
exports.subtract = subtract;
exports.sum = sum;
exports.symmetricDifference = symmetricDifference;
exports.symmetricDifferenceWith = symmetricDifferenceWith;
exports.tail = tail;
exports.take = take;
exports.takeLast = takeLast;
exports.takeLastWhile = takeLastWhile;
exports.takeWhile = takeWhile;
exports.tap = tap;
exports.test = test;
exports.times = times;
exports.toLower = toLower;
exports.toPairs = toPairs;
exports.toPairsIn = toPairsIn;
exports.toString = toString;
exports.toUpper = toUpper;
exports.transduce = transduce;
exports.transpose = transpose;
exports.traverse = traverse;
exports.trim = trim;
exports.tryCatch = tryCatch;
exports.type = type;
exports.unapply = unapply;
exports.unary = unary;
exports.uncurryN = uncurryN;
exports.unfold = unfold;
exports.union = union;
exports.unionWith = unionWith;
exports.uniq = uniq;
exports.uniqBy = uniqBy;
exports.uniqWith = uniqWith;
exports.unless = unless;
exports.unnest = unnest;
exports.until = until;
exports.update = update;
exports.useWith = useWith;
exports.values = values;
exports.valuesIn = valuesIn;
exports.when = when;
exports.where = where;
exports.whereEq = whereEq;
exports.without = without;
exports.xprod = xprod;
exports.zip = zip;
exports.zipObj = zipObj;
exports.zipWith = zipWith;
exports.abs = abs;
exports.acos = acos;
exports.acosh = acosh;
exports.asin = asin;
exports.asinh = asinh;
exports.atan = atan;
exports.atan2 = atan2;
exports.atanh = atanh;
exports.cbrt = cbrt;
exports.ceil = ceil;
exports.clz32 = clz32;
exports.cos = cos;
exports.cosh = cosh;
exports.exp = exp;
exports.expm1 = expm1;
exports.floor = floor;
exports.fround = fround;
exports.hypot = hypot;
exports.imul = imul;
exports.log = log;
exports.log10 = log10;
exports.log1p = log1p;
exports.log2 = log2;
exports.pow = pow;
exports.round = round;
exports.sign = sign;
exports.sin = sin;
exports.sinh = sinh;
exports.sqrt = sqrt;
exports.tan = tan;
exports.tanh = tanh;
exports.trunc = trunc;
exports.indices = indices;
exports.mapElems = mapElems;
exports.mapElemsWithIds = mapElemsWithIds;
