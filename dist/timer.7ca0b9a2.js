// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"utils/timer.js":[function(require,module,exports) {
var FULL_DASH_ARRAY = 283;
var WARNING_THRESHOLD = 10;
var ALERT_THRESHOLD = 5;
var COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};
var TIME_LIMIT = 20;
var timePassed = 0;
var timeLeft = TIME_LIMIT;
var timerInterval = null;
var remainingPathColor = COLOR_CODES.info.color;
document.getElementById("app").innerHTML = "\n<div class=\"base-timer\">\n  <svg class=\"base-timer__svg\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">\n    <g class=\"base-timer__circle\">\n      <circle class=\"base-timer__path-elapsed\" cx=\"50\" cy=\"50\" r=\"45\"></circle>\n      <path\n        id=\"base-timer-path-remaining\"\n        stroke-dasharray=\"283\"\n        class=\"base-timer__path-remaining ".concat(remainingPathColor, "\"\n        d=\"\n          M 50, 50\n          m -45, 0\n          a 45,45 0 1,0 90,0\n          a 45,45 0 1,0 -90,0\n        \"\n      ></path>\n    </g>\n  </svg>\n  <span id=\"base-timer-label\" class=\"base-timer__label\">").concat(formatTime(timeLeft), "</span>\n  <img id=\"guess_image\" src=\"/resources/images/cat.png\" class=\"img-fluid\">\n\n</div>\n");
startTimer();

function onTimesUp() {
  clearInterval(timerInterval);
}

function startTimer() {
  timerInterval = setInterval(function () {
    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;
    document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft);
    setCircleDasharray();
    setRemainingPathColor(timeLeft);

    if (timeLeft === 0) {
      onTimesUp();
    }
  }, 1000);
}

function formatTime(time) {
  var minutes = Math.floor(time / 60);
  var seconds = time % 60;

  if (seconds < 10) {
    seconds = "0".concat(seconds);
  }

  return "".concat(minutes, ":").concat(seconds);
}

function setRemainingPathColor(timeLeft) {
  var alert = COLOR_CODES.alert,
      warning = COLOR_CODES.warning,
      info = COLOR_CODES.info;

  if (timeLeft <= alert.threshold) {
    document.getElementById("base-timer-path-remaining").classList.remove(warning.color);
    document.getElementById("base-timer-path-remaining").classList.add(alert.color);
  } else if (timeLeft <= warning.threshold) {
    document.getElementById("base-timer-path-remaining").classList.remove(info.color);
    document.getElementById("base-timer-path-remaining").classList.add(warning.color);
  }
}

function calculateTimeFraction() {
  var rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - 1 / TIME_LIMIT * (1 - rawTimeFraction);
}

function setCircleDasharray() {
  var circleDasharray = "".concat((calculateTimeFraction() * FULL_DASH_ARRAY).toFixed(0), " 283");
  document.getElementById("base-timer-path-remaining").setAttribute("stroke-dasharray", circleDasharray);
}
},{}]},{},["utils/timer.js"], null)