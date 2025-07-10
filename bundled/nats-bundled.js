/* Bundled NATS.js client with Node.js TCP transport for n8n-nodes-synadia */
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/encoders.js
var require_encoders = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/encoders.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TD = exports2.TE = exports2.Empty = void 0;
    exports2.encode = encode;
    exports2.decode = decode;
    exports2.Empty = new Uint8Array(0);
    exports2.TE = new TextEncoder();
    exports2.TD = new TextDecoder();
    function concat(...bufs) {
      let max = 0;
      for (let i = 0; i < bufs.length; i++) {
        max += bufs[i].length;
      }
      const out = new Uint8Array(max);
      let index = 0;
      for (let i = 0; i < bufs.length; i++) {
        out.set(bufs[i], index);
        index += bufs[i].length;
      }
      return out;
    }
    __name(concat, "concat");
    function encode(...a) {
      const bufs = [];
      for (let i = 0; i < a.length; i++) {
        bufs.push(exports2.TE.encode(a[i]));
      }
      if (bufs.length === 0) {
        return exports2.Empty;
      }
      if (bufs.length === 1) {
        return bufs[0];
      }
      return concat(...bufs);
    }
    __name(encode, "encode");
    function decode(a) {
      if (!a || a.length === 0) {
        return "";
      }
      return exports2.TD.decode(a);
    }
    __name(decode, "decode");
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/errors.js
var require_errors = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/errors.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.errors = exports2.PermissionViolationError = exports2.NoRespondersError = exports2.TimeoutError = exports2.RequestError = exports2.ProtocolError = exports2.ConnectionError = exports2.DrainingConnectionError = exports2.ClosedConnectionError = exports2.AuthorizationError = exports2.UserAuthenticationExpiredError = exports2.InvalidOperationError = exports2.InvalidArgumentError = exports2.InvalidSubjectError = void 0;
    var _InvalidSubjectError = class _InvalidSubjectError extends Error {
      constructor(subject, options) {
        super(`illegal subject: '${subject}'`, options);
        this.name = "InvalidSubjectError";
      }
    };
    __name(_InvalidSubjectError, "InvalidSubjectError");
    var InvalidSubjectError = _InvalidSubjectError;
    exports2.InvalidSubjectError = InvalidSubjectError;
    var _InvalidArgumentError = class _InvalidArgumentError extends Error {
      constructor(message, options) {
        super(message, options);
        this.name = "InvalidArgumentError";
      }
      static format(property, message, options) {
        if (Array.isArray(message) && message.length > 1) {
          message = message[0];
        }
        if (Array.isArray(property)) {
          property = property.map((n) => `'${n}'`);
          property = property.join(",");
        } else {
          property = `'${property}'`;
        }
        return new _InvalidArgumentError(`${property} ${message}`, options);
      }
    };
    __name(_InvalidArgumentError, "InvalidArgumentError");
    var InvalidArgumentError = _InvalidArgumentError;
    exports2.InvalidArgumentError = InvalidArgumentError;
    var _InvalidOperationError = class _InvalidOperationError extends Error {
      constructor(message, options) {
        super(message, options);
        this.name = "InvalidOperationError";
      }
    };
    __name(_InvalidOperationError, "InvalidOperationError");
    var InvalidOperationError = _InvalidOperationError;
    exports2.InvalidOperationError = InvalidOperationError;
    var _UserAuthenticationExpiredError = class _UserAuthenticationExpiredError extends Error {
      constructor(message, options) {
        super(message, options);
        this.name = "UserAuthenticationExpiredError";
      }
      static parse(s) {
        const ss = s.toLowerCase();
        if (ss.indexOf("user authentication expired") !== -1) {
          return new _UserAuthenticationExpiredError(s);
        }
        return null;
      }
    };
    __name(_UserAuthenticationExpiredError, "UserAuthenticationExpiredError");
    var UserAuthenticationExpiredError = _UserAuthenticationExpiredError;
    exports2.UserAuthenticationExpiredError = UserAuthenticationExpiredError;
    var _AuthorizationError = class _AuthorizationError extends Error {
      constructor(message, options) {
        super(message, options);
        this.name = "AuthorizationError";
      }
      static parse(s) {
        const messages = [
          "authorization violation",
          "account authentication expired",
          "authentication timeout"
        ];
        const ss = s.toLowerCase();
        for (let i = 0; i < messages.length; i++) {
          if (ss.indexOf(messages[i]) !== -1) {
            return new _AuthorizationError(s);
          }
        }
        return null;
      }
    };
    __name(_AuthorizationError, "AuthorizationError");
    var AuthorizationError = _AuthorizationError;
    exports2.AuthorizationError = AuthorizationError;
    var _ClosedConnectionError = class _ClosedConnectionError extends Error {
      constructor() {
        super("closed connection");
        this.name = "ClosedConnectionError";
      }
    };
    __name(_ClosedConnectionError, "ClosedConnectionError");
    var ClosedConnectionError = _ClosedConnectionError;
    exports2.ClosedConnectionError = ClosedConnectionError;
    var _DrainingConnectionError = class _DrainingConnectionError extends Error {
      constructor() {
        super("connection draining");
        this.name = "DrainingConnectionError";
      }
    };
    __name(_DrainingConnectionError, "DrainingConnectionError");
    var DrainingConnectionError = _DrainingConnectionError;
    exports2.DrainingConnectionError = DrainingConnectionError;
    var _ConnectionError = class _ConnectionError extends Error {
      constructor(message, options) {
        super(message, options);
        this.name = "ConnectionError";
      }
    };
    __name(_ConnectionError, "ConnectionError");
    var ConnectionError = _ConnectionError;
    exports2.ConnectionError = ConnectionError;
    var _ProtocolError = class _ProtocolError extends Error {
      constructor(message, options) {
        super(message, options);
        this.name = "ProtocolError";
      }
    };
    __name(_ProtocolError, "ProtocolError");
    var ProtocolError = _ProtocolError;
    exports2.ProtocolError = ProtocolError;
    var _RequestError = class _RequestError extends Error {
      constructor(message = "", options) {
        super(message, options);
        this.name = "RequestError";
      }
      isNoResponders() {
        return this.cause instanceof NoRespondersError;
      }
    };
    __name(_RequestError, "RequestError");
    var RequestError = _RequestError;
    exports2.RequestError = RequestError;
    var _TimeoutError = class _TimeoutError extends Error {
      constructor(options) {
        super("timeout", options);
        this.name = "TimeoutError";
      }
    };
    __name(_TimeoutError, "TimeoutError");
    var TimeoutError = _TimeoutError;
    exports2.TimeoutError = TimeoutError;
    var _NoRespondersError = class _NoRespondersError extends Error {
      subject;
      constructor(subject, options) {
        super(`no responders: '${subject}'`, options);
        this.subject = subject;
        this.name = "NoResponders";
      }
    };
    __name(_NoRespondersError, "NoRespondersError");
    var NoRespondersError = _NoRespondersError;
    exports2.NoRespondersError = NoRespondersError;
    var _PermissionViolationError = class _PermissionViolationError extends Error {
      operation;
      subject;
      queue;
      constructor(message, operation, subject, queue, options) {
        super(message, options);
        this.name = "PermissionViolationError";
        this.operation = operation;
        this.subject = subject;
        this.queue = queue;
      }
      static parse(s) {
        const t = s ? s.toLowerCase() : "";
        if (t.indexOf("permissions violation") === -1) {
          return null;
        }
        let operation = "publish";
        let subject = "";
        let queue = void 0;
        const m = s.match(/(Publish|Subscription) to "(\S+)"/);
        if (m) {
          operation = m[1].toLowerCase();
          subject = m[2];
          if (operation === "subscription") {
            const qm = s.match(/using queue "(\S+)"/);
            if (qm) {
              queue = qm[1];
            }
          }
        }
        return new _PermissionViolationError(s, operation, subject, queue);
      }
    };
    __name(_PermissionViolationError, "PermissionViolationError");
    var PermissionViolationError = _PermissionViolationError;
    exports2.PermissionViolationError = PermissionViolationError;
    exports2.errors = {
      AuthorizationError,
      ClosedConnectionError,
      ConnectionError,
      DrainingConnectionError,
      InvalidArgumentError,
      InvalidOperationError,
      InvalidSubjectError,
      NoRespondersError,
      PermissionViolationError,
      ProtocolError,
      RequestError,
      TimeoutError,
      UserAuthenticationExpiredError
    };
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/util.js
var require_util = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/util.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SimpleMutex = exports2.Perf = void 0;
    exports2.extend = extend;
    exports2.render = render;
    exports2.timeout = timeout;
    exports2.delay = delay;
    exports2.deadline = deadline;
    exports2.deferred = deferred;
    exports2.debugDeferred = debugDeferred;
    exports2.shuffle = shuffle;
    exports2.collect = collect;
    exports2.jitter = jitter;
    exports2.backoff = backoff;
    exports2.nanos = nanos;
    exports2.millis = millis;
    var encoders_1 = require_encoders();
    var errors_1 = require_errors();
    function extend(a, ...b) {
      for (let i = 0; i < b.length; i++) {
        const o = b[i];
        Object.keys(o).forEach(function(k) {
          a[k] = o[k];
        });
      }
      return a;
    }
    __name(extend, "extend");
    function render(frame) {
      const cr = "\u240D";
      const lf = "\u240A";
      return encoders_1.TD.decode(frame).replace(/\n/g, lf).replace(/\r/g, cr);
    }
    __name(render, "render");
    function timeout(ms, asyncTraces = true) {
      const err = asyncTraces ? new errors_1.TimeoutError() : null;
      let methods;
      let timer;
      const p = new Promise((_resolve, reject) => {
        const cancel = /* @__PURE__ */ __name(() => {
          if (timer) {
            clearTimeout(timer);
          }
        }, "cancel");
        methods = { cancel };
        timer = setTimeout(() => {
          if (err === null) {
            reject(new errors_1.TimeoutError());
          } else {
            reject(err);
          }
        }, ms);
      });
      return Object.assign(p, methods);
    }
    __name(timeout, "timeout");
    function delay(ms = 0) {
      let methods;
      const p = new Promise((resolve) => {
        const timer = setTimeout(() => {
          resolve();
        }, ms);
        const cancel = /* @__PURE__ */ __name(() => {
          if (timer) {
            clearTimeout(timer);
            resolve();
          }
        }, "cancel");
        methods = { cancel };
      });
      return Object.assign(p, methods);
    }
    __name(delay, "delay");
    async function deadline(p, millis2 = 1e3) {
      const d = deferred();
      const timer = setTimeout(() => {
        d.reject(new errors_1.TimeoutError());
      }, millis2);
      try {
        return await Promise.race([p, d]);
      } finally {
        clearTimeout(timer);
      }
    }
    __name(deadline, "deadline");
    function deferred() {
      let methods = {};
      const p = new Promise((resolve, reject) => {
        methods = { resolve, reject };
      });
      return Object.assign(p, methods);
    }
    __name(deferred, "deferred");
    function debugDeferred() {
      let methods = {};
      const p = new Promise((resolve, reject) => {
        methods = {
          resolve: /* @__PURE__ */ __name((v) => {
            console.trace("resolve", v);
            resolve(v);
          }, "resolve"),
          reject: /* @__PURE__ */ __name((err) => {
            console.trace("reject");
            reject(err);
          }, "reject")
        };
      });
      return Object.assign(p, methods);
    }
    __name(debugDeferred, "debugDeferred");
    function shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    __name(shuffle, "shuffle");
    async function collect(iter) {
      const buf = [];
      for await (const v of iter) {
        buf.push(v);
      }
      return buf;
    }
    __name(collect, "collect");
    var _Perf = class _Perf {
      timers;
      measures;
      constructor() {
        this.timers = /* @__PURE__ */ new Map();
        this.measures = /* @__PURE__ */ new Map();
      }
      mark(key) {
        this.timers.set(key, performance.now());
      }
      measure(key, startKey, endKey) {
        const s = this.timers.get(startKey);
        if (s === void 0) {
          throw new Error(`${startKey} is not defined`);
        }
        const e = this.timers.get(endKey);
        if (e === void 0) {
          throw new Error(`${endKey} is not defined`);
        }
        this.measures.set(key, e - s);
      }
      getEntries() {
        const values = [];
        this.measures.forEach((v, k) => {
          values.push({ name: k, duration: v });
        });
        return values;
      }
    };
    __name(_Perf, "Perf");
    var Perf = _Perf;
    exports2.Perf = Perf;
    var _SimpleMutex = class _SimpleMutex {
      max;
      current;
      waiting;
      /**
       * @param max number of concurrent operations
       */
      constructor(max = 1) {
        this.max = max;
        this.current = 0;
        this.waiting = [];
      }
      /**
       * Returns a promise that resolves when the mutex is acquired
       */
      lock() {
        this.current++;
        if (this.current <= this.max) {
          return Promise.resolve();
        }
        const d = deferred();
        this.waiting.push(d);
        return d;
      }
      /**
       * Release an acquired mutex - must be called
       */
      unlock() {
        this.current--;
        const d = this.waiting.pop();
        d == null ? void 0 : d.resolve();
      }
    };
    __name(_SimpleMutex, "SimpleMutex");
    var SimpleMutex = _SimpleMutex;
    exports2.SimpleMutex = SimpleMutex;
    function jitter(n) {
      if (n === 0) {
        return 0;
      }
      return Math.floor(n / 2 + Math.random() * n);
    }
    __name(jitter, "jitter");
    function backoff(policy = [0, 250, 250, 500, 500, 3e3, 5e3]) {
      if (!Array.isArray(policy)) {
        policy = [0, 250, 250, 500, 500, 3e3, 5e3];
      }
      const max = policy.length - 1;
      return {
        backoff(attempt) {
          return jitter(attempt > max ? policy[max] : policy[attempt]);
        }
      };
    }
    __name(backoff, "backoff");
    function nanos(millis2) {
      return millis2 * 1e6;
    }
    __name(nanos, "nanos");
    function millis(ns) {
      return Math.floor(ns / 1e6);
    }
    __name(millis, "millis");
  }
});

// node_modules/@nats-io/nuid/lib/nuid.js
var require_nuid = __commonJS({
  "node_modules/@nats-io/nuid/lib/nuid.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.nuid = exports2.Nuid = void 0;
    var digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var base = 36;
    var preLen = 12;
    var seqLen = 10;
    var maxSeq = 3656158440062976;
    var minInc = 33;
    var maxInc = 333;
    var totalLen = preLen + seqLen;
    function _getRandomValues(a) {
      for (let i = 0; i < a.length; i++) {
        a[i] = Math.floor(Math.random() * 255);
      }
    }
    __name(_getRandomValues, "_getRandomValues");
    function fillRandom(a) {
      var _a;
      if ((_a = globalThis == null ? void 0 : globalThis.crypto) == null ? void 0 : _a.getRandomValues) {
        globalThis.crypto.getRandomValues(a);
      } else {
        _getRandomValues(a);
      }
    }
    __name(fillRandom, "fillRandom");
    var _Nuid = class _Nuid {
      /**
       *   @hidden
       */
      buf;
      /**
       *   @hidden
       */
      seq;
      /**
       * @hidden
       */
      inc;
      /**
       * @hidden
       */
      inited;
      constructor() {
        this.buf = new Uint8Array(totalLen);
        this.inited = false;
      }
      /**
       * Initializes a nuid with a crypto random prefix,
       * and pseudo-random sequence and increment. This function
       * is only called if any api on a nuid is called.
       *
       * @ignore
       */
      init() {
        this.inited = true;
        this.setPre();
        this.initSeqAndInc();
        this.fillSeq();
      }
      /**
       * Initializes the pseudo random sequence number and the increment range.
       * @ignore
       */
      initSeqAndInc() {
        this.seq = Math.floor(Math.random() * maxSeq);
        this.inc = Math.floor(Math.random() * (maxInc - minInc) + minInc);
      }
      /**
       * Sets the prefix from crypto random bytes. Converts them to base36.
       *
       * @ignore
       */
      setPre() {
        const cbuf = new Uint8Array(preLen);
        fillRandom(cbuf);
        for (let i = 0; i < preLen; i++) {
          const di = cbuf[i] % base;
          this.buf[i] = digits.charCodeAt(di);
        }
      }
      /**
       * Fills the sequence part of the nuid as base36 from this.seq.
       * @ignore
       */
      fillSeq() {
        let n = this.seq;
        for (let i = totalLen - 1; i >= preLen; i--) {
          this.buf[i] = digits.charCodeAt(n % base);
          n = Math.floor(n / base);
        }
      }
      /**
       * Returns the next nuid.
       */
      next() {
        if (!this.inited) {
          this.init();
        }
        this.seq += this.inc;
        if (this.seq > maxSeq) {
          this.setPre();
          this.initSeqAndInc();
        }
        this.fillSeq();
        return String.fromCharCode.apply(String, this.buf);
      }
      /**
       * Resets the prefix and counter for the nuid. This is typically
       * called automatically from within next() if the current sequence
       * exceeds the resolution of the nuid.
       */
      reset() {
        this.init();
      }
    };
    __name(_Nuid, "Nuid");
    var Nuid = _Nuid;
    exports2.Nuid = Nuid;
    exports2.nuid = new Nuid();
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/nuid.js
var require_nuid2 = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/nuid.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.nuid = exports2.Nuid = void 0;
    var nuid_1 = require_nuid();
    Object.defineProperty(exports2, "Nuid", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nuid_1.Nuid;
    }, "get") });
    Object.defineProperty(exports2, "nuid", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nuid_1.nuid;
    }, "get") });
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/core.js
var require_core = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/core.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_HOST = exports2.DEFAULT_PORT = exports2.Match = void 0;
    exports2.syncIterator = syncIterator;
    exports2.createInbox = createInbox2;
    var nuid_1 = require_nuid2();
    var errors_1 = require_errors();
    exports2.Match = {
      // Exact option is case-sensitive
      Exact: "exact",
      // Case-sensitive, but key is transformed to Canonical MIME representation
      CanonicalMIME: "canonical",
      // Case-insensitive matches
      IgnoreCase: "insensitive"
    };
    function syncIterator(src) {
      const iter = src[Symbol.asyncIterator]();
      return {
        async next() {
          const m = await iter.next();
          if (m.done) {
            return Promise.resolve(null);
          }
          return Promise.resolve(m.value);
        }
      };
    }
    __name(syncIterator, "syncIterator");
    function createInbox2(prefix = "") {
      prefix = prefix || "_INBOX";
      if (typeof prefix !== "string") {
        throw new TypeError("prefix must be a string");
      }
      prefix.split(".").forEach((v) => {
        if (v === "*" || v === ">") {
          throw errors_1.InvalidArgumentError.format("prefix", `cannot have wildcards ('${prefix}')`);
        }
      });
      return `${prefix}.${nuid_1.nuid.next()}`;
    }
    __name(createInbox2, "createInbox");
    exports2.DEFAULT_PORT = 4222;
    exports2.DEFAULT_HOST = "127.0.0.1";
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/databuffer.js
var require_databuffer = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/databuffer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DataBuffer = void 0;
    var encoders_1 = require_encoders();
    var _DataBuffer = class _DataBuffer {
      buffers;
      byteLength;
      constructor() {
        this.buffers = [];
        this.byteLength = 0;
      }
      static concat(...bufs) {
        let max = 0;
        for (let i = 0; i < bufs.length; i++) {
          max += bufs[i].length;
        }
        const out = new Uint8Array(max);
        let index = 0;
        for (let i = 0; i < bufs.length; i++) {
          out.set(bufs[i], index);
          index += bufs[i].length;
        }
        return out;
      }
      static fromAscii(m) {
        if (!m) {
          m = "";
        }
        return encoders_1.TE.encode(m);
      }
      static toAscii(a) {
        return encoders_1.TD.decode(a);
      }
      reset() {
        this.buffers.length = 0;
        this.byteLength = 0;
      }
      pack() {
        if (this.buffers.length > 1) {
          const v = new Uint8Array(this.byteLength);
          let index = 0;
          for (let i = 0; i < this.buffers.length; i++) {
            v.set(this.buffers[i], index);
            index += this.buffers[i].length;
          }
          this.buffers.length = 0;
          this.buffers.push(v);
        }
      }
      shift() {
        if (this.buffers.length) {
          const a = this.buffers.shift();
          if (a) {
            this.byteLength -= a.length;
            return a;
          }
        }
        return new Uint8Array(0);
      }
      drain(n) {
        if (this.buffers.length) {
          this.pack();
          const v = this.buffers.pop();
          if (v) {
            const max = this.byteLength;
            if (n === void 0 || n > max) {
              n = max;
            }
            const d = v.subarray(0, n);
            if (max > n) {
              this.buffers.push(v.subarray(n));
            }
            this.byteLength = max - n;
            return d;
          }
        }
        return new Uint8Array(0);
      }
      fill(a, ...bufs) {
        if (a) {
          this.buffers.push(a);
          this.byteLength += a.length;
        }
        for (let i = 0; i < bufs.length; i++) {
          if (bufs[i] && bufs[i].length) {
            this.buffers.push(bufs[i]);
            this.byteLength += bufs[i].length;
          }
        }
      }
      peek() {
        if (this.buffers.length) {
          this.pack();
          return this.buffers[0];
        }
        return new Uint8Array(0);
      }
      size() {
        return this.byteLength;
      }
      length() {
        return this.buffers.length;
      }
    };
    __name(_DataBuffer, "DataBuffer");
    var DataBuffer = _DataBuffer;
    exports2.DataBuffer = DataBuffer;
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/transport.js
var require_transport = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/transport.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LF = exports2.CR = exports2.CRLF = exports2.CR_LF_LEN = exports2.CR_LF = void 0;
    exports2.setTransportFactory = setTransportFactory;
    exports2.defaultPort = defaultPort;
    exports2.getUrlParseFn = getUrlParseFn;
    exports2.newTransport = newTransport;
    exports2.getResolveFn = getResolveFn;
    exports2.protoLen = protoLen;
    exports2.extractProtocolMessage = extractProtocolMessage;
    var encoders_1 = require_encoders();
    var core_1 = require_core();
    var databuffer_1 = require_databuffer();
    var transportConfig;
    function setTransportFactory(config) {
      transportConfig = config;
    }
    __name(setTransportFactory, "setTransportFactory");
    function defaultPort() {
      return transportConfig !== void 0 && transportConfig.defaultPort !== void 0 ? transportConfig.defaultPort : core_1.DEFAULT_PORT;
    }
    __name(defaultPort, "defaultPort");
    function getUrlParseFn() {
      return transportConfig !== void 0 && transportConfig.urlParseFn ? transportConfig.urlParseFn : void 0;
    }
    __name(getUrlParseFn, "getUrlParseFn");
    function newTransport() {
      if (!transportConfig || typeof transportConfig.factory !== "function") {
        throw new Error("transport fn is not set");
      }
      return transportConfig.factory();
    }
    __name(newTransport, "newTransport");
    function getResolveFn() {
      return transportConfig !== void 0 && transportConfig.dnsResolveFn ? transportConfig.dnsResolveFn : void 0;
    }
    __name(getResolveFn, "getResolveFn");
    exports2.CR_LF = "\r\n";
    exports2.CR_LF_LEN = exports2.CR_LF.length;
    exports2.CRLF = databuffer_1.DataBuffer.fromAscii(exports2.CR_LF);
    exports2.CR = new Uint8Array(exports2.CRLF)[0];
    exports2.LF = new Uint8Array(exports2.CRLF)[1];
    function protoLen(ba) {
      for (let i = 0; i < ba.length; i++) {
        const n = i + 1;
        if (ba.byteLength > n && ba[i] === exports2.CR && ba[n] === exports2.LF) {
          return n + 1;
        }
      }
      return 0;
    }
    __name(protoLen, "protoLen");
    function extractProtocolMessage(a) {
      const len = protoLen(a);
      if (len > 0) {
        const ba = new Uint8Array(a);
        const out = ba.slice(0, len);
        return encoders_1.TD.decode(out);
      }
      return "";
    }
    __name(extractProtocolMessage, "extractProtocolMessage");
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/ipparser.js
var require_ipparser = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/ipparser.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ipV4 = ipV4;
    exports2.isIP = isIP;
    exports2.parseIP = parseIP;
    var IPv4LEN = 4;
    var IPv6LEN = 16;
    var ASCII0 = 48;
    var ASCII9 = 57;
    var ASCIIA = 65;
    var ASCIIF = 70;
    var ASCIIa = 97;
    var ASCIIf = 102;
    var big = 16777215;
    function ipV4(a, b, c, d) {
      const ip = new Uint8Array(IPv6LEN);
      const prefix = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255];
      prefix.forEach((v, idx) => {
        ip[idx] = v;
      });
      ip[12] = a;
      ip[13] = b;
      ip[14] = c;
      ip[15] = d;
      return ip;
    }
    __name(ipV4, "ipV4");
    function isIP(h) {
      return parseIP(h) !== void 0;
    }
    __name(isIP, "isIP");
    function parseIP(h) {
      for (let i = 0; i < h.length; i++) {
        switch (h[i]) {
          case ".":
            return parseIPv4(h);
          case ":":
            return parseIPv6(h);
        }
      }
      return;
    }
    __name(parseIP, "parseIP");
    function parseIPv4(s) {
      const ip = new Uint8Array(IPv4LEN);
      for (let i = 0; i < IPv4LEN; i++) {
        if (s.length === 0) {
          return void 0;
        }
        if (i > 0) {
          if (s[0] !== ".") {
            return void 0;
          }
          s = s.substring(1);
        }
        const { n, c, ok } = dtoi(s);
        if (!ok || n > 255) {
          return void 0;
        }
        s = s.substring(c);
        ip[i] = n;
      }
      return ipV4(ip[0], ip[1], ip[2], ip[3]);
    }
    __name(parseIPv4, "parseIPv4");
    function parseIPv6(s) {
      const ip = new Uint8Array(IPv6LEN);
      let ellipsis = -1;
      if (s.length >= 2 && s[0] === ":" && s[1] === ":") {
        ellipsis = 0;
        s = s.substring(2);
        if (s.length === 0) {
          return ip;
        }
      }
      let i = 0;
      while (i < IPv6LEN) {
        const { n, c, ok } = xtoi(s);
        if (!ok || n > 65535) {
          return void 0;
        }
        if (c < s.length && s[c] === ".") {
          if (ellipsis < 0 && i != IPv6LEN - IPv4LEN) {
            return void 0;
          }
          if (i + IPv4LEN > IPv6LEN) {
            return void 0;
          }
          const ip4 = parseIPv4(s);
          if (ip4 === void 0) {
            return void 0;
          }
          ip[i] = ip4[12];
          ip[i + 1] = ip4[13];
          ip[i + 2] = ip4[14];
          ip[i + 3] = ip4[15];
          s = "";
          i += IPv4LEN;
          break;
        }
        ip[i] = n >> 8;
        ip[i + 1] = n;
        i += 2;
        s = s.substring(c);
        if (s.length === 0) {
          break;
        }
        if (s[0] !== ":" || s.length == 1) {
          return void 0;
        }
        s = s.substring(1);
        if (s[0] === ":") {
          if (ellipsis >= 0) {
            return void 0;
          }
          ellipsis = i;
          s = s.substring(1);
          if (s.length === 0) {
            break;
          }
        }
      }
      if (s.length !== 0) {
        return void 0;
      }
      if (i < IPv6LEN) {
        if (ellipsis < 0) {
          return void 0;
        }
        const n = IPv6LEN - i;
        for (let j = i - 1; j >= ellipsis; j--) {
          ip[j + n] = ip[j];
        }
        for (let j = ellipsis + n - 1; j >= ellipsis; j--) {
          ip[j] = 0;
        }
      } else if (ellipsis >= 0) {
        return void 0;
      }
      return ip;
    }
    __name(parseIPv6, "parseIPv6");
    function dtoi(s) {
      let i = 0;
      let n = 0;
      for (i = 0; i < s.length && ASCII0 <= s.charCodeAt(i) && s.charCodeAt(i) <= ASCII9; i++) {
        n = n * 10 + (s.charCodeAt(i) - ASCII0);
        if (n >= big) {
          return { n: big, c: i, ok: false };
        }
      }
      if (i === 0) {
        return { n: 0, c: 0, ok: false };
      }
      return { n, c: i, ok: true };
    }
    __name(dtoi, "dtoi");
    function xtoi(s) {
      let n = 0;
      let i = 0;
      for (i = 0; i < s.length; i++) {
        if (ASCII0 <= s.charCodeAt(i) && s.charCodeAt(i) <= ASCII9) {
          n *= 16;
          n += s.charCodeAt(i) - ASCII0;
        } else if (ASCIIa <= s.charCodeAt(i) && s.charCodeAt(i) <= ASCIIf) {
          n *= 16;
          n += s.charCodeAt(i) - ASCIIa + 10;
        } else if (ASCIIA <= s.charCodeAt(i) && s.charCodeAt(i) <= ASCIIF) {
          n *= 16;
          n += s.charCodeAt(i) - ASCIIA + 10;
        } else {
          break;
        }
        if (n >= big) {
          return { n: 0, c: i, ok: false };
        }
      }
      if (i === 0) {
        return { n: 0, c: i, ok: false };
      }
      return { n, c: i, ok: true };
    }
    __name(xtoi, "xtoi");
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/servers.js
var require_servers = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/servers.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Servers = exports2.ServerImpl = void 0;
    exports2.isIPV4OrHostname = isIPV4OrHostname;
    exports2.hostPort = hostPort;
    var transport_1 = require_transport();
    var util_1 = require_util();
    var ipparser_1 = require_ipparser();
    var core_1 = require_core();
    function isIPV4OrHostname(hp) {
      if (hp.indexOf("[") !== -1 || hp.indexOf("::") !== -1) {
        return false;
      }
      if (hp.indexOf(".") !== -1) {
        return true;
      }
      if (hp.split(":").length <= 2) {
        return true;
      }
      return false;
    }
    __name(isIPV4OrHostname, "isIPV4OrHostname");
    function isIPV6(hp) {
      return !isIPV4OrHostname(hp);
    }
    __name(isIPV6, "isIPV6");
    function filterIpv6MappedToIpv4(hp) {
      const prefix = "::FFFF:";
      const idx = hp.toUpperCase().indexOf(prefix);
      if (idx !== -1 && hp.indexOf(".") !== -1) {
        let ip = hp.substring(idx + prefix.length);
        ip = ip.replace("[", "");
        return ip.replace("]", "");
      }
      return hp;
    }
    __name(filterIpv6MappedToIpv4, "filterIpv6MappedToIpv4");
    function hostPort(u) {
      u = u.trim();
      if (u.match(/^(.*:\/\/)(.*)/m)) {
        u = u.replace(/^(.*:\/\/)(.*)/gm, "$2");
      }
      u = filterIpv6MappedToIpv4(u);
      if (isIPV6(u) && u.indexOf("[") === -1) {
        u = `[${u}]`;
      }
      const op = isIPV6(u) ? u.match(/(]:)(\d+)/) : u.match(/(:)(\d+)/);
      const port = op && op.length === 3 && op[1] && op[2] ? parseInt(op[2]) : core_1.DEFAULT_PORT;
      const protocol = port === 80 ? "https" : "http";
      const url = new URL(`${protocol}://${u}`);
      url.port = `${port}`;
      let hostname = url.hostname;
      if (hostname.charAt(0) === "[") {
        hostname = hostname.substring(1, hostname.length - 1);
      }
      const listen = url.host;
      return { listen, hostname, port };
    }
    __name(hostPort, "hostPort");
    var _ServerImpl = class _ServerImpl {
      src;
      listen;
      hostname;
      port;
      didConnect;
      reconnects;
      lastConnect;
      gossiped;
      tlsName;
      resolves;
      constructor(u, gossiped = false) {
        this.src = u;
        this.tlsName = "";
        const v = hostPort(u);
        this.listen = v.listen;
        this.hostname = v.hostname;
        this.port = v.port;
        this.didConnect = false;
        this.reconnects = 0;
        this.lastConnect = 0;
        this.gossiped = gossiped;
      }
      toString() {
        return this.listen;
      }
      async resolve(opts) {
        if (!opts.fn || opts.resolve === false) {
          return [this];
        }
        const buf = [];
        if ((0, ipparser_1.isIP)(this.hostname)) {
          return [this];
        } else {
          const ips = await opts.fn(this.hostname);
          if (opts.debug) {
            console.log(`resolve ${this.hostname} = ${ips.join(",")}`);
          }
          for (const ip of ips) {
            const proto = this.port === 80 ? "https" : "http";
            const url = new URL(`${proto}://${isIPV6(ip) ? "[" + ip + "]" : ip}`);
            url.port = `${this.port}`;
            const ss = new _ServerImpl(url.host, false);
            ss.tlsName = this.hostname;
            buf.push(ss);
          }
        }
        if (opts.randomize) {
          (0, util_1.shuffle)(buf);
        }
        this.resolves = buf;
        return buf;
      }
    };
    __name(_ServerImpl, "ServerImpl");
    var ServerImpl = _ServerImpl;
    exports2.ServerImpl = ServerImpl;
    var _Servers = class _Servers {
      firstSelect;
      servers;
      currentServer;
      tlsName;
      randomize;
      constructor(listens = [], opts = {}) {
        this.firstSelect = true;
        this.servers = [];
        this.tlsName = "";
        this.randomize = opts.randomize || false;
        const urlParseFn = (0, transport_1.getUrlParseFn)();
        if (listens) {
          listens.forEach((hp) => {
            hp = urlParseFn ? urlParseFn(hp) : hp;
            this.servers.push(new ServerImpl(hp));
          });
          if (this.randomize) {
            this.servers = (0, util_1.shuffle)(this.servers);
          }
        }
        if (this.servers.length === 0) {
          this.addServer(`${core_1.DEFAULT_HOST}:${(0, transport_1.defaultPort)()}`, false);
        }
        this.currentServer = this.servers[0];
      }
      clear() {
        this.servers.length = 0;
      }
      updateTLSName() {
        const cs = this.getCurrentServer();
        if (!(0, ipparser_1.isIP)(cs.hostname)) {
          this.tlsName = cs.hostname;
          this.servers.forEach((s) => {
            if (s.gossiped) {
              s.tlsName = this.tlsName;
            }
          });
        }
      }
      getCurrentServer() {
        return this.currentServer;
      }
      addServer(u, implicit = false) {
        const urlParseFn = (0, transport_1.getUrlParseFn)();
        u = urlParseFn ? urlParseFn(u) : u;
        const s = new ServerImpl(u, implicit);
        if ((0, ipparser_1.isIP)(s.hostname)) {
          s.tlsName = this.tlsName;
        }
        this.servers.push(s);
      }
      selectServer() {
        if (this.firstSelect) {
          this.firstSelect = false;
          return this.currentServer;
        }
        const t = this.servers.shift();
        if (t) {
          this.servers.push(t);
          this.currentServer = t;
        }
        return t;
      }
      removeCurrentServer() {
        this.removeServer(this.currentServer);
      }
      removeServer(server) {
        if (server) {
          const index = this.servers.indexOf(server);
          this.servers.splice(index, 1);
        }
      }
      length() {
        return this.servers.length;
      }
      next() {
        return this.servers.length ? this.servers[0] : void 0;
      }
      getServers() {
        return this.servers;
      }
      update(info, encrypted) {
        const added = [];
        let deleted = [];
        const urlParseFn = (0, transport_1.getUrlParseFn)();
        const discovered = /* @__PURE__ */ new Map();
        if (info.connect_urls && info.connect_urls.length > 0) {
          info.connect_urls.forEach((hp) => {
            hp = urlParseFn ? urlParseFn(hp, encrypted) : hp;
            const s = new ServerImpl(hp, true);
            discovered.set(hp, s);
          });
        }
        const toDelete = [];
        this.servers.forEach((s, index) => {
          const u = s.listen;
          if (s.gossiped && this.currentServer.listen !== u && discovered.get(u) === void 0) {
            toDelete.push(index);
          }
          discovered.delete(u);
        });
        toDelete.reverse();
        toDelete.forEach((index) => {
          const removed = this.servers.splice(index, 1);
          deleted = deleted.concat(removed[0].listen);
        });
        discovered.forEach((v, k) => {
          this.servers.push(v);
          added.push(k);
        });
        return { added, deleted };
      }
    };
    __name(_Servers, "Servers");
    var Servers = _Servers;
    exports2.Servers = Servers;
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/queued_iterator.js
var require_queued_iterator = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/queued_iterator.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.QueuedIteratorImpl = void 0;
    var util_1 = require_util();
    var errors_1 = require_errors();
    var _QueuedIteratorImpl = class _QueuedIteratorImpl {
      inflight;
      processed;
      // this is updated by the protocol
      received;
      noIterator;
      iterClosed;
      done;
      signal;
      yields;
      filtered;
      pendingFiltered;
      ctx;
      _data;
      //data is for use by extenders in any way they like
      err;
      time;
      profile;
      yielding;
      didBreak;
      constructor() {
        this.inflight = 0;
        this.filtered = 0;
        this.pendingFiltered = 0;
        this.processed = 0;
        this.received = 0;
        this.noIterator = false;
        this.done = false;
        this.signal = (0, util_1.deferred)();
        this.yields = [];
        this.iterClosed = (0, util_1.deferred)();
        this.time = 0;
        this.yielding = false;
        this.didBreak = false;
        this.profile = false;
      }
      [Symbol.asyncIterator]() {
        return this.iterate();
      }
      push(v) {
        if (this.done) {
          return;
        }
        if (this.didBreak) {
          if (typeof v === "function") {
            const cb = v;
            try {
              cb();
            } catch (_) {
            }
          }
          return;
        }
        if (typeof v === "function") {
          this.pendingFiltered++;
        }
        this.yields.push(v);
        this.signal.resolve();
      }
      async *iterate() {
        if (this.noIterator) {
          throw new errors_1.InvalidOperationError("iterator cannot be used when a callback is registered");
        }
        if (this.yielding) {
          throw new errors_1.InvalidOperationError("iterator is already yielding");
        }
        this.yielding = true;
        try {
          while (true) {
            if (this.yields.length === 0) {
              await this.signal;
            }
            if (this.err) {
              throw this.err;
            }
            const yields = this.yields;
            this.inflight = yields.length;
            this.yields = [];
            for (let i = 0; i < yields.length; i++) {
              if (typeof yields[i] === "function") {
                this.pendingFiltered--;
                const fn = yields[i];
                try {
                  fn();
                } catch (err) {
                  throw err;
                }
                if (this.err) {
                  throw this.err;
                }
                continue;
              }
              this.processed++;
              this.inflight--;
              const start = this.profile ? Date.now() : 0;
              yield yields[i];
              this.time = this.profile ? Date.now() - start : 0;
            }
            if (this.done) {
              break;
            } else if (this.yields.length === 0) {
              yields.length = 0;
              this.yields = yields;
              this.signal = (0, util_1.deferred)();
            }
          }
        } finally {
          this.didBreak = true;
          this.stop();
        }
      }
      stop(err) {
        if (this.done) {
          return;
        }
        this.err = err;
        this.done = true;
        this.signal.resolve();
        this.iterClosed.resolve(err);
      }
      getProcessed() {
        return this.noIterator ? this.received : this.processed;
      }
      getPending() {
        return this.yields.length + this.inflight - this.pendingFiltered;
      }
      getReceived() {
        return this.received - this.filtered;
      }
    };
    __name(_QueuedIteratorImpl, "QueuedIteratorImpl");
    var QueuedIteratorImpl = _QueuedIteratorImpl;
    exports2.QueuedIteratorImpl = QueuedIteratorImpl;
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/muxsubscription.js
var require_muxsubscription = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/muxsubscription.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MuxSubscription = void 0;
    var core_1 = require_core();
    var errors_1 = require_errors();
    var _MuxSubscription = class _MuxSubscription {
      baseInbox;
      reqs;
      constructor() {
        this.reqs = /* @__PURE__ */ new Map();
      }
      size() {
        return this.reqs.size;
      }
      init(prefix) {
        this.baseInbox = `${(0, core_1.createInbox)(prefix)}.`;
        return this.baseInbox;
      }
      add(r) {
        if (!isNaN(r.received)) {
          r.received = 0;
        }
        this.reqs.set(r.token, r);
      }
      get(token) {
        return this.reqs.get(token);
      }
      cancel(r) {
        this.reqs.delete(r.token);
      }
      getToken(m) {
        const s = m.subject || "";
        if (s.indexOf(this.baseInbox) === 0) {
          return s.substring(this.baseInbox.length);
        }
        return null;
      }
      all() {
        return Array.from(this.reqs.values());
      }
      handleError(isMuxPermissionError, err) {
        if (isMuxPermissionError) {
          this.all().forEach((r) => {
            r.resolver(err, {});
          });
          return true;
        }
        if (err.operation === "publish") {
          const req = this.all().find((s) => {
            return s.requestSubject === err.subject;
          });
          if (req) {
            req.resolver(err, {});
            return true;
          }
        }
        return false;
      }
      dispatcher() {
        return (err, m) => {
          var _a, _b;
          const token = this.getToken(m);
          if (token) {
            const r = this.get(token);
            if (r) {
              if (err === null) {
                err = ((_a = m == null ? void 0 : m.data) == null ? void 0 : _a.length) === 0 && ((_b = m.headers) == null ? void 0 : _b.code) === 503 ? new errors_1.NoRespondersError(r.requestSubject) : null;
              }
              r.resolver(err, m);
            }
          }
        };
      }
      close() {
        const err = new errors_1.RequestError("connection closed");
        this.reqs.forEach((req) => {
          req.resolver(err, {});
        });
      }
    };
    __name(_MuxSubscription, "MuxSubscription");
    var MuxSubscription = _MuxSubscription;
    exports2.MuxSubscription = MuxSubscription;
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/heartbeats.js
var require_heartbeats = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/heartbeats.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Heartbeat = void 0;
    var util_1 = require_util();
    var _Heartbeat = class _Heartbeat {
      ph;
      interval;
      maxOut;
      timer;
      pendings;
      constructor(ph, interval, maxOut) {
        this.ph = ph;
        this.interval = interval;
        this.maxOut = maxOut;
        this.pendings = [];
      }
      // api to start the heartbeats, since this can be
      // spuriously called from dial, ensure we don't
      // leak timers
      start() {
        this.cancel();
        this._schedule();
      }
      // api for canceling the heartbeats, if stale is
      // true it will initiate a client disconnect
      cancel(stale) {
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = void 0;
        }
        this._reset();
        if (stale) {
          this.ph.disconnect();
        }
      }
      _schedule() {
        this.timer = setTimeout(() => {
          this.ph.dispatchStatus({ type: "ping", pendingPings: this.pendings.length + 1 });
          if (this.pendings.length === this.maxOut) {
            this.cancel(true);
            return;
          }
          const ping = (0, util_1.deferred)();
          this.ph.flush(ping).then(() => {
            this._reset();
          }).catch(() => {
            this.cancel();
          });
          this.pendings.push(ping);
          this._schedule();
        }, this.interval);
      }
      _reset() {
        this.pendings = this.pendings.filter((p) => {
          const d = p;
          d.resolve();
          return false;
        });
      }
    };
    __name(_Heartbeat, "Heartbeat");
    var Heartbeat = _Heartbeat;
    exports2.Heartbeat = Heartbeat;
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/denobuffer.js
var require_denobuffer = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/denobuffer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DenoBuffer = exports2.MAX_SIZE = exports2.AssertionError = void 0;
    exports2.assert = assert;
    exports2.concat = concat;
    exports2.append = append;
    exports2.readAll = readAll;
    exports2.writeAll = writeAll;
    var encoders_1 = require_encoders();
    var _AssertionError = class _AssertionError extends Error {
      constructor(msg) {
        super(msg);
        this.name = "AssertionError";
      }
    };
    __name(_AssertionError, "AssertionError");
    var AssertionError = _AssertionError;
    exports2.AssertionError = AssertionError;
    function assert(cond, msg = "Assertion failed.") {
      if (!cond) {
        throw new AssertionError(msg);
      }
    }
    __name(assert, "assert");
    var MIN_READ = 32 * 1024;
    exports2.MAX_SIZE = 2 ** 32 - 2;
    function copy(src, dst, off = 0) {
      const r = dst.byteLength - off;
      if (src.byteLength > r) {
        src = src.subarray(0, r);
      }
      dst.set(src, off);
      return src.byteLength;
    }
    __name(copy, "copy");
    function concat(origin, b) {
      if (origin === void 0 && b === void 0) {
        return new Uint8Array(0);
      }
      if (origin === void 0) {
        return b;
      }
      if (b === void 0) {
        return origin;
      }
      const output = new Uint8Array(origin.length + b.length);
      output.set(origin, 0);
      output.set(b, origin.length);
      return output;
    }
    __name(concat, "concat");
    function append(origin, b) {
      return concat(origin, Uint8Array.of(b));
    }
    __name(append, "append");
    var _DenoBuffer = class _DenoBuffer {
      _buf;
      // contents are the bytes _buf[off : len(_buf)]
      _off;
      // read at _buf[off], write at _buf[_buf.byteLength]
      constructor(ab) {
        this._off = 0;
        if (ab == null) {
          this._buf = new Uint8Array(0);
          return;
        }
        this._buf = new Uint8Array(ab);
      }
      bytes(options = { copy: true }) {
        if (options.copy === false)
          return this._buf.subarray(this._off);
        return this._buf.slice(this._off);
      }
      empty() {
        return this._buf.byteLength <= this._off;
      }
      get length() {
        return this._buf.byteLength - this._off;
      }
      get capacity() {
        return this._buf.buffer.byteLength;
      }
      truncate(n) {
        if (n === 0) {
          this.reset();
          return;
        }
        if (n < 0 || n > this.length) {
          throw Error("bytes.Buffer: truncation out of range");
        }
        this._reslice(this._off + n);
      }
      reset() {
        this._reslice(0);
        this._off = 0;
      }
      _tryGrowByReslice(n) {
        const l = this._buf.byteLength;
        if (n <= this.capacity - l) {
          this._reslice(l + n);
          return l;
        }
        return -1;
      }
      _reslice(len) {
        assert(len <= this._buf.buffer.byteLength);
        this._buf = new Uint8Array(this._buf.buffer, 0, len);
      }
      readByte() {
        const a = new Uint8Array(1);
        if (this.read(a)) {
          return a[0];
        }
        return null;
      }
      read(p) {
        if (this.empty()) {
          this.reset();
          if (p.byteLength === 0) {
            return 0;
          }
          return null;
        }
        const nread = copy(this._buf.subarray(this._off), p);
        this._off += nread;
        return nread;
      }
      writeByte(n) {
        return this.write(Uint8Array.of(n));
      }
      writeString(s) {
        return this.write(encoders_1.TE.encode(s));
      }
      write(p) {
        const m = this._grow(p.byteLength);
        return copy(p, this._buf, m);
      }
      _grow(n) {
        const m = this.length;
        if (m === 0 && this._off !== 0) {
          this.reset();
        }
        const i = this._tryGrowByReslice(n);
        if (i >= 0) {
          return i;
        }
        const c = this.capacity;
        if (n <= Math.floor(c / 2) - m) {
          copy(this._buf.subarray(this._off), this._buf);
        } else if (c + n > exports2.MAX_SIZE) {
          throw new Error("The buffer cannot be grown beyond the maximum size.");
        } else {
          const buf = new Uint8Array(Math.min(2 * c + n, exports2.MAX_SIZE));
          copy(this._buf.subarray(this._off), buf);
          this._buf = buf;
        }
        this._off = 0;
        this._reslice(Math.min(m + n, exports2.MAX_SIZE));
        return m;
      }
      grow(n) {
        if (n < 0) {
          throw Error("Buffer._grow: negative count");
        }
        const m = this._grow(n);
        this._reslice(m);
      }
      readFrom(r) {
        let n = 0;
        const tmp = new Uint8Array(MIN_READ);
        while (true) {
          const shouldGrow = this.capacity - this.length < MIN_READ;
          const buf = shouldGrow ? tmp : new Uint8Array(this._buf.buffer, this.length);
          const nread = r.read(buf);
          if (nread === null) {
            return n;
          }
          if (shouldGrow)
            this.write(buf.subarray(0, nread));
          else
            this._reslice(this.length + nread);
          n += nread;
        }
      }
    };
    __name(_DenoBuffer, "DenoBuffer");
    var DenoBuffer = _DenoBuffer;
    exports2.DenoBuffer = DenoBuffer;
    function readAll(r) {
      const buf = new DenoBuffer();
      buf.readFrom(r);
      return buf.bytes();
    }
    __name(readAll, "readAll");
    function writeAll(w, arr) {
      let nwritten = 0;
      while (nwritten < arr.length) {
        nwritten += w.write(arr.subarray(nwritten));
      }
    }
    __name(writeAll, "writeAll");
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/parser.js
var require_parser = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/parser.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.cc = exports2.State = exports2.Parser = exports2.Kind = void 0;
    exports2.describe = describe;
    var denobuffer_1 = require_denobuffer();
    var encoders_1 = require_encoders();
    exports2.Kind = {
      OK: 0,
      ERR: 1,
      MSG: 2,
      INFO: 3,
      PING: 4,
      PONG: 5
    };
    function describe(e) {
      let ks;
      let data = "";
      switch (e.kind) {
        case exports2.Kind.MSG:
          ks = "MSG";
          break;
        case exports2.Kind.OK:
          ks = "OK";
          break;
        case exports2.Kind.ERR:
          ks = "ERR";
          data = encoders_1.TD.decode(e.data);
          break;
        case exports2.Kind.PING:
          ks = "PING";
          break;
        case exports2.Kind.PONG:
          ks = "PONG";
          break;
        case exports2.Kind.INFO:
          ks = "INFO";
          data = encoders_1.TD.decode(e.data);
      }
      return `${ks}: ${data}`;
    }
    __name(describe, "describe");
    function newMsgArg() {
      const ma = {};
      ma.sid = -1;
      ma.hdr = -1;
      ma.size = -1;
      return ma;
    }
    __name(newMsgArg, "newMsgArg");
    var ASCII_0 = 48;
    var ASCII_9 = 57;
    var _Parser = class _Parser {
      dispatcher;
      state;
      as;
      drop;
      hdr;
      ma;
      argBuf;
      msgBuf;
      constructor(dispatcher) {
        this.dispatcher = dispatcher;
        this.state = exports2.State.OP_START;
        this.as = 0;
        this.drop = 0;
        this.hdr = 0;
      }
      parse(buf) {
        let i;
        for (i = 0; i < buf.length; i++) {
          const b = buf[i];
          switch (this.state) {
            case exports2.State.OP_START:
              switch (b) {
                case exports2.cc.M:
                case exports2.cc.m:
                  this.state = exports2.State.OP_M;
                  this.hdr = -1;
                  this.ma = newMsgArg();
                  break;
                case exports2.cc.H:
                case exports2.cc.h:
                  this.state = exports2.State.OP_H;
                  this.hdr = 0;
                  this.ma = newMsgArg();
                  break;
                case exports2.cc.P:
                case exports2.cc.p:
                  this.state = exports2.State.OP_P;
                  break;
                case exports2.cc.PLUS:
                  this.state = exports2.State.OP_PLUS;
                  break;
                case exports2.cc.MINUS:
                  this.state = exports2.State.OP_MINUS;
                  break;
                case exports2.cc.I:
                case exports2.cc.i:
                  this.state = exports2.State.OP_I;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_H:
              switch (b) {
                case exports2.cc.M:
                case exports2.cc.m:
                  this.state = exports2.State.OP_M;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_M:
              switch (b) {
                case exports2.cc.S:
                case exports2.cc.s:
                  this.state = exports2.State.OP_MS;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_MS:
              switch (b) {
                case exports2.cc.G:
                case exports2.cc.g:
                  this.state = exports2.State.OP_MSG;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_MSG:
              switch (b) {
                case exports2.cc.SPACE:
                case exports2.cc.TAB:
                  this.state = exports2.State.OP_MSG_SPC;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_MSG_SPC:
              switch (b) {
                case exports2.cc.SPACE:
                case exports2.cc.TAB:
                  continue;
                default:
                  this.state = exports2.State.MSG_ARG;
                  this.as = i;
              }
              break;
            case exports2.State.MSG_ARG:
              switch (b) {
                case exports2.cc.CR:
                  this.drop = 1;
                  break;
                case exports2.cc.NL: {
                  const arg = this.argBuf ? this.argBuf.bytes() : buf.subarray(this.as, i - this.drop);
                  this.processMsgArgs(arg);
                  this.drop = 0;
                  this.as = i + 1;
                  this.state = exports2.State.MSG_PAYLOAD;
                  i = this.as + this.ma.size - 1;
                  break;
                }
                default:
                  if (this.argBuf) {
                    this.argBuf.writeByte(b);
                  }
              }
              break;
            case exports2.State.MSG_PAYLOAD:
              if (this.msgBuf) {
                if (this.msgBuf.length >= this.ma.size) {
                  const data = this.msgBuf.bytes({ copy: false });
                  this.dispatcher.push({ kind: exports2.Kind.MSG, msg: this.ma, data });
                  this.argBuf = void 0;
                  this.msgBuf = void 0;
                  this.state = exports2.State.MSG_END;
                } else {
                  let toCopy = this.ma.size - this.msgBuf.length;
                  const avail = buf.length - i;
                  if (avail < toCopy) {
                    toCopy = avail;
                  }
                  if (toCopy > 0) {
                    this.msgBuf.write(buf.subarray(i, i + toCopy));
                    i = i + toCopy - 1;
                  } else {
                    this.msgBuf.writeByte(b);
                  }
                }
              } else if (i - this.as >= this.ma.size) {
                this.dispatcher.push({ kind: exports2.Kind.MSG, msg: this.ma, data: buf.subarray(this.as, i) });
                this.argBuf = void 0;
                this.msgBuf = void 0;
                this.state = exports2.State.MSG_END;
              }
              break;
            case exports2.State.MSG_END:
              switch (b) {
                case exports2.cc.NL:
                  this.drop = 0;
                  this.as = i + 1;
                  this.state = exports2.State.OP_START;
                  break;
                default:
                  continue;
              }
              break;
            case exports2.State.OP_PLUS:
              switch (b) {
                case exports2.cc.O:
                case exports2.cc.o:
                  this.state = exports2.State.OP_PLUS_O;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_PLUS_O:
              switch (b) {
                case exports2.cc.K:
                case exports2.cc.k:
                  this.state = exports2.State.OP_PLUS_OK;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_PLUS_OK:
              switch (b) {
                case exports2.cc.NL:
                  this.dispatcher.push({ kind: exports2.Kind.OK });
                  this.drop = 0;
                  this.state = exports2.State.OP_START;
                  break;
              }
              break;
            case exports2.State.OP_MINUS:
              switch (b) {
                case exports2.cc.E:
                case exports2.cc.e:
                  this.state = exports2.State.OP_MINUS_E;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_MINUS_E:
              switch (b) {
                case exports2.cc.R:
                case exports2.cc.r:
                  this.state = exports2.State.OP_MINUS_ER;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_MINUS_ER:
              switch (b) {
                case exports2.cc.R:
                case exports2.cc.r:
                  this.state = exports2.State.OP_MINUS_ERR;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_MINUS_ERR:
              switch (b) {
                case exports2.cc.SPACE:
                case exports2.cc.TAB:
                  this.state = exports2.State.OP_MINUS_ERR_SPC;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_MINUS_ERR_SPC:
              switch (b) {
                case exports2.cc.SPACE:
                case exports2.cc.TAB:
                  continue;
                default:
                  this.state = exports2.State.MINUS_ERR_ARG;
                  this.as = i;
              }
              break;
            case exports2.State.MINUS_ERR_ARG:
              switch (b) {
                case exports2.cc.CR:
                  this.drop = 1;
                  break;
                case exports2.cc.NL: {
                  let arg;
                  if (this.argBuf) {
                    arg = this.argBuf.bytes();
                    this.argBuf = void 0;
                  } else {
                    arg = buf.subarray(this.as, i - this.drop);
                  }
                  this.dispatcher.push({ kind: exports2.Kind.ERR, data: arg });
                  this.drop = 0;
                  this.as = i + 1;
                  this.state = exports2.State.OP_START;
                  break;
                }
                default:
                  if (this.argBuf) {
                    this.argBuf.write(Uint8Array.of(b));
                  }
              }
              break;
            case exports2.State.OP_P:
              switch (b) {
                case exports2.cc.I:
                case exports2.cc.i:
                  this.state = exports2.State.OP_PI;
                  break;
                case exports2.cc.O:
                case exports2.cc.o:
                  this.state = exports2.State.OP_PO;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_PO:
              switch (b) {
                case exports2.cc.N:
                case exports2.cc.n:
                  this.state = exports2.State.OP_PON;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_PON:
              switch (b) {
                case exports2.cc.G:
                case exports2.cc.g:
                  this.state = exports2.State.OP_PONG;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_PONG:
              switch (b) {
                case exports2.cc.NL:
                  this.dispatcher.push({ kind: exports2.Kind.PONG });
                  this.drop = 0;
                  this.state = exports2.State.OP_START;
                  break;
              }
              break;
            case exports2.State.OP_PI:
              switch (b) {
                case exports2.cc.N:
                case exports2.cc.n:
                  this.state = exports2.State.OP_PIN;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_PIN:
              switch (b) {
                case exports2.cc.G:
                case exports2.cc.g:
                  this.state = exports2.State.OP_PING;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_PING:
              switch (b) {
                case exports2.cc.NL:
                  this.dispatcher.push({ kind: exports2.Kind.PING });
                  this.drop = 0;
                  this.state = exports2.State.OP_START;
                  break;
              }
              break;
            case exports2.State.OP_I:
              switch (b) {
                case exports2.cc.N:
                case exports2.cc.n:
                  this.state = exports2.State.OP_IN;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_IN:
              switch (b) {
                case exports2.cc.F:
                case exports2.cc.f:
                  this.state = exports2.State.OP_INF;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_INF:
              switch (b) {
                case exports2.cc.O:
                case exports2.cc.o:
                  this.state = exports2.State.OP_INFO;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_INFO:
              switch (b) {
                case exports2.cc.SPACE:
                case exports2.cc.TAB:
                  this.state = exports2.State.OP_INFO_SPC;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_INFO_SPC:
              switch (b) {
                case exports2.cc.SPACE:
                case exports2.cc.TAB:
                  continue;
                default:
                  this.state = exports2.State.INFO_ARG;
                  this.as = i;
              }
              break;
            case exports2.State.INFO_ARG:
              switch (b) {
                case exports2.cc.CR:
                  this.drop = 1;
                  break;
                case exports2.cc.NL: {
                  let arg;
                  if (this.argBuf) {
                    arg = this.argBuf.bytes();
                    this.argBuf = void 0;
                  } else {
                    arg = buf.subarray(this.as, i - this.drop);
                  }
                  this.dispatcher.push({ kind: exports2.Kind.INFO, data: arg });
                  this.drop = 0;
                  this.as = i + 1;
                  this.state = exports2.State.OP_START;
                  break;
                }
                default:
                  if (this.argBuf) {
                    this.argBuf.writeByte(b);
                  }
              }
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
        }
        if ((this.state === exports2.State.MSG_ARG || this.state === exports2.State.MINUS_ERR_ARG || this.state === exports2.State.INFO_ARG) && !this.argBuf) {
          this.argBuf = new denobuffer_1.DenoBuffer(buf.subarray(this.as, i - this.drop));
        }
        if (this.state === exports2.State.MSG_PAYLOAD && !this.msgBuf) {
          if (!this.argBuf) {
            this.cloneMsgArg();
          }
          this.msgBuf = new denobuffer_1.DenoBuffer(buf.subarray(this.as));
        }
      }
      cloneMsgArg() {
        const s = this.ma.subject.length;
        const r = this.ma.reply ? this.ma.reply.length : 0;
        const buf = new Uint8Array(s + r);
        buf.set(this.ma.subject);
        if (this.ma.reply) {
          buf.set(this.ma.reply, s);
        }
        this.argBuf = new denobuffer_1.DenoBuffer(buf);
        this.ma.subject = buf.subarray(0, s);
        if (this.ma.reply) {
          this.ma.reply = buf.subarray(s);
        }
      }
      processMsgArgs(arg) {
        if (this.hdr >= 0) {
          return this.processHeaderMsgArgs(arg);
        }
        const args = [];
        let start = -1;
        for (let i = 0; i < arg.length; i++) {
          const b = arg[i];
          switch (b) {
            case exports2.cc.SPACE:
            case exports2.cc.TAB:
            case exports2.cc.CR:
            case exports2.cc.NL:
              if (start >= 0) {
                args.push(arg.subarray(start, i));
                start = -1;
              }
              break;
            default:
              if (start < 0) {
                start = i;
              }
          }
        }
        if (start >= 0) {
          args.push(arg.subarray(start));
        }
        switch (args.length) {
          case 3:
            this.ma.subject = args[0];
            this.ma.sid = this.protoParseInt(args[1]);
            this.ma.reply = void 0;
            this.ma.size = this.protoParseInt(args[2]);
            break;
          case 4:
            this.ma.subject = args[0];
            this.ma.sid = this.protoParseInt(args[1]);
            this.ma.reply = args[2];
            this.ma.size = this.protoParseInt(args[3]);
            break;
          default:
            throw this.fail(arg, "processMsgArgs Parse Error");
        }
        if (this.ma.sid < 0) {
          throw this.fail(arg, "processMsgArgs Bad or Missing Sid Error");
        }
        if (this.ma.size < 0) {
          throw this.fail(arg, "processMsgArgs Bad or Missing Size Error");
        }
      }
      fail(data, label = "") {
        if (!label) {
          label = `parse error [${this.state}]`;
        } else {
          label = `${label} [${this.state}]`;
        }
        return new Error(`${label}: ${encoders_1.TD.decode(data)}`);
      }
      processHeaderMsgArgs(arg) {
        const args = [];
        let start = -1;
        for (let i = 0; i < arg.length; i++) {
          const b = arg[i];
          switch (b) {
            case exports2.cc.SPACE:
            case exports2.cc.TAB:
            case exports2.cc.CR:
            case exports2.cc.NL:
              if (start >= 0) {
                args.push(arg.subarray(start, i));
                start = -1;
              }
              break;
            default:
              if (start < 0) {
                start = i;
              }
          }
        }
        if (start >= 0) {
          args.push(arg.subarray(start));
        }
        switch (args.length) {
          case 4:
            this.ma.subject = args[0];
            this.ma.sid = this.protoParseInt(args[1]);
            this.ma.reply = void 0;
            this.ma.hdr = this.protoParseInt(args[2]);
            this.ma.size = this.protoParseInt(args[3]);
            break;
          case 5:
            this.ma.subject = args[0];
            this.ma.sid = this.protoParseInt(args[1]);
            this.ma.reply = args[2];
            this.ma.hdr = this.protoParseInt(args[3]);
            this.ma.size = this.protoParseInt(args[4]);
            break;
          default:
            throw this.fail(arg, "processHeaderMsgArgs Parse Error");
        }
        if (this.ma.sid < 0) {
          throw this.fail(arg, "processHeaderMsgArgs Bad or Missing Sid Error");
        }
        if (this.ma.hdr < 0 || this.ma.hdr > this.ma.size) {
          throw this.fail(arg, "processHeaderMsgArgs Bad or Missing Header Size Error");
        }
        if (this.ma.size < 0) {
          throw this.fail(arg, "processHeaderMsgArgs Bad or Missing Size Error");
        }
      }
      protoParseInt(a) {
        if (a.length === 0) {
          return -1;
        }
        let n = 0;
        for (let i = 0; i < a.length; i++) {
          if (a[i] < ASCII_0 || a[i] > ASCII_9) {
            return -1;
          }
          n = n * 10 + (a[i] - ASCII_0);
        }
        return n;
      }
    };
    __name(_Parser, "Parser");
    var Parser = _Parser;
    exports2.Parser = Parser;
    exports2.State = {
      OP_START: 0,
      OP_PLUS: 1,
      OP_PLUS_O: 2,
      OP_PLUS_OK: 3,
      OP_MINUS: 4,
      OP_MINUS_E: 5,
      OP_MINUS_ER: 6,
      OP_MINUS_ERR: 7,
      OP_MINUS_ERR_SPC: 8,
      MINUS_ERR_ARG: 9,
      OP_M: 10,
      OP_MS: 11,
      OP_MSG: 12,
      OP_MSG_SPC: 13,
      MSG_ARG: 14,
      MSG_PAYLOAD: 15,
      MSG_END: 16,
      OP_H: 17,
      OP_P: 18,
      OP_PI: 19,
      OP_PIN: 20,
      OP_PING: 21,
      OP_PO: 22,
      OP_PON: 23,
      OP_PONG: 24,
      OP_I: 25,
      OP_IN: 26,
      OP_INF: 27,
      OP_INFO: 28,
      OP_INFO_SPC: 29,
      INFO_ARG: 30
    };
    exports2.cc = {
      CR: "\r".charCodeAt(0),
      E: "E".charCodeAt(0),
      e: "e".charCodeAt(0),
      F: "F".charCodeAt(0),
      f: "f".charCodeAt(0),
      G: "G".charCodeAt(0),
      g: "g".charCodeAt(0),
      H: "H".charCodeAt(0),
      h: "h".charCodeAt(0),
      I: "I".charCodeAt(0),
      i: "i".charCodeAt(0),
      K: "K".charCodeAt(0),
      k: "k".charCodeAt(0),
      M: "M".charCodeAt(0),
      m: "m".charCodeAt(0),
      MINUS: "-".charCodeAt(0),
      N: "N".charCodeAt(0),
      n: "n".charCodeAt(0),
      NL: "\n".charCodeAt(0),
      O: "O".charCodeAt(0),
      o: "o".charCodeAt(0),
      P: "P".charCodeAt(0),
      p: "p".charCodeAt(0),
      PLUS: "+".charCodeAt(0),
      R: "R".charCodeAt(0),
      r: "r".charCodeAt(0),
      S: "S".charCodeAt(0),
      s: "s".charCodeAt(0),
      SPACE: " ".charCodeAt(0),
      TAB: "	".charCodeAt(0)
    };
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/headers.js
var require_headers = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/headers.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MsgHdrsImpl = void 0;
    exports2.canonicalMIMEHeaderKey = canonicalMIMEHeaderKey;
    exports2.headers = headers2;
    var encoders_1 = require_encoders();
    var core_1 = require_core();
    var errors_1 = require_errors();
    function canonicalMIMEHeaderKey(k) {
      const a = 97;
      const A = 65;
      const Z = 90;
      const z = 122;
      const dash = 45;
      const colon = 58;
      const start = 33;
      const end = 126;
      const toLower = a - A;
      let upper = true;
      const buf = new Array(k.length);
      for (let i = 0; i < k.length; i++) {
        let c = k.charCodeAt(i);
        if (c === colon || c < start || c > end) {
          throw errors_1.InvalidArgumentError.format("header", `'${k[i]}' is not a valid character in a header name`);
        }
        if (upper && a <= c && c <= z) {
          c -= toLower;
        } else if (!upper && A <= c && c <= Z) {
          c += toLower;
        }
        buf[i] = c;
        upper = c == dash;
      }
      return String.fromCharCode(...buf);
    }
    __name(canonicalMIMEHeaderKey, "canonicalMIMEHeaderKey");
    function headers2(code = 0, description = "") {
      if (code === 0 && description !== "" || code > 0 && description === "") {
        throw errors_1.InvalidArgumentError.format("description", "is required");
      }
      return new MsgHdrsImpl(code, description);
    }
    __name(headers2, "headers");
    var HEADER = "NATS/1.0";
    var _MsgHdrsImpl = class _MsgHdrsImpl {
      _code;
      headers;
      _description;
      constructor(code = 0, description = "") {
        this._code = code;
        this._description = description;
        this.headers = /* @__PURE__ */ new Map();
      }
      [Symbol.iterator]() {
        return this.headers.entries();
      }
      size() {
        return this.headers.size;
      }
      equals(mh) {
        if (mh && this.headers.size === mh.headers.size && this._code === mh._code) {
          for (const [k, v] of this.headers) {
            const a = mh.values(k);
            if (v.length !== a.length) {
              return false;
            }
            const vv = [...v].sort();
            const aa = [...a].sort();
            for (let i = 0; i < vv.length; i++) {
              if (vv[i] !== aa[i]) {
                return false;
              }
            }
          }
          return true;
        }
        return false;
      }
      static decode(a) {
        const mh = new _MsgHdrsImpl();
        const s = encoders_1.TD.decode(a);
        const lines = s.split("\r\n");
        const h = lines[0];
        if (h !== HEADER) {
          let str = h.replace(HEADER, "").trim();
          if (str.length > 0) {
            mh._code = parseInt(str, 10);
            if (isNaN(mh._code)) {
              mh._code = 0;
            }
            const scode = mh._code.toString();
            str = str.replace(scode, "");
            mh._description = str.trim();
          }
        }
        if (lines.length >= 1) {
          lines.slice(1).map((s2) => {
            if (s2) {
              const idx = s2.indexOf(":");
              if (idx > -1) {
                const k = s2.slice(0, idx);
                const v = s2.slice(idx + 1).trim();
                mh.append(k, v);
              }
            }
          });
        }
        return mh;
      }
      toString() {
        if (this.headers.size === 0 && this._code === 0) {
          return "";
        }
        let s = HEADER;
        if (this._code > 0 && this._description !== "") {
          s += ` ${this._code} ${this._description}`;
        }
        for (const [k, v] of this.headers) {
          for (let i = 0; i < v.length; i++) {
            s = `${s}\r
${k}: ${v[i]}`;
          }
        }
        return `${s}\r
\r
`;
      }
      encode() {
        return encoders_1.TE.encode(this.toString());
      }
      static validHeaderValue(k) {
        const inv = /[\r\n]/;
        if (inv.test(k)) {
          throw errors_1.InvalidArgumentError.format("header", "values cannot contain \\r or \\n");
        }
        return k.trim();
      }
      keys() {
        const keys = [];
        for (const sk of this.headers.keys()) {
          keys.push(sk);
        }
        return keys;
      }
      findKeys(k, match = core_1.Match.Exact) {
        const keys = this.keys();
        switch (match) {
          case core_1.Match.Exact:
            return keys.filter((v) => {
              return v === k;
            });
          case core_1.Match.CanonicalMIME:
            k = canonicalMIMEHeaderKey(k);
            return keys.filter((v) => {
              return v === k;
            });
          default: {
            const lci = k.toLowerCase();
            return keys.filter((v) => {
              return lci === v.toLowerCase();
            });
          }
        }
      }
      get(k, match = core_1.Match.Exact) {
        const keys = this.findKeys(k, match);
        if (keys.length) {
          const v = this.headers.get(keys[0]);
          if (v) {
            return Array.isArray(v) ? v[0] : v;
          }
        }
        return "";
      }
      last(k, match = core_1.Match.Exact) {
        const keys = this.findKeys(k, match);
        if (keys.length) {
          const v = this.headers.get(keys[0]);
          if (v) {
            return Array.isArray(v) ? v[v.length - 1] : v;
          }
        }
        return "";
      }
      has(k, match = core_1.Match.Exact) {
        return this.findKeys(k, match).length > 0;
      }
      set(k, v, match = core_1.Match.Exact) {
        this.delete(k, match);
        this.append(k, v, match);
      }
      append(k, v, match = core_1.Match.Exact) {
        const ck = canonicalMIMEHeaderKey(k);
        if (match === core_1.Match.CanonicalMIME) {
          k = ck;
        }
        const keys = this.findKeys(k, match);
        k = keys.length > 0 ? keys[0] : k;
        const value = _MsgHdrsImpl.validHeaderValue(v);
        let a = this.headers.get(k);
        if (!a) {
          a = [];
          this.headers.set(k, a);
        }
        a.push(value);
      }
      values(k, match = core_1.Match.Exact) {
        const buf = [];
        const keys = this.findKeys(k, match);
        keys.forEach((v) => {
          const values = this.headers.get(v);
          if (values) {
            buf.push(...values);
          }
        });
        return buf;
      }
      delete(k, match = core_1.Match.Exact) {
        const keys = this.findKeys(k, match);
        keys.forEach((v) => {
          this.headers.delete(v);
        });
      }
      get hasError() {
        return this._code >= 300;
      }
      get status() {
        return `${this._code} ${this._description}`.trim();
      }
      toRecord() {
        const data = {};
        this.keys().forEach((v) => {
          data[v] = this.values(v);
        });
        return data;
      }
      get code() {
        return this._code;
      }
      get description() {
        return this._description;
      }
      static fromRecord(r) {
        const h = new _MsgHdrsImpl();
        for (const k in r) {
          h.headers.set(k, r[k]);
        }
        return h;
      }
    };
    __name(_MsgHdrsImpl, "MsgHdrsImpl");
    var MsgHdrsImpl = _MsgHdrsImpl;
    exports2.MsgHdrsImpl = MsgHdrsImpl;
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/msg.js
var require_msg = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/msg.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MsgImpl = void 0;
    var headers_1 = require_headers();
    var encoders_1 = require_encoders();
    var _MsgImpl = class _MsgImpl {
      _headers;
      _msg;
      _rdata;
      _reply;
      _subject;
      publisher;
      constructor(msg, data, publisher) {
        this._msg = msg;
        this._rdata = data;
        this.publisher = publisher;
      }
      get subject() {
        if (this._subject) {
          return this._subject;
        }
        this._subject = encoders_1.TD.decode(this._msg.subject);
        return this._subject;
      }
      get reply() {
        if (this._reply) {
          return this._reply;
        }
        this._reply = encoders_1.TD.decode(this._msg.reply);
        return this._reply;
      }
      get sid() {
        return this._msg.sid;
      }
      get headers() {
        if (this._msg.hdr > -1 && !this._headers) {
          const buf = this._rdata.subarray(0, this._msg.hdr);
          this._headers = headers_1.MsgHdrsImpl.decode(buf);
        }
        return this._headers;
      }
      get data() {
        if (!this._rdata) {
          return new Uint8Array(0);
        }
        return this._msg.hdr > -1 ? this._rdata.subarray(this._msg.hdr) : this._rdata;
      }
      // eslint-ignore-next-line @typescript-eslint/no-explicit-any
      respond(data = encoders_1.Empty, opts) {
        if (this.reply) {
          this.publisher.publish(this.reply, data, opts);
          return true;
        }
        return false;
      }
      size() {
        var _a;
        const subj = this._msg.subject.length;
        const reply = ((_a = this._msg.reply) == null ? void 0 : _a.length) || 0;
        const payloadAndHeaders = this._msg.size === -1 ? 0 : this._msg.size;
        return subj + reply + payloadAndHeaders;
      }
      json(reviver) {
        return JSON.parse(this.string(), reviver);
      }
      string() {
        return encoders_1.TD.decode(this.data);
      }
      requestInfo() {
        var _a;
        const v = (_a = this.headers) == null ? void 0 : _a.get("Nats-Request-Info");
        if (v) {
          return JSON.parse(v, function(key, value) {
            if ((key === "start" || key === "stop") && value !== "") {
              return new Date(Date.parse(value));
            }
            return value;
          });
        }
        return null;
      }
    };
    __name(_MsgImpl, "MsgImpl");
    var MsgImpl = _MsgImpl;
    exports2.MsgImpl = MsgImpl;
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/semver.js
var require_semver = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/semver.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Features = exports2.Feature = void 0;
    exports2.parseSemVer = parseSemVer;
    exports2.compare = compare;
    function parseSemVer(s = "") {
      const m = s.match(/(\d+).(\d+).(\d+)/);
      if (m) {
        return {
          major: parseInt(m[1]),
          minor: parseInt(m[2]),
          micro: parseInt(m[3])
        };
      }
      throw new Error(`'${s}' is not a semver value`);
    }
    __name(parseSemVer, "parseSemVer");
    function compare(a, b) {
      if (a.major < b.major)
        return -1;
      if (a.major > b.major)
        return 1;
      if (a.minor < b.minor)
        return -1;
      if (a.minor > b.minor)
        return 1;
      if (a.micro < b.micro)
        return -1;
      if (a.micro > b.micro)
        return 1;
      return 0;
    }
    __name(compare, "compare");
    exports2.Feature = {
      JS_KV: "js_kv",
      JS_OBJECTSTORE: "js_objectstore",
      JS_PULL_MAX_BYTES: "js_pull_max_bytes",
      JS_NEW_CONSUMER_CREATE_API: "js_new_consumer_create",
      JS_ALLOW_DIRECT: "js_allow_direct",
      JS_MULTIPLE_CONSUMER_FILTER: "js_multiple_consumer_filter",
      JS_SIMPLIFICATION: "js_simplification",
      JS_STREAM_CONSUMER_METADATA: "js_stream_consumer_metadata",
      JS_CONSUMER_FILTER_SUBJECTS: "js_consumer_filter_subjects",
      JS_STREAM_FIRST_SEQ: "js_stream_first_seq",
      JS_STREAM_SUBJECT_TRANSFORM: "js_stream_subject_transform",
      JS_STREAM_SOURCE_SUBJECT_TRANSFORM: "js_stream_source_subject_transform",
      JS_STREAM_COMPRESSION: "js_stream_compression",
      JS_DEFAULT_CONSUMER_LIMITS: "js_default_consumer_limits",
      JS_BATCH_DIRECT_GET: "js_batch_direct_get",
      JS_PRIORITY_GROUPS: "js_priority_groups"
    };
    var _Features = class _Features {
      server;
      features;
      disabled;
      constructor(v) {
        this.features = /* @__PURE__ */ new Map();
        this.disabled = [];
        this.update(v);
      }
      /**
       * Removes all disabled entries
       */
      resetDisabled() {
        this.disabled.length = 0;
        this.update(this.server);
      }
      /**
       * Disables a particular feature.
       * @param f
       */
      disable(f) {
        this.disabled.push(f);
        this.update(this.server);
      }
      isDisabled(f) {
        return this.disabled.indexOf(f) !== -1;
      }
      update(v) {
        if (typeof v === "string") {
          v = parseSemVer(v);
        }
        this.server = v;
        this.set(exports2.Feature.JS_KV, "2.6.2");
        this.set(exports2.Feature.JS_OBJECTSTORE, "2.6.3");
        this.set(exports2.Feature.JS_PULL_MAX_BYTES, "2.8.3");
        this.set(exports2.Feature.JS_NEW_CONSUMER_CREATE_API, "2.9.0");
        this.set(exports2.Feature.JS_ALLOW_DIRECT, "2.9.0");
        this.set(exports2.Feature.JS_MULTIPLE_CONSUMER_FILTER, "2.10.0");
        this.set(exports2.Feature.JS_SIMPLIFICATION, "2.9.4");
        this.set(exports2.Feature.JS_STREAM_CONSUMER_METADATA, "2.10.0");
        this.set(exports2.Feature.JS_CONSUMER_FILTER_SUBJECTS, "2.10.0");
        this.set(exports2.Feature.JS_STREAM_FIRST_SEQ, "2.10.0");
        this.set(exports2.Feature.JS_STREAM_SUBJECT_TRANSFORM, "2.10.0");
        this.set(exports2.Feature.JS_STREAM_SOURCE_SUBJECT_TRANSFORM, "2.10.0");
        this.set(exports2.Feature.JS_STREAM_COMPRESSION, "2.10.0");
        this.set(exports2.Feature.JS_DEFAULT_CONSUMER_LIMITS, "2.10.0");
        this.set(exports2.Feature.JS_BATCH_DIRECT_GET, "2.11.0");
        this.set(exports2.Feature.JS_PRIORITY_GROUPS, "2.11.0");
        this.disabled.forEach((f) => {
          this.features.delete(f);
        });
      }
      /**
       * Register a feature that requires a particular server version.
       * @param f
       * @param requires
       */
      set(f, requires) {
        this.features.set(f, {
          min: requires,
          ok: compare(this.server, parseSemVer(requires)) >= 0
        });
      }
      /**
       * Returns whether the feature is available and the min server
       * version that supports it.
       * @param f
       */
      get(f) {
        return this.features.get(f) || { min: "unknown", ok: false };
      }
      /**
       * Returns true if the feature is supported
       * @param f
       */
      supports(f) {
        var _a;
        return ((_a = this.get(f)) == null ? void 0 : _a.ok) || false;
      }
      /**
       * Returns true if the server is at least the specified version
       * @param v
       */
      require(v) {
        if (typeof v === "string") {
          v = parseSemVer(v);
        }
        return compare(this.server, v) >= 0;
      }
    };
    __name(_Features, "Features");
    var Features = _Features;
    exports2.Features = Features;
  }
});

// node_modules/@nats-io/nkeys/lib/crc16.js
var require_crc16 = __commonJS({
  "node_modules/@nats-io/nkeys/lib/crc16.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.crc16 = void 0;
    var crc16tab = new Uint16Array([
      0,
      4129,
      8258,
      12387,
      16516,
      20645,
      24774,
      28903,
      33032,
      37161,
      41290,
      45419,
      49548,
      53677,
      57806,
      61935,
      4657,
      528,
      12915,
      8786,
      21173,
      17044,
      29431,
      25302,
      37689,
      33560,
      45947,
      41818,
      54205,
      50076,
      62463,
      58334,
      9314,
      13379,
      1056,
      5121,
      25830,
      29895,
      17572,
      21637,
      42346,
      46411,
      34088,
      38153,
      58862,
      62927,
      50604,
      54669,
      13907,
      9842,
      5649,
      1584,
      30423,
      26358,
      22165,
      18100,
      46939,
      42874,
      38681,
      34616,
      63455,
      59390,
      55197,
      51132,
      18628,
      22757,
      26758,
      30887,
      2112,
      6241,
      10242,
      14371,
      51660,
      55789,
      59790,
      63919,
      35144,
      39273,
      43274,
      47403,
      23285,
      19156,
      31415,
      27286,
      6769,
      2640,
      14899,
      10770,
      56317,
      52188,
      64447,
      60318,
      39801,
      35672,
      47931,
      43802,
      27814,
      31879,
      19684,
      23749,
      11298,
      15363,
      3168,
      7233,
      60846,
      64911,
      52716,
      56781,
      44330,
      48395,
      36200,
      40265,
      32407,
      28342,
      24277,
      20212,
      15891,
      11826,
      7761,
      3696,
      65439,
      61374,
      57309,
      53244,
      48923,
      44858,
      40793,
      36728,
      37256,
      33193,
      45514,
      41451,
      53516,
      49453,
      61774,
      57711,
      4224,
      161,
      12482,
      8419,
      20484,
      16421,
      28742,
      24679,
      33721,
      37784,
      41979,
      46042,
      49981,
      54044,
      58239,
      62302,
      689,
      4752,
      8947,
      13010,
      16949,
      21012,
      25207,
      29270,
      46570,
      42443,
      38312,
      34185,
      62830,
      58703,
      54572,
      50445,
      13538,
      9411,
      5280,
      1153,
      29798,
      25671,
      21540,
      17413,
      42971,
      47098,
      34713,
      38840,
      59231,
      63358,
      50973,
      55100,
      9939,
      14066,
      1681,
      5808,
      26199,
      30326,
      17941,
      22068,
      55628,
      51565,
      63758,
      59695,
      39368,
      35305,
      47498,
      43435,
      22596,
      18533,
      30726,
      26663,
      6336,
      2273,
      14466,
      10403,
      52093,
      56156,
      60223,
      64286,
      35833,
      39896,
      43963,
      48026,
      19061,
      23124,
      27191,
      31254,
      2801,
      6864,
      10931,
      14994,
      64814,
      60687,
      56684,
      52557,
      48554,
      44427,
      40424,
      36297,
      31782,
      27655,
      23652,
      19525,
      15522,
      11395,
      7392,
      3265,
      61215,
      65342,
      53085,
      57212,
      44955,
      49082,
      36825,
      40952,
      28183,
      32310,
      20053,
      24180,
      11923,
      16050,
      3793,
      7920
    ]);
    var _crc16 = class _crc16 {
      // crc16 returns the crc for the data provided.
      static checksum(data) {
        let crc = 0;
        for (let i = 0; i < data.byteLength; i++) {
          const b = data[i];
          crc = crc << 8 & 65535 ^ crc16tab[(crc >> 8 ^ b) & 255];
        }
        return crc;
      }
      // validate will check the calculated crc16 checksum for data against the expected.
      static validate(data, expected) {
        const ba = _crc16.checksum(data);
        return ba == expected;
      }
    };
    __name(_crc16, "crc16");
    var crc16 = _crc16;
    exports2.crc16 = crc16;
  }
});

// node_modules/@nats-io/nkeys/lib/base32.js
var require_base32 = __commonJS({
  "node_modules/@nats-io/nkeys/lib/base32.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.base32 = void 0;
    var b32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var _base32 = class _base32 {
      static encode(src) {
        let bits = 0;
        let value = 0;
        const a = new Uint8Array(src);
        const buf = new Uint8Array(src.byteLength * 2);
        let j = 0;
        for (let i = 0; i < a.byteLength; i++) {
          value = value << 8 | a[i];
          bits += 8;
          while (bits >= 5) {
            const index = value >>> bits - 5 & 31;
            buf[j++] = b32Alphabet.charAt(index).charCodeAt(0);
            bits -= 5;
          }
        }
        if (bits > 0) {
          const index = value << 5 - bits & 31;
          buf[j++] = b32Alphabet.charAt(index).charCodeAt(0);
        }
        return buf.slice(0, j);
      }
      static decode(src) {
        let bits = 0;
        let byte = 0;
        let j = 0;
        const a = new Uint8Array(src);
        const out = new Uint8Array(a.byteLength * 5 / 8 | 0);
        for (let i = 0; i < a.byteLength; i++) {
          const v = String.fromCharCode(a[i]);
          const vv = b32Alphabet.indexOf(v);
          if (vv === -1) {
            throw new Error("Illegal Base32 character: " + a[i]);
          }
          byte = byte << 5 | vv;
          bits += 5;
          if (bits >= 8) {
            out[j++] = byte >>> bits - 8 & 255;
            bits -= 8;
          }
        }
        return out.slice(0, j);
      }
    };
    __name(_base32, "base32");
    var base32 = _base32;
    exports2.base32 = base32;
  }
});

// node_modules/@nats-io/nkeys/lib/codec.js
var require_codec = __commonJS({
  "node_modules/@nats-io/nkeys/lib/codec.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Codec = void 0;
    var crc16_1 = require_crc16();
    var nkeys_1 = require_nkeys();
    var base32_1 = require_base32();
    var _Codec = class _Codec {
      static encode(prefix, src) {
        if (!src || !(src instanceof Uint8Array)) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.SerializationError);
        }
        if (!nkeys_1.Prefixes.isValidPrefix(prefix)) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidPrefixByte);
        }
        return _Codec._encode(false, prefix, src);
      }
      static encodeSeed(role, src) {
        if (!src) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ApiError);
        }
        if (!nkeys_1.Prefixes.isValidPublicPrefix(role)) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidPrefixByte);
        }
        if (src.byteLength !== 32) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidSeedLen);
        }
        return _Codec._encode(true, role, src);
      }
      static decode(expected, src) {
        if (!nkeys_1.Prefixes.isValidPrefix(expected)) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidPrefixByte);
        }
        const raw = _Codec._decode(src);
        if (raw[0] !== expected) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidPrefixByte);
        }
        return raw.slice(1);
      }
      static decodeSeed(src) {
        const raw = _Codec._decode(src);
        const prefix = _Codec._decodePrefix(raw);
        if (prefix[0] != nkeys_1.Prefix.Seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidSeed);
        }
        if (!nkeys_1.Prefixes.isValidPublicPrefix(prefix[1])) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidPrefixByte);
        }
        return { buf: raw.slice(2), prefix: prefix[1] };
      }
      // unsafe encode no prefix/role validation
      static _encode(seed, role, payload) {
        const payloadOffset = seed ? 2 : 1;
        const payloadLen = payload.byteLength;
        const checkLen = 2;
        const cap = payloadOffset + payloadLen + checkLen;
        const checkOffset = payloadOffset + payloadLen;
        const raw = new Uint8Array(cap);
        if (seed) {
          const encodedPrefix = _Codec._encodePrefix(nkeys_1.Prefix.Seed, role);
          raw.set(encodedPrefix);
        } else {
          raw[0] = role;
        }
        raw.set(payload, payloadOffset);
        const checksum = crc16_1.crc16.checksum(raw.slice(0, checkOffset));
        const dv = new DataView(raw.buffer);
        dv.setUint16(checkOffset, checksum, true);
        return base32_1.base32.encode(raw);
      }
      // unsafe decode - no prefix/role validation
      static _decode(src) {
        if (src.byteLength < 4) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidEncoding);
        }
        let raw;
        try {
          raw = base32_1.base32.decode(src);
        } catch (ex) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidEncoding, { cause: ex });
        }
        const checkOffset = raw.byteLength - 2;
        const dv = new DataView(raw.buffer);
        const checksum = dv.getUint16(checkOffset, true);
        const payload = raw.slice(0, checkOffset);
        if (!crc16_1.crc16.validate(payload, checksum)) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidChecksum);
        }
        return payload;
      }
      static _encodePrefix(kind, role) {
        const b1 = kind | role >> 5;
        const b2 = (role & 31) << 3;
        return new Uint8Array([b1, b2]);
      }
      static _decodePrefix(raw) {
        const b1 = raw[0] & 248;
        const b2 = (raw[0] & 7) << 5 | (raw[1] & 248) >> 3;
        return new Uint8Array([b1, b2]);
      }
    };
    __name(_Codec, "Codec");
    var Codec = _Codec;
    exports2.Codec = Codec;
  }
});

// node_modules/tweetnacl/nacl-fast.js
var require_nacl_fast = __commonJS({
  "node_modules/tweetnacl/nacl-fast.js"(exports2, module2) {
    (function(nacl) {
      "use strict";
      var gf = /* @__PURE__ */ __name(function(init) {
        var i, r = new Float64Array(16);
        if (init) for (i = 0; i < init.length; i++) r[i] = init[i];
        return r;
      }, "gf");
      var randombytes = /* @__PURE__ */ __name(function() {
        throw new Error("no PRNG");
      }, "randombytes");
      var _0 = new Uint8Array(16);
      var _9 = new Uint8Array(32);
      _9[0] = 9;
      var gf0 = gf(), gf1 = gf([1]), _121665 = gf([56129, 1]), D = gf([30883, 4953, 19914, 30187, 55467, 16705, 2637, 112, 59544, 30585, 16505, 36039, 65139, 11119, 27886, 20995]), D2 = gf([61785, 9906, 39828, 60374, 45398, 33411, 5274, 224, 53552, 61171, 33010, 6542, 64743, 22239, 55772, 9222]), X = gf([54554, 36645, 11616, 51542, 42930, 38181, 51040, 26924, 56412, 64982, 57905, 49316, 21502, 52590, 14035, 8553]), Y = gf([26200, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214]), I = gf([41136, 18958, 6951, 50414, 58488, 44335, 6150, 12099, 55207, 15867, 153, 11085, 57099, 20417, 9344, 11139]);
      function ts64(x, i, h, l) {
        x[i] = h >> 24 & 255;
        x[i + 1] = h >> 16 & 255;
        x[i + 2] = h >> 8 & 255;
        x[i + 3] = h & 255;
        x[i + 4] = l >> 24 & 255;
        x[i + 5] = l >> 16 & 255;
        x[i + 6] = l >> 8 & 255;
        x[i + 7] = l & 255;
      }
      __name(ts64, "ts64");
      function vn(x, xi, y, yi, n) {
        var i, d = 0;
        for (i = 0; i < n; i++) d |= x[xi + i] ^ y[yi + i];
        return (1 & d - 1 >>> 8) - 1;
      }
      __name(vn, "vn");
      function crypto_verify_16(x, xi, y, yi) {
        return vn(x, xi, y, yi, 16);
      }
      __name(crypto_verify_16, "crypto_verify_16");
      function crypto_verify_32(x, xi, y, yi) {
        return vn(x, xi, y, yi, 32);
      }
      __name(crypto_verify_32, "crypto_verify_32");
      function core_salsa20(o, p, k, c) {
        var j0 = c[0] & 255 | (c[1] & 255) << 8 | (c[2] & 255) << 16 | (c[3] & 255) << 24, j1 = k[0] & 255 | (k[1] & 255) << 8 | (k[2] & 255) << 16 | (k[3] & 255) << 24, j2 = k[4] & 255 | (k[5] & 255) << 8 | (k[6] & 255) << 16 | (k[7] & 255) << 24, j3 = k[8] & 255 | (k[9] & 255) << 8 | (k[10] & 255) << 16 | (k[11] & 255) << 24, j4 = k[12] & 255 | (k[13] & 255) << 8 | (k[14] & 255) << 16 | (k[15] & 255) << 24, j5 = c[4] & 255 | (c[5] & 255) << 8 | (c[6] & 255) << 16 | (c[7] & 255) << 24, j6 = p[0] & 255 | (p[1] & 255) << 8 | (p[2] & 255) << 16 | (p[3] & 255) << 24, j7 = p[4] & 255 | (p[5] & 255) << 8 | (p[6] & 255) << 16 | (p[7] & 255) << 24, j8 = p[8] & 255 | (p[9] & 255) << 8 | (p[10] & 255) << 16 | (p[11] & 255) << 24, j9 = p[12] & 255 | (p[13] & 255) << 8 | (p[14] & 255) << 16 | (p[15] & 255) << 24, j10 = c[8] & 255 | (c[9] & 255) << 8 | (c[10] & 255) << 16 | (c[11] & 255) << 24, j11 = k[16] & 255 | (k[17] & 255) << 8 | (k[18] & 255) << 16 | (k[19] & 255) << 24, j12 = k[20] & 255 | (k[21] & 255) << 8 | (k[22] & 255) << 16 | (k[23] & 255) << 24, j13 = k[24] & 255 | (k[25] & 255) << 8 | (k[26] & 255) << 16 | (k[27] & 255) << 24, j14 = k[28] & 255 | (k[29] & 255) << 8 | (k[30] & 255) << 16 | (k[31] & 255) << 24, j15 = c[12] & 255 | (c[13] & 255) << 8 | (c[14] & 255) << 16 | (c[15] & 255) << 24;
        var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7, x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15, u;
        for (var i = 0; i < 20; i += 2) {
          u = x0 + x12 | 0;
          x4 ^= u << 7 | u >>> 32 - 7;
          u = x4 + x0 | 0;
          x8 ^= u << 9 | u >>> 32 - 9;
          u = x8 + x4 | 0;
          x12 ^= u << 13 | u >>> 32 - 13;
          u = x12 + x8 | 0;
          x0 ^= u << 18 | u >>> 32 - 18;
          u = x5 + x1 | 0;
          x9 ^= u << 7 | u >>> 32 - 7;
          u = x9 + x5 | 0;
          x13 ^= u << 9 | u >>> 32 - 9;
          u = x13 + x9 | 0;
          x1 ^= u << 13 | u >>> 32 - 13;
          u = x1 + x13 | 0;
          x5 ^= u << 18 | u >>> 32 - 18;
          u = x10 + x6 | 0;
          x14 ^= u << 7 | u >>> 32 - 7;
          u = x14 + x10 | 0;
          x2 ^= u << 9 | u >>> 32 - 9;
          u = x2 + x14 | 0;
          x6 ^= u << 13 | u >>> 32 - 13;
          u = x6 + x2 | 0;
          x10 ^= u << 18 | u >>> 32 - 18;
          u = x15 + x11 | 0;
          x3 ^= u << 7 | u >>> 32 - 7;
          u = x3 + x15 | 0;
          x7 ^= u << 9 | u >>> 32 - 9;
          u = x7 + x3 | 0;
          x11 ^= u << 13 | u >>> 32 - 13;
          u = x11 + x7 | 0;
          x15 ^= u << 18 | u >>> 32 - 18;
          u = x0 + x3 | 0;
          x1 ^= u << 7 | u >>> 32 - 7;
          u = x1 + x0 | 0;
          x2 ^= u << 9 | u >>> 32 - 9;
          u = x2 + x1 | 0;
          x3 ^= u << 13 | u >>> 32 - 13;
          u = x3 + x2 | 0;
          x0 ^= u << 18 | u >>> 32 - 18;
          u = x5 + x4 | 0;
          x6 ^= u << 7 | u >>> 32 - 7;
          u = x6 + x5 | 0;
          x7 ^= u << 9 | u >>> 32 - 9;
          u = x7 + x6 | 0;
          x4 ^= u << 13 | u >>> 32 - 13;
          u = x4 + x7 | 0;
          x5 ^= u << 18 | u >>> 32 - 18;
          u = x10 + x9 | 0;
          x11 ^= u << 7 | u >>> 32 - 7;
          u = x11 + x10 | 0;
          x8 ^= u << 9 | u >>> 32 - 9;
          u = x8 + x11 | 0;
          x9 ^= u << 13 | u >>> 32 - 13;
          u = x9 + x8 | 0;
          x10 ^= u << 18 | u >>> 32 - 18;
          u = x15 + x14 | 0;
          x12 ^= u << 7 | u >>> 32 - 7;
          u = x12 + x15 | 0;
          x13 ^= u << 9 | u >>> 32 - 9;
          u = x13 + x12 | 0;
          x14 ^= u << 13 | u >>> 32 - 13;
          u = x14 + x13 | 0;
          x15 ^= u << 18 | u >>> 32 - 18;
        }
        x0 = x0 + j0 | 0;
        x1 = x1 + j1 | 0;
        x2 = x2 + j2 | 0;
        x3 = x3 + j3 | 0;
        x4 = x4 + j4 | 0;
        x5 = x5 + j5 | 0;
        x6 = x6 + j6 | 0;
        x7 = x7 + j7 | 0;
        x8 = x8 + j8 | 0;
        x9 = x9 + j9 | 0;
        x10 = x10 + j10 | 0;
        x11 = x11 + j11 | 0;
        x12 = x12 + j12 | 0;
        x13 = x13 + j13 | 0;
        x14 = x14 + j14 | 0;
        x15 = x15 + j15 | 0;
        o[0] = x0 >>> 0 & 255;
        o[1] = x0 >>> 8 & 255;
        o[2] = x0 >>> 16 & 255;
        o[3] = x0 >>> 24 & 255;
        o[4] = x1 >>> 0 & 255;
        o[5] = x1 >>> 8 & 255;
        o[6] = x1 >>> 16 & 255;
        o[7] = x1 >>> 24 & 255;
        o[8] = x2 >>> 0 & 255;
        o[9] = x2 >>> 8 & 255;
        o[10] = x2 >>> 16 & 255;
        o[11] = x2 >>> 24 & 255;
        o[12] = x3 >>> 0 & 255;
        o[13] = x3 >>> 8 & 255;
        o[14] = x3 >>> 16 & 255;
        o[15] = x3 >>> 24 & 255;
        o[16] = x4 >>> 0 & 255;
        o[17] = x4 >>> 8 & 255;
        o[18] = x4 >>> 16 & 255;
        o[19] = x4 >>> 24 & 255;
        o[20] = x5 >>> 0 & 255;
        o[21] = x5 >>> 8 & 255;
        o[22] = x5 >>> 16 & 255;
        o[23] = x5 >>> 24 & 255;
        o[24] = x6 >>> 0 & 255;
        o[25] = x6 >>> 8 & 255;
        o[26] = x6 >>> 16 & 255;
        o[27] = x6 >>> 24 & 255;
        o[28] = x7 >>> 0 & 255;
        o[29] = x7 >>> 8 & 255;
        o[30] = x7 >>> 16 & 255;
        o[31] = x7 >>> 24 & 255;
        o[32] = x8 >>> 0 & 255;
        o[33] = x8 >>> 8 & 255;
        o[34] = x8 >>> 16 & 255;
        o[35] = x8 >>> 24 & 255;
        o[36] = x9 >>> 0 & 255;
        o[37] = x9 >>> 8 & 255;
        o[38] = x9 >>> 16 & 255;
        o[39] = x9 >>> 24 & 255;
        o[40] = x10 >>> 0 & 255;
        o[41] = x10 >>> 8 & 255;
        o[42] = x10 >>> 16 & 255;
        o[43] = x10 >>> 24 & 255;
        o[44] = x11 >>> 0 & 255;
        o[45] = x11 >>> 8 & 255;
        o[46] = x11 >>> 16 & 255;
        o[47] = x11 >>> 24 & 255;
        o[48] = x12 >>> 0 & 255;
        o[49] = x12 >>> 8 & 255;
        o[50] = x12 >>> 16 & 255;
        o[51] = x12 >>> 24 & 255;
        o[52] = x13 >>> 0 & 255;
        o[53] = x13 >>> 8 & 255;
        o[54] = x13 >>> 16 & 255;
        o[55] = x13 >>> 24 & 255;
        o[56] = x14 >>> 0 & 255;
        o[57] = x14 >>> 8 & 255;
        o[58] = x14 >>> 16 & 255;
        o[59] = x14 >>> 24 & 255;
        o[60] = x15 >>> 0 & 255;
        o[61] = x15 >>> 8 & 255;
        o[62] = x15 >>> 16 & 255;
        o[63] = x15 >>> 24 & 255;
      }
      __name(core_salsa20, "core_salsa20");
      function core_hsalsa20(o, p, k, c) {
        var j0 = c[0] & 255 | (c[1] & 255) << 8 | (c[2] & 255) << 16 | (c[3] & 255) << 24, j1 = k[0] & 255 | (k[1] & 255) << 8 | (k[2] & 255) << 16 | (k[3] & 255) << 24, j2 = k[4] & 255 | (k[5] & 255) << 8 | (k[6] & 255) << 16 | (k[7] & 255) << 24, j3 = k[8] & 255 | (k[9] & 255) << 8 | (k[10] & 255) << 16 | (k[11] & 255) << 24, j4 = k[12] & 255 | (k[13] & 255) << 8 | (k[14] & 255) << 16 | (k[15] & 255) << 24, j5 = c[4] & 255 | (c[5] & 255) << 8 | (c[6] & 255) << 16 | (c[7] & 255) << 24, j6 = p[0] & 255 | (p[1] & 255) << 8 | (p[2] & 255) << 16 | (p[3] & 255) << 24, j7 = p[4] & 255 | (p[5] & 255) << 8 | (p[6] & 255) << 16 | (p[7] & 255) << 24, j8 = p[8] & 255 | (p[9] & 255) << 8 | (p[10] & 255) << 16 | (p[11] & 255) << 24, j9 = p[12] & 255 | (p[13] & 255) << 8 | (p[14] & 255) << 16 | (p[15] & 255) << 24, j10 = c[8] & 255 | (c[9] & 255) << 8 | (c[10] & 255) << 16 | (c[11] & 255) << 24, j11 = k[16] & 255 | (k[17] & 255) << 8 | (k[18] & 255) << 16 | (k[19] & 255) << 24, j12 = k[20] & 255 | (k[21] & 255) << 8 | (k[22] & 255) << 16 | (k[23] & 255) << 24, j13 = k[24] & 255 | (k[25] & 255) << 8 | (k[26] & 255) << 16 | (k[27] & 255) << 24, j14 = k[28] & 255 | (k[29] & 255) << 8 | (k[30] & 255) << 16 | (k[31] & 255) << 24, j15 = c[12] & 255 | (c[13] & 255) << 8 | (c[14] & 255) << 16 | (c[15] & 255) << 24;
        var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7, x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15, u;
        for (var i = 0; i < 20; i += 2) {
          u = x0 + x12 | 0;
          x4 ^= u << 7 | u >>> 32 - 7;
          u = x4 + x0 | 0;
          x8 ^= u << 9 | u >>> 32 - 9;
          u = x8 + x4 | 0;
          x12 ^= u << 13 | u >>> 32 - 13;
          u = x12 + x8 | 0;
          x0 ^= u << 18 | u >>> 32 - 18;
          u = x5 + x1 | 0;
          x9 ^= u << 7 | u >>> 32 - 7;
          u = x9 + x5 | 0;
          x13 ^= u << 9 | u >>> 32 - 9;
          u = x13 + x9 | 0;
          x1 ^= u << 13 | u >>> 32 - 13;
          u = x1 + x13 | 0;
          x5 ^= u << 18 | u >>> 32 - 18;
          u = x10 + x6 | 0;
          x14 ^= u << 7 | u >>> 32 - 7;
          u = x14 + x10 | 0;
          x2 ^= u << 9 | u >>> 32 - 9;
          u = x2 + x14 | 0;
          x6 ^= u << 13 | u >>> 32 - 13;
          u = x6 + x2 | 0;
          x10 ^= u << 18 | u >>> 32 - 18;
          u = x15 + x11 | 0;
          x3 ^= u << 7 | u >>> 32 - 7;
          u = x3 + x15 | 0;
          x7 ^= u << 9 | u >>> 32 - 9;
          u = x7 + x3 | 0;
          x11 ^= u << 13 | u >>> 32 - 13;
          u = x11 + x7 | 0;
          x15 ^= u << 18 | u >>> 32 - 18;
          u = x0 + x3 | 0;
          x1 ^= u << 7 | u >>> 32 - 7;
          u = x1 + x0 | 0;
          x2 ^= u << 9 | u >>> 32 - 9;
          u = x2 + x1 | 0;
          x3 ^= u << 13 | u >>> 32 - 13;
          u = x3 + x2 | 0;
          x0 ^= u << 18 | u >>> 32 - 18;
          u = x5 + x4 | 0;
          x6 ^= u << 7 | u >>> 32 - 7;
          u = x6 + x5 | 0;
          x7 ^= u << 9 | u >>> 32 - 9;
          u = x7 + x6 | 0;
          x4 ^= u << 13 | u >>> 32 - 13;
          u = x4 + x7 | 0;
          x5 ^= u << 18 | u >>> 32 - 18;
          u = x10 + x9 | 0;
          x11 ^= u << 7 | u >>> 32 - 7;
          u = x11 + x10 | 0;
          x8 ^= u << 9 | u >>> 32 - 9;
          u = x8 + x11 | 0;
          x9 ^= u << 13 | u >>> 32 - 13;
          u = x9 + x8 | 0;
          x10 ^= u << 18 | u >>> 32 - 18;
          u = x15 + x14 | 0;
          x12 ^= u << 7 | u >>> 32 - 7;
          u = x12 + x15 | 0;
          x13 ^= u << 9 | u >>> 32 - 9;
          u = x13 + x12 | 0;
          x14 ^= u << 13 | u >>> 32 - 13;
          u = x14 + x13 | 0;
          x15 ^= u << 18 | u >>> 32 - 18;
        }
        o[0] = x0 >>> 0 & 255;
        o[1] = x0 >>> 8 & 255;
        o[2] = x0 >>> 16 & 255;
        o[3] = x0 >>> 24 & 255;
        o[4] = x5 >>> 0 & 255;
        o[5] = x5 >>> 8 & 255;
        o[6] = x5 >>> 16 & 255;
        o[7] = x5 >>> 24 & 255;
        o[8] = x10 >>> 0 & 255;
        o[9] = x10 >>> 8 & 255;
        o[10] = x10 >>> 16 & 255;
        o[11] = x10 >>> 24 & 255;
        o[12] = x15 >>> 0 & 255;
        o[13] = x15 >>> 8 & 255;
        o[14] = x15 >>> 16 & 255;
        o[15] = x15 >>> 24 & 255;
        o[16] = x6 >>> 0 & 255;
        o[17] = x6 >>> 8 & 255;
        o[18] = x6 >>> 16 & 255;
        o[19] = x6 >>> 24 & 255;
        o[20] = x7 >>> 0 & 255;
        o[21] = x7 >>> 8 & 255;
        o[22] = x7 >>> 16 & 255;
        o[23] = x7 >>> 24 & 255;
        o[24] = x8 >>> 0 & 255;
        o[25] = x8 >>> 8 & 255;
        o[26] = x8 >>> 16 & 255;
        o[27] = x8 >>> 24 & 255;
        o[28] = x9 >>> 0 & 255;
        o[29] = x9 >>> 8 & 255;
        o[30] = x9 >>> 16 & 255;
        o[31] = x9 >>> 24 & 255;
      }
      __name(core_hsalsa20, "core_hsalsa20");
      function crypto_core_salsa20(out, inp, k, c) {
        core_salsa20(out, inp, k, c);
      }
      __name(crypto_core_salsa20, "crypto_core_salsa20");
      function crypto_core_hsalsa20(out, inp, k, c) {
        core_hsalsa20(out, inp, k, c);
      }
      __name(crypto_core_hsalsa20, "crypto_core_hsalsa20");
      var sigma = new Uint8Array([101, 120, 112, 97, 110, 100, 32, 51, 50, 45, 98, 121, 116, 101, 32, 107]);
      function crypto_stream_salsa20_xor(c, cpos, m, mpos, b, n, k) {
        var z = new Uint8Array(16), x = new Uint8Array(64);
        var u, i;
        for (i = 0; i < 16; i++) z[i] = 0;
        for (i = 0; i < 8; i++) z[i] = n[i];
        while (b >= 64) {
          crypto_core_salsa20(x, z, k, sigma);
          for (i = 0; i < 64; i++) c[cpos + i] = m[mpos + i] ^ x[i];
          u = 1;
          for (i = 8; i < 16; i++) {
            u = u + (z[i] & 255) | 0;
            z[i] = u & 255;
            u >>>= 8;
          }
          b -= 64;
          cpos += 64;
          mpos += 64;
        }
        if (b > 0) {
          crypto_core_salsa20(x, z, k, sigma);
          for (i = 0; i < b; i++) c[cpos + i] = m[mpos + i] ^ x[i];
        }
        return 0;
      }
      __name(crypto_stream_salsa20_xor, "crypto_stream_salsa20_xor");
      function crypto_stream_salsa20(c, cpos, b, n, k) {
        var z = new Uint8Array(16), x = new Uint8Array(64);
        var u, i;
        for (i = 0; i < 16; i++) z[i] = 0;
        for (i = 0; i < 8; i++) z[i] = n[i];
        while (b >= 64) {
          crypto_core_salsa20(x, z, k, sigma);
          for (i = 0; i < 64; i++) c[cpos + i] = x[i];
          u = 1;
          for (i = 8; i < 16; i++) {
            u = u + (z[i] & 255) | 0;
            z[i] = u & 255;
            u >>>= 8;
          }
          b -= 64;
          cpos += 64;
        }
        if (b > 0) {
          crypto_core_salsa20(x, z, k, sigma);
          for (i = 0; i < b; i++) c[cpos + i] = x[i];
        }
        return 0;
      }
      __name(crypto_stream_salsa20, "crypto_stream_salsa20");
      function crypto_stream(c, cpos, d, n, k) {
        var s = new Uint8Array(32);
        crypto_core_hsalsa20(s, n, k, sigma);
        var sn = new Uint8Array(8);
        for (var i = 0; i < 8; i++) sn[i] = n[i + 16];
        return crypto_stream_salsa20(c, cpos, d, sn, s);
      }
      __name(crypto_stream, "crypto_stream");
      function crypto_stream_xor(c, cpos, m, mpos, d, n, k) {
        var s = new Uint8Array(32);
        crypto_core_hsalsa20(s, n, k, sigma);
        var sn = new Uint8Array(8);
        for (var i = 0; i < 8; i++) sn[i] = n[i + 16];
        return crypto_stream_salsa20_xor(c, cpos, m, mpos, d, sn, s);
      }
      __name(crypto_stream_xor, "crypto_stream_xor");
      var poly1305 = /* @__PURE__ */ __name(function(key) {
        this.buffer = new Uint8Array(16);
        this.r = new Uint16Array(10);
        this.h = new Uint16Array(10);
        this.pad = new Uint16Array(8);
        this.leftover = 0;
        this.fin = 0;
        var t0, t1, t2, t3, t4, t5, t6, t7;
        t0 = key[0] & 255 | (key[1] & 255) << 8;
        this.r[0] = t0 & 8191;
        t1 = key[2] & 255 | (key[3] & 255) << 8;
        this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
        t2 = key[4] & 255 | (key[5] & 255) << 8;
        this.r[2] = (t1 >>> 10 | t2 << 6) & 7939;
        t3 = key[6] & 255 | (key[7] & 255) << 8;
        this.r[3] = (t2 >>> 7 | t3 << 9) & 8191;
        t4 = key[8] & 255 | (key[9] & 255) << 8;
        this.r[4] = (t3 >>> 4 | t4 << 12) & 255;
        this.r[5] = t4 >>> 1 & 8190;
        t5 = key[10] & 255 | (key[11] & 255) << 8;
        this.r[6] = (t4 >>> 14 | t5 << 2) & 8191;
        t6 = key[12] & 255 | (key[13] & 255) << 8;
        this.r[7] = (t5 >>> 11 | t6 << 5) & 8065;
        t7 = key[14] & 255 | (key[15] & 255) << 8;
        this.r[8] = (t6 >>> 8 | t7 << 8) & 8191;
        this.r[9] = t7 >>> 5 & 127;
        this.pad[0] = key[16] & 255 | (key[17] & 255) << 8;
        this.pad[1] = key[18] & 255 | (key[19] & 255) << 8;
        this.pad[2] = key[20] & 255 | (key[21] & 255) << 8;
        this.pad[3] = key[22] & 255 | (key[23] & 255) << 8;
        this.pad[4] = key[24] & 255 | (key[25] & 255) << 8;
        this.pad[5] = key[26] & 255 | (key[27] & 255) << 8;
        this.pad[6] = key[28] & 255 | (key[29] & 255) << 8;
        this.pad[7] = key[30] & 255 | (key[31] & 255) << 8;
      }, "poly1305");
      poly1305.prototype.blocks = function(m, mpos, bytes) {
        var hibit = this.fin ? 0 : 1 << 11;
        var t0, t1, t2, t3, t4, t5, t6, t7, c;
        var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9;
        var h0 = this.h[0], h1 = this.h[1], h2 = this.h[2], h3 = this.h[3], h4 = this.h[4], h5 = this.h[5], h6 = this.h[6], h7 = this.h[7], h8 = this.h[8], h9 = this.h[9];
        var r0 = this.r[0], r1 = this.r[1], r2 = this.r[2], r3 = this.r[3], r4 = this.r[4], r5 = this.r[5], r6 = this.r[6], r7 = this.r[7], r8 = this.r[8], r9 = this.r[9];
        while (bytes >= 16) {
          t0 = m[mpos + 0] & 255 | (m[mpos + 1] & 255) << 8;
          h0 += t0 & 8191;
          t1 = m[mpos + 2] & 255 | (m[mpos + 3] & 255) << 8;
          h1 += (t0 >>> 13 | t1 << 3) & 8191;
          t2 = m[mpos + 4] & 255 | (m[mpos + 5] & 255) << 8;
          h2 += (t1 >>> 10 | t2 << 6) & 8191;
          t3 = m[mpos + 6] & 255 | (m[mpos + 7] & 255) << 8;
          h3 += (t2 >>> 7 | t3 << 9) & 8191;
          t4 = m[mpos + 8] & 255 | (m[mpos + 9] & 255) << 8;
          h4 += (t3 >>> 4 | t4 << 12) & 8191;
          h5 += t4 >>> 1 & 8191;
          t5 = m[mpos + 10] & 255 | (m[mpos + 11] & 255) << 8;
          h6 += (t4 >>> 14 | t5 << 2) & 8191;
          t6 = m[mpos + 12] & 255 | (m[mpos + 13] & 255) << 8;
          h7 += (t5 >>> 11 | t6 << 5) & 8191;
          t7 = m[mpos + 14] & 255 | (m[mpos + 15] & 255) << 8;
          h8 += (t6 >>> 8 | t7 << 8) & 8191;
          h9 += t7 >>> 5 | hibit;
          c = 0;
          d0 = c;
          d0 += h0 * r0;
          d0 += h1 * (5 * r9);
          d0 += h2 * (5 * r8);
          d0 += h3 * (5 * r7);
          d0 += h4 * (5 * r6);
          c = d0 >>> 13;
          d0 &= 8191;
          d0 += h5 * (5 * r5);
          d0 += h6 * (5 * r4);
          d0 += h7 * (5 * r3);
          d0 += h8 * (5 * r2);
          d0 += h9 * (5 * r1);
          c += d0 >>> 13;
          d0 &= 8191;
          d1 = c;
          d1 += h0 * r1;
          d1 += h1 * r0;
          d1 += h2 * (5 * r9);
          d1 += h3 * (5 * r8);
          d1 += h4 * (5 * r7);
          c = d1 >>> 13;
          d1 &= 8191;
          d1 += h5 * (5 * r6);
          d1 += h6 * (5 * r5);
          d1 += h7 * (5 * r4);
          d1 += h8 * (5 * r3);
          d1 += h9 * (5 * r2);
          c += d1 >>> 13;
          d1 &= 8191;
          d2 = c;
          d2 += h0 * r2;
          d2 += h1 * r1;
          d2 += h2 * r0;
          d2 += h3 * (5 * r9);
          d2 += h4 * (5 * r8);
          c = d2 >>> 13;
          d2 &= 8191;
          d2 += h5 * (5 * r7);
          d2 += h6 * (5 * r6);
          d2 += h7 * (5 * r5);
          d2 += h8 * (5 * r4);
          d2 += h9 * (5 * r3);
          c += d2 >>> 13;
          d2 &= 8191;
          d3 = c;
          d3 += h0 * r3;
          d3 += h1 * r2;
          d3 += h2 * r1;
          d3 += h3 * r0;
          d3 += h4 * (5 * r9);
          c = d3 >>> 13;
          d3 &= 8191;
          d3 += h5 * (5 * r8);
          d3 += h6 * (5 * r7);
          d3 += h7 * (5 * r6);
          d3 += h8 * (5 * r5);
          d3 += h9 * (5 * r4);
          c += d3 >>> 13;
          d3 &= 8191;
          d4 = c;
          d4 += h0 * r4;
          d4 += h1 * r3;
          d4 += h2 * r2;
          d4 += h3 * r1;
          d4 += h4 * r0;
          c = d4 >>> 13;
          d4 &= 8191;
          d4 += h5 * (5 * r9);
          d4 += h6 * (5 * r8);
          d4 += h7 * (5 * r7);
          d4 += h8 * (5 * r6);
          d4 += h9 * (5 * r5);
          c += d4 >>> 13;
          d4 &= 8191;
          d5 = c;
          d5 += h0 * r5;
          d5 += h1 * r4;
          d5 += h2 * r3;
          d5 += h3 * r2;
          d5 += h4 * r1;
          c = d5 >>> 13;
          d5 &= 8191;
          d5 += h5 * r0;
          d5 += h6 * (5 * r9);
          d5 += h7 * (5 * r8);
          d5 += h8 * (5 * r7);
          d5 += h9 * (5 * r6);
          c += d5 >>> 13;
          d5 &= 8191;
          d6 = c;
          d6 += h0 * r6;
          d6 += h1 * r5;
          d6 += h2 * r4;
          d6 += h3 * r3;
          d6 += h4 * r2;
          c = d6 >>> 13;
          d6 &= 8191;
          d6 += h5 * r1;
          d6 += h6 * r0;
          d6 += h7 * (5 * r9);
          d6 += h8 * (5 * r8);
          d6 += h9 * (5 * r7);
          c += d6 >>> 13;
          d6 &= 8191;
          d7 = c;
          d7 += h0 * r7;
          d7 += h1 * r6;
          d7 += h2 * r5;
          d7 += h3 * r4;
          d7 += h4 * r3;
          c = d7 >>> 13;
          d7 &= 8191;
          d7 += h5 * r2;
          d7 += h6 * r1;
          d7 += h7 * r0;
          d7 += h8 * (5 * r9);
          d7 += h9 * (5 * r8);
          c += d7 >>> 13;
          d7 &= 8191;
          d8 = c;
          d8 += h0 * r8;
          d8 += h1 * r7;
          d8 += h2 * r6;
          d8 += h3 * r5;
          d8 += h4 * r4;
          c = d8 >>> 13;
          d8 &= 8191;
          d8 += h5 * r3;
          d8 += h6 * r2;
          d8 += h7 * r1;
          d8 += h8 * r0;
          d8 += h9 * (5 * r9);
          c += d8 >>> 13;
          d8 &= 8191;
          d9 = c;
          d9 += h0 * r9;
          d9 += h1 * r8;
          d9 += h2 * r7;
          d9 += h3 * r6;
          d9 += h4 * r5;
          c = d9 >>> 13;
          d9 &= 8191;
          d9 += h5 * r4;
          d9 += h6 * r3;
          d9 += h7 * r2;
          d9 += h8 * r1;
          d9 += h9 * r0;
          c += d9 >>> 13;
          d9 &= 8191;
          c = (c << 2) + c | 0;
          c = c + d0 | 0;
          d0 = c & 8191;
          c = c >>> 13;
          d1 += c;
          h0 = d0;
          h1 = d1;
          h2 = d2;
          h3 = d3;
          h4 = d4;
          h5 = d5;
          h6 = d6;
          h7 = d7;
          h8 = d8;
          h9 = d9;
          mpos += 16;
          bytes -= 16;
        }
        this.h[0] = h0;
        this.h[1] = h1;
        this.h[2] = h2;
        this.h[3] = h3;
        this.h[4] = h4;
        this.h[5] = h5;
        this.h[6] = h6;
        this.h[7] = h7;
        this.h[8] = h8;
        this.h[9] = h9;
      };
      poly1305.prototype.finish = function(mac, macpos) {
        var g = new Uint16Array(10);
        var c, mask, f, i;
        if (this.leftover) {
          i = this.leftover;
          this.buffer[i++] = 1;
          for (; i < 16; i++) this.buffer[i] = 0;
          this.fin = 1;
          this.blocks(this.buffer, 0, 16);
        }
        c = this.h[1] >>> 13;
        this.h[1] &= 8191;
        for (i = 2; i < 10; i++) {
          this.h[i] += c;
          c = this.h[i] >>> 13;
          this.h[i] &= 8191;
        }
        this.h[0] += c * 5;
        c = this.h[0] >>> 13;
        this.h[0] &= 8191;
        this.h[1] += c;
        c = this.h[1] >>> 13;
        this.h[1] &= 8191;
        this.h[2] += c;
        g[0] = this.h[0] + 5;
        c = g[0] >>> 13;
        g[0] &= 8191;
        for (i = 1; i < 10; i++) {
          g[i] = this.h[i] + c;
          c = g[i] >>> 13;
          g[i] &= 8191;
        }
        g[9] -= 1 << 13;
        mask = (c ^ 1) - 1;
        for (i = 0; i < 10; i++) g[i] &= mask;
        mask = ~mask;
        for (i = 0; i < 10; i++) this.h[i] = this.h[i] & mask | g[i];
        this.h[0] = (this.h[0] | this.h[1] << 13) & 65535;
        this.h[1] = (this.h[1] >>> 3 | this.h[2] << 10) & 65535;
        this.h[2] = (this.h[2] >>> 6 | this.h[3] << 7) & 65535;
        this.h[3] = (this.h[3] >>> 9 | this.h[4] << 4) & 65535;
        this.h[4] = (this.h[4] >>> 12 | this.h[5] << 1 | this.h[6] << 14) & 65535;
        this.h[5] = (this.h[6] >>> 2 | this.h[7] << 11) & 65535;
        this.h[6] = (this.h[7] >>> 5 | this.h[8] << 8) & 65535;
        this.h[7] = (this.h[8] >>> 8 | this.h[9] << 5) & 65535;
        f = this.h[0] + this.pad[0];
        this.h[0] = f & 65535;
        for (i = 1; i < 8; i++) {
          f = (this.h[i] + this.pad[i] | 0) + (f >>> 16) | 0;
          this.h[i] = f & 65535;
        }
        mac[macpos + 0] = this.h[0] >>> 0 & 255;
        mac[macpos + 1] = this.h[0] >>> 8 & 255;
        mac[macpos + 2] = this.h[1] >>> 0 & 255;
        mac[macpos + 3] = this.h[1] >>> 8 & 255;
        mac[macpos + 4] = this.h[2] >>> 0 & 255;
        mac[macpos + 5] = this.h[2] >>> 8 & 255;
        mac[macpos + 6] = this.h[3] >>> 0 & 255;
        mac[macpos + 7] = this.h[3] >>> 8 & 255;
        mac[macpos + 8] = this.h[4] >>> 0 & 255;
        mac[macpos + 9] = this.h[4] >>> 8 & 255;
        mac[macpos + 10] = this.h[5] >>> 0 & 255;
        mac[macpos + 11] = this.h[5] >>> 8 & 255;
        mac[macpos + 12] = this.h[6] >>> 0 & 255;
        mac[macpos + 13] = this.h[6] >>> 8 & 255;
        mac[macpos + 14] = this.h[7] >>> 0 & 255;
        mac[macpos + 15] = this.h[7] >>> 8 & 255;
      };
      poly1305.prototype.update = function(m, mpos, bytes) {
        var i, want;
        if (this.leftover) {
          want = 16 - this.leftover;
          if (want > bytes)
            want = bytes;
          for (i = 0; i < want; i++)
            this.buffer[this.leftover + i] = m[mpos + i];
          bytes -= want;
          mpos += want;
          this.leftover += want;
          if (this.leftover < 16)
            return;
          this.blocks(this.buffer, 0, 16);
          this.leftover = 0;
        }
        if (bytes >= 16) {
          want = bytes - bytes % 16;
          this.blocks(m, mpos, want);
          mpos += want;
          bytes -= want;
        }
        if (bytes) {
          for (i = 0; i < bytes; i++)
            this.buffer[this.leftover + i] = m[mpos + i];
          this.leftover += bytes;
        }
      };
      function crypto_onetimeauth(out, outpos, m, mpos, n, k) {
        var s = new poly1305(k);
        s.update(m, mpos, n);
        s.finish(out, outpos);
        return 0;
      }
      __name(crypto_onetimeauth, "crypto_onetimeauth");
      function crypto_onetimeauth_verify(h, hpos, m, mpos, n, k) {
        var x = new Uint8Array(16);
        crypto_onetimeauth(x, 0, m, mpos, n, k);
        return crypto_verify_16(h, hpos, x, 0);
      }
      __name(crypto_onetimeauth_verify, "crypto_onetimeauth_verify");
      function crypto_secretbox(c, m, d, n, k) {
        var i;
        if (d < 32) return -1;
        crypto_stream_xor(c, 0, m, 0, d, n, k);
        crypto_onetimeauth(c, 16, c, 32, d - 32, c);
        for (i = 0; i < 16; i++) c[i] = 0;
        return 0;
      }
      __name(crypto_secretbox, "crypto_secretbox");
      function crypto_secretbox_open(m, c, d, n, k) {
        var i;
        var x = new Uint8Array(32);
        if (d < 32) return -1;
        crypto_stream(x, 0, 32, n, k);
        if (crypto_onetimeauth_verify(c, 16, c, 32, d - 32, x) !== 0) return -1;
        crypto_stream_xor(m, 0, c, 0, d, n, k);
        for (i = 0; i < 32; i++) m[i] = 0;
        return 0;
      }
      __name(crypto_secretbox_open, "crypto_secretbox_open");
      function set25519(r, a) {
        var i;
        for (i = 0; i < 16; i++) r[i] = a[i] | 0;
      }
      __name(set25519, "set25519");
      function car25519(o) {
        var i, v, c = 1;
        for (i = 0; i < 16; i++) {
          v = o[i] + c + 65535;
          c = Math.floor(v / 65536);
          o[i] = v - c * 65536;
        }
        o[0] += c - 1 + 37 * (c - 1);
      }
      __name(car25519, "car25519");
      function sel25519(p, q, b) {
        var t, c = ~(b - 1);
        for (var i = 0; i < 16; i++) {
          t = c & (p[i] ^ q[i]);
          p[i] ^= t;
          q[i] ^= t;
        }
      }
      __name(sel25519, "sel25519");
      function pack25519(o, n) {
        var i, j, b;
        var m = gf(), t = gf();
        for (i = 0; i < 16; i++) t[i] = n[i];
        car25519(t);
        car25519(t);
        car25519(t);
        for (j = 0; j < 2; j++) {
          m[0] = t[0] - 65517;
          for (i = 1; i < 15; i++) {
            m[i] = t[i] - 65535 - (m[i - 1] >> 16 & 1);
            m[i - 1] &= 65535;
          }
          m[15] = t[15] - 32767 - (m[14] >> 16 & 1);
          b = m[15] >> 16 & 1;
          m[14] &= 65535;
          sel25519(t, m, 1 - b);
        }
        for (i = 0; i < 16; i++) {
          o[2 * i] = t[i] & 255;
          o[2 * i + 1] = t[i] >> 8;
        }
      }
      __name(pack25519, "pack25519");
      function neq25519(a, b) {
        var c = new Uint8Array(32), d = new Uint8Array(32);
        pack25519(c, a);
        pack25519(d, b);
        return crypto_verify_32(c, 0, d, 0);
      }
      __name(neq25519, "neq25519");
      function par25519(a) {
        var d = new Uint8Array(32);
        pack25519(d, a);
        return d[0] & 1;
      }
      __name(par25519, "par25519");
      function unpack25519(o, n) {
        var i;
        for (i = 0; i < 16; i++) o[i] = n[2 * i] + (n[2 * i + 1] << 8);
        o[15] &= 32767;
      }
      __name(unpack25519, "unpack25519");
      function A(o, a, b) {
        for (var i = 0; i < 16; i++) o[i] = a[i] + b[i];
      }
      __name(A, "A");
      function Z(o, a, b) {
        for (var i = 0; i < 16; i++) o[i] = a[i] - b[i];
      }
      __name(Z, "Z");
      function M(o, a, b) {
        var v, c, t0 = 0, t1 = 0, t2 = 0, t3 = 0, t4 = 0, t5 = 0, t6 = 0, t7 = 0, t8 = 0, t9 = 0, t10 = 0, t11 = 0, t12 = 0, t13 = 0, t14 = 0, t15 = 0, t16 = 0, t17 = 0, t18 = 0, t19 = 0, t20 = 0, t21 = 0, t22 = 0, t23 = 0, t24 = 0, t25 = 0, t26 = 0, t27 = 0, t28 = 0, t29 = 0, t30 = 0, b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7], b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11], b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
        v = a[0];
        t0 += v * b0;
        t1 += v * b1;
        t2 += v * b2;
        t3 += v * b3;
        t4 += v * b4;
        t5 += v * b5;
        t6 += v * b6;
        t7 += v * b7;
        t8 += v * b8;
        t9 += v * b9;
        t10 += v * b10;
        t11 += v * b11;
        t12 += v * b12;
        t13 += v * b13;
        t14 += v * b14;
        t15 += v * b15;
        v = a[1];
        t1 += v * b0;
        t2 += v * b1;
        t3 += v * b2;
        t4 += v * b3;
        t5 += v * b4;
        t6 += v * b5;
        t7 += v * b6;
        t8 += v * b7;
        t9 += v * b8;
        t10 += v * b9;
        t11 += v * b10;
        t12 += v * b11;
        t13 += v * b12;
        t14 += v * b13;
        t15 += v * b14;
        t16 += v * b15;
        v = a[2];
        t2 += v * b0;
        t3 += v * b1;
        t4 += v * b2;
        t5 += v * b3;
        t6 += v * b4;
        t7 += v * b5;
        t8 += v * b6;
        t9 += v * b7;
        t10 += v * b8;
        t11 += v * b9;
        t12 += v * b10;
        t13 += v * b11;
        t14 += v * b12;
        t15 += v * b13;
        t16 += v * b14;
        t17 += v * b15;
        v = a[3];
        t3 += v * b0;
        t4 += v * b1;
        t5 += v * b2;
        t6 += v * b3;
        t7 += v * b4;
        t8 += v * b5;
        t9 += v * b6;
        t10 += v * b7;
        t11 += v * b8;
        t12 += v * b9;
        t13 += v * b10;
        t14 += v * b11;
        t15 += v * b12;
        t16 += v * b13;
        t17 += v * b14;
        t18 += v * b15;
        v = a[4];
        t4 += v * b0;
        t5 += v * b1;
        t6 += v * b2;
        t7 += v * b3;
        t8 += v * b4;
        t9 += v * b5;
        t10 += v * b6;
        t11 += v * b7;
        t12 += v * b8;
        t13 += v * b9;
        t14 += v * b10;
        t15 += v * b11;
        t16 += v * b12;
        t17 += v * b13;
        t18 += v * b14;
        t19 += v * b15;
        v = a[5];
        t5 += v * b0;
        t6 += v * b1;
        t7 += v * b2;
        t8 += v * b3;
        t9 += v * b4;
        t10 += v * b5;
        t11 += v * b6;
        t12 += v * b7;
        t13 += v * b8;
        t14 += v * b9;
        t15 += v * b10;
        t16 += v * b11;
        t17 += v * b12;
        t18 += v * b13;
        t19 += v * b14;
        t20 += v * b15;
        v = a[6];
        t6 += v * b0;
        t7 += v * b1;
        t8 += v * b2;
        t9 += v * b3;
        t10 += v * b4;
        t11 += v * b5;
        t12 += v * b6;
        t13 += v * b7;
        t14 += v * b8;
        t15 += v * b9;
        t16 += v * b10;
        t17 += v * b11;
        t18 += v * b12;
        t19 += v * b13;
        t20 += v * b14;
        t21 += v * b15;
        v = a[7];
        t7 += v * b0;
        t8 += v * b1;
        t9 += v * b2;
        t10 += v * b3;
        t11 += v * b4;
        t12 += v * b5;
        t13 += v * b6;
        t14 += v * b7;
        t15 += v * b8;
        t16 += v * b9;
        t17 += v * b10;
        t18 += v * b11;
        t19 += v * b12;
        t20 += v * b13;
        t21 += v * b14;
        t22 += v * b15;
        v = a[8];
        t8 += v * b0;
        t9 += v * b1;
        t10 += v * b2;
        t11 += v * b3;
        t12 += v * b4;
        t13 += v * b5;
        t14 += v * b6;
        t15 += v * b7;
        t16 += v * b8;
        t17 += v * b9;
        t18 += v * b10;
        t19 += v * b11;
        t20 += v * b12;
        t21 += v * b13;
        t22 += v * b14;
        t23 += v * b15;
        v = a[9];
        t9 += v * b0;
        t10 += v * b1;
        t11 += v * b2;
        t12 += v * b3;
        t13 += v * b4;
        t14 += v * b5;
        t15 += v * b6;
        t16 += v * b7;
        t17 += v * b8;
        t18 += v * b9;
        t19 += v * b10;
        t20 += v * b11;
        t21 += v * b12;
        t22 += v * b13;
        t23 += v * b14;
        t24 += v * b15;
        v = a[10];
        t10 += v * b0;
        t11 += v * b1;
        t12 += v * b2;
        t13 += v * b3;
        t14 += v * b4;
        t15 += v * b5;
        t16 += v * b6;
        t17 += v * b7;
        t18 += v * b8;
        t19 += v * b9;
        t20 += v * b10;
        t21 += v * b11;
        t22 += v * b12;
        t23 += v * b13;
        t24 += v * b14;
        t25 += v * b15;
        v = a[11];
        t11 += v * b0;
        t12 += v * b1;
        t13 += v * b2;
        t14 += v * b3;
        t15 += v * b4;
        t16 += v * b5;
        t17 += v * b6;
        t18 += v * b7;
        t19 += v * b8;
        t20 += v * b9;
        t21 += v * b10;
        t22 += v * b11;
        t23 += v * b12;
        t24 += v * b13;
        t25 += v * b14;
        t26 += v * b15;
        v = a[12];
        t12 += v * b0;
        t13 += v * b1;
        t14 += v * b2;
        t15 += v * b3;
        t16 += v * b4;
        t17 += v * b5;
        t18 += v * b6;
        t19 += v * b7;
        t20 += v * b8;
        t21 += v * b9;
        t22 += v * b10;
        t23 += v * b11;
        t24 += v * b12;
        t25 += v * b13;
        t26 += v * b14;
        t27 += v * b15;
        v = a[13];
        t13 += v * b0;
        t14 += v * b1;
        t15 += v * b2;
        t16 += v * b3;
        t17 += v * b4;
        t18 += v * b5;
        t19 += v * b6;
        t20 += v * b7;
        t21 += v * b8;
        t22 += v * b9;
        t23 += v * b10;
        t24 += v * b11;
        t25 += v * b12;
        t26 += v * b13;
        t27 += v * b14;
        t28 += v * b15;
        v = a[14];
        t14 += v * b0;
        t15 += v * b1;
        t16 += v * b2;
        t17 += v * b3;
        t18 += v * b4;
        t19 += v * b5;
        t20 += v * b6;
        t21 += v * b7;
        t22 += v * b8;
        t23 += v * b9;
        t24 += v * b10;
        t25 += v * b11;
        t26 += v * b12;
        t27 += v * b13;
        t28 += v * b14;
        t29 += v * b15;
        v = a[15];
        t15 += v * b0;
        t16 += v * b1;
        t17 += v * b2;
        t18 += v * b3;
        t19 += v * b4;
        t20 += v * b5;
        t21 += v * b6;
        t22 += v * b7;
        t23 += v * b8;
        t24 += v * b9;
        t25 += v * b10;
        t26 += v * b11;
        t27 += v * b12;
        t28 += v * b13;
        t29 += v * b14;
        t30 += v * b15;
        t0 += 38 * t16;
        t1 += 38 * t17;
        t2 += 38 * t18;
        t3 += 38 * t19;
        t4 += 38 * t20;
        t5 += 38 * t21;
        t6 += 38 * t22;
        t7 += 38 * t23;
        t8 += 38 * t24;
        t9 += 38 * t25;
        t10 += 38 * t26;
        t11 += 38 * t27;
        t12 += 38 * t28;
        t13 += 38 * t29;
        t14 += 38 * t30;
        c = 1;
        v = t0 + c + 65535;
        c = Math.floor(v / 65536);
        t0 = v - c * 65536;
        v = t1 + c + 65535;
        c = Math.floor(v / 65536);
        t1 = v - c * 65536;
        v = t2 + c + 65535;
        c = Math.floor(v / 65536);
        t2 = v - c * 65536;
        v = t3 + c + 65535;
        c = Math.floor(v / 65536);
        t3 = v - c * 65536;
        v = t4 + c + 65535;
        c = Math.floor(v / 65536);
        t4 = v - c * 65536;
        v = t5 + c + 65535;
        c = Math.floor(v / 65536);
        t5 = v - c * 65536;
        v = t6 + c + 65535;
        c = Math.floor(v / 65536);
        t6 = v - c * 65536;
        v = t7 + c + 65535;
        c = Math.floor(v / 65536);
        t7 = v - c * 65536;
        v = t8 + c + 65535;
        c = Math.floor(v / 65536);
        t8 = v - c * 65536;
        v = t9 + c + 65535;
        c = Math.floor(v / 65536);
        t9 = v - c * 65536;
        v = t10 + c + 65535;
        c = Math.floor(v / 65536);
        t10 = v - c * 65536;
        v = t11 + c + 65535;
        c = Math.floor(v / 65536);
        t11 = v - c * 65536;
        v = t12 + c + 65535;
        c = Math.floor(v / 65536);
        t12 = v - c * 65536;
        v = t13 + c + 65535;
        c = Math.floor(v / 65536);
        t13 = v - c * 65536;
        v = t14 + c + 65535;
        c = Math.floor(v / 65536);
        t14 = v - c * 65536;
        v = t15 + c + 65535;
        c = Math.floor(v / 65536);
        t15 = v - c * 65536;
        t0 += c - 1 + 37 * (c - 1);
        c = 1;
        v = t0 + c + 65535;
        c = Math.floor(v / 65536);
        t0 = v - c * 65536;
        v = t1 + c + 65535;
        c = Math.floor(v / 65536);
        t1 = v - c * 65536;
        v = t2 + c + 65535;
        c = Math.floor(v / 65536);
        t2 = v - c * 65536;
        v = t3 + c + 65535;
        c = Math.floor(v / 65536);
        t3 = v - c * 65536;
        v = t4 + c + 65535;
        c = Math.floor(v / 65536);
        t4 = v - c * 65536;
        v = t5 + c + 65535;
        c = Math.floor(v / 65536);
        t5 = v - c * 65536;
        v = t6 + c + 65535;
        c = Math.floor(v / 65536);
        t6 = v - c * 65536;
        v = t7 + c + 65535;
        c = Math.floor(v / 65536);
        t7 = v - c * 65536;
        v = t8 + c + 65535;
        c = Math.floor(v / 65536);
        t8 = v - c * 65536;
        v = t9 + c + 65535;
        c = Math.floor(v / 65536);
        t9 = v - c * 65536;
        v = t10 + c + 65535;
        c = Math.floor(v / 65536);
        t10 = v - c * 65536;
        v = t11 + c + 65535;
        c = Math.floor(v / 65536);
        t11 = v - c * 65536;
        v = t12 + c + 65535;
        c = Math.floor(v / 65536);
        t12 = v - c * 65536;
        v = t13 + c + 65535;
        c = Math.floor(v / 65536);
        t13 = v - c * 65536;
        v = t14 + c + 65535;
        c = Math.floor(v / 65536);
        t14 = v - c * 65536;
        v = t15 + c + 65535;
        c = Math.floor(v / 65536);
        t15 = v - c * 65536;
        t0 += c - 1 + 37 * (c - 1);
        o[0] = t0;
        o[1] = t1;
        o[2] = t2;
        o[3] = t3;
        o[4] = t4;
        o[5] = t5;
        o[6] = t6;
        o[7] = t7;
        o[8] = t8;
        o[9] = t9;
        o[10] = t10;
        o[11] = t11;
        o[12] = t12;
        o[13] = t13;
        o[14] = t14;
        o[15] = t15;
      }
      __name(M, "M");
      function S(o, a) {
        M(o, a, a);
      }
      __name(S, "S");
      function inv25519(o, i) {
        var c = gf();
        var a;
        for (a = 0; a < 16; a++) c[a] = i[a];
        for (a = 253; a >= 0; a--) {
          S(c, c);
          if (a !== 2 && a !== 4) M(c, c, i);
        }
        for (a = 0; a < 16; a++) o[a] = c[a];
      }
      __name(inv25519, "inv25519");
      function pow2523(o, i) {
        var c = gf();
        var a;
        for (a = 0; a < 16; a++) c[a] = i[a];
        for (a = 250; a >= 0; a--) {
          S(c, c);
          if (a !== 1) M(c, c, i);
        }
        for (a = 0; a < 16; a++) o[a] = c[a];
      }
      __name(pow2523, "pow2523");
      function crypto_scalarmult(q, n, p) {
        var z = new Uint8Array(32);
        var x = new Float64Array(80), r, i;
        var a = gf(), b = gf(), c = gf(), d = gf(), e = gf(), f = gf();
        for (i = 0; i < 31; i++) z[i] = n[i];
        z[31] = n[31] & 127 | 64;
        z[0] &= 248;
        unpack25519(x, p);
        for (i = 0; i < 16; i++) {
          b[i] = x[i];
          d[i] = a[i] = c[i] = 0;
        }
        a[0] = d[0] = 1;
        for (i = 254; i >= 0; --i) {
          r = z[i >>> 3] >>> (i & 7) & 1;
          sel25519(a, b, r);
          sel25519(c, d, r);
          A(e, a, c);
          Z(a, a, c);
          A(c, b, d);
          Z(b, b, d);
          S(d, e);
          S(f, a);
          M(a, c, a);
          M(c, b, e);
          A(e, a, c);
          Z(a, a, c);
          S(b, a);
          Z(c, d, f);
          M(a, c, _121665);
          A(a, a, d);
          M(c, c, a);
          M(a, d, f);
          M(d, b, x);
          S(b, e);
          sel25519(a, b, r);
          sel25519(c, d, r);
        }
        for (i = 0; i < 16; i++) {
          x[i + 16] = a[i];
          x[i + 32] = c[i];
          x[i + 48] = b[i];
          x[i + 64] = d[i];
        }
        var x32 = x.subarray(32);
        var x16 = x.subarray(16);
        inv25519(x32, x32);
        M(x16, x16, x32);
        pack25519(q, x16);
        return 0;
      }
      __name(crypto_scalarmult, "crypto_scalarmult");
      function crypto_scalarmult_base(q, n) {
        return crypto_scalarmult(q, n, _9);
      }
      __name(crypto_scalarmult_base, "crypto_scalarmult_base");
      function crypto_box_keypair(y, x) {
        randombytes(x, 32);
        return crypto_scalarmult_base(y, x);
      }
      __name(crypto_box_keypair, "crypto_box_keypair");
      function crypto_box_beforenm(k, y, x) {
        var s = new Uint8Array(32);
        crypto_scalarmult(s, x, y);
        return crypto_core_hsalsa20(k, _0, s, sigma);
      }
      __name(crypto_box_beforenm, "crypto_box_beforenm");
      var crypto_box_afternm = crypto_secretbox;
      var crypto_box_open_afternm = crypto_secretbox_open;
      function crypto_box(c, m, d, n, y, x) {
        var k = new Uint8Array(32);
        crypto_box_beforenm(k, y, x);
        return crypto_box_afternm(c, m, d, n, k);
      }
      __name(crypto_box, "crypto_box");
      function crypto_box_open(m, c, d, n, y, x) {
        var k = new Uint8Array(32);
        crypto_box_beforenm(k, y, x);
        return crypto_box_open_afternm(m, c, d, n, k);
      }
      __name(crypto_box_open, "crypto_box_open");
      var K = [
        1116352408,
        3609767458,
        1899447441,
        602891725,
        3049323471,
        3964484399,
        3921009573,
        2173295548,
        961987163,
        4081628472,
        1508970993,
        3053834265,
        2453635748,
        2937671579,
        2870763221,
        3664609560,
        3624381080,
        2734883394,
        310598401,
        1164996542,
        607225278,
        1323610764,
        1426881987,
        3590304994,
        1925078388,
        4068182383,
        2162078206,
        991336113,
        2614888103,
        633803317,
        3248222580,
        3479774868,
        3835390401,
        2666613458,
        4022224774,
        944711139,
        264347078,
        2341262773,
        604807628,
        2007800933,
        770255983,
        1495990901,
        1249150122,
        1856431235,
        1555081692,
        3175218132,
        1996064986,
        2198950837,
        2554220882,
        3999719339,
        2821834349,
        766784016,
        2952996808,
        2566594879,
        3210313671,
        3203337956,
        3336571891,
        1034457026,
        3584528711,
        2466948901,
        113926993,
        3758326383,
        338241895,
        168717936,
        666307205,
        1188179964,
        773529912,
        1546045734,
        1294757372,
        1522805485,
        1396182291,
        2643833823,
        1695183700,
        2343527390,
        1986661051,
        1014477480,
        2177026350,
        1206759142,
        2456956037,
        344077627,
        2730485921,
        1290863460,
        2820302411,
        3158454273,
        3259730800,
        3505952657,
        3345764771,
        106217008,
        3516065817,
        3606008344,
        3600352804,
        1432725776,
        4094571909,
        1467031594,
        275423344,
        851169720,
        430227734,
        3100823752,
        506948616,
        1363258195,
        659060556,
        3750685593,
        883997877,
        3785050280,
        958139571,
        3318307427,
        1322822218,
        3812723403,
        1537002063,
        2003034995,
        1747873779,
        3602036899,
        1955562222,
        1575990012,
        2024104815,
        1125592928,
        2227730452,
        2716904306,
        2361852424,
        442776044,
        2428436474,
        593698344,
        2756734187,
        3733110249,
        3204031479,
        2999351573,
        3329325298,
        3815920427,
        3391569614,
        3928383900,
        3515267271,
        566280711,
        3940187606,
        3454069534,
        4118630271,
        4000239992,
        116418474,
        1914138554,
        174292421,
        2731055270,
        289380356,
        3203993006,
        460393269,
        320620315,
        685471733,
        587496836,
        852142971,
        1086792851,
        1017036298,
        365543100,
        1126000580,
        2618297676,
        1288033470,
        3409855158,
        1501505948,
        4234509866,
        1607167915,
        987167468,
        1816402316,
        1246189591
      ];
      function crypto_hashblocks_hl(hh, hl, m, n) {
        var wh = new Int32Array(16), wl = new Int32Array(16), bh0, bh1, bh2, bh3, bh4, bh5, bh6, bh7, bl0, bl1, bl2, bl3, bl4, bl5, bl6, bl7, th, tl, i, j, h, l, a, b, c, d;
        var ah0 = hh[0], ah1 = hh[1], ah2 = hh[2], ah3 = hh[3], ah4 = hh[4], ah5 = hh[5], ah6 = hh[6], ah7 = hh[7], al0 = hl[0], al1 = hl[1], al2 = hl[2], al3 = hl[3], al4 = hl[4], al5 = hl[5], al6 = hl[6], al7 = hl[7];
        var pos = 0;
        while (n >= 128) {
          for (i = 0; i < 16; i++) {
            j = 8 * i + pos;
            wh[i] = m[j + 0] << 24 | m[j + 1] << 16 | m[j + 2] << 8 | m[j + 3];
            wl[i] = m[j + 4] << 24 | m[j + 5] << 16 | m[j + 6] << 8 | m[j + 7];
          }
          for (i = 0; i < 80; i++) {
            bh0 = ah0;
            bh1 = ah1;
            bh2 = ah2;
            bh3 = ah3;
            bh4 = ah4;
            bh5 = ah5;
            bh6 = ah6;
            bh7 = ah7;
            bl0 = al0;
            bl1 = al1;
            bl2 = al2;
            bl3 = al3;
            bl4 = al4;
            bl5 = al5;
            bl6 = al6;
            bl7 = al7;
            h = ah7;
            l = al7;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = (ah4 >>> 14 | al4 << 32 - 14) ^ (ah4 >>> 18 | al4 << 32 - 18) ^ (al4 >>> 41 - 32 | ah4 << 32 - (41 - 32));
            l = (al4 >>> 14 | ah4 << 32 - 14) ^ (al4 >>> 18 | ah4 << 32 - 18) ^ (ah4 >>> 41 - 32 | al4 << 32 - (41 - 32));
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            h = ah4 & ah5 ^ ~ah4 & ah6;
            l = al4 & al5 ^ ~al4 & al6;
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            h = K[i * 2];
            l = K[i * 2 + 1];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            h = wh[i % 16];
            l = wl[i % 16];
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            th = c & 65535 | d << 16;
            tl = a & 65535 | b << 16;
            h = th;
            l = tl;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = (ah0 >>> 28 | al0 << 32 - 28) ^ (al0 >>> 34 - 32 | ah0 << 32 - (34 - 32)) ^ (al0 >>> 39 - 32 | ah0 << 32 - (39 - 32));
            l = (al0 >>> 28 | ah0 << 32 - 28) ^ (ah0 >>> 34 - 32 | al0 << 32 - (34 - 32)) ^ (ah0 >>> 39 - 32 | al0 << 32 - (39 - 32));
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            h = ah0 & ah1 ^ ah0 & ah2 ^ ah1 & ah2;
            l = al0 & al1 ^ al0 & al2 ^ al1 & al2;
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            bh7 = c & 65535 | d << 16;
            bl7 = a & 65535 | b << 16;
            h = bh3;
            l = bl3;
            a = l & 65535;
            b = l >>> 16;
            c = h & 65535;
            d = h >>> 16;
            h = th;
            l = tl;
            a += l & 65535;
            b += l >>> 16;
            c += h & 65535;
            d += h >>> 16;
            b += a >>> 16;
            c += b >>> 16;
            d += c >>> 16;
            bh3 = c & 65535 | d << 16;
            bl3 = a & 65535 | b << 16;
            ah1 = bh0;
            ah2 = bh1;
            ah3 = bh2;
            ah4 = bh3;
            ah5 = bh4;
            ah6 = bh5;
            ah7 = bh6;
            ah0 = bh7;
            al1 = bl0;
            al2 = bl1;
            al3 = bl2;
            al4 = bl3;
            al5 = bl4;
            al6 = bl5;
            al7 = bl6;
            al0 = bl7;
            if (i % 16 === 15) {
              for (j = 0; j < 16; j++) {
                h = wh[j];
                l = wl[j];
                a = l & 65535;
                b = l >>> 16;
                c = h & 65535;
                d = h >>> 16;
                h = wh[(j + 9) % 16];
                l = wl[(j + 9) % 16];
                a += l & 65535;
                b += l >>> 16;
                c += h & 65535;
                d += h >>> 16;
                th = wh[(j + 1) % 16];
                tl = wl[(j + 1) % 16];
                h = (th >>> 1 | tl << 32 - 1) ^ (th >>> 8 | tl << 32 - 8) ^ th >>> 7;
                l = (tl >>> 1 | th << 32 - 1) ^ (tl >>> 8 | th << 32 - 8) ^ (tl >>> 7 | th << 32 - 7);
                a += l & 65535;
                b += l >>> 16;
                c += h & 65535;
                d += h >>> 16;
                th = wh[(j + 14) % 16];
                tl = wl[(j + 14) % 16];
                h = (th >>> 19 | tl << 32 - 19) ^ (tl >>> 61 - 32 | th << 32 - (61 - 32)) ^ th >>> 6;
                l = (tl >>> 19 | th << 32 - 19) ^ (th >>> 61 - 32 | tl << 32 - (61 - 32)) ^ (tl >>> 6 | th << 32 - 6);
                a += l & 65535;
                b += l >>> 16;
                c += h & 65535;
                d += h >>> 16;
                b += a >>> 16;
                c += b >>> 16;
                d += c >>> 16;
                wh[j] = c & 65535 | d << 16;
                wl[j] = a & 65535 | b << 16;
              }
            }
          }
          h = ah0;
          l = al0;
          a = l & 65535;
          b = l >>> 16;
          c = h & 65535;
          d = h >>> 16;
          h = hh[0];
          l = hl[0];
          a += l & 65535;
          b += l >>> 16;
          c += h & 65535;
          d += h >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[0] = ah0 = c & 65535 | d << 16;
          hl[0] = al0 = a & 65535 | b << 16;
          h = ah1;
          l = al1;
          a = l & 65535;
          b = l >>> 16;
          c = h & 65535;
          d = h >>> 16;
          h = hh[1];
          l = hl[1];
          a += l & 65535;
          b += l >>> 16;
          c += h & 65535;
          d += h >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[1] = ah1 = c & 65535 | d << 16;
          hl[1] = al1 = a & 65535 | b << 16;
          h = ah2;
          l = al2;
          a = l & 65535;
          b = l >>> 16;
          c = h & 65535;
          d = h >>> 16;
          h = hh[2];
          l = hl[2];
          a += l & 65535;
          b += l >>> 16;
          c += h & 65535;
          d += h >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[2] = ah2 = c & 65535 | d << 16;
          hl[2] = al2 = a & 65535 | b << 16;
          h = ah3;
          l = al3;
          a = l & 65535;
          b = l >>> 16;
          c = h & 65535;
          d = h >>> 16;
          h = hh[3];
          l = hl[3];
          a += l & 65535;
          b += l >>> 16;
          c += h & 65535;
          d += h >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[3] = ah3 = c & 65535 | d << 16;
          hl[3] = al3 = a & 65535 | b << 16;
          h = ah4;
          l = al4;
          a = l & 65535;
          b = l >>> 16;
          c = h & 65535;
          d = h >>> 16;
          h = hh[4];
          l = hl[4];
          a += l & 65535;
          b += l >>> 16;
          c += h & 65535;
          d += h >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[4] = ah4 = c & 65535 | d << 16;
          hl[4] = al4 = a & 65535 | b << 16;
          h = ah5;
          l = al5;
          a = l & 65535;
          b = l >>> 16;
          c = h & 65535;
          d = h >>> 16;
          h = hh[5];
          l = hl[5];
          a += l & 65535;
          b += l >>> 16;
          c += h & 65535;
          d += h >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[5] = ah5 = c & 65535 | d << 16;
          hl[5] = al5 = a & 65535 | b << 16;
          h = ah6;
          l = al6;
          a = l & 65535;
          b = l >>> 16;
          c = h & 65535;
          d = h >>> 16;
          h = hh[6];
          l = hl[6];
          a += l & 65535;
          b += l >>> 16;
          c += h & 65535;
          d += h >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[6] = ah6 = c & 65535 | d << 16;
          hl[6] = al6 = a & 65535 | b << 16;
          h = ah7;
          l = al7;
          a = l & 65535;
          b = l >>> 16;
          c = h & 65535;
          d = h >>> 16;
          h = hh[7];
          l = hl[7];
          a += l & 65535;
          b += l >>> 16;
          c += h & 65535;
          d += h >>> 16;
          b += a >>> 16;
          c += b >>> 16;
          d += c >>> 16;
          hh[7] = ah7 = c & 65535 | d << 16;
          hl[7] = al7 = a & 65535 | b << 16;
          pos += 128;
          n -= 128;
        }
        return n;
      }
      __name(crypto_hashblocks_hl, "crypto_hashblocks_hl");
      function crypto_hash(out, m, n) {
        var hh = new Int32Array(8), hl = new Int32Array(8), x = new Uint8Array(256), i, b = n;
        hh[0] = 1779033703;
        hh[1] = 3144134277;
        hh[2] = 1013904242;
        hh[3] = 2773480762;
        hh[4] = 1359893119;
        hh[5] = 2600822924;
        hh[6] = 528734635;
        hh[7] = 1541459225;
        hl[0] = 4089235720;
        hl[1] = 2227873595;
        hl[2] = 4271175723;
        hl[3] = 1595750129;
        hl[4] = 2917565137;
        hl[5] = 725511199;
        hl[6] = 4215389547;
        hl[7] = 327033209;
        crypto_hashblocks_hl(hh, hl, m, n);
        n %= 128;
        for (i = 0; i < n; i++) x[i] = m[b - n + i];
        x[n] = 128;
        n = 256 - 128 * (n < 112 ? 1 : 0);
        x[n - 9] = 0;
        ts64(x, n - 8, b / 536870912 | 0, b << 3);
        crypto_hashblocks_hl(hh, hl, x, n);
        for (i = 0; i < 8; i++) ts64(out, 8 * i, hh[i], hl[i]);
        return 0;
      }
      __name(crypto_hash, "crypto_hash");
      function add(p, q) {
        var a = gf(), b = gf(), c = gf(), d = gf(), e = gf(), f = gf(), g = gf(), h = gf(), t = gf();
        Z(a, p[1], p[0]);
        Z(t, q[1], q[0]);
        M(a, a, t);
        A(b, p[0], p[1]);
        A(t, q[0], q[1]);
        M(b, b, t);
        M(c, p[3], q[3]);
        M(c, c, D2);
        M(d, p[2], q[2]);
        A(d, d, d);
        Z(e, b, a);
        Z(f, d, c);
        A(g, d, c);
        A(h, b, a);
        M(p[0], e, f);
        M(p[1], h, g);
        M(p[2], g, f);
        M(p[3], e, h);
      }
      __name(add, "add");
      function cswap(p, q, b) {
        var i;
        for (i = 0; i < 4; i++) {
          sel25519(p[i], q[i], b);
        }
      }
      __name(cswap, "cswap");
      function pack(r, p) {
        var tx = gf(), ty = gf(), zi = gf();
        inv25519(zi, p[2]);
        M(tx, p[0], zi);
        M(ty, p[1], zi);
        pack25519(r, ty);
        r[31] ^= par25519(tx) << 7;
      }
      __name(pack, "pack");
      function scalarmult(p, q, s) {
        var b, i;
        set25519(p[0], gf0);
        set25519(p[1], gf1);
        set25519(p[2], gf1);
        set25519(p[3], gf0);
        for (i = 255; i >= 0; --i) {
          b = s[i / 8 | 0] >> (i & 7) & 1;
          cswap(p, q, b);
          add(q, p);
          add(p, p);
          cswap(p, q, b);
        }
      }
      __name(scalarmult, "scalarmult");
      function scalarbase(p, s) {
        var q = [gf(), gf(), gf(), gf()];
        set25519(q[0], X);
        set25519(q[1], Y);
        set25519(q[2], gf1);
        M(q[3], X, Y);
        scalarmult(p, q, s);
      }
      __name(scalarbase, "scalarbase");
      function crypto_sign_keypair(pk, sk, seeded) {
        var d = new Uint8Array(64);
        var p = [gf(), gf(), gf(), gf()];
        var i;
        if (!seeded) randombytes(sk, 32);
        crypto_hash(d, sk, 32);
        d[0] &= 248;
        d[31] &= 127;
        d[31] |= 64;
        scalarbase(p, d);
        pack(pk, p);
        for (i = 0; i < 32; i++) sk[i + 32] = pk[i];
        return 0;
      }
      __name(crypto_sign_keypair, "crypto_sign_keypair");
      var L = new Float64Array([237, 211, 245, 92, 26, 99, 18, 88, 214, 156, 247, 162, 222, 249, 222, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16]);
      function modL(r, x) {
        var carry, i, j, k;
        for (i = 63; i >= 32; --i) {
          carry = 0;
          for (j = i - 32, k = i - 12; j < k; ++j) {
            x[j] += carry - 16 * x[i] * L[j - (i - 32)];
            carry = Math.floor((x[j] + 128) / 256);
            x[j] -= carry * 256;
          }
          x[j] += carry;
          x[i] = 0;
        }
        carry = 0;
        for (j = 0; j < 32; j++) {
          x[j] += carry - (x[31] >> 4) * L[j];
          carry = x[j] >> 8;
          x[j] &= 255;
        }
        for (j = 0; j < 32; j++) x[j] -= carry * L[j];
        for (i = 0; i < 32; i++) {
          x[i + 1] += x[i] >> 8;
          r[i] = x[i] & 255;
        }
      }
      __name(modL, "modL");
      function reduce(r) {
        var x = new Float64Array(64), i;
        for (i = 0; i < 64; i++) x[i] = r[i];
        for (i = 0; i < 64; i++) r[i] = 0;
        modL(r, x);
      }
      __name(reduce, "reduce");
      function crypto_sign(sm, m, n, sk) {
        var d = new Uint8Array(64), h = new Uint8Array(64), r = new Uint8Array(64);
        var i, j, x = new Float64Array(64);
        var p = [gf(), gf(), gf(), gf()];
        crypto_hash(d, sk, 32);
        d[0] &= 248;
        d[31] &= 127;
        d[31] |= 64;
        var smlen = n + 64;
        for (i = 0; i < n; i++) sm[64 + i] = m[i];
        for (i = 0; i < 32; i++) sm[32 + i] = d[32 + i];
        crypto_hash(r, sm.subarray(32), n + 32);
        reduce(r);
        scalarbase(p, r);
        pack(sm, p);
        for (i = 32; i < 64; i++) sm[i] = sk[i];
        crypto_hash(h, sm, n + 64);
        reduce(h);
        for (i = 0; i < 64; i++) x[i] = 0;
        for (i = 0; i < 32; i++) x[i] = r[i];
        for (i = 0; i < 32; i++) {
          for (j = 0; j < 32; j++) {
            x[i + j] += h[i] * d[j];
          }
        }
        modL(sm.subarray(32), x);
        return smlen;
      }
      __name(crypto_sign, "crypto_sign");
      function unpackneg(r, p) {
        var t = gf(), chk = gf(), num = gf(), den = gf(), den2 = gf(), den4 = gf(), den6 = gf();
        set25519(r[2], gf1);
        unpack25519(r[1], p);
        S(num, r[1]);
        M(den, num, D);
        Z(num, num, r[2]);
        A(den, r[2], den);
        S(den2, den);
        S(den4, den2);
        M(den6, den4, den2);
        M(t, den6, num);
        M(t, t, den);
        pow2523(t, t);
        M(t, t, num);
        M(t, t, den);
        M(t, t, den);
        M(r[0], t, den);
        S(chk, r[0]);
        M(chk, chk, den);
        if (neq25519(chk, num)) M(r[0], r[0], I);
        S(chk, r[0]);
        M(chk, chk, den);
        if (neq25519(chk, num)) return -1;
        if (par25519(r[0]) === p[31] >> 7) Z(r[0], gf0, r[0]);
        M(r[3], r[0], r[1]);
        return 0;
      }
      __name(unpackneg, "unpackneg");
      function crypto_sign_open(m, sm, n, pk) {
        var i;
        var t = new Uint8Array(32), h = new Uint8Array(64);
        var p = [gf(), gf(), gf(), gf()], q = [gf(), gf(), gf(), gf()];
        if (n < 64) return -1;
        if (unpackneg(q, pk)) return -1;
        for (i = 0; i < n; i++) m[i] = sm[i];
        for (i = 0; i < 32; i++) m[i + 32] = pk[i];
        crypto_hash(h, m, n);
        reduce(h);
        scalarmult(p, q, h);
        scalarbase(q, sm.subarray(32));
        add(p, q);
        pack(t, p);
        n -= 64;
        if (crypto_verify_32(sm, 0, t, 0)) {
          for (i = 0; i < n; i++) m[i] = 0;
          return -1;
        }
        for (i = 0; i < n; i++) m[i] = sm[i + 64];
        return n;
      }
      __name(crypto_sign_open, "crypto_sign_open");
      var crypto_secretbox_KEYBYTES = 32, crypto_secretbox_NONCEBYTES = 24, crypto_secretbox_ZEROBYTES = 32, crypto_secretbox_BOXZEROBYTES = 16, crypto_scalarmult_BYTES = 32, crypto_scalarmult_SCALARBYTES = 32, crypto_box_PUBLICKEYBYTES = 32, crypto_box_SECRETKEYBYTES = 32, crypto_box_BEFORENMBYTES = 32, crypto_box_NONCEBYTES = crypto_secretbox_NONCEBYTES, crypto_box_ZEROBYTES = crypto_secretbox_ZEROBYTES, crypto_box_BOXZEROBYTES = crypto_secretbox_BOXZEROBYTES, crypto_sign_BYTES = 64, crypto_sign_PUBLICKEYBYTES = 32, crypto_sign_SECRETKEYBYTES = 64, crypto_sign_SEEDBYTES = 32, crypto_hash_BYTES = 64;
      nacl.lowlevel = {
        crypto_core_hsalsa20,
        crypto_stream_xor,
        crypto_stream,
        crypto_stream_salsa20_xor,
        crypto_stream_salsa20,
        crypto_onetimeauth,
        crypto_onetimeauth_verify,
        crypto_verify_16,
        crypto_verify_32,
        crypto_secretbox,
        crypto_secretbox_open,
        crypto_scalarmult,
        crypto_scalarmult_base,
        crypto_box_beforenm,
        crypto_box_afternm,
        crypto_box,
        crypto_box_open,
        crypto_box_keypair,
        crypto_hash,
        crypto_sign,
        crypto_sign_keypair,
        crypto_sign_open,
        crypto_secretbox_KEYBYTES,
        crypto_secretbox_NONCEBYTES,
        crypto_secretbox_ZEROBYTES,
        crypto_secretbox_BOXZEROBYTES,
        crypto_scalarmult_BYTES,
        crypto_scalarmult_SCALARBYTES,
        crypto_box_PUBLICKEYBYTES,
        crypto_box_SECRETKEYBYTES,
        crypto_box_BEFORENMBYTES,
        crypto_box_NONCEBYTES,
        crypto_box_ZEROBYTES,
        crypto_box_BOXZEROBYTES,
        crypto_sign_BYTES,
        crypto_sign_PUBLICKEYBYTES,
        crypto_sign_SECRETKEYBYTES,
        crypto_sign_SEEDBYTES,
        crypto_hash_BYTES,
        gf,
        D,
        L,
        pack25519,
        unpack25519,
        M,
        A,
        S,
        Z,
        pow2523,
        add,
        set25519,
        modL,
        scalarmult,
        scalarbase
      };
      function checkLengths(k, n) {
        if (k.length !== crypto_secretbox_KEYBYTES) throw new Error("bad key size");
        if (n.length !== crypto_secretbox_NONCEBYTES) throw new Error("bad nonce size");
      }
      __name(checkLengths, "checkLengths");
      function checkBoxLengths(pk, sk) {
        if (pk.length !== crypto_box_PUBLICKEYBYTES) throw new Error("bad public key size");
        if (sk.length !== crypto_box_SECRETKEYBYTES) throw new Error("bad secret key size");
      }
      __name(checkBoxLengths, "checkBoxLengths");
      function checkArrayTypes() {
        for (var i = 0; i < arguments.length; i++) {
          if (!(arguments[i] instanceof Uint8Array))
            throw new TypeError("unexpected type, use Uint8Array");
        }
      }
      __name(checkArrayTypes, "checkArrayTypes");
      function cleanup(arr) {
        for (var i = 0; i < arr.length; i++) arr[i] = 0;
      }
      __name(cleanup, "cleanup");
      nacl.randomBytes = function(n) {
        var b = new Uint8Array(n);
        randombytes(b, n);
        return b;
      };
      nacl.secretbox = function(msg, nonce, key) {
        checkArrayTypes(msg, nonce, key);
        checkLengths(key, nonce);
        var m = new Uint8Array(crypto_secretbox_ZEROBYTES + msg.length);
        var c = new Uint8Array(m.length);
        for (var i = 0; i < msg.length; i++) m[i + crypto_secretbox_ZEROBYTES] = msg[i];
        crypto_secretbox(c, m, m.length, nonce, key);
        return c.subarray(crypto_secretbox_BOXZEROBYTES);
      };
      nacl.secretbox.open = function(box, nonce, key) {
        checkArrayTypes(box, nonce, key);
        checkLengths(key, nonce);
        var c = new Uint8Array(crypto_secretbox_BOXZEROBYTES + box.length);
        var m = new Uint8Array(c.length);
        for (var i = 0; i < box.length; i++) c[i + crypto_secretbox_BOXZEROBYTES] = box[i];
        if (c.length < 32) return null;
        if (crypto_secretbox_open(m, c, c.length, nonce, key) !== 0) return null;
        return m.subarray(crypto_secretbox_ZEROBYTES);
      };
      nacl.secretbox.keyLength = crypto_secretbox_KEYBYTES;
      nacl.secretbox.nonceLength = crypto_secretbox_NONCEBYTES;
      nacl.secretbox.overheadLength = crypto_secretbox_BOXZEROBYTES;
      nacl.scalarMult = function(n, p) {
        checkArrayTypes(n, p);
        if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error("bad n size");
        if (p.length !== crypto_scalarmult_BYTES) throw new Error("bad p size");
        var q = new Uint8Array(crypto_scalarmult_BYTES);
        crypto_scalarmult(q, n, p);
        return q;
      };
      nacl.scalarMult.base = function(n) {
        checkArrayTypes(n);
        if (n.length !== crypto_scalarmult_SCALARBYTES) throw new Error("bad n size");
        var q = new Uint8Array(crypto_scalarmult_BYTES);
        crypto_scalarmult_base(q, n);
        return q;
      };
      nacl.scalarMult.scalarLength = crypto_scalarmult_SCALARBYTES;
      nacl.scalarMult.groupElementLength = crypto_scalarmult_BYTES;
      nacl.box = function(msg, nonce, publicKey, secretKey) {
        var k = nacl.box.before(publicKey, secretKey);
        return nacl.secretbox(msg, nonce, k);
      };
      nacl.box.before = function(publicKey, secretKey) {
        checkArrayTypes(publicKey, secretKey);
        checkBoxLengths(publicKey, secretKey);
        var k = new Uint8Array(crypto_box_BEFORENMBYTES);
        crypto_box_beforenm(k, publicKey, secretKey);
        return k;
      };
      nacl.box.after = nacl.secretbox;
      nacl.box.open = function(msg, nonce, publicKey, secretKey) {
        var k = nacl.box.before(publicKey, secretKey);
        return nacl.secretbox.open(msg, nonce, k);
      };
      nacl.box.open.after = nacl.secretbox.open;
      nacl.box.keyPair = function() {
        var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
        var sk = new Uint8Array(crypto_box_SECRETKEYBYTES);
        crypto_box_keypair(pk, sk);
        return { publicKey: pk, secretKey: sk };
      };
      nacl.box.keyPair.fromSecretKey = function(secretKey) {
        checkArrayTypes(secretKey);
        if (secretKey.length !== crypto_box_SECRETKEYBYTES)
          throw new Error("bad secret key size");
        var pk = new Uint8Array(crypto_box_PUBLICKEYBYTES);
        crypto_scalarmult_base(pk, secretKey);
        return { publicKey: pk, secretKey: new Uint8Array(secretKey) };
      };
      nacl.box.publicKeyLength = crypto_box_PUBLICKEYBYTES;
      nacl.box.secretKeyLength = crypto_box_SECRETKEYBYTES;
      nacl.box.sharedKeyLength = crypto_box_BEFORENMBYTES;
      nacl.box.nonceLength = crypto_box_NONCEBYTES;
      nacl.box.overheadLength = nacl.secretbox.overheadLength;
      nacl.sign = function(msg, secretKey) {
        checkArrayTypes(msg, secretKey);
        if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
          throw new Error("bad secret key size");
        var signedMsg = new Uint8Array(crypto_sign_BYTES + msg.length);
        crypto_sign(signedMsg, msg, msg.length, secretKey);
        return signedMsg;
      };
      nacl.sign.open = function(signedMsg, publicKey) {
        checkArrayTypes(signedMsg, publicKey);
        if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
          throw new Error("bad public key size");
        var tmp = new Uint8Array(signedMsg.length);
        var mlen = crypto_sign_open(tmp, signedMsg, signedMsg.length, publicKey);
        if (mlen < 0) return null;
        var m = new Uint8Array(mlen);
        for (var i = 0; i < m.length; i++) m[i] = tmp[i];
        return m;
      };
      nacl.sign.detached = function(msg, secretKey) {
        var signedMsg = nacl.sign(msg, secretKey);
        var sig = new Uint8Array(crypto_sign_BYTES);
        for (var i = 0; i < sig.length; i++) sig[i] = signedMsg[i];
        return sig;
      };
      nacl.sign.detached.verify = function(msg, sig, publicKey) {
        checkArrayTypes(msg, sig, publicKey);
        if (sig.length !== crypto_sign_BYTES)
          throw new Error("bad signature size");
        if (publicKey.length !== crypto_sign_PUBLICKEYBYTES)
          throw new Error("bad public key size");
        var sm = new Uint8Array(crypto_sign_BYTES + msg.length);
        var m = new Uint8Array(crypto_sign_BYTES + msg.length);
        var i;
        for (i = 0; i < crypto_sign_BYTES; i++) sm[i] = sig[i];
        for (i = 0; i < msg.length; i++) sm[i + crypto_sign_BYTES] = msg[i];
        return crypto_sign_open(m, sm, sm.length, publicKey) >= 0;
      };
      nacl.sign.keyPair = function() {
        var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
        var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
        crypto_sign_keypair(pk, sk);
        return { publicKey: pk, secretKey: sk };
      };
      nacl.sign.keyPair.fromSecretKey = function(secretKey) {
        checkArrayTypes(secretKey);
        if (secretKey.length !== crypto_sign_SECRETKEYBYTES)
          throw new Error("bad secret key size");
        var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
        for (var i = 0; i < pk.length; i++) pk[i] = secretKey[32 + i];
        return { publicKey: pk, secretKey: new Uint8Array(secretKey) };
      };
      nacl.sign.keyPair.fromSeed = function(seed) {
        checkArrayTypes(seed);
        if (seed.length !== crypto_sign_SEEDBYTES)
          throw new Error("bad seed size");
        var pk = new Uint8Array(crypto_sign_PUBLICKEYBYTES);
        var sk = new Uint8Array(crypto_sign_SECRETKEYBYTES);
        for (var i = 0; i < 32; i++) sk[i] = seed[i];
        crypto_sign_keypair(pk, sk, true);
        return { publicKey: pk, secretKey: sk };
      };
      nacl.sign.publicKeyLength = crypto_sign_PUBLICKEYBYTES;
      nacl.sign.secretKeyLength = crypto_sign_SECRETKEYBYTES;
      nacl.sign.seedLength = crypto_sign_SEEDBYTES;
      nacl.sign.signatureLength = crypto_sign_BYTES;
      nacl.hash = function(msg) {
        checkArrayTypes(msg);
        var h = new Uint8Array(crypto_hash_BYTES);
        crypto_hash(h, msg, msg.length);
        return h;
      };
      nacl.hash.hashLength = crypto_hash_BYTES;
      nacl.verify = function(x, y) {
        checkArrayTypes(x, y);
        if (x.length === 0 || y.length === 0) return false;
        if (x.length !== y.length) return false;
        return vn(x, 0, y, 0, x.length) === 0 ? true : false;
      };
      nacl.setPRNG = function(fn) {
        randombytes = fn;
      };
      (function() {
        var crypto2 = typeof self !== "undefined" ? self.crypto || self.msCrypto : null;
        if (crypto2 && crypto2.getRandomValues) {
          var QUOTA = 65536;
          nacl.setPRNG(function(x, n) {
            var i, v = new Uint8Array(n);
            for (i = 0; i < n; i += QUOTA) {
              crypto2.getRandomValues(v.subarray(i, i + Math.min(n - i, QUOTA)));
            }
            for (i = 0; i < n; i++) x[i] = v[i];
            cleanup(v);
          });
        } else if (typeof require !== "undefined") {
          crypto2 = require("crypto");
          if (crypto2 && crypto2.randomBytes) {
            nacl.setPRNG(function(x, n) {
              var i, v = crypto2.randomBytes(n);
              for (i = 0; i < n; i++) x[i] = v[i];
              cleanup(v);
            });
          }
        }
      })();
    })(typeof module2 !== "undefined" && module2.exports ? module2.exports : self.nacl = self.nacl || {});
  }
});

// node_modules/@nats-io/nkeys/lib/nacl.js
var require_nacl = __commonJS({
  "node_modules/@nats-io/nkeys/lib/nacl.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var tweetnacl_1 = __importDefault(require_nacl_fast());
    exports2.default = tweetnacl_1.default;
  }
});

// node_modules/@nats-io/nkeys/lib/kp.js
var require_kp = __commonJS({
  "node_modules/@nats-io/nkeys/lib/kp.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.KP = void 0;
    var codec_1 = require_codec();
    var nkeys_1 = require_nkeys();
    var nacl_1 = __importDefault(require_nacl());
    var _KP = class _KP {
      seed;
      constructor(seed) {
        this.seed = seed;
      }
      getRawSeed() {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        const sd = codec_1.Codec.decodeSeed(this.seed);
        return sd.buf;
      }
      getSeed() {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        return this.seed;
      }
      getPublicKey() {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        const sd = codec_1.Codec.decodeSeed(this.seed);
        const kp = nacl_1.default.sign.keyPair.fromSeed(this.getRawSeed());
        const buf = codec_1.Codec.encode(sd.prefix, kp.publicKey);
        return new TextDecoder().decode(buf);
      }
      getPrivateKey() {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        const kp = nacl_1.default.sign.keyPair.fromSeed(this.getRawSeed());
        return codec_1.Codec.encode(nkeys_1.Prefix.Private, kp.secretKey);
      }
      sign(input) {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        const kp = nacl_1.default.sign.keyPair.fromSeed(this.getRawSeed());
        return nacl_1.default.sign.detached(input, kp.secretKey);
      }
      verify(input, sig) {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        const kp = nacl_1.default.sign.keyPair.fromSeed(this.getRawSeed());
        return nacl_1.default.sign.detached.verify(input, sig, kp.publicKey);
      }
      clear() {
        if (!this.seed) {
          return;
        }
        this.seed.fill(0);
        this.seed = void 0;
      }
      seal(_, _recipient, _nonce) {
        throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidNKeyOperation);
      }
      open(_, _sender) {
        throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidNKeyOperation);
      }
    };
    __name(_KP, "KP");
    var KP = _KP;
    exports2.KP = KP;
  }
});

// node_modules/@nats-io/nkeys/lib/public.js
var require_public = __commonJS({
  "node_modules/@nats-io/nkeys/lib/public.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PublicKey = void 0;
    var codec_1 = require_codec();
    var nkeys_1 = require_nkeys();
    var nacl_1 = __importDefault(require_nacl());
    var _PublicKey = class _PublicKey {
      publicKey;
      constructor(publicKey) {
        this.publicKey = publicKey;
      }
      getPublicKey() {
        if (!this.publicKey) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        return new TextDecoder().decode(this.publicKey);
      }
      getPrivateKey() {
        if (!this.publicKey) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.PublicKeyOnly);
      }
      getSeed() {
        if (!this.publicKey) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.PublicKeyOnly);
      }
      sign(_) {
        if (!this.publicKey) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.CannotSign);
      }
      verify(input, sig) {
        if (!this.publicKey) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        const buf = codec_1.Codec._decode(this.publicKey);
        return nacl_1.default.sign.detached.verify(input, sig, buf.slice(1));
      }
      clear() {
        if (!this.publicKey) {
          return;
        }
        this.publicKey.fill(0);
        this.publicKey = void 0;
      }
      seal(_, _recipient, _nonce) {
        throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidNKeyOperation);
      }
      open(_, _sender) {
        throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidNKeyOperation);
      }
    };
    __name(_PublicKey, "PublicKey");
    var PublicKey = _PublicKey;
    exports2.PublicKey = PublicKey;
  }
});

// node_modules/@nats-io/nkeys/lib/curve.js
var require_curve = __commonJS({
  "node_modules/@nats-io/nkeys/lib/curve.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CurveKP = exports2.curveNonceLen = exports2.curveKeyLen = void 0;
    var nkeys_1 = require_nkeys();
    var nacl_1 = __importDefault(require_nacl());
    var codec_1 = require_codec();
    var nkeys_2 = require_nkeys();
    var base32_1 = require_base32();
    var crc16_1 = require_crc16();
    exports2.curveKeyLen = 32;
    var curveDecodeLen = 35;
    exports2.curveNonceLen = 24;
    var XKeyVersionV1 = [120, 107, 118, 49];
    var _CurveKP = class _CurveKP {
      seed;
      constructor(seed) {
        this.seed = seed;
      }
      clear() {
        if (!this.seed) {
          return;
        }
        this.seed.fill(0);
        this.seed = void 0;
      }
      getPrivateKey() {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        return codec_1.Codec.encode(nkeys_2.Prefix.Private, this.seed);
      }
      getPublicKey() {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        const pub = nacl_1.default.scalarMult.base(this.seed);
        const buf = codec_1.Codec.encode(nkeys_2.Prefix.Curve, pub);
        return new TextDecoder().decode(buf);
      }
      getSeed() {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        return codec_1.Codec.encodeSeed(nkeys_2.Prefix.Curve, this.seed);
      }
      sign() {
        throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidCurveOperation);
      }
      verify() {
        throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidCurveOperation);
      }
      decodePubCurveKey(src) {
        try {
          const raw = base32_1.base32.decode(new TextEncoder().encode(src));
          if (raw.byteLength !== curveDecodeLen) {
            throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidCurveKey);
          }
          if (raw[0] !== nkeys_2.Prefix.Curve) {
            throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidPublicKey);
          }
          const checkOffset = raw.byteLength - 2;
          const dv = new DataView(raw.buffer);
          const checksum = dv.getUint16(checkOffset, true);
          const payload = raw.slice(0, checkOffset);
          if (!crc16_1.crc16.validate(payload, checksum)) {
            throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidChecksum);
          }
          return payload.slice(1);
        } catch (ex) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidRecipient, { cause: ex });
        }
      }
      seal(message, recipient, nonce) {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        if (!nonce) {
          nonce = nacl_1.default.randomBytes(exports2.curveNonceLen);
        }
        const pub = this.decodePubCurveKey(recipient);
        const out = new Uint8Array(XKeyVersionV1.length + exports2.curveNonceLen);
        out.set(XKeyVersionV1, 0);
        out.set(nonce, XKeyVersionV1.length);
        const encrypted = nacl_1.default.box(message, nonce, pub, this.seed);
        const fullMessage = new Uint8Array(out.length + encrypted.length);
        fullMessage.set(out);
        fullMessage.set(encrypted, out.length);
        return fullMessage;
      }
      open(message, sender) {
        if (!this.seed) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.ClearedPair);
        }
        if (message.length <= exports2.curveNonceLen + XKeyVersionV1.length) {
          throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidEncrypted);
        }
        for (let i = 0; i < XKeyVersionV1.length; i++) {
          if (message[i] !== XKeyVersionV1[i]) {
            throw new nkeys_1.NKeysError(nkeys_1.NKeysErrorCode.InvalidEncrypted);
          }
        }
        const pub = this.decodePubCurveKey(sender);
        message = message.slice(XKeyVersionV1.length);
        const nonce = message.slice(0, exports2.curveNonceLen);
        message = message.slice(exports2.curveNonceLen);
        return nacl_1.default.box.open(message, nonce, pub, this.seed);
      }
    };
    __name(_CurveKP, "CurveKP");
    var CurveKP = _CurveKP;
    exports2.CurveKP = CurveKP;
  }
});

// node_modules/@nats-io/nkeys/lib/nkeys.js
var require_nkeys = __commonJS({
  "node_modules/@nats-io/nkeys/lib/nkeys.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NKeysError = exports2.NKeysErrorCode = exports2.Prefixes = exports2.Prefix = void 0;
    exports2.createPair = createPair;
    exports2.createOperator = createOperator;
    exports2.createAccount = createAccount;
    exports2.createUser = createUser;
    exports2.createCluster = createCluster;
    exports2.createServer = createServer;
    exports2.createCurve = createCurve;
    exports2.fromPublic = fromPublic;
    exports2.fromCurveSeed = fromCurveSeed;
    exports2.fromSeed = fromSeed;
    var kp_1 = require_kp();
    var public_1 = require_public();
    var codec_1 = require_codec();
    var curve_1 = require_curve();
    var nacl_1 = __importDefault(require_nacl());
    function createPair(prefix) {
      const len = prefix === Prefix.Curve ? curve_1.curveKeyLen : 32;
      const rawSeed = nacl_1.default.randomBytes(len);
      const str = codec_1.Codec.encodeSeed(prefix, new Uint8Array(rawSeed));
      return prefix === Prefix.Curve ? new curve_1.CurveKP(new Uint8Array(rawSeed)) : new kp_1.KP(str);
    }
    __name(createPair, "createPair");
    function createOperator() {
      return createPair(Prefix.Operator);
    }
    __name(createOperator, "createOperator");
    function createAccount() {
      return createPair(Prefix.Account);
    }
    __name(createAccount, "createAccount");
    function createUser() {
      return createPair(Prefix.User);
    }
    __name(createUser, "createUser");
    function createCluster() {
      return createPair(Prefix.Cluster);
    }
    __name(createCluster, "createCluster");
    function createServer() {
      return createPair(Prefix.Server);
    }
    __name(createServer, "createServer");
    function createCurve() {
      return createPair(Prefix.Curve);
    }
    __name(createCurve, "createCurve");
    function fromPublic(src) {
      const ba = new TextEncoder().encode(src);
      const raw = codec_1.Codec._decode(ba);
      const prefix = Prefixes.parsePrefix(raw[0]);
      if (Prefixes.isValidPublicPrefix(prefix)) {
        return new public_1.PublicKey(ba);
      }
      throw new NKeysError(NKeysErrorCode.InvalidPublicKey);
    }
    __name(fromPublic, "fromPublic");
    function fromCurveSeed(src) {
      const sd = codec_1.Codec.decodeSeed(src);
      if (sd.prefix !== Prefix.Curve) {
        throw new NKeysError(NKeysErrorCode.InvalidCurveSeed);
      }
      if (sd.buf.byteLength !== curve_1.curveKeyLen) {
        throw new NKeysError(NKeysErrorCode.InvalidSeedLen);
      }
      return new curve_1.CurveKP(sd.buf);
    }
    __name(fromCurveSeed, "fromCurveSeed");
    function fromSeed(src) {
      const sd = codec_1.Codec.decodeSeed(src);
      if (sd.prefix === Prefix.Curve) {
        return fromCurveSeed(src);
      }
      return new kp_1.KP(src);
    }
    __name(fromSeed, "fromSeed");
    var Prefix;
    (function(Prefix2) {
      Prefix2[Prefix2["Unknown"] = -1] = "Unknown";
      Prefix2[Prefix2["Seed"] = 144] = "Seed";
      Prefix2[Prefix2["Private"] = 120] = "Private";
      Prefix2[Prefix2["Operator"] = 112] = "Operator";
      Prefix2[Prefix2["Server"] = 104] = "Server";
      Prefix2[Prefix2["Cluster"] = 16] = "Cluster";
      Prefix2[Prefix2["Account"] = 0] = "Account";
      Prefix2[Prefix2["User"] = 160] = "User";
      Prefix2[Prefix2["Curve"] = 184] = "Curve";
    })(Prefix || (exports2.Prefix = Prefix = {}));
    var _Prefixes = class _Prefixes {
      static isValidPublicPrefix(prefix) {
        return prefix == Prefix.Server || prefix == Prefix.Operator || prefix == Prefix.Cluster || prefix == Prefix.Account || prefix == Prefix.User || prefix == Prefix.Curve;
      }
      static startsWithValidPrefix(s) {
        const c = s[0];
        return c == "S" || c == "P" || c == "O" || c == "N" || c == "C" || c == "A" || c == "U" || c == "X";
      }
      static isValidPrefix(prefix) {
        const v = this.parsePrefix(prefix);
        return v !== Prefix.Unknown;
      }
      static parsePrefix(v) {
        switch (v) {
          case Prefix.Seed:
            return Prefix.Seed;
          case Prefix.Private:
            return Prefix.Private;
          case Prefix.Operator:
            return Prefix.Operator;
          case Prefix.Server:
            return Prefix.Server;
          case Prefix.Cluster:
            return Prefix.Cluster;
          case Prefix.Account:
            return Prefix.Account;
          case Prefix.User:
            return Prefix.User;
          case Prefix.Curve:
            return Prefix.Curve;
          default:
            return Prefix.Unknown;
        }
      }
    };
    __name(_Prefixes, "Prefixes");
    var Prefixes = _Prefixes;
    exports2.Prefixes = Prefixes;
    var NKeysErrorCode;
    (function(NKeysErrorCode2) {
      NKeysErrorCode2["InvalidPrefixByte"] = "nkeys: invalid prefix byte";
      NKeysErrorCode2["InvalidKey"] = "nkeys: invalid key";
      NKeysErrorCode2["InvalidPublicKey"] = "nkeys: invalid public key";
      NKeysErrorCode2["InvalidSeedLen"] = "nkeys: invalid seed length";
      NKeysErrorCode2["InvalidSeed"] = "nkeys: invalid seed";
      NKeysErrorCode2["InvalidCurveSeed"] = "nkeys: invalid curve seed";
      NKeysErrorCode2["InvalidCurveKey"] = "nkeys: not a valid curve key";
      NKeysErrorCode2["InvalidCurveOperation"] = "nkeys: curve key is not valid for sign/verify";
      NKeysErrorCode2["InvalidNKeyOperation"] = "keys: only curve key can seal/open";
      NKeysErrorCode2["InvalidEncoding"] = "nkeys: invalid encoded key";
      NKeysErrorCode2["InvalidRecipient"] = "nkeys: not a valid recipient public curve key";
      NKeysErrorCode2["InvalidEncrypted"] = "nkeys: encrypted input is not valid";
      NKeysErrorCode2["CannotSign"] = "nkeys: cannot sign, no private key available";
      NKeysErrorCode2["PublicKeyOnly"] = "nkeys: no seed or private key available";
      NKeysErrorCode2["InvalidChecksum"] = "nkeys: invalid checksum";
      NKeysErrorCode2["SerializationError"] = "nkeys: serialization error";
      NKeysErrorCode2["ApiError"] = "nkeys: api error";
      NKeysErrorCode2["ClearedPair"] = "nkeys: pair is cleared";
    })(NKeysErrorCode || (exports2.NKeysErrorCode = NKeysErrorCode = {}));
    var _NKeysError = class _NKeysError extends Error {
      code;
      constructor(code, options) {
        super(code, options);
        this.code = code;
      }
    };
    __name(_NKeysError, "NKeysError");
    var NKeysError = _NKeysError;
    exports2.NKeysError = NKeysError;
  }
});

// node_modules/@nats-io/nkeys/lib/util.js
var require_util2 = __commonJS({
  "node_modules/@nats-io/nkeys/lib/util.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.encode = encode;
    exports2.decode = decode;
    exports2.dump = dump;
    function encode(bytes) {
      return btoa(String.fromCharCode(...bytes));
    }
    __name(encode, "encode");
    function decode(b64str) {
      const bin = atob(b64str);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      return bytes;
    }
    __name(decode, "decode");
    function dump(buf, msg) {
      if (msg) {
        console.log(msg);
      }
      const a = [];
      for (let i = 0; i < buf.byteLength; i++) {
        if (i % 8 === 0) {
          a.push("\n");
        }
        let v = buf[i].toString(16);
        if (v.length === 1) {
          v = "0" + v;
        }
        a.push(v);
      }
      console.log(a.join("  "));
    }
    __name(dump, "dump");
  }
});

// node_modules/@nats-io/nkeys/lib/version.js
var require_version = __commonJS({
  "node_modules/@nats-io/nkeys/lib/version.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.version = void 0;
    exports2.version = "2.0.3";
  }
});

// node_modules/@nats-io/nkeys/lib/mod.js
var require_mod = __commonJS({
  "node_modules/@nats-io/nkeys/lib/mod.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.version = exports2.encode = exports2.decode = exports2.Prefixes = exports2.Prefix = exports2.NKeysErrorCode = exports2.NKeysError = exports2.fromSeed = exports2.fromPublic = exports2.fromCurveSeed = exports2.createUser = exports2.createServer = exports2.createPair = exports2.createOperator = exports2.createCurve = exports2.createCluster = exports2.createAccount = void 0;
    var nkeys_1 = require_nkeys();
    Object.defineProperty(exports2, "createAccount", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nkeys_1.createAccount;
    }, "get") });
    Object.defineProperty(exports2, "createCluster", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nkeys_1.createCluster;
    }, "get") });
    Object.defineProperty(exports2, "createCurve", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nkeys_1.createCurve;
    }, "get") });
    Object.defineProperty(exports2, "createOperator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nkeys_1.createOperator;
    }, "get") });
    Object.defineProperty(exports2, "createPair", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nkeys_1.createPair;
    }, "get") });
    Object.defineProperty(exports2, "createServer", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nkeys_1.createServer;
    }, "get") });
    Object.defineProperty(exports2, "createUser", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nkeys_1.createUser;
    }, "get") });
    Object.defineProperty(exports2, "fromCurveSeed", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nkeys_1.fromCurveSeed;
    }, "get") });
    Object.defineProperty(exports2, "fromPublic", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nkeys_1.fromPublic;
    }, "get") });
    Object.defineProperty(exports2, "fromSeed", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nkeys_1.fromSeed;
    }, "get") });
    Object.defineProperty(exports2, "NKeysError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nkeys_1.NKeysError;
    }, "get") });
    Object.defineProperty(exports2, "NKeysErrorCode", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nkeys_1.NKeysErrorCode;
    }, "get") });
    Object.defineProperty(exports2, "Prefix", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nkeys_1.Prefix;
    }, "get") });
    Object.defineProperty(exports2, "Prefixes", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nkeys_1.Prefixes;
    }, "get") });
    var util_1 = require_util2();
    Object.defineProperty(exports2, "decode", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.decode;
    }, "get") });
    Object.defineProperty(exports2, "encode", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.encode;
    }, "get") });
    var version_1 = require_version();
    Object.defineProperty(exports2, "version", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return version_1.version;
    }, "get") });
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/nkeys.js
var require_nkeys2 = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/nkeys.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: /* @__PURE__ */ __name(function() {
          return m[k];
        }, "get") };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ function() {
      var ownKeys = /* @__PURE__ */ __name(function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      }, "ownKeys");
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    }();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.nkeys = void 0;
    exports2.nkeys = __importStar(require_mod());
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/authenticator.js
var require_authenticator = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/authenticator.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.multiAuthenticator = multiAuthenticator;
    exports2.noAuthFn = noAuthFn;
    exports2.usernamePasswordAuthenticator = usernamePasswordAuthenticator2;
    exports2.tokenAuthenticator = tokenAuthenticator2;
    exports2.nkeyAuthenticator = nkeyAuthenticator2;
    exports2.jwtAuthenticator = jwtAuthenticator2;
    exports2.credsAuthenticator = credsAuthenticator2;
    var nkeys_1 = require_nkeys2();
    var encoders_1 = require_encoders();
    function multiAuthenticator(authenticators) {
      return (nonce) => {
        let auth = {};
        authenticators.forEach((a) => {
          const args = a(nonce) || {};
          auth = Object.assign(auth, args);
        });
        return auth;
      };
    }
    __name(multiAuthenticator, "multiAuthenticator");
    function noAuthFn() {
      return () => {
        return;
      };
    }
    __name(noAuthFn, "noAuthFn");
    function usernamePasswordAuthenticator2(user, pass) {
      return () => {
        const u = typeof user === "function" ? user() : user;
        const p = typeof pass === "function" ? pass() : pass;
        return { user: u, pass: p };
      };
    }
    __name(usernamePasswordAuthenticator2, "usernamePasswordAuthenticator");
    function tokenAuthenticator2(token) {
      return () => {
        const auth_token = typeof token === "function" ? token() : token;
        return { auth_token };
      };
    }
    __name(tokenAuthenticator2, "tokenAuthenticator");
    function nkeyAuthenticator2(seed) {
      return (nonce) => {
        const s = typeof seed === "function" ? seed() : seed;
        const kp = s ? nkeys_1.nkeys.fromSeed(s) : void 0;
        const nkey = kp ? kp.getPublicKey() : "";
        const challenge = encoders_1.TE.encode(nonce || "");
        const sigBytes = kp !== void 0 && nonce ? kp.sign(challenge) : void 0;
        const sig = sigBytes ? nkeys_1.nkeys.encode(sigBytes) : "";
        return { nkey, sig };
      };
    }
    __name(nkeyAuthenticator2, "nkeyAuthenticator");
    function jwtAuthenticator2(ajwt, seed) {
      return (nonce) => {
        const jwt = typeof ajwt === "function" ? ajwt() : ajwt;
        const fn = nkeyAuthenticator2(seed);
        const { nkey, sig } = fn(nonce);
        return { jwt, nkey, sig };
      };
    }
    __name(jwtAuthenticator2, "jwtAuthenticator");
    function credsAuthenticator2(creds) {
      const fn = typeof creds !== "function" ? () => creds : creds;
      const parse = /* @__PURE__ */ __name(() => {
        const CREDS = /\s*(?:(?:[-]{3,}[^\n]*[-]{3,}\n)(.+)(?:\n\s*[-]{3,}[^\n]*[-]{3,}\n))/ig;
        const s = encoders_1.TD.decode(fn());
        let m = CREDS.exec(s);
        if (!m) {
          throw new Error("unable to parse credentials");
        }
        const jwt = m[1].trim();
        m = CREDS.exec(s);
        if (!m) {
          throw new Error("unable to parse credentials");
        }
        const seed = encoders_1.TE.encode(m[1].trim());
        return { jwt, seed };
      }, "parse");
      const jwtFn = /* @__PURE__ */ __name(() => {
        const { jwt } = parse();
        return jwt;
      }, "jwtFn");
      const nkeyFn = /* @__PURE__ */ __name(() => {
        const { seed } = parse();
        return seed;
      }, "nkeyFn");
      return jwtAuthenticator2(jwtFn, nkeyFn);
    }
    __name(credsAuthenticator2, "credsAuthenticator");
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/options.js
var require_options = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/options.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_RECONNECT_TIME_WAIT = exports2.DEFAULT_MAX_PING_OUT = exports2.DEFAULT_PING_INTERVAL = exports2.DEFAULT_JITTER_TLS = exports2.DEFAULT_JITTER = exports2.DEFAULT_MAX_RECONNECT_ATTEMPTS = void 0;
    exports2.defaultOptions = defaultOptions;
    exports2.hasWsProtocol = hasWsProtocol;
    exports2.buildAuthenticator = buildAuthenticator;
    exports2.parseOptions = parseOptions;
    exports2.checkOptions = checkOptions;
    exports2.checkUnsupportedOption = checkUnsupportedOption;
    var util_1 = require_util();
    var transport_1 = require_transport();
    var core_1 = require_core();
    var authenticator_1 = require_authenticator();
    var errors_1 = require_errors();
    exports2.DEFAULT_MAX_RECONNECT_ATTEMPTS = 10;
    exports2.DEFAULT_JITTER = 100;
    exports2.DEFAULT_JITTER_TLS = 1e3;
    exports2.DEFAULT_PING_INTERVAL = 2 * 60 * 1e3;
    exports2.DEFAULT_MAX_PING_OUT = 2;
    exports2.DEFAULT_RECONNECT_TIME_WAIT = 2 * 1e3;
    function defaultOptions() {
      return {
        maxPingOut: exports2.DEFAULT_MAX_PING_OUT,
        maxReconnectAttempts: exports2.DEFAULT_MAX_RECONNECT_ATTEMPTS,
        noRandomize: false,
        pedantic: false,
        pingInterval: exports2.DEFAULT_PING_INTERVAL,
        reconnect: true,
        reconnectJitter: exports2.DEFAULT_JITTER,
        reconnectJitterTLS: exports2.DEFAULT_JITTER_TLS,
        reconnectTimeWait: exports2.DEFAULT_RECONNECT_TIME_WAIT,
        tls: void 0,
        verbose: false,
        waitOnFirstConnect: false,
        ignoreAuthErrorAbort: false
      };
    }
    __name(defaultOptions, "defaultOptions");
    function hasWsProtocol(opts) {
      if (opts) {
        let { servers } = opts;
        if (typeof servers === "string") {
          servers = [servers];
        }
        if (servers) {
          for (let i = 0; i < servers.length; i++) {
            const s = servers[i].toLowerCase();
            if (s.startsWith("ws://") || s.startsWith("wss://")) {
              return true;
            }
          }
        }
      }
      return false;
    }
    __name(hasWsProtocol, "hasWsProtocol");
    function buildAuthenticator(opts) {
      const buf = [];
      if (typeof opts.authenticator === "function") {
        buf.push(opts.authenticator);
      }
      if (Array.isArray(opts.authenticator)) {
        buf.push(...opts.authenticator);
      }
      if (opts.token) {
        buf.push((0, authenticator_1.tokenAuthenticator)(opts.token));
      }
      if (opts.user) {
        buf.push((0, authenticator_1.usernamePasswordAuthenticator)(opts.user, opts.pass));
      }
      return buf.length === 0 ? (0, authenticator_1.noAuthFn)() : (0, authenticator_1.multiAuthenticator)(buf);
    }
    __name(buildAuthenticator, "buildAuthenticator");
    function parseOptions(opts) {
      const dhp = `${core_1.DEFAULT_HOST}:${(0, transport_1.defaultPort)()}`;
      opts = opts || { servers: [dhp] };
      opts.servers = opts.servers || [];
      if (typeof opts.servers === "string") {
        opts.servers = [opts.servers];
      }
      if (opts.servers.length > 0 && opts.port) {
        throw errors_1.InvalidArgumentError.format(["servers", "port"], "are mutually exclusive");
      }
      if (opts.servers.length === 0 && opts.port) {
        opts.servers = [`${core_1.DEFAULT_HOST}:${opts.port}`];
      }
      if (opts.servers && opts.servers.length === 0) {
        opts.servers = [dhp];
      }
      const options = (0, util_1.extend)(defaultOptions(), opts);
      options.authenticator = buildAuthenticator(options);
      ["reconnectDelayHandler", "authenticator"].forEach((n) => {
        if (options[n] && typeof options[n] !== "function") {
          throw TypeError(`'${n}' must be a function`);
        }
      });
      if (!options.reconnectDelayHandler) {
        options.reconnectDelayHandler = () => {
          let extra = options.tls ? options.reconnectJitterTLS : options.reconnectJitter;
          if (extra) {
            extra++;
            extra = Math.floor(Math.random() * extra);
          }
          return options.reconnectTimeWait + extra;
        };
      }
      if (options.inboxPrefix) {
        (0, core_1.createInbox)(options.inboxPrefix);
      }
      if (options.resolve === void 0) {
        options.resolve = typeof (0, transport_1.getResolveFn)() === "function";
      }
      if (options.resolve) {
        if (typeof (0, transport_1.getResolveFn)() !== "function") {
          throw errors_1.InvalidArgumentError.format("resolve", "is not supported in the current runtime");
        }
      }
      return options;
    }
    __name(parseOptions, "parseOptions");
    function checkOptions(info, options) {
      const { proto, tls_required: tlsRequired, tls_available: tlsAvailable } = info;
      if ((proto === void 0 || proto < 1) && options.noEcho) {
        throw new errors_1.errors.ConnectionError(`server does not support 'noEcho'`);
      }
      const tls = tlsRequired || tlsAvailable || false;
      if (options.tls && !tls) {
        throw new errors_1.errors.ConnectionError(`server does not support 'tls'`);
      }
    }
    __name(checkOptions, "checkOptions");
    function checkUnsupportedOption(prop, v) {
      if (v) {
        throw errors_1.InvalidArgumentError.format(prop, "is not supported");
      }
    }
    __name(checkUnsupportedOption, "checkUnsupportedOption");
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/protocol.js
var require_protocol = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/protocol.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProtocolHandler = exports2.Subscriptions = exports2.SubscriptionImpl = exports2.Connect = exports2.INFO = void 0;
    var encoders_1 = require_encoders();
    var transport_1 = require_transport();
    var util_1 = require_util();
    var databuffer_1 = require_databuffer();
    var servers_1 = require_servers();
    var queued_iterator_1 = require_queued_iterator();
    var muxsubscription_1 = require_muxsubscription();
    var heartbeats_1 = require_heartbeats();
    var parser_1 = require_parser();
    var msg_1 = require_msg();
    var semver_1 = require_semver();
    var options_1 = require_options();
    var errors_1 = require_errors();
    var FLUSH_THRESHOLD = 1024 * 32;
    exports2.INFO = /^INFO\s+([^\r\n]+)\r\n/i;
    var PONG_CMD = (0, encoders_1.encode)("PONG\r\n");
    var PING_CMD = (0, encoders_1.encode)("PING\r\n");
    var _Connect = class _Connect {
      echo;
      no_responders;
      protocol;
      verbose;
      pedantic;
      jwt;
      nkey;
      sig;
      user;
      pass;
      auth_token;
      tls_required;
      name;
      lang;
      version;
      headers;
      constructor(transport, opts, nonce) {
        this.protocol = 1;
        this.version = transport.version;
        this.lang = transport.lang;
        this.echo = opts.noEcho ? false : void 0;
        this.verbose = opts.verbose;
        this.pedantic = opts.pedantic;
        this.tls_required = opts.tls ? true : void 0;
        this.name = opts.name;
        const creds = (opts && typeof opts.authenticator === "function" ? opts.authenticator(nonce) : {}) || {};
        (0, util_1.extend)(this, creds);
      }
    };
    __name(_Connect, "Connect");
    var Connect = _Connect;
    exports2.Connect = Connect;
    var _SlowNotifier = class _SlowNotifier {
      slow;
      cb;
      notified;
      constructor(slow, cb) {
        this.slow = slow;
        this.cb = cb;
        this.notified = false;
      }
      maybeNotify(pending) {
        if (pending <= this.slow) {
          this.notified = false;
        } else {
          if (!this.notified) {
            this.cb(pending);
            this.notified = true;
          }
        }
      }
    };
    __name(_SlowNotifier, "SlowNotifier");
    var SlowNotifier = _SlowNotifier;
    var _SubscriptionImpl = class _SubscriptionImpl extends queued_iterator_1.QueuedIteratorImpl {
      sid;
      queue;
      draining;
      max;
      subject;
      drained;
      protocol;
      timer;
      info;
      cleanupFn;
      closed;
      requestSubject;
      slow;
      constructor(protocol, subject, opts = {}) {
        var _a;
        super();
        (0, util_1.extend)(this, opts);
        this.protocol = protocol;
        this.subject = subject;
        this.draining = false;
        this.noIterator = typeof opts.callback === "function";
        this.closed = (0, util_1.deferred)();
        const asyncTraces = !(((_a = protocol.options) == null ? void 0 : _a.noAsyncTraces) || false);
        if (opts.timeout) {
          this.timer = (0, util_1.timeout)(opts.timeout, asyncTraces);
          this.timer.then(() => {
            this.timer = void 0;
          }).catch((err) => {
            this.stop(err);
            if (this.noIterator) {
              this.callback(err, {});
            }
          });
        }
        if (!this.noIterator) {
          this.iterClosed.then((err) => {
            this.closed.resolve(err);
            this.unsubscribe();
          });
        }
      }
      setSlowNotificationFn(slow, fn) {
        this.slow = void 0;
        if (fn) {
          if (this.noIterator) {
            throw new Error("callbacks don't support slow notifications");
          }
          this.slow = new SlowNotifier(slow, fn);
        }
      }
      callback(err, msg) {
        this.cancelTimeout();
        err ? this.stop(err) : this.push(msg);
        if (!err && this.slow) {
          this.slow.maybeNotify(this.getPending());
        }
      }
      close(err) {
        if (!this.isClosed()) {
          this.cancelTimeout();
          const fn = /* @__PURE__ */ __name(() => {
            this.stop();
            if (this.cleanupFn) {
              try {
                this.cleanupFn(this, this.info);
              } catch (_err) {
              }
            }
            this.closed.resolve(err);
          }, "fn");
          if (this.noIterator) {
            fn();
          } else {
            this.push(fn);
          }
        }
      }
      unsubscribe(max) {
        this.protocol.unsubscribe(this, max);
      }
      cancelTimeout() {
        if (this.timer) {
          this.timer.cancel();
          this.timer = void 0;
        }
      }
      drain() {
        if (this.protocol.isClosed()) {
          return Promise.reject(new errors_1.errors.ClosedConnectionError());
        }
        if (this.isClosed()) {
          return Promise.reject(new errors_1.errors.InvalidOperationError("subscription is already closed"));
        }
        if (!this.drained) {
          this.draining = true;
          this.protocol.unsub(this);
          this.drained = this.protocol.flush((0, util_1.deferred)()).then(() => {
            this.protocol.subscriptions.cancel(this);
          }).catch(() => {
            this.protocol.subscriptions.cancel(this);
          });
        }
        return this.drained;
      }
      isDraining() {
        return this.draining;
      }
      isClosed() {
        return this.done;
      }
      getSubject() {
        return this.subject;
      }
      getMax() {
        return this.max;
      }
      getID() {
        return this.sid;
      }
    };
    __name(_SubscriptionImpl, "SubscriptionImpl");
    var SubscriptionImpl = _SubscriptionImpl;
    exports2.SubscriptionImpl = SubscriptionImpl;
    var _Subscriptions = class _Subscriptions {
      mux;
      subs;
      sidCounter;
      constructor() {
        this.sidCounter = 0;
        this.mux = null;
        this.subs = /* @__PURE__ */ new Map();
      }
      size() {
        return this.subs.size;
      }
      add(s) {
        this.sidCounter++;
        s.sid = this.sidCounter;
        this.subs.set(s.sid, s);
        return s;
      }
      setMux(s) {
        this.mux = s;
        return s;
      }
      getMux() {
        return this.mux;
      }
      get(sid) {
        return this.subs.get(sid);
      }
      resub(s) {
        this.sidCounter++;
        this.subs.delete(s.sid);
        s.sid = this.sidCounter;
        this.subs.set(s.sid, s);
        return s;
      }
      all() {
        return Array.from(this.subs.values());
      }
      cancel(s) {
        if (s) {
          s.close();
          this.subs.delete(s.sid);
        }
      }
      handleError(err) {
        const subs = this.all();
        let sub;
        if (err.operation === "subscription") {
          sub = subs.find((s) => {
            return s.subject === err.subject && s.queue === err.queue;
          });
        } else if (err.operation === "publish") {
          sub = subs.find((s) => {
            return s.requestSubject === err.subject;
          });
        }
        if (sub) {
          sub.callback(err, {});
          sub.close(err);
          this.subs.delete(sub.sid);
          return sub !== this.mux;
        }
        return false;
      }
      close() {
        this.subs.forEach((sub) => {
          sub.close();
        });
      }
    };
    __name(_Subscriptions, "Subscriptions");
    var Subscriptions = _Subscriptions;
    exports2.Subscriptions = Subscriptions;
    var _ProtocolHandler = class _ProtocolHandler {
      connected;
      connectedOnce;
      infoReceived;
      info;
      muxSubscriptions;
      options;
      outbound;
      pongs;
      subscriptions;
      transport;
      noMorePublishing;
      connectError;
      publisher;
      _closed;
      closed;
      listeners;
      heartbeats;
      parser;
      outMsgs;
      inMsgs;
      outBytes;
      inBytes;
      pendingLimit;
      lastError;
      abortReconnect;
      whyClosed;
      servers;
      server;
      features;
      connectPromise;
      dialDelay;
      raceTimer;
      constructor(options, publisher) {
        this._closed = false;
        this.connected = false;
        this.connectedOnce = false;
        this.infoReceived = false;
        this.noMorePublishing = false;
        this.abortReconnect = false;
        this.listeners = [];
        this.pendingLimit = FLUSH_THRESHOLD;
        this.outMsgs = 0;
        this.inMsgs = 0;
        this.outBytes = 0;
        this.inBytes = 0;
        this.options = options;
        this.publisher = publisher;
        this.subscriptions = new Subscriptions();
        this.muxSubscriptions = new muxsubscription_1.MuxSubscription();
        this.outbound = new databuffer_1.DataBuffer();
        this.pongs = [];
        this.whyClosed = "";
        this.pendingLimit = options.pendingLimit || this.pendingLimit;
        this.features = new semver_1.Features({ major: 0, minor: 0, micro: 0 });
        this.connectPromise = null;
        this.dialDelay = null;
        const servers = typeof options.servers === "string" ? [options.servers] : options.servers;
        this.servers = new servers_1.Servers(servers, {
          randomize: !options.noRandomize
        });
        this.closed = (0, util_1.deferred)();
        this.parser = new parser_1.Parser(this);
        this.heartbeats = new heartbeats_1.Heartbeat(this, this.options.pingInterval || options_1.DEFAULT_PING_INTERVAL, this.options.maxPingOut || options_1.DEFAULT_MAX_PING_OUT);
      }
      resetOutbound() {
        this.outbound.reset();
        const pongs = this.pongs;
        this.pongs = [];
        const err = new errors_1.errors.RequestError("connection disconnected");
        err.stack = "";
        pongs.forEach((p) => {
          p.reject(err);
        });
        this.parser = new parser_1.Parser(this);
        this.infoReceived = false;
      }
      dispatchStatus(status) {
        this.listeners.forEach((q) => {
          q.push(status);
        });
      }
      prepare() {
        if (this.transport) {
          this.transport.discard();
        }
        this.info = void 0;
        this.resetOutbound();
        const pong = (0, util_1.deferred)();
        pong.catch(() => {
        });
        this.pongs.unshift(pong);
        this.connectError = (err) => {
          pong.reject(err);
        };
        this.transport = (0, transport_1.newTransport)();
        this.transport.closed().then(async (_err) => {
          this.connected = false;
          if (!this.isClosed()) {
            await this.disconnected(this.transport.closeError || this.lastError);
            return;
          }
        });
        return pong;
      }
      disconnect() {
        this.dispatchStatus({ type: "staleConnection" });
        this.transport.disconnect();
      }
      reconnect() {
        if (this.connected) {
          this.dispatchStatus({
            type: "forceReconnect"
          });
          this.transport.disconnect();
        }
        return Promise.resolve();
      }
      async disconnected(err) {
        this.dispatchStatus({
          type: "disconnect",
          server: this.servers.getCurrentServer().toString()
        });
        if (this.options.reconnect) {
          await this.dialLoop().then(() => {
            this.dispatchStatus({
              type: "reconnect",
              server: this.servers.getCurrentServer().toString()
            });
            if (this.lastError instanceof errors_1.errors.UserAuthenticationExpiredError) {
              this.lastError = void 0;
            }
          }).catch((err2) => {
            this.close(err2).catch();
          });
        } else {
          await this.close(err).catch();
        }
      }
      async dial(srv) {
        var _a, _b;
        const pong = this.prepare();
        try {
          this.raceTimer = (0, util_1.timeout)(this.options.timeout || 2e4);
          const cp = this.transport.connect(srv, this.options);
          await Promise.race([cp, this.raceTimer]);
          (async () => {
            try {
              for await (const b of this.transport) {
                this.parser.parse(b);
              }
            } catch (err) {
              console.log("reader closed", err);
            }
          })().then();
        } catch (err) {
          pong.reject(err);
        }
        try {
          await Promise.race([this.raceTimer, pong]);
          (_a = this.raceTimer) == null ? void 0 : _a.cancel();
          this.connected = true;
          this.connectError = void 0;
          this.sendSubscriptions();
          this.connectedOnce = true;
          this.server.didConnect = true;
          this.server.reconnects = 0;
          this.flushPending();
          this.heartbeats.start();
        } catch (err) {
          (_b = this.raceTimer) == null ? void 0 : _b.cancel();
          await this.transport.close(err);
          throw err;
        }
      }
      async _doDial(srv) {
        const { resolve } = this.options;
        const alts = await srv.resolve({
          fn: (0, transport_1.getResolveFn)(),
          debug: this.options.debug,
          randomize: !this.options.noRandomize,
          resolve
        });
        let lastErr = null;
        for (const a of alts) {
          try {
            lastErr = null;
            this.dispatchStatus({ type: "reconnecting" });
            await this.dial(a);
            return;
          } catch (err) {
            lastErr = err;
          }
        }
        throw lastErr;
      }
      dialLoop() {
        if (this.connectPromise === null) {
          this.connectPromise = this.dodialLoop();
          this.connectPromise.then(() => {
          }).catch(() => {
          }).finally(() => {
            this.connectPromise = null;
          });
        }
        return this.connectPromise;
      }
      async dodialLoop() {
        let lastError;
        while (true) {
          if (this._closed) {
            this.servers.clear();
          }
          const wait = this.options.reconnectDelayHandler ? this.options.reconnectDelayHandler() : options_1.DEFAULT_RECONNECT_TIME_WAIT;
          let maxWait = wait;
          const srv = this.selectServer();
          if (!srv || this.abortReconnect) {
            if (lastError) {
              throw lastError;
            } else if (this.lastError) {
              throw this.lastError;
            } else {
              throw new errors_1.errors.ConnectionError("connection refused");
            }
          }
          const now = Date.now();
          if (srv.lastConnect === 0 || srv.lastConnect + wait <= now) {
            srv.lastConnect = Date.now();
            try {
              await this._doDial(srv);
              break;
            } catch (err) {
              lastError = err;
              if (!this.connectedOnce) {
                if (this.options.waitOnFirstConnect) {
                  continue;
                }
                this.servers.removeCurrentServer();
              }
              srv.reconnects++;
              const mra = this.options.maxReconnectAttempts || 0;
              if (mra !== -1 && srv.reconnects >= mra) {
                this.servers.removeCurrentServer();
              }
            }
          } else {
            maxWait = Math.min(maxWait, srv.lastConnect + wait - now);
            this.dialDelay = (0, util_1.delay)(maxWait);
            await this.dialDelay;
          }
        }
      }
      static async connect(options, publisher) {
        const h = new _ProtocolHandler(options, publisher);
        await h.dialLoop();
        return h;
      }
      static toError(s) {
        let err = errors_1.errors.PermissionViolationError.parse(s);
        if (err) {
          return err;
        }
        err = errors_1.errors.UserAuthenticationExpiredError.parse(s);
        if (err) {
          return err;
        }
        err = errors_1.errors.AuthorizationError.parse(s);
        if (err) {
          return err;
        }
        return new errors_1.errors.ProtocolError(s);
      }
      processMsg(msg, data) {
        this.inMsgs++;
        this.inBytes += data.length;
        if (!this.subscriptions.sidCounter) {
          return;
        }
        const sub = this.subscriptions.get(msg.sid);
        if (!sub) {
          return;
        }
        sub.received += 1;
        if (sub.callback) {
          sub.callback(null, new msg_1.MsgImpl(msg, data, this));
        }
        if (sub.max !== void 0 && sub.received >= sub.max) {
          sub.unsubscribe();
        }
      }
      processError(m) {
        let s = (0, encoders_1.decode)(m);
        if (s.startsWith("'") && s.endsWith("'")) {
          s = s.slice(1, s.length - 1);
        }
        const err = _ProtocolHandler.toError(s);
        switch (err.constructor) {
          case errors_1.errors.PermissionViolationError: {
            const pe = err;
            const mux = this.subscriptions.getMux();
            const isMuxPermission = mux ? pe.subject === mux.subject : false;
            this.subscriptions.handleError(pe);
            this.muxSubscriptions.handleError(isMuxPermission, pe);
            if (isMuxPermission) {
              this.subscriptions.setMux(null);
            }
          }
        }
        this.dispatchStatus({ type: "error", error: err });
        this.handleError(err);
      }
      handleError(err) {
        if (err instanceof errors_1.errors.UserAuthenticationExpiredError || err instanceof errors_1.errors.AuthorizationError) {
          this.handleAuthError(err);
        }
        if (!(err instanceof errors_1.errors.PermissionViolationError)) {
          this.lastError = err;
        }
      }
      handleAuthError(err) {
        if ((this.lastError instanceof errors_1.errors.UserAuthenticationExpiredError || this.lastError instanceof errors_1.errors.AuthorizationError) && this.options.ignoreAuthErrorAbort === false) {
          this.abortReconnect = true;
        }
        if (this.connectError) {
          this.connectError(err);
        } else {
          this.disconnect();
        }
      }
      processPing() {
        this.transport.send(PONG_CMD);
      }
      processPong() {
        const cb = this.pongs.shift();
        if (cb) {
          cb.resolve();
        }
      }
      processInfo(m) {
        const info = JSON.parse((0, encoders_1.decode)(m));
        this.info = info;
        const updates = this.options && this.options.ignoreClusterUpdates ? void 0 : this.servers.update(info, this.transport.isEncrypted());
        if (!this.infoReceived) {
          this.features.update((0, semver_1.parseSemVer)(info.version));
          this.infoReceived = true;
          if (this.transport.isEncrypted()) {
            this.servers.updateTLSName();
          }
          const { version, lang } = this.transport;
          try {
            const c = new Connect({ version, lang }, this.options, info.nonce);
            if (info.headers) {
              c.headers = true;
              c.no_responders = true;
            }
            const cs = JSON.stringify(c);
            this.transport.send((0, encoders_1.encode)(`CONNECT ${cs}${transport_1.CR_LF}`));
            this.transport.send(PING_CMD);
          } catch (err) {
            this.close(err).catch();
          }
        }
        if (updates) {
          const { added, deleted } = updates;
          this.dispatchStatus({ type: "update", added, deleted });
        }
        const ldm = info.ldm !== void 0 ? info.ldm : false;
        if (ldm) {
          this.dispatchStatus({
            type: "ldm",
            server: this.servers.getCurrentServer().toString()
          });
        }
      }
      push(e) {
        switch (e.kind) {
          case parser_1.Kind.MSG: {
            const { msg, data } = e;
            this.processMsg(msg, data);
            break;
          }
          case parser_1.Kind.OK:
            break;
          case parser_1.Kind.ERR:
            this.processError(e.data);
            break;
          case parser_1.Kind.PING:
            this.processPing();
            break;
          case parser_1.Kind.PONG:
            this.processPong();
            break;
          case parser_1.Kind.INFO:
            this.processInfo(e.data);
            break;
        }
      }
      sendCommand(cmd, ...payloads) {
        const len = this.outbound.length();
        let buf;
        if (typeof cmd === "string") {
          buf = (0, encoders_1.encode)(cmd);
        } else {
          buf = cmd;
        }
        this.outbound.fill(buf, ...payloads);
        if (len === 0) {
          queueMicrotask(() => {
            this.flushPending();
          });
        } else if (this.outbound.size() >= this.pendingLimit) {
          this.flushPending();
        }
      }
      publish(subject, payload = encoders_1.Empty, options) {
        let data;
        if (payload instanceof Uint8Array) {
          data = payload;
        } else if (typeof payload === "string") {
          data = encoders_1.TE.encode(payload);
        } else {
          throw new TypeError("payload types can be strings or Uint8Array");
        }
        let len = data.length;
        options = options || {};
        options.reply = options.reply || "";
        let headers2 = encoders_1.Empty;
        let hlen = 0;
        if (options.headers) {
          if (this.info && !this.info.headers) {
            errors_1.InvalidArgumentError.format("headers", "are not available on this server");
          }
          const hdrs = options.headers;
          headers2 = hdrs.encode();
          hlen = headers2.length;
          len = data.length + hlen;
        }
        if (this.info && len > this.info.max_payload) {
          throw errors_1.InvalidArgumentError.format("payload", "max_payload size exceeded");
        }
        this.outBytes += len;
        this.outMsgs++;
        let proto;
        if (options.headers) {
          if (options.reply) {
            proto = `HPUB ${subject} ${options.reply} ${hlen} ${len}\r
`;
          } else {
            proto = `HPUB ${subject} ${hlen} ${len}\r
`;
          }
          this.sendCommand(proto, headers2, data, transport_1.CRLF);
        } else {
          if (options.reply) {
            proto = `PUB ${subject} ${options.reply} ${len}\r
`;
          } else {
            proto = `PUB ${subject} ${len}\r
`;
          }
          this.sendCommand(proto, data, transport_1.CRLF);
        }
      }
      request(r) {
        this.initMux();
        this.muxSubscriptions.add(r);
        return r;
      }
      subscribe(s) {
        this.subscriptions.add(s);
        this._subunsub(s);
        return s;
      }
      _sub(s) {
        if (s.queue) {
          this.sendCommand(`SUB ${s.subject} ${s.queue} ${s.sid}\r
`);
        } else {
          this.sendCommand(`SUB ${s.subject} ${s.sid}\r
`);
        }
      }
      _subunsub(s) {
        this._sub(s);
        if (s.max) {
          this.unsubscribe(s, s.max);
        }
        return s;
      }
      unsubscribe(s, max) {
        this.unsub(s, max);
        if (s.max === void 0 || s.received >= s.max) {
          this.subscriptions.cancel(s);
        }
      }
      unsub(s, max) {
        if (!s || this.isClosed()) {
          return;
        }
        if (max) {
          this.sendCommand(`UNSUB ${s.sid} ${max}\r
`);
        } else {
          this.sendCommand(`UNSUB ${s.sid}\r
`);
        }
        s.max = max;
      }
      resub(s, subject) {
        if (!s || this.isClosed()) {
          return;
        }
        this.unsub(s);
        s.subject = subject;
        this.subscriptions.resub(s);
        this._sub(s);
      }
      flush(p) {
        if (!p) {
          p = (0, util_1.deferred)();
        }
        this.pongs.push(p);
        this.outbound.fill(PING_CMD);
        this.flushPending();
        return p;
      }
      sendSubscriptions() {
        const cmds = [];
        this.subscriptions.all().forEach((s) => {
          const sub = s;
          if (sub.queue) {
            cmds.push(`SUB ${sub.subject} ${sub.queue} ${sub.sid}${transport_1.CR_LF}`);
          } else {
            cmds.push(`SUB ${sub.subject} ${sub.sid}${transport_1.CR_LF}`);
          }
        });
        if (cmds.length) {
          this.transport.send((0, encoders_1.encode)(cmds.join("")));
        }
      }
      async close(err) {
        var _a, _b;
        if (this._closed) {
          return;
        }
        this.whyClosed = new Error("close trace").stack || "";
        this.heartbeats.cancel();
        if (this.connectError) {
          this.connectError(err);
          this.connectError = void 0;
        }
        this.muxSubscriptions.close();
        this.subscriptions.close();
        const proms = [];
        for (let i = 0; i < this.listeners.length; i++) {
          const qi = this.listeners[i];
          if (qi) {
            qi.push({ type: "close" });
            qi.stop();
            proms.push(qi.iterClosed);
          }
        }
        if (proms.length) {
          await Promise.all(proms);
        }
        this._closed = true;
        await this.transport.close(err);
        (_a = this.raceTimer) == null ? void 0 : _a.cancel();
        (_b = this.dialDelay) == null ? void 0 : _b.cancel();
        this.closed.resolve(err);
      }
      isClosed() {
        return this._closed;
      }
      async drain() {
        const subs = this.subscriptions.all();
        const promises = [];
        subs.forEach((sub) => {
          promises.push(sub.drain());
        });
        try {
          await Promise.allSettled(promises);
        } catch {
        } finally {
          this.noMorePublishing = true;
          await this.flush();
        }
        return this.close();
      }
      flushPending() {
        if (!this.infoReceived || !this.connected) {
          return;
        }
        if (this.outbound.size()) {
          const d = this.outbound.drain();
          this.transport.send(d);
        }
      }
      initMux() {
        const mux = this.subscriptions.getMux();
        if (!mux) {
          const inbox = this.muxSubscriptions.init(this.options.inboxPrefix);
          const sub = new SubscriptionImpl(this, `${inbox}*`);
          sub.callback = this.muxSubscriptions.dispatcher();
          this.subscriptions.setMux(sub);
          this.subscribe(sub);
        }
      }
      selectServer() {
        const server = this.servers.selectServer();
        if (server === void 0) {
          return void 0;
        }
        this.server = server;
        return this.server;
      }
      getServer() {
        return this.server;
      }
    };
    __name(_ProtocolHandler, "ProtocolHandler");
    var ProtocolHandler = _ProtocolHandler;
    exports2.ProtocolHandler = ProtocolHandler;
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/request.js
var require_request = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/request.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RequestOne = exports2.RequestMany = exports2.BaseRequest = void 0;
    var util_1 = require_util();
    var nuid_1 = require_nuid2();
    var errors_1 = require_errors();
    var _BaseRequest = class _BaseRequest {
      token;
      received;
      ctx;
      requestSubject;
      mux;
      constructor(mux, requestSubject, asyncTraces = true) {
        this.mux = mux;
        this.requestSubject = requestSubject;
        this.received = 0;
        this.token = nuid_1.nuid.next();
        if (asyncTraces) {
          this.ctx = new errors_1.RequestError();
        }
      }
    };
    __name(_BaseRequest, "BaseRequest");
    var BaseRequest = _BaseRequest;
    exports2.BaseRequest = BaseRequest;
    var _RequestMany = class _RequestMany extends BaseRequest {
      callback;
      done;
      timer;
      max;
      opts;
      constructor(mux, requestSubject, opts = { maxWait: 1e3 }) {
        super(mux, requestSubject);
        this.opts = opts;
        if (typeof this.opts.callback !== "function") {
          throw new TypeError("callback must be a function");
        }
        this.callback = this.opts.callback;
        this.max = typeof opts.maxMessages === "number" && opts.maxMessages > 0 ? opts.maxMessages : -1;
        this.done = (0, util_1.deferred)();
        this.done.then(() => {
          this.callback(null, null);
        });
        this.timer = setTimeout(() => {
          this.cancel();
        }, opts.maxWait);
      }
      cancel(err) {
        if (err) {
          this.callback(err, null);
        }
        clearTimeout(this.timer);
        this.mux.cancel(this);
        this.done.resolve();
      }
      resolver(err, msg) {
        if (err) {
          if (this.ctx) {
            err.stack += `

${this.ctx.stack}`;
          }
          this.cancel(err);
        } else {
          this.callback(null, msg);
          if (this.opts.strategy === "count") {
            this.max--;
            if (this.max === 0) {
              this.cancel();
            }
          }
          if (this.opts.strategy === "stall") {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
              this.cancel();
            }, this.opts.stall || 300);
          }
          if (this.opts.strategy === "sentinel") {
            if (msg && msg.data.length === 0) {
              this.cancel();
            }
          }
        }
      }
    };
    __name(_RequestMany, "RequestMany");
    var RequestMany = _RequestMany;
    exports2.RequestMany = RequestMany;
    var _RequestOne = class _RequestOne extends BaseRequest {
      deferred;
      timer;
      constructor(mux, requestSubject, opts = { timeout: 1e3 }, asyncTraces = true) {
        super(mux, requestSubject, asyncTraces);
        this.deferred = (0, util_1.deferred)();
        this.timer = (0, util_1.timeout)(opts.timeout, asyncTraces);
      }
      resolver(err, msg) {
        if (this.timer) {
          this.timer.cancel();
        }
        if (err) {
          if (!(err instanceof errors_1.TimeoutError)) {
            if (this.ctx) {
              this.ctx.message = err.message;
              this.ctx.cause = err;
              err = this.ctx;
            } else {
              err = new errors_1.errors.RequestError(err.message, { cause: err });
            }
          }
          this.deferred.reject(err);
        } else {
          this.deferred.resolve(msg);
        }
        this.cancel();
      }
      cancel(err) {
        if (this.timer) {
          this.timer.cancel();
        }
        this.mux.cancel(this);
        this.deferred.reject(err ? err : new errors_1.RequestError("cancelled"));
      }
    };
    __name(_RequestOne, "RequestOne");
    var RequestOne = _RequestOne;
    exports2.RequestOne = RequestOne;
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/nats.js
var require_nats = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/nats.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NatsConnectionImpl = void 0;
    var util_1 = require_util();
    var protocol_1 = require_protocol();
    var encoders_1 = require_encoders();
    var headers_1 = require_headers();
    var semver_1 = require_semver();
    var options_1 = require_options();
    var queued_iterator_1 = require_queued_iterator();
    var request_1 = require_request();
    var core_1 = require_core();
    var errors_1 = require_errors();
    var _NatsConnectionImpl = class _NatsConnectionImpl {
      options;
      protocol;
      draining;
      closeListeners;
      constructor(opts) {
        this.draining = false;
        this.options = (0, options_1.parseOptions)(opts);
      }
      static connect(opts = {}) {
        return new Promise((resolve, reject) => {
          const nc = new _NatsConnectionImpl(opts);
          protocol_1.ProtocolHandler.connect(nc.options, nc).then((ph) => {
            nc.protocol = ph;
            resolve(nc);
          }).catch((err) => {
            reject(err);
          });
        });
      }
      closed() {
        return this.protocol.closed;
      }
      async close() {
        await this.protocol.close();
      }
      _check(subject, sub, pub) {
        if (this.isClosed()) {
          throw new errors_1.errors.ClosedConnectionError();
        }
        if (sub && this.isDraining()) {
          throw new errors_1.errors.DrainingConnectionError();
        }
        if (pub && this.protocol.noMorePublishing) {
          throw new errors_1.errors.DrainingConnectionError();
        }
        subject = subject || "";
        if (subject.length === 0) {
          throw new errors_1.errors.InvalidSubjectError(subject);
        }
      }
      publish(subject, data, options) {
        this._check(subject, false, true);
        if (options == null ? void 0 : options.reply) {
          this._check(options.reply, false, true);
        }
        if (typeof (options == null ? void 0 : options.traceOnly) === "boolean") {
          const hdrs = options.headers || (0, headers_1.headers)();
          hdrs.set("Nats-Trace-Only", "true");
          options.headers = hdrs;
        }
        if (typeof (options == null ? void 0 : options.traceDestination) === "string") {
          const hdrs = options.headers || (0, headers_1.headers)();
          hdrs.set("Nats-Trace-Dest", options.traceDestination);
          options.headers = hdrs;
        }
        this.protocol.publish(subject, data, options);
      }
      publishMessage(msg) {
        return this.publish(msg.subject, msg.data, {
          reply: msg.reply,
          headers: msg.headers
        });
      }
      respondMessage(msg) {
        if (msg.reply) {
          this.publish(msg.reply, msg.data, {
            reply: msg.reply,
            headers: msg.headers
          });
          return true;
        }
        return false;
      }
      subscribe(subject, opts = {}) {
        this._check(subject, true, false);
        const sub = new protocol_1.SubscriptionImpl(this.protocol, subject, opts);
        if (typeof opts.callback !== "function" && typeof opts.slow === "number") {
          sub.setSlowNotificationFn(opts.slow, (pending) => {
            this.protocol.dispatchStatus({
              type: "slowConsumer",
              sub,
              pending
            });
          });
        }
        this.protocol.subscribe(sub);
        return sub;
      }
      _resub(s, subject, max) {
        this._check(subject, true, false);
        const si = s;
        si.max = max;
        if (max) {
          si.max = max + si.received;
        }
        this.protocol.resub(si, subject);
      }
      // possibilities are:
      // stop on error or any non-100 status
      // AND:
      // - wait for timer
      // - wait for n messages or timer
      // - wait for unknown messages, done when empty or reset timer expires (with possible alt wait)
      // - wait for unknown messages, done when an empty payload is received or timer expires (with possible alt wait)
      requestMany(subject, data = encoders_1.Empty, opts = { maxWait: 1e3, maxMessages: -1 }) {
        const asyncTraces = !(this.protocol.options.noAsyncTraces || false);
        try {
          this._check(subject, true, true);
        } catch (err) {
          return Promise.reject(err);
        }
        opts.strategy = opts.strategy || "timer";
        opts.maxWait = opts.maxWait || 1e3;
        if (opts.maxWait < 1) {
          return Promise.reject(errors_1.InvalidArgumentError.format("timeout", "must be greater than 0"));
        }
        const qi = new queued_iterator_1.QueuedIteratorImpl();
        function stop(err) {
          qi.push(() => {
            qi.stop(err);
          });
        }
        __name(stop, "stop");
        function callback(err, msg) {
          if (err || msg === null) {
            stop(err === null ? void 0 : err);
          } else {
            qi.push(msg);
          }
        }
        __name(callback, "callback");
        if (opts.noMux) {
          const stack = asyncTraces ? new Error().stack : null;
          let max = typeof opts.maxMessages === "number" && opts.maxMessages > 0 ? opts.maxMessages : -1;
          const sub = this.subscribe((0, core_1.createInbox)(this.options.inboxPrefix), {
            callback: /* @__PURE__ */ __name((err, msg) => {
              var _a, _b;
              if (((_a = msg == null ? void 0 : msg.data) == null ? void 0 : _a.length) === 0 && ((_b = msg == null ? void 0 : msg.headers) == null ? void 0 : _b.status) === "503") {
                err = new errors_1.errors.NoRespondersError(subject);
              }
              if (err) {
                if (stack) {
                  err.stack += `

${stack}`;
                }
                cancel(err);
                return;
              }
              callback(null, msg);
              if (opts.strategy === "count") {
                max--;
                if (max === 0) {
                  cancel();
                }
              }
              if (opts.strategy === "stall") {
                clearTimers();
                timer = setTimeout(() => {
                  cancel();
                }, 300);
              }
              if (opts.strategy === "sentinel") {
                if (msg && msg.data.length === 0) {
                  cancel();
                }
              }
            }, "callback")
          });
          sub.requestSubject = subject;
          sub.closed.then(() => {
            stop();
          }).catch((err) => {
            qi.stop(err);
          });
          const cancel = /* @__PURE__ */ __name((err) => {
            if (err) {
              qi.push(() => {
                throw err;
              });
            }
            clearTimers();
            sub.drain().then(() => {
              stop();
            }).catch((_err) => {
              stop();
            });
          }, "cancel");
          qi.iterClosed.then(() => {
            clearTimers();
            sub == null ? void 0 : sub.unsubscribe();
          }).catch((_err) => {
            clearTimers();
            sub == null ? void 0 : sub.unsubscribe();
          });
          const { headers: headers2, traceDestination, traceOnly } = opts;
          try {
            this.publish(subject, data, {
              reply: sub.getSubject(),
              headers: headers2,
              traceDestination,
              traceOnly
            });
          } catch (err) {
            cancel(err);
          }
          let timer = setTimeout(() => {
            cancel();
          }, opts.maxWait);
          const clearTimers = /* @__PURE__ */ __name(() => {
            if (timer) {
              clearTimeout(timer);
            }
          }, "clearTimers");
        } else {
          const rmo = opts;
          rmo.callback = callback;
          qi.iterClosed.then(() => {
            r.cancel();
          }).catch((err) => {
            r.cancel(err);
          });
          const r = new request_1.RequestMany(this.protocol.muxSubscriptions, subject, rmo);
          this.protocol.request(r);
          const { headers: headers2, traceDestination, traceOnly } = opts;
          try {
            this.publish(subject, data, {
              reply: `${this.protocol.muxSubscriptions.baseInbox}${r.token}`,
              headers: headers2,
              traceDestination,
              traceOnly
            });
          } catch (err) {
            r.cancel(err);
          }
        }
        return Promise.resolve(qi);
      }
      request(subject, data, opts = { timeout: 1e3, noMux: false }) {
        try {
          this._check(subject, true, true);
        } catch (err) {
          return Promise.reject(err);
        }
        const asyncTraces = !(this.protocol.options.noAsyncTraces || false);
        opts.timeout = opts.timeout || 1e3;
        if (opts.timeout < 1) {
          return Promise.reject(errors_1.InvalidArgumentError.format("timeout", `must be greater than 0`));
        }
        if (!opts.noMux && opts.reply) {
          return Promise.reject(errors_1.InvalidArgumentError.format(["reply", "noMux"], "are mutually exclusive"));
        }
        if (opts.noMux) {
          const inbox = opts.reply ? opts.reply : (0, core_1.createInbox)(this.options.inboxPrefix);
          const d = (0, util_1.deferred)();
          const errCtx = asyncTraces ? new errors_1.errors.RequestError("") : null;
          const sub = this.subscribe(inbox, {
            max: 1,
            timeout: opts.timeout,
            callback: /* @__PURE__ */ __name((err, msg) => {
              var _a, _b;
              if (msg && ((_a = msg.data) == null ? void 0 : _a.length) === 0 && ((_b = msg.headers) == null ? void 0 : _b.code) === 503) {
                err = new errors_1.errors.NoRespondersError(subject);
              }
              if (err) {
                if (!(err instanceof errors_1.TimeoutError)) {
                  if (errCtx) {
                    errCtx.message = err.message;
                    errCtx.cause = err;
                    err = errCtx;
                  } else {
                    err = new errors_1.errors.RequestError(err.message, { cause: err });
                  }
                }
                d.reject(err);
                sub.unsubscribe();
              } else {
                d.resolve(msg);
              }
            }, "callback")
          });
          sub.requestSubject = subject;
          this.protocol.publish(subject, data, {
            reply: inbox,
            headers: opts.headers
          });
          return d;
        } else {
          const r = new request_1.RequestOne(this.protocol.muxSubscriptions, subject, opts, asyncTraces);
          this.protocol.request(r);
          const { headers: headers2, traceDestination, traceOnly } = opts;
          try {
            this.publish(subject, data, {
              reply: `${this.protocol.muxSubscriptions.baseInbox}${r.token}`,
              headers: headers2,
              traceDestination,
              traceOnly
            });
          } catch (err) {
            r.cancel(err);
          }
          const p = Promise.race([r.timer, r.deferred]);
          p.catch(() => {
            r.cancel();
          });
          return p;
        }
      }
      /** *
       * Flushes to the server. Promise resolves when round-trip completes.
       * @returns {Promise<void>}
       */
      flush() {
        if (this.isClosed()) {
          return Promise.reject(new errors_1.errors.ClosedConnectionError());
        }
        return this.protocol.flush();
      }
      drain() {
        if (this.isClosed()) {
          return Promise.reject(new errors_1.errors.ClosedConnectionError());
        }
        if (this.isDraining()) {
          return Promise.reject(new errors_1.errors.DrainingConnectionError());
        }
        this.draining = true;
        return this.protocol.drain();
      }
      isClosed() {
        return this.protocol.isClosed();
      }
      isDraining() {
        return this.draining;
      }
      getServer() {
        const srv = this.protocol.getServer();
        return srv ? srv.listen : "";
      }
      status() {
        const iter = new queued_iterator_1.QueuedIteratorImpl();
        iter.iterClosed.then(() => {
          const idx = this.protocol.listeners.indexOf(iter);
          if (idx > -1) {
            this.protocol.listeners.splice(idx, 1);
          }
        });
        this.protocol.listeners.push(iter);
        return iter;
      }
      get info() {
        return this.protocol.isClosed() ? void 0 : this.protocol.info;
      }
      async context() {
        const r = await this.request(`$SYS.REQ.USER.INFO`);
        return r.json((key, value) => {
          if (key === "time") {
            return new Date(Date.parse(value));
          }
          return value;
        });
      }
      stats() {
        return {
          inBytes: this.protocol.inBytes,
          outBytes: this.protocol.outBytes,
          inMsgs: this.protocol.inMsgs,
          outMsgs: this.protocol.outMsgs
        };
      }
      getServerVersion() {
        const info = this.info;
        return info ? (0, semver_1.parseSemVer)(info.version) : void 0;
      }
      async rtt() {
        if (this.isClosed()) {
          throw new errors_1.errors.ClosedConnectionError();
        }
        if (!this.protocol.connected) {
          throw new errors_1.errors.RequestError("connection disconnected");
        }
        const start = Date.now();
        await this.flush();
        return Date.now() - start;
      }
      get features() {
        return this.protocol.features;
      }
      reconnect() {
        if (this.isClosed()) {
          return Promise.reject(new errors_1.errors.ClosedConnectionError());
        }
        if (this.isDraining()) {
          return Promise.reject(new errors_1.errors.DrainingConnectionError());
        }
        return this.protocol.reconnect();
      }
      // internal
      addCloseListener(listener) {
        if (this.closeListeners === void 0) {
          this.closeListeners = new CloseListeners(this.closed());
        }
        this.closeListeners.add(listener);
      }
      // internal
      removeCloseListener(listener) {
        if (this.closeListeners) {
          this.closeListeners.remove(listener);
        }
      }
    };
    __name(_NatsConnectionImpl, "NatsConnectionImpl");
    var NatsConnectionImpl = _NatsConnectionImpl;
    exports2.NatsConnectionImpl = NatsConnectionImpl;
    var _CloseListeners = class _CloseListeners {
      listeners;
      constructor(closed) {
        this.listeners = [];
        closed.then((err) => {
          this.notify(err);
        });
      }
      add(listener) {
        this.listeners.push(listener);
      }
      remove(listener) {
        this.listeners = this.listeners.filter((l) => l !== listener);
      }
      notify(err) {
        this.listeners.forEach((l) => {
          if (typeof l.connectionClosedCallback === "function") {
            try {
              l.connectionClosedCallback(err);
            } catch (_) {
            }
          }
        });
        this.listeners = [];
      }
    };
    __name(_CloseListeners, "CloseListeners");
    var CloseListeners = _CloseListeners;
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/types.js
var require_types = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Empty = void 0;
    var encoders_1 = require_encoders();
    Object.defineProperty(exports2, "Empty", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return encoders_1.Empty;
    }, "get") });
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/bench.js
var require_bench = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/bench.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Bench = exports2.Metric = void 0;
    exports2.throughput = throughput;
    exports2.msgThroughput = msgThroughput;
    exports2.humanizeBytes = humanizeBytes;
    var types_1 = require_types();
    var nuid_1 = require_nuid2();
    var util_1 = require_util();
    var _Metric = class _Metric {
      name;
      duration;
      date;
      payload;
      msgs;
      lang;
      version;
      bytes;
      asyncRequests;
      min;
      max;
      constructor(name, duration) {
        this.name = name;
        this.duration = duration;
        this.date = Date.now();
        this.payload = 0;
        this.msgs = 0;
        this.bytes = 0;
      }
      toString() {
        const sec = this.duration / 1e3;
        const mps = Math.round(this.msgs / sec);
        const label = this.asyncRequests ? "asyncRequests" : "";
        let minmax = "";
        if (this.max) {
          minmax = `${this.min}/${this.max}`;
        }
        return `${this.name}${label ? " [asyncRequests]" : ""} ${humanizeNumber(mps)} msgs/sec - [${sec.toFixed(2)} secs] ~ ${throughput(this.bytes, sec)} ${minmax}`;
      }
      toCsv() {
        return `"${this.name}",${new Date(this.date).toISOString()},${this.lang},${this.version},${this.msgs},${this.payload},${this.bytes},${this.duration},${this.asyncRequests ? this.asyncRequests : false}
`;
      }
      static header() {
        return `Test,Date,Lang,Version,Count,MsgPayload,Bytes,Millis,Async
`;
      }
    };
    __name(_Metric, "Metric");
    var Metric = _Metric;
    exports2.Metric = Metric;
    var _Bench = class _Bench {
      nc;
      callbacks;
      msgs;
      size;
      subject;
      asyncRequests;
      pub;
      sub;
      req;
      rep;
      perf;
      payload;
      constructor(nc, opts = {
        msgs: 1e5,
        size: 128,
        subject: "",
        asyncRequests: false,
        pub: false,
        sub: false,
        req: false,
        rep: false
      }) {
        this.nc = nc;
        this.callbacks = opts.callbacks || false;
        this.msgs = opts.msgs || 0;
        this.size = opts.size || 0;
        this.subject = opts.subject || nuid_1.nuid.next();
        this.asyncRequests = opts.asyncRequests || false;
        this.pub = opts.pub || false;
        this.sub = opts.sub || false;
        this.req = opts.req || false;
        this.rep = opts.rep || false;
        this.perf = new util_1.Perf();
        this.payload = this.size ? new Uint8Array(this.size) : types_1.Empty;
        if (!this.pub && !this.sub && !this.req && !this.rep) {
          throw new Error("no options selected");
        }
      }
      async run() {
        this.nc.closed().then((err) => {
          if (err) {
            throw err;
          }
        });
        if (this.callbacks) {
          await this.runCallbacks();
        } else {
          await this.runAsync();
        }
        return this.processMetrics();
      }
      processMetrics() {
        const nc = this.nc;
        const { lang, version } = nc.protocol.transport;
        if (this.pub && this.sub) {
          this.perf.measure("pubsub", "pubStart", "subStop");
        }
        if (this.req && this.rep) {
          this.perf.measure("reqrep", "reqStart", "reqStop");
        }
        const measures = this.perf.getEntries();
        const pubsub = measures.find((m) => m.name === "pubsub");
        const reqrep = measures.find((m) => m.name === "reqrep");
        const req = measures.find((m) => m.name === "req");
        const rep = measures.find((m) => m.name === "rep");
        const pub = measures.find((m) => m.name === "pub");
        const sub = measures.find((m) => m.name === "sub");
        const stats = this.nc.stats();
        const metrics = [];
        if (pubsub) {
          const { name, duration } = pubsub;
          const m = new Metric(name, duration);
          m.msgs = this.msgs * 2;
          m.bytes = stats.inBytes + stats.outBytes;
          m.lang = lang;
          m.version = version;
          m.payload = this.payload.length;
          metrics.push(m);
        }
        if (reqrep) {
          const { name, duration } = reqrep;
          const m = new Metric(name, duration);
          m.msgs = this.msgs * 2;
          m.bytes = stats.inBytes + stats.outBytes;
          m.lang = lang;
          m.version = version;
          m.payload = this.payload.length;
          metrics.push(m);
        }
        if (pub) {
          const { name, duration } = pub;
          const m = new Metric(name, duration);
          m.msgs = this.msgs;
          m.bytes = stats.outBytes;
          m.lang = lang;
          m.version = version;
          m.payload = this.payload.length;
          metrics.push(m);
        }
        if (sub) {
          const { name, duration } = sub;
          const m = new Metric(name, duration);
          m.msgs = this.msgs;
          m.bytes = stats.inBytes;
          m.lang = lang;
          m.version = version;
          m.payload = this.payload.length;
          metrics.push(m);
        }
        if (rep) {
          const { name, duration } = rep;
          const m = new Metric(name, duration);
          m.msgs = this.msgs;
          m.bytes = stats.inBytes + stats.outBytes;
          m.lang = lang;
          m.version = version;
          m.payload = this.payload.length;
          metrics.push(m);
        }
        if (req) {
          const { name, duration } = req;
          const m = new Metric(name, duration);
          m.msgs = this.msgs;
          m.bytes = stats.inBytes + stats.outBytes;
          m.lang = lang;
          m.version = version;
          m.payload = this.payload.length;
          metrics.push(m);
        }
        return metrics;
      }
      async runCallbacks() {
        const jobs = [];
        if (this.sub) {
          const d = (0, util_1.deferred)();
          jobs.push(d);
          let i = 0;
          this.nc.subscribe(this.subject, {
            max: this.msgs,
            callback: /* @__PURE__ */ __name(() => {
              i++;
              if (i === 1) {
                this.perf.mark("subStart");
              }
              if (i === this.msgs) {
                this.perf.mark("subStop");
                this.perf.measure("sub", "subStart", "subStop");
                d.resolve();
              }
            }, "callback")
          });
        }
        if (this.rep) {
          const d = (0, util_1.deferred)();
          jobs.push(d);
          let i = 0;
          this.nc.subscribe(this.subject, {
            max: this.msgs,
            callback: /* @__PURE__ */ __name((_, m) => {
              m.respond(this.payload);
              i++;
              if (i === 1) {
                this.perf.mark("repStart");
              }
              if (i === this.msgs) {
                this.perf.mark("repStop");
                this.perf.measure("rep", "repStart", "repStop");
                d.resolve();
              }
            }, "callback")
          });
        }
        if (this.pub) {
          const job = (async () => {
            this.perf.mark("pubStart");
            for (let i = 0; i < this.msgs; i++) {
              this.nc.publish(this.subject, this.payload);
            }
            await this.nc.flush();
            this.perf.mark("pubStop");
            this.perf.measure("pub", "pubStart", "pubStop");
          })();
          jobs.push(job);
        }
        if (this.req) {
          const job = (async () => {
            if (this.asyncRequests) {
              this.perf.mark("reqStart");
              const a = [];
              for (let i = 0; i < this.msgs; i++) {
                a.push(this.nc.request(this.subject, this.payload, { timeout: 2e4 }));
              }
              await Promise.all(a);
              this.perf.mark("reqStop");
              this.perf.measure("req", "reqStart", "reqStop");
            } else {
              this.perf.mark("reqStart");
              for (let i = 0; i < this.msgs; i++) {
                await this.nc.request(this.subject);
              }
              this.perf.mark("reqStop");
              this.perf.measure("req", "reqStart", "reqStop");
            }
          })();
          jobs.push(job);
        }
        await Promise.all(jobs);
      }
      async runAsync() {
        const jobs = [];
        if (this.rep) {
          let first = false;
          const sub = this.nc.subscribe(this.subject, { max: this.msgs });
          const job = (async () => {
            for await (const m of sub) {
              if (!first) {
                this.perf.mark("repStart");
                first = true;
              }
              m.respond(this.payload);
            }
            await this.nc.flush();
            this.perf.mark("repStop");
            this.perf.measure("rep", "repStart", "repStop");
          })();
          jobs.push(job);
        }
        if (this.sub) {
          let first = false;
          const sub = this.nc.subscribe(this.subject, { max: this.msgs });
          const job = (async () => {
            for await (const _m of sub) {
              if (!first) {
                this.perf.mark("subStart");
                first = true;
              }
            }
            this.perf.mark("subStop");
            this.perf.measure("sub", "subStart", "subStop");
          })();
          jobs.push(job);
        }
        if (this.pub) {
          const job = (async () => {
            this.perf.mark("pubStart");
            for (let i = 0; i < this.msgs; i++) {
              this.nc.publish(this.subject, this.payload);
            }
            await this.nc.flush();
            this.perf.mark("pubStop");
            this.perf.measure("pub", "pubStart", "pubStop");
          })();
          jobs.push(job);
        }
        if (this.req) {
          const job = (async () => {
            if (this.asyncRequests) {
              this.perf.mark("reqStart");
              const a = [];
              for (let i = 0; i < this.msgs; i++) {
                a.push(this.nc.request(this.subject, this.payload, { timeout: 2e4 }));
              }
              await Promise.all(a);
              this.perf.mark("reqStop");
              this.perf.measure("req", "reqStart", "reqStop");
            } else {
              this.perf.mark("reqStart");
              for (let i = 0; i < this.msgs; i++) {
                await this.nc.request(this.subject);
              }
              this.perf.mark("reqStop");
              this.perf.measure("req", "reqStart", "reqStop");
            }
          })();
          jobs.push(job);
        }
        await Promise.all(jobs);
      }
    };
    __name(_Bench, "Bench");
    var Bench = _Bench;
    exports2.Bench = Bench;
    function throughput(bytes, seconds) {
      return `${humanizeBytes(bytes / seconds)}/sec`;
    }
    __name(throughput, "throughput");
    function msgThroughput(msgs, seconds) {
      return `${Math.floor(msgs / seconds)} msgs/sec`;
    }
    __name(msgThroughput, "msgThroughput");
    function humanizeBytes(bytes, si = false) {
      const base = si ? 1e3 : 1024;
      const pre = si ? ["k", "M", "G", "T", "P", "E"] : ["K", "M", "G", "T", "P", "E"];
      const post = si ? "iB" : "B";
      if (bytes < base) {
        return `${bytes.toFixed(2)} ${post}`;
      }
      const exp = parseInt(Math.log(bytes) / Math.log(base) + "");
      const index = parseInt(exp - 1 + "");
      return `${(bytes / Math.pow(base, exp)).toFixed(2)} ${pre[index]}${post}`;
    }
    __name(humanizeBytes, "humanizeBytes");
    function humanizeNumber(n) {
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    __name(humanizeNumber, "humanizeNumber");
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/idleheartbeat_monitor.js
var require_idleheartbeat_monitor = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/idleheartbeat_monitor.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IdleHeartbeatMonitor = void 0;
    var _IdleHeartbeatMonitor = class _IdleHeartbeatMonitor {
      interval;
      maxOut;
      cancelAfter;
      timer;
      autoCancelTimer;
      last;
      missed;
      count;
      callback;
      /**
       * Constructor
       * @param interval in millis to check
       * @param cb a callback to report when heartbeats are missed
       * @param opts monitor options @see IdleHeartbeatOptions
       */
      constructor(interval, cb, opts = { maxOut: 2 }) {
        this.interval = interval;
        this.maxOut = (opts == null ? void 0 : opts.maxOut) || 2;
        this.cancelAfter = (opts == null ? void 0 : opts.cancelAfter) || 0;
        this.last = Date.now();
        this.missed = 0;
        this.count = 0;
        this.callback = cb;
        this._schedule();
      }
      /**
       * cancel monitoring
       */
      cancel() {
        if (this.autoCancelTimer) {
          clearTimeout(this.autoCancelTimer);
        }
        if (this.timer) {
          clearInterval(this.timer);
        }
        this.timer = 0;
        this.autoCancelTimer = 0;
        this.missed = 0;
      }
      /**
       * work signals that there was work performed
       */
      work() {
        this.last = Date.now();
        this.missed = 0;
      }
      /**
       * internal api to change the interval, cancelAfter and maxOut
       * @param interval
       * @param cancelAfter
       * @param maxOut
       */
      _change(interval, cancelAfter = 0, maxOut = 2) {
        this.interval = interval;
        this.maxOut = maxOut;
        this.cancelAfter = cancelAfter;
        this.restart();
      }
      /**
       * cancels and restarts the monitoring
       */
      restart() {
        this.cancel();
        this._schedule();
      }
      /**
       * internal api called to start monitoring
       */
      _schedule() {
        if (this.cancelAfter > 0) {
          this.autoCancelTimer = setTimeout(() => {
            this.cancel();
          }, this.cancelAfter);
        }
        this.timer = setInterval(() => {
          this.count++;
          if (Date.now() - this.last > this.interval) {
            this.missed++;
          }
          if (this.missed >= this.maxOut) {
            try {
              if (this.callback(this.missed) === true) {
                this.cancel();
              }
            } catch (err) {
              console.log(err);
            }
          }
        }, this.interval);
      }
    };
    __name(_IdleHeartbeatMonitor, "IdleHeartbeatMonitor");
    var IdleHeartbeatMonitor = _IdleHeartbeatMonitor;
    exports2.IdleHeartbeatMonitor = IdleHeartbeatMonitor;
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/version.js
var require_version2 = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/version.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.version = void 0;
    exports2.version = "3.1.0";
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/ws_transport.js
var require_ws_transport = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/ws_transport.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WsTransport = void 0;
    exports2.wsUrlParseFn = wsUrlParseFn;
    exports2.wsconnect = wsconnect;
    var util_1 = require_util();
    var transport_1 = require_transport();
    var options_1 = require_options();
    var databuffer_1 = require_databuffer();
    var protocol_1 = require_protocol();
    var nats_1 = require_nats();
    var version_1 = require_version2();
    var errors_1 = require_errors();
    var VERSION = version_1.version;
    var LANG = "nats.ws";
    var _WsTransport = class _WsTransport {
      version;
      lang;
      closeError;
      connected;
      done;
      // @ts-ignore: expecting global WebSocket
      socket;
      options;
      socketClosed;
      encrypted;
      peeked;
      yields;
      signal;
      closedNotification;
      constructor() {
        this.version = VERSION;
        this.lang = LANG;
        this.connected = false;
        this.done = false;
        this.socketClosed = false;
        this.encrypted = false;
        this.peeked = false;
        this.yields = [];
        this.signal = (0, util_1.deferred)();
        this.closedNotification = (0, util_1.deferred)();
      }
      async connect(server, options) {
        const connected = false;
        const ok = (0, util_1.deferred)();
        this.options = options;
        const u = server.src;
        if (options.wsFactory) {
          const { socket, encrypted } = await options.wsFactory(server.src, options);
          this.socket = socket;
          this.encrypted = encrypted;
        } else {
          this.encrypted = u.indexOf("wss://") === 0;
          this.socket = new WebSocket(u);
        }
        this.socket.binaryType = "arraybuffer";
        this.socket.onopen = () => {
          if (this.done) {
            this._closed(new Error("aborted"));
          }
        };
        this.socket.onmessage = (me) => {
          if (this.done) {
            return;
          }
          this.yields.push(new Uint8Array(me.data));
          if (this.peeked) {
            this.signal.resolve();
            return;
          }
          const t = databuffer_1.DataBuffer.concat(...this.yields);
          const pm = (0, transport_1.extractProtocolMessage)(t);
          if (pm !== "") {
            const m = protocol_1.INFO.exec(pm);
            if (!m) {
              if (options.debug) {
                console.error("!!!", (0, util_1.render)(t));
              }
              ok.reject(new Error("unexpected response from server"));
              return;
            }
            try {
              const info = JSON.parse(m[1]);
              (0, options_1.checkOptions)(info, this.options);
              this.peeked = true;
              this.connected = true;
              this.signal.resolve();
              ok.resolve();
            } catch (err) {
              ok.reject(err);
              return;
            }
          }
        };
        this.socket.onclose = (evt) => {
          let reason;
          if (!evt.wasClean && evt.reason !== "") {
            reason = new Error(evt.reason);
          }
          this._closed(reason);
          this._cleanup();
        };
        this.socket.onerror = (e) => {
          if (this.done) {
            return;
          }
          const evt = e;
          const err = new errors_1.errors.ConnectionError(evt.message);
          if (!connected) {
            ok.reject(err);
          } else {
            this._closed(err);
          }
          this._cleanup();
        };
        return ok;
      }
      _cleanup() {
        if (this.socketClosed === false) {
          this.socketClosed = true;
          this.socket.onopen = null;
          this.socket.onmessage = null;
          this.socket.onerror = null;
          this.socket.onclose = null;
          this.closedNotification.resolve(this.closeError);
        }
      }
      disconnect() {
        this._closed(void 0, true);
      }
      async _closed(err, _internal = true) {
        if (this.done) {
          try {
            this.socket.close();
          } catch (_) {
          }
          return;
        }
        this.closeError = err;
        if (!err) {
          while (!this.socketClosed && this.socket.bufferedAmount > 0) {
            await (0, util_1.delay)(100);
          }
        }
        this.done = true;
        try {
          this.socket.close();
        } catch (_) {
        }
        return this.closedNotification;
      }
      get isClosed() {
        return this.done;
      }
      [Symbol.asyncIterator]() {
        return this.iterate();
      }
      async *iterate() {
        while (true) {
          if (this.done) {
            return;
          }
          if (this.yields.length === 0) {
            await this.signal;
          }
          const yields = this.yields;
          this.yields = [];
          for (let i = 0; i < yields.length; i++) {
            if (this.options.debug) {
              console.info(`> ${(0, util_1.render)(yields[i])}`);
            }
            yield yields[i];
          }
          if (this.done) {
            break;
          } else if (this.yields.length === 0) {
            yields.length = 0;
            this.yields = yields;
            this.signal = (0, util_1.deferred)();
          }
        }
      }
      isEncrypted() {
        return this.connected && this.encrypted;
      }
      send(frame) {
        if (this.done) {
          return;
        }
        try {
          this.socket.send(frame.buffer);
          if (this.options.debug) {
            console.info(`< ${(0, util_1.render)(frame)}`);
          }
          return;
        } catch (err) {
          if (this.options.debug) {
            console.error(`!!! ${(0, util_1.render)(frame)}: ${err}`);
          }
        }
      }
      close(err) {
        return this._closed(err, false);
      }
      closed() {
        return this.closedNotification;
      }
      // this is to allow a force discard on a connection
      // if the connection fails during the handshake protocol.
      // Firefox for example, will keep connections going,
      // so eventually if it succeeds, the client will have
      // an additional transport running. With this
      discard() {
        var _a;
        (_a = this.socket) == null ? void 0 : _a.close();
      }
    };
    __name(_WsTransport, "WsTransport");
    var WsTransport = _WsTransport;
    exports2.WsTransport = WsTransport;
    function wsUrlParseFn(u, encrypted) {
      const ut = /^(.*:\/\/)(.*)/;
      if (!ut.test(u)) {
        if (typeof encrypted === "boolean") {
          u = `${encrypted === true ? "https" : "http"}://${u}`;
        } else {
          u = `https://${u}`;
        }
      }
      let url = new URL(u);
      const srcProto = url.protocol.toLowerCase();
      if (srcProto === "ws:") {
        encrypted = false;
      }
      if (srcProto === "wss:") {
        encrypted = true;
      }
      if (srcProto !== "https:" && srcProto !== "http") {
        u = u.replace(/^(.*:\/\/)(.*)/gm, "$2");
        url = new URL(`http://${u}`);
      }
      let protocol;
      let port;
      const host = url.hostname;
      const path = url.pathname;
      const search = url.search || "";
      switch (srcProto) {
        case "http:":
        case "ws:":
        case "nats:":
          port = url.port || "80";
          protocol = "ws:";
          break;
        case "https:":
        case "wss:":
        case "tls:":
          port = url.port || "443";
          protocol = "wss:";
          break;
        default:
          port = url.port || encrypted === true ? "443" : "80";
          protocol = encrypted === true ? "wss:" : "ws:";
          break;
      }
      return `${protocol}//${host}:${port}${path}${search}`;
    }
    __name(wsUrlParseFn, "wsUrlParseFn");
    function wsconnect(opts = {}) {
      (0, transport_1.setTransportFactory)({
        defaultPort: 443,
        urlParseFn: wsUrlParseFn,
        factory: /* @__PURE__ */ __name(() => {
          if (opts.tls) {
            throw errors_1.InvalidArgumentError.format("tls", "is not configurable on w3c websocket connections");
          }
          return new WsTransport();
        }, "factory")
      });
      return nats_1.NatsConnectionImpl.connect(opts);
    }
    __name(wsconnect, "wsconnect");
  }
});

// node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/internal_mod.js
var require_internal_mod = __commonJS({
  "node_modules/@nats-io/transport-node/node_modules/@nats-io/nats-core/lib/internal_mod.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: /* @__PURE__ */ __name(function() {
          return m[k];
        }, "get") };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TD = exports2.Metric = exports2.Bench = exports2.writeAll = exports2.readAll = exports2.MAX_SIZE = exports2.DenoBuffer = exports2.State = exports2.Parser = exports2.Kind = exports2.QueuedIteratorImpl = exports2.usernamePasswordAuthenticator = exports2.tokenAuthenticator = exports2.nkeyAuthenticator = exports2.jwtAuthenticator = exports2.credsAuthenticator = exports2.RequestOne = exports2.parseOptions = exports2.hasWsProtocol = exports2.defaultOptions = exports2.DEFAULT_MAX_RECONNECT_ATTEMPTS = exports2.checkUnsupportedOption = exports2.checkOptions = exports2.buildAuthenticator = exports2.DataBuffer = exports2.MuxSubscription = exports2.Heartbeat = exports2.MsgHdrsImpl = exports2.headers = exports2.canonicalMIMEHeaderKey = exports2.timeout = exports2.SimpleMutex = exports2.render = exports2.nanos = exports2.millis = exports2.extend = exports2.delay = exports2.deferred = exports2.deadline = exports2.collect = exports2.backoff = exports2.ProtocolHandler = exports2.INFO = exports2.Connect = exports2.setTransportFactory = exports2.getResolveFn = exports2.MsgImpl = exports2.nuid = exports2.Nuid = exports2.NatsConnectionImpl = void 0;
    exports2.UserAuthenticationExpiredError = exports2.TimeoutError = exports2.RequestError = exports2.ProtocolError = exports2.PermissionViolationError = exports2.NoRespondersError = exports2.InvalidSubjectError = exports2.InvalidOperationError = exports2.InvalidArgumentError = exports2.errors = exports2.DrainingConnectionError = exports2.ConnectionError = exports2.ClosedConnectionError = exports2.AuthorizationError = exports2.wsUrlParseFn = exports2.wsconnect = exports2.Servers = exports2.isIPV4OrHostname = exports2.IdleHeartbeatMonitor = exports2.Subscriptions = exports2.SubscriptionImpl = exports2.syncIterator = exports2.Match = exports2.createInbox = exports2.protoLen = exports2.extractProtocolMessage = exports2.Empty = exports2.parseSemVer = exports2.Features = exports2.Feature = exports2.compare = exports2.parseIP = exports2.isIP = exports2.ipV4 = exports2.TE = void 0;
    var nats_1 = require_nats();
    Object.defineProperty(exports2, "NatsConnectionImpl", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nats_1.NatsConnectionImpl;
    }, "get") });
    var nuid_1 = require_nuid2();
    Object.defineProperty(exports2, "Nuid", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nuid_1.Nuid;
    }, "get") });
    Object.defineProperty(exports2, "nuid", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nuid_1.nuid;
    }, "get") });
    var msg_1 = require_msg();
    Object.defineProperty(exports2, "MsgImpl", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return msg_1.MsgImpl;
    }, "get") });
    var transport_1 = require_transport();
    Object.defineProperty(exports2, "getResolveFn", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return transport_1.getResolveFn;
    }, "get") });
    Object.defineProperty(exports2, "setTransportFactory", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return transport_1.setTransportFactory;
    }, "get") });
    var protocol_1 = require_protocol();
    Object.defineProperty(exports2, "Connect", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return protocol_1.Connect;
    }, "get") });
    Object.defineProperty(exports2, "INFO", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return protocol_1.INFO;
    }, "get") });
    Object.defineProperty(exports2, "ProtocolHandler", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return protocol_1.ProtocolHandler;
    }, "get") });
    var util_1 = require_util();
    Object.defineProperty(exports2, "backoff", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.backoff;
    }, "get") });
    Object.defineProperty(exports2, "collect", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.collect;
    }, "get") });
    Object.defineProperty(exports2, "deadline", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.deadline;
    }, "get") });
    Object.defineProperty(exports2, "deferred", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.deferred;
    }, "get") });
    Object.defineProperty(exports2, "delay", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.delay;
    }, "get") });
    Object.defineProperty(exports2, "extend", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.extend;
    }, "get") });
    Object.defineProperty(exports2, "millis", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.millis;
    }, "get") });
    Object.defineProperty(exports2, "nanos", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.nanos;
    }, "get") });
    Object.defineProperty(exports2, "render", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.render;
    }, "get") });
    Object.defineProperty(exports2, "SimpleMutex", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.SimpleMutex;
    }, "get") });
    Object.defineProperty(exports2, "timeout", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.timeout;
    }, "get") });
    var headers_1 = require_headers();
    Object.defineProperty(exports2, "canonicalMIMEHeaderKey", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return headers_1.canonicalMIMEHeaderKey;
    }, "get") });
    Object.defineProperty(exports2, "headers", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return headers_1.headers;
    }, "get") });
    Object.defineProperty(exports2, "MsgHdrsImpl", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return headers_1.MsgHdrsImpl;
    }, "get") });
    var heartbeats_1 = require_heartbeats();
    Object.defineProperty(exports2, "Heartbeat", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return heartbeats_1.Heartbeat;
    }, "get") });
    var muxsubscription_1 = require_muxsubscription();
    Object.defineProperty(exports2, "MuxSubscription", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return muxsubscription_1.MuxSubscription;
    }, "get") });
    var databuffer_1 = require_databuffer();
    Object.defineProperty(exports2, "DataBuffer", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return databuffer_1.DataBuffer;
    }, "get") });
    var options_1 = require_options();
    Object.defineProperty(exports2, "buildAuthenticator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return options_1.buildAuthenticator;
    }, "get") });
    Object.defineProperty(exports2, "checkOptions", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return options_1.checkOptions;
    }, "get") });
    Object.defineProperty(exports2, "checkUnsupportedOption", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return options_1.checkUnsupportedOption;
    }, "get") });
    Object.defineProperty(exports2, "DEFAULT_MAX_RECONNECT_ATTEMPTS", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return options_1.DEFAULT_MAX_RECONNECT_ATTEMPTS;
    }, "get") });
    Object.defineProperty(exports2, "defaultOptions", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return options_1.defaultOptions;
    }, "get") });
    Object.defineProperty(exports2, "hasWsProtocol", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return options_1.hasWsProtocol;
    }, "get") });
    Object.defineProperty(exports2, "parseOptions", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return options_1.parseOptions;
    }, "get") });
    var request_1 = require_request();
    Object.defineProperty(exports2, "RequestOne", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return request_1.RequestOne;
    }, "get") });
    var authenticator_1 = require_authenticator();
    Object.defineProperty(exports2, "credsAuthenticator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return authenticator_1.credsAuthenticator;
    }, "get") });
    Object.defineProperty(exports2, "jwtAuthenticator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return authenticator_1.jwtAuthenticator;
    }, "get") });
    Object.defineProperty(exports2, "nkeyAuthenticator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return authenticator_1.nkeyAuthenticator;
    }, "get") });
    Object.defineProperty(exports2, "tokenAuthenticator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return authenticator_1.tokenAuthenticator;
    }, "get") });
    Object.defineProperty(exports2, "usernamePasswordAuthenticator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return authenticator_1.usernamePasswordAuthenticator;
    }, "get") });
    __exportStar(require_nkeys2(), exports2);
    var queued_iterator_1 = require_queued_iterator();
    Object.defineProperty(exports2, "QueuedIteratorImpl", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return queued_iterator_1.QueuedIteratorImpl;
    }, "get") });
    var parser_1 = require_parser();
    Object.defineProperty(exports2, "Kind", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return parser_1.Kind;
    }, "get") });
    Object.defineProperty(exports2, "Parser", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return parser_1.Parser;
    }, "get") });
    Object.defineProperty(exports2, "State", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return parser_1.State;
    }, "get") });
    var denobuffer_1 = require_denobuffer();
    Object.defineProperty(exports2, "DenoBuffer", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return denobuffer_1.DenoBuffer;
    }, "get") });
    Object.defineProperty(exports2, "MAX_SIZE", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return denobuffer_1.MAX_SIZE;
    }, "get") });
    Object.defineProperty(exports2, "readAll", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return denobuffer_1.readAll;
    }, "get") });
    Object.defineProperty(exports2, "writeAll", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return denobuffer_1.writeAll;
    }, "get") });
    var bench_1 = require_bench();
    Object.defineProperty(exports2, "Bench", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return bench_1.Bench;
    }, "get") });
    Object.defineProperty(exports2, "Metric", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return bench_1.Metric;
    }, "get") });
    var encoders_1 = require_encoders();
    Object.defineProperty(exports2, "TD", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return encoders_1.TD;
    }, "get") });
    Object.defineProperty(exports2, "TE", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return encoders_1.TE;
    }, "get") });
    var ipparser_1 = require_ipparser();
    Object.defineProperty(exports2, "ipV4", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return ipparser_1.ipV4;
    }, "get") });
    Object.defineProperty(exports2, "isIP", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return ipparser_1.isIP;
    }, "get") });
    Object.defineProperty(exports2, "parseIP", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return ipparser_1.parseIP;
    }, "get") });
    var semver_1 = require_semver();
    Object.defineProperty(exports2, "compare", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return semver_1.compare;
    }, "get") });
    Object.defineProperty(exports2, "Feature", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return semver_1.Feature;
    }, "get") });
    Object.defineProperty(exports2, "Features", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return semver_1.Features;
    }, "get") });
    Object.defineProperty(exports2, "parseSemVer", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return semver_1.parseSemVer;
    }, "get") });
    var types_1 = require_types();
    Object.defineProperty(exports2, "Empty", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return types_1.Empty;
    }, "get") });
    var transport_2 = require_transport();
    Object.defineProperty(exports2, "extractProtocolMessage", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return transport_2.extractProtocolMessage;
    }, "get") });
    Object.defineProperty(exports2, "protoLen", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return transport_2.protoLen;
    }, "get") });
    var core_1 = require_core();
    Object.defineProperty(exports2, "createInbox", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return core_1.createInbox;
    }, "get") });
    Object.defineProperty(exports2, "Match", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return core_1.Match;
    }, "get") });
    Object.defineProperty(exports2, "syncIterator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return core_1.syncIterator;
    }, "get") });
    var protocol_2 = require_protocol();
    Object.defineProperty(exports2, "SubscriptionImpl", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return protocol_2.SubscriptionImpl;
    }, "get") });
    Object.defineProperty(exports2, "Subscriptions", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return protocol_2.Subscriptions;
    }, "get") });
    var idleheartbeat_monitor_1 = require_idleheartbeat_monitor();
    Object.defineProperty(exports2, "IdleHeartbeatMonitor", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return idleheartbeat_monitor_1.IdleHeartbeatMonitor;
    }, "get") });
    var servers_1 = require_servers();
    Object.defineProperty(exports2, "isIPV4OrHostname", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return servers_1.isIPV4OrHostname;
    }, "get") });
    Object.defineProperty(exports2, "Servers", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return servers_1.Servers;
    }, "get") });
    var ws_transport_1 = require_ws_transport();
    Object.defineProperty(exports2, "wsconnect", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return ws_transport_1.wsconnect;
    }, "get") });
    Object.defineProperty(exports2, "wsUrlParseFn", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return ws_transport_1.wsUrlParseFn;
    }, "get") });
    var errors_1 = require_errors();
    Object.defineProperty(exports2, "AuthorizationError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.AuthorizationError;
    }, "get") });
    Object.defineProperty(exports2, "ClosedConnectionError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.ClosedConnectionError;
    }, "get") });
    Object.defineProperty(exports2, "ConnectionError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.ConnectionError;
    }, "get") });
    Object.defineProperty(exports2, "DrainingConnectionError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.DrainingConnectionError;
    }, "get") });
    Object.defineProperty(exports2, "errors", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.errors;
    }, "get") });
    Object.defineProperty(exports2, "InvalidArgumentError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.InvalidArgumentError;
    }, "get") });
    Object.defineProperty(exports2, "InvalidOperationError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.InvalidOperationError;
    }, "get") });
    Object.defineProperty(exports2, "InvalidSubjectError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.InvalidSubjectError;
    }, "get") });
    Object.defineProperty(exports2, "NoRespondersError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.NoRespondersError;
    }, "get") });
    Object.defineProperty(exports2, "PermissionViolationError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.PermissionViolationError;
    }, "get") });
    Object.defineProperty(exports2, "ProtocolError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.ProtocolError;
    }, "get") });
    Object.defineProperty(exports2, "RequestError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.RequestError;
    }, "get") });
    Object.defineProperty(exports2, "TimeoutError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.TimeoutError;
    }, "get") });
    Object.defineProperty(exports2, "UserAuthenticationExpiredError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.UserAuthenticationExpiredError;
    }, "get") });
  }
});

// node_modules/@nats-io/transport-node/lib/nats-base-client.js
var require_nats_base_client = __commonJS({
  "node_modules/@nats-io/transport-node/lib/nats-base-client.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: /* @__PURE__ */ __name(function() {
          return m[k];
        }, "get") };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar(require_internal_mod(), exports2);
  }
});

// node_modules/@nats-io/transport-node/lib/version.js
var require_version3 = __commonJS({
  "node_modules/@nats-io/transport-node/lib/version.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.version = void 0;
    exports2.version = "3.1.0";
  }
});

// node_modules/@nats-io/transport-node/lib/node_transport.js
var require_node_transport = __commonJS({
  "node_modules/@nats-io/transport-node/lib/node_transport.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NodeTransport = exports2.VERSION = void 0;
    exports2.nodeResolveHost = nodeResolveHost;
    var nats_base_client_1 = require_nats_base_client();
    var node_net_1 = require("node:net");
    var node_tls_1 = require("node:tls");
    var node_path_1 = require("node:path");
    var node_fs_1 = require("node:fs");
    var node_dns_1 = __importDefault(require("node:dns"));
    var version_1 = require_version3();
    exports2.VERSION = version_1.version;
    var LANG = "nats.js";
    var _NodeTransport = class _NodeTransport {
      socket;
      version;
      lang;
      yields = [];
      signal = (0, nats_base_client_1.deferred)();
      closedNotification = (0, nats_base_client_1.deferred)();
      options;
      connected = false;
      tlsName = "";
      done = false;
      closeError;
      constructor() {
        this.lang = LANG;
        this.version = exports2.VERSION;
      }
      async connect(hp, options) {
        var _a, _b, _c;
        this.tlsName = hp.tlsName;
        this.options = options;
        const { tls } = this.options;
        const { handshakeFirst } = tls || {};
        try {
          if (handshakeFirst === true) {
            this.socket = await this.tlsFirst(hp);
          } else {
            this.socket = await this.dial(hp);
          }
          if (this.done) {
            (_a = this.socket) == null ? void 0 : _a.destroy();
          }
          const info = await this.peekInfo();
          (0, nats_base_client_1.checkOptions)(info, options);
          const { tls_required: tlsRequired, tls_available: tlsAvailable } = info;
          const desired = tlsAvailable === true && options.tls !== null;
          if (!handshakeFirst && (tlsRequired || desired)) {
            this.socket = await this.startTLS();
          }
          if (this.done) {
            (_b = this.socket) == null ? void 0 : _b.destroy();
          }
          if (tlsRequired && this.socket.encrypted !== true) {
            throw nats_base_client_1.errors.InvalidArgumentError.format("tls", "is not available on this server");
          }
          this.connected = true;
          this.setupHandlers();
          this.signal.resolve();
          return Promise.resolve();
        } catch (ex) {
          let err = ex;
          if (!err) {
            err = new nats_base_client_1.errors.ConnectionError("error connecting - node provided an undefined error");
          }
          const { code } = err;
          const perr = code === "ECONNREFUSED" ? new nats_base_client_1.errors.ConnectionError("connection refused", { cause: err }) : err;
          (_c = this.socket) == null ? void 0 : _c.destroy();
          throw perr;
        }
      }
      dial(hp) {
        const d = (0, nats_base_client_1.deferred)();
        let dialError;
        const socket = (0, node_net_1.createConnection)(hp.port, hp.hostname, () => {
          d.resolve(socket);
          socket.removeAllListeners();
        });
        socket.on("error", (err) => {
          dialError = err;
        });
        socket.on("close", () => {
          socket.removeAllListeners();
          d.reject(dialError);
        });
        socket.setNoDelay(true);
        return d;
      }
      get isClosed() {
        return this.done;
      }
      close(err) {
        return this._closed(err, false);
      }
      peekInfo() {
        const d = (0, nats_base_client_1.deferred)();
        let peekError;
        this.socket.on("data", (frame) => {
          this.yields.push(frame);
          const t = nats_base_client_1.DataBuffer.concat(...this.yields);
          const pm = (0, nats_base_client_1.extractProtocolMessage)(t);
          if (pm !== "") {
            try {
              const m = nats_base_client_1.INFO.exec(pm);
              if (!m) {
                throw new Error("unexpected response from server");
              }
              const info = JSON.parse(m[1]);
              d.resolve(info);
            } catch (err) {
              d.reject(err);
            } finally {
              this.socket.removeAllListeners();
            }
          }
        });
        this.socket.on("error", (err) => {
          peekError = err;
        });
        this.socket.on("close", () => {
          this.socket.removeAllListeners();
          d.reject(peekError);
        });
        return d;
      }
      loadFile(fn) {
        if (!fn) {
          return Promise.resolve();
        }
        const d = (0, nats_base_client_1.deferred)();
        try {
          fn = (0, node_path_1.resolve)(fn);
          if (!(0, node_fs_1.existsSync)(fn)) {
            d.reject(new Error(`${fn} doesn't exist`));
          }
          (0, node_fs_1.readFile)(fn, (err, data) => {
            if (err) {
              return d.reject(err);
            }
            d.resolve(data);
          });
        } catch (err) {
          d.reject(err);
        }
        return d;
      }
      async loadClientCerts() {
        const tlsOpts = {};
        const { certFile, cert, caFile, ca, keyFile, key } = this.options.tls;
        try {
          if (certFile) {
            const data = await this.loadFile(certFile);
            if (data) {
              tlsOpts.cert = data;
            }
          } else if (cert) {
            tlsOpts.cert = cert;
          }
          if (keyFile) {
            const data = await this.loadFile(keyFile);
            if (data) {
              tlsOpts.key = data;
            }
          } else if (key) {
            tlsOpts.key = key;
          }
          if (caFile) {
            const data = await this.loadFile(caFile);
            if (data) {
              tlsOpts.ca = [data];
            }
          } else if (ca) {
            tlsOpts.ca = ca;
          }
          return Promise.resolve(tlsOpts);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async tlsFirst(hp) {
        let tlsError;
        let tlsOpts = {
          servername: this.tlsName,
          rejectUnauthorized: true
        };
        if (this.socket) {
          tlsOpts.socket = this.socket;
        }
        if (typeof this.options.tls === "object") {
          try {
            const certOpts = await this.loadClientCerts() || {};
            tlsOpts = (0, nats_base_client_1.extend)(tlsOpts, this.options.tls, certOpts);
          } catch (err) {
            return Promise.reject(new nats_base_client_1.errors.ConnectionError(err.message, { cause: err }));
          }
        }
        const d = (0, nats_base_client_1.deferred)();
        try {
          const tlsSocket = (0, node_tls_1.connect)(hp.port, hp.hostname, tlsOpts, () => {
            tlsSocket.removeAllListeners();
            d.resolve(tlsSocket);
          });
          tlsSocket.on("error", (err) => {
            tlsError = err;
          });
          tlsSocket.on("secureConnect", () => {
            if (tlsOpts.rejectUnauthorized === false) {
              return;
            }
            if (!tlsSocket.authorized) {
              throw tlsSocket.authorizationError;
            }
          });
          tlsSocket.on("close", () => {
            d.reject(tlsError);
            tlsSocket.removeAllListeners();
          });
          tlsSocket.setNoDelay(true);
        } catch (err) {
          d.reject(new nats_base_client_1.errors.ConnectionError(err.message, { cause: err }));
        }
        return d;
      }
      async startTLS() {
        let tlsError;
        let tlsOpts = {
          socket: this.socket,
          servername: this.tlsName,
          rejectUnauthorized: true
        };
        if (typeof this.options.tls === "object") {
          try {
            const certOpts = await this.loadClientCerts() || {};
            tlsOpts = (0, nats_base_client_1.extend)(tlsOpts, this.options.tls, certOpts);
          } catch (err) {
            return Promise.reject(new nats_base_client_1.errors.ConnectionError(err.message, {
              cause: err
            }));
          }
        }
        const d = (0, nats_base_client_1.deferred)();
        try {
          const tlsSocket = (0, node_tls_1.connect)(tlsOpts, () => {
            tlsSocket.removeAllListeners();
            d.resolve(tlsSocket);
          });
          tlsSocket.on("error", (err) => {
            tlsError = err;
          });
          tlsSocket.on("secureConnect", () => {
            if (tlsOpts.rejectUnauthorized === false) {
              return;
            }
            if (!tlsSocket.authorized) {
              throw tlsSocket.authorizationError;
            }
          });
          tlsSocket.on("close", () => {
            d.reject(tlsError);
            tlsSocket.removeAllListeners();
          });
        } catch (err) {
          d.reject(new nats_base_client_1.errors.ConnectionError(err.message, { cause: err }));
        }
        return d;
      }
      setupHandlers() {
        let connError;
        this.socket.on("data", (frame) => {
          this.yields.push(frame);
          return this.signal.resolve();
        });
        this.socket.on("error", (err) => {
          connError = err;
        });
        this.socket.on("end", () => {
          var _a, _b;
          if ((_a = this.socket) == null ? void 0 : _a.destroyed) {
            return;
          }
          (_b = this.socket) == null ? void 0 : _b.write(new Uint8Array(0), () => {
            var _a2;
            (_a2 = this.socket) == null ? void 0 : _a2.end();
          });
        });
        this.socket.on("close", () => {
          this._closed(connError, false);
        });
      }
      [Symbol.asyncIterator]() {
        return this.iterate();
      }
      async *iterate() {
        while (true) {
          if (this.yields.length === 0) {
            await this.signal;
          }
          const yields = this.yields;
          this.yields = [];
          for (let i = 0; i < yields.length; i++) {
            if (this.options.debug) {
              console.info(`> ${(0, nats_base_client_1.render)(yields[i])}`);
            }
            yield yields[i];
          }
          if (this.done) {
            break;
          } else if (this.yields.length === 0) {
            yields.length = 0;
            this.yields = yields;
            this.signal = (0, nats_base_client_1.deferred)();
          }
        }
      }
      discard() {
      }
      disconnect() {
        this._closed(void 0, true).then().catch();
      }
      isEncrypted() {
        return this.socket instanceof node_tls_1.TLSSocket;
      }
      _send(frame) {
        if (this.isClosed || this.socket === void 0) {
          return Promise.resolve();
        }
        if (this.options.debug) {
          console.info(`< ${(0, nats_base_client_1.render)(frame)}`);
        }
        const d = (0, nats_base_client_1.deferred)();
        try {
          this.socket.write(frame, (err) => {
            if (err) {
              if (this.options.debug) {
                console.error(`!!! ${(0, nats_base_client_1.render)(frame)}: ${err}`);
              }
              return d.reject(err);
            }
            return d.resolve();
          });
        } catch (err) {
          if (this.options.debug) {
            console.error(`!!! ${(0, nats_base_client_1.render)(frame)}: ${err}`);
          }
          d.reject(err);
        }
        return d;
      }
      send(frame) {
        const p = this._send(frame);
        p.catch((_err) => {
        });
      }
      async _closed(err, internal = true) {
        var _a, _b;
        if (!this.connected)
          return;
        if (this.done) {
          (_a = this.socket) == null ? void 0 : _a.destroy();
          return;
        }
        this.closeError = err;
        if (!err && this.socket && internal) {
          try {
            await this._send(new TextEncoder().encode(""));
          } catch (err2) {
            if (this.options.debug) {
              console.log("transport close terminated with an error", err2);
            }
          }
        }
        try {
          if (this.socket) {
            this.socket.removeAllListeners();
            (_b = this.socket) == null ? void 0 : _b.destroy();
            this.socket = void 0;
          }
        } catch (err2) {
          console.log(err2);
        }
        this.done = true;
        this.closedNotification.resolve(this.closeError);
      }
      closed() {
        return this.closedNotification;
      }
    };
    __name(_NodeTransport, "NodeTransport");
    var NodeTransport = _NodeTransport;
    exports2.NodeTransport = NodeTransport;
    async function nodeResolveHost(s) {
      const a = (0, nats_base_client_1.deferred)();
      const aaaa = (0, nats_base_client_1.deferred)();
      node_dns_1.default.resolve4(s, (err, records) => {
        if (err) {
          a.resolve(err);
        } else {
          a.resolve(records);
        }
      });
      node_dns_1.default.resolve6(s, (err, records) => {
        if (err) {
          aaaa.resolve(err);
        } else {
          aaaa.resolve(records);
        }
      });
      const ips = [];
      const da = await a;
      if (Array.isArray(da)) {
        ips.push(...da);
      }
      const daaaa = await aaaa;
      if (Array.isArray(daaaa)) {
        ips.push(...daaaa);
      }
      if (ips.length === 0) {
        ips.push(s);
      }
      return ips;
    }
    __name(nodeResolveHost, "nodeResolveHost");
  }
});

// node_modules/@nats-io/transport-node/lib/connect.js
var require_connect = __commonJS({
  "node_modules/@nats-io/transport-node/lib/connect.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.connect = connect2;
    var node_transport_1 = require_node_transport();
    var nats_base_client_1 = require_nats_base_client();
    var nats_base_client_2 = require_nats_base_client();
    function connect2(opts = {}) {
      if ((0, nats_base_client_2.hasWsProtocol)(opts)) {
        return Promise.reject(nats_base_client_2.errors.InvalidArgumentError.format(`servers`, `node client doesn't support websockets, use the 'wsconnect' function instead`));
      }
      (0, nats_base_client_1.setTransportFactory)({
        factory: /* @__PURE__ */ __name(() => {
          return new node_transport_1.NodeTransport();
        }, "factory"),
        dnsResolveFn: node_transport_1.nodeResolveHost
      });
      return nats_base_client_1.NatsConnectionImpl.connect(opts);
    }
    __name(connect2, "connect");
  }
});

// node_modules/@nats-io/transport-node/lib/mod.js
var require_mod2 = __commonJS({
  "node_modules/@nats-io/transport-node/lib/mod.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: /* @__PURE__ */ __name(function() {
          return m[k];
        }, "get") };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.connect = void 0;
    var connect_1 = require_connect();
    Object.defineProperty(exports2, "connect", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return connect_1.connect;
    }, "get") });
    __exportStar(require_nats_base_client(), exports2);
  }
});

// node_modules/@nats-io/transport-node/index.js
var require_transport_node = __commonJS({
  "node_modules/@nats-io/transport-node/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_mod2();
  }
});

// node_modules/@nats-io/nats-core/lib/encoders.js
var require_encoders2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/encoders.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TD = exports2.TE = exports2.Empty = void 0;
    exports2.encode = encode;
    exports2.decode = decode;
    exports2.Empty = new Uint8Array(0);
    exports2.TE = new TextEncoder();
    exports2.TD = new TextDecoder();
    function concat(...bufs) {
      let max = 0;
      for (let i = 0; i < bufs.length; i++) {
        max += bufs[i].length;
      }
      const out = new Uint8Array(max);
      let index = 0;
      for (let i = 0; i < bufs.length; i++) {
        out.set(bufs[i], index);
        index += bufs[i].length;
      }
      return out;
    }
    __name(concat, "concat");
    function encode(...a) {
      const bufs = [];
      for (let i = 0; i < a.length; i++) {
        bufs.push(exports2.TE.encode(a[i]));
      }
      if (bufs.length === 0) {
        return exports2.Empty;
      }
      if (bufs.length === 1) {
        return bufs[0];
      }
      return concat(...bufs);
    }
    __name(encode, "encode");
    function decode(a) {
      if (!a || a.length === 0) {
        return "";
      }
      return exports2.TD.decode(a);
    }
    __name(decode, "decode");
  }
});

// node_modules/@nats-io/nats-core/lib/errors.js
var require_errors2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/errors.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.errors = exports2.PermissionViolationError = exports2.NoRespondersError = exports2.TimeoutError = exports2.RequestError = exports2.ProtocolError = exports2.ConnectionError = exports2.DrainingConnectionError = exports2.ClosedConnectionError = exports2.AuthorizationError = exports2.UserAuthenticationExpiredError = exports2.InvalidOperationError = exports2.InvalidArgumentError = exports2.InvalidSubjectError = void 0;
    var _InvalidSubjectError = class _InvalidSubjectError extends Error {
      constructor(subject, options) {
        super(`illegal subject: '${subject}'`, options);
        this.name = "InvalidSubjectError";
      }
    };
    __name(_InvalidSubjectError, "InvalidSubjectError");
    var InvalidSubjectError = _InvalidSubjectError;
    exports2.InvalidSubjectError = InvalidSubjectError;
    var _InvalidArgumentError = class _InvalidArgumentError extends Error {
      constructor(message, options) {
        super(message, options);
        this.name = "InvalidArgumentError";
      }
      static format(property, message, options) {
        if (Array.isArray(message) && message.length > 1) {
          message = message[0];
        }
        if (Array.isArray(property)) {
          property = property.map((n) => `'${n}'`);
          property = property.join(",");
        } else {
          property = `'${property}'`;
        }
        return new _InvalidArgumentError(`${property} ${message}`, options);
      }
    };
    __name(_InvalidArgumentError, "InvalidArgumentError");
    var InvalidArgumentError = _InvalidArgumentError;
    exports2.InvalidArgumentError = InvalidArgumentError;
    var _InvalidOperationError = class _InvalidOperationError extends Error {
      constructor(message, options) {
        super(message, options);
        this.name = "InvalidOperationError";
      }
    };
    __name(_InvalidOperationError, "InvalidOperationError");
    var InvalidOperationError = _InvalidOperationError;
    exports2.InvalidOperationError = InvalidOperationError;
    var _UserAuthenticationExpiredError = class _UserAuthenticationExpiredError extends Error {
      constructor(message, options) {
        super(message, options);
        this.name = "UserAuthenticationExpiredError";
      }
      static parse(s) {
        const ss = s.toLowerCase();
        if (ss.indexOf("user authentication expired") !== -1) {
          return new _UserAuthenticationExpiredError(s);
        }
        return null;
      }
    };
    __name(_UserAuthenticationExpiredError, "UserAuthenticationExpiredError");
    var UserAuthenticationExpiredError = _UserAuthenticationExpiredError;
    exports2.UserAuthenticationExpiredError = UserAuthenticationExpiredError;
    var _AuthorizationError = class _AuthorizationError extends Error {
      constructor(message, options) {
        super(message, options);
        this.name = "AuthorizationError";
      }
      static parse(s) {
        const messages = [
          "authorization violation",
          "account authentication expired",
          "authentication timeout"
        ];
        const ss = s.toLowerCase();
        for (let i = 0; i < messages.length; i++) {
          if (ss.indexOf(messages[i]) !== -1) {
            return new _AuthorizationError(s);
          }
        }
        return null;
      }
    };
    __name(_AuthorizationError, "AuthorizationError");
    var AuthorizationError = _AuthorizationError;
    exports2.AuthorizationError = AuthorizationError;
    var _ClosedConnectionError = class _ClosedConnectionError extends Error {
      constructor() {
        super("closed connection");
        this.name = "ClosedConnectionError";
      }
    };
    __name(_ClosedConnectionError, "ClosedConnectionError");
    var ClosedConnectionError = _ClosedConnectionError;
    exports2.ClosedConnectionError = ClosedConnectionError;
    var _DrainingConnectionError = class _DrainingConnectionError extends Error {
      constructor() {
        super("connection draining");
        this.name = "DrainingConnectionError";
      }
    };
    __name(_DrainingConnectionError, "DrainingConnectionError");
    var DrainingConnectionError = _DrainingConnectionError;
    exports2.DrainingConnectionError = DrainingConnectionError;
    var _ConnectionError = class _ConnectionError extends Error {
      constructor(message, options) {
        super(message, options);
        this.name = "ConnectionError";
      }
    };
    __name(_ConnectionError, "ConnectionError");
    var ConnectionError = _ConnectionError;
    exports2.ConnectionError = ConnectionError;
    var _ProtocolError = class _ProtocolError extends Error {
      constructor(message, options) {
        super(message, options);
        this.name = "ProtocolError";
      }
    };
    __name(_ProtocolError, "ProtocolError");
    var ProtocolError = _ProtocolError;
    exports2.ProtocolError = ProtocolError;
    var _RequestError = class _RequestError extends Error {
      constructor(message = "", options) {
        super(message, options);
        this.name = "RequestError";
      }
      isNoResponders() {
        return this.cause instanceof NoRespondersError;
      }
    };
    __name(_RequestError, "RequestError");
    var RequestError = _RequestError;
    exports2.RequestError = RequestError;
    var _TimeoutError = class _TimeoutError extends Error {
      constructor(options) {
        super("timeout", options);
        this.name = "TimeoutError";
      }
    };
    __name(_TimeoutError, "TimeoutError");
    var TimeoutError = _TimeoutError;
    exports2.TimeoutError = TimeoutError;
    var _NoRespondersError = class _NoRespondersError extends Error {
      subject;
      constructor(subject, options) {
        super(`no responders: '${subject}'`, options);
        this.subject = subject;
        this.name = "NoResponders";
      }
    };
    __name(_NoRespondersError, "NoRespondersError");
    var NoRespondersError = _NoRespondersError;
    exports2.NoRespondersError = NoRespondersError;
    var _PermissionViolationError = class _PermissionViolationError extends Error {
      operation;
      subject;
      queue;
      constructor(message, operation, subject, queue, options) {
        super(message, options);
        this.name = "PermissionViolationError";
        this.operation = operation;
        this.subject = subject;
        this.queue = queue;
      }
      static parse(s) {
        const t = s ? s.toLowerCase() : "";
        if (t.indexOf("permissions violation") === -1) {
          return null;
        }
        let operation = "publish";
        let subject = "";
        let queue = void 0;
        const m = s.match(/(Publish|Subscription) to "(\S+)"/);
        if (m) {
          operation = m[1].toLowerCase();
          subject = m[2];
          if (operation === "subscription") {
            const qm = s.match(/using queue "(\S+)"/);
            if (qm) {
              queue = qm[1];
            }
          }
        }
        return new _PermissionViolationError(s, operation, subject, queue);
      }
    };
    __name(_PermissionViolationError, "PermissionViolationError");
    var PermissionViolationError = _PermissionViolationError;
    exports2.PermissionViolationError = PermissionViolationError;
    exports2.errors = {
      AuthorizationError,
      ClosedConnectionError,
      ConnectionError,
      DrainingConnectionError,
      InvalidArgumentError,
      InvalidOperationError,
      InvalidSubjectError,
      NoRespondersError,
      PermissionViolationError,
      ProtocolError,
      RequestError,
      TimeoutError,
      UserAuthenticationExpiredError
    };
  }
});

// node_modules/@nats-io/nats-core/lib/util.js
var require_util3 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/util.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SimpleMutex = exports2.Perf = void 0;
    exports2.extend = extend;
    exports2.render = render;
    exports2.timeout = timeout;
    exports2.delay = delay;
    exports2.deadline = deadline;
    exports2.deferred = deferred;
    exports2.debugDeferred = debugDeferred;
    exports2.shuffle = shuffle;
    exports2.collect = collect;
    exports2.jitter = jitter;
    exports2.backoff = backoff;
    exports2.nanos = nanos;
    exports2.millis = millis;
    var encoders_1 = require_encoders2();
    var errors_1 = require_errors2();
    function extend(a, ...b) {
      for (let i = 0; i < b.length; i++) {
        const o = b[i];
        Object.keys(o).forEach(function(k) {
          a[k] = o[k];
        });
      }
      return a;
    }
    __name(extend, "extend");
    function render(frame) {
      const cr = "\u240D";
      const lf = "\u240A";
      return encoders_1.TD.decode(frame).replace(/\n/g, lf).replace(/\r/g, cr);
    }
    __name(render, "render");
    function timeout(ms, asyncTraces = true) {
      const err = asyncTraces ? new errors_1.TimeoutError() : null;
      let methods;
      let timer;
      const p = new Promise((_resolve, reject) => {
        const cancel = /* @__PURE__ */ __name(() => {
          if (timer) {
            clearTimeout(timer);
          }
        }, "cancel");
        methods = { cancel };
        timer = setTimeout(() => {
          if (err === null) {
            reject(new errors_1.TimeoutError());
          } else {
            reject(err);
          }
        }, ms);
      });
      return Object.assign(p, methods);
    }
    __name(timeout, "timeout");
    function delay(ms = 0) {
      let methods;
      const p = new Promise((resolve) => {
        const timer = setTimeout(() => {
          resolve();
        }, ms);
        const cancel = /* @__PURE__ */ __name(() => {
          if (timer) {
            clearTimeout(timer);
            resolve();
          }
        }, "cancel");
        methods = { cancel };
      });
      return Object.assign(p, methods);
    }
    __name(delay, "delay");
    async function deadline(p, millis2 = 1e3) {
      const d = deferred();
      const timer = setTimeout(() => {
        d.reject(new errors_1.TimeoutError());
      }, millis2);
      try {
        return await Promise.race([p, d]);
      } finally {
        clearTimeout(timer);
      }
    }
    __name(deadline, "deadline");
    function deferred() {
      let methods = {};
      const p = new Promise((resolve, reject) => {
        methods = { resolve, reject };
      });
      return Object.assign(p, methods);
    }
    __name(deferred, "deferred");
    function debugDeferred() {
      let methods = {};
      const p = new Promise((resolve, reject) => {
        methods = {
          resolve: /* @__PURE__ */ __name((v) => {
            console.trace("resolve", v);
            resolve(v);
          }, "resolve"),
          reject: /* @__PURE__ */ __name((err) => {
            console.trace("reject");
            reject(err);
          }, "reject")
        };
      });
      return Object.assign(p, methods);
    }
    __name(debugDeferred, "debugDeferred");
    function shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    __name(shuffle, "shuffle");
    async function collect(iter) {
      const buf = [];
      for await (const v of iter) {
        buf.push(v);
      }
      return buf;
    }
    __name(collect, "collect");
    var _Perf = class _Perf {
      timers;
      measures;
      constructor() {
        this.timers = /* @__PURE__ */ new Map();
        this.measures = /* @__PURE__ */ new Map();
      }
      mark(key) {
        this.timers.set(key, performance.now());
      }
      measure(key, startKey, endKey) {
        const s = this.timers.get(startKey);
        if (s === void 0) {
          throw new Error(`${startKey} is not defined`);
        }
        const e = this.timers.get(endKey);
        if (e === void 0) {
          throw new Error(`${endKey} is not defined`);
        }
        this.measures.set(key, e - s);
      }
      getEntries() {
        const values = [];
        this.measures.forEach((v, k) => {
          values.push({ name: k, duration: v });
        });
        return values;
      }
    };
    __name(_Perf, "Perf");
    var Perf = _Perf;
    exports2.Perf = Perf;
    var _SimpleMutex = class _SimpleMutex {
      max;
      current;
      waiting;
      /**
       * @param max number of concurrent operations
       */
      constructor(max = 1) {
        this.max = max;
        this.current = 0;
        this.waiting = [];
      }
      /**
       * Returns a promise that resolves when the mutex is acquired
       */
      lock() {
        this.current++;
        if (this.current <= this.max) {
          return Promise.resolve();
        }
        const d = deferred();
        this.waiting.push(d);
        return d;
      }
      /**
       * Release an acquired mutex - must be called
       */
      unlock() {
        this.current--;
        const d = this.waiting.pop();
        d == null ? void 0 : d.resolve();
      }
    };
    __name(_SimpleMutex, "SimpleMutex");
    var SimpleMutex = _SimpleMutex;
    exports2.SimpleMutex = SimpleMutex;
    function jitter(n) {
      if (n === 0) {
        return 0;
      }
      return Math.floor(n / 2 + Math.random() * n);
    }
    __name(jitter, "jitter");
    function backoff(policy = [0, 250, 250, 500, 500, 3e3, 5e3]) {
      if (!Array.isArray(policy)) {
        policy = [0, 250, 250, 500, 500, 3e3, 5e3];
      }
      const max = policy.length - 1;
      return {
        backoff(attempt) {
          return jitter(attempt > max ? policy[max] : policy[attempt]);
        }
      };
    }
    __name(backoff, "backoff");
    function nanos(millis2) {
      return millis2 * 1e6;
    }
    __name(nanos, "nanos");
    function millis(ns) {
      return Math.floor(ns / 1e6);
    }
    __name(millis, "millis");
  }
});

// node_modules/@nats-io/nats-core/lib/nuid.js
var require_nuid3 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/nuid.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.nuid = exports2.Nuid = void 0;
    var nuid_1 = require_nuid();
    Object.defineProperty(exports2, "Nuid", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nuid_1.Nuid;
    }, "get") });
    Object.defineProperty(exports2, "nuid", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nuid_1.nuid;
    }, "get") });
  }
});

// node_modules/@nats-io/nats-core/lib/core.js
var require_core2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/core.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_HOST = exports2.DEFAULT_PORT = exports2.Match = void 0;
    exports2.syncIterator = syncIterator;
    exports2.createInbox = createInbox2;
    var nuid_1 = require_nuid3();
    var errors_1 = require_errors2();
    exports2.Match = {
      // Exact option is case-sensitive
      Exact: "exact",
      // Case-sensitive, but key is transformed to Canonical MIME representation
      CanonicalMIME: "canonical",
      // Case-insensitive matches
      IgnoreCase: "insensitive"
    };
    function syncIterator(src) {
      const iter = src[Symbol.asyncIterator]();
      return {
        async next() {
          const m = await iter.next();
          if (m.done) {
            return Promise.resolve(null);
          }
          return Promise.resolve(m.value);
        }
      };
    }
    __name(syncIterator, "syncIterator");
    function createInbox2(prefix = "") {
      prefix = prefix || "_INBOX";
      if (typeof prefix !== "string") {
        throw new TypeError("prefix must be a string");
      }
      prefix.split(".").forEach((v) => {
        if (v === "*" || v === ">") {
          throw errors_1.InvalidArgumentError.format("prefix", `cannot have wildcards ('${prefix}')`);
        }
      });
      return `${prefix}.${nuid_1.nuid.next()}`;
    }
    __name(createInbox2, "createInbox");
    exports2.DEFAULT_PORT = 4222;
    exports2.DEFAULT_HOST = "127.0.0.1";
  }
});

// node_modules/@nats-io/nats-core/lib/databuffer.js
var require_databuffer2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/databuffer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DataBuffer = void 0;
    var encoders_1 = require_encoders2();
    var _DataBuffer = class _DataBuffer {
      buffers;
      byteLength;
      constructor() {
        this.buffers = [];
        this.byteLength = 0;
      }
      static concat(...bufs) {
        let max = 0;
        for (let i = 0; i < bufs.length; i++) {
          max += bufs[i].length;
        }
        const out = new Uint8Array(max);
        let index = 0;
        for (let i = 0; i < bufs.length; i++) {
          out.set(bufs[i], index);
          index += bufs[i].length;
        }
        return out;
      }
      static fromAscii(m) {
        if (!m) {
          m = "";
        }
        return encoders_1.TE.encode(m);
      }
      static toAscii(a) {
        return encoders_1.TD.decode(a);
      }
      reset() {
        this.buffers.length = 0;
        this.byteLength = 0;
      }
      pack() {
        if (this.buffers.length > 1) {
          const v = new Uint8Array(this.byteLength);
          let index = 0;
          for (let i = 0; i < this.buffers.length; i++) {
            v.set(this.buffers[i], index);
            index += this.buffers[i].length;
          }
          this.buffers.length = 0;
          this.buffers.push(v);
        }
      }
      shift() {
        if (this.buffers.length) {
          const a = this.buffers.shift();
          if (a) {
            this.byteLength -= a.length;
            return a;
          }
        }
        return new Uint8Array(0);
      }
      drain(n) {
        if (this.buffers.length) {
          this.pack();
          const v = this.buffers.pop();
          if (v) {
            const max = this.byteLength;
            if (n === void 0 || n > max) {
              n = max;
            }
            const d = v.subarray(0, n);
            if (max > n) {
              this.buffers.push(v.subarray(n));
            }
            this.byteLength = max - n;
            return d;
          }
        }
        return new Uint8Array(0);
      }
      fill(a, ...bufs) {
        if (a) {
          this.buffers.push(a);
          this.byteLength += a.length;
        }
        for (let i = 0; i < bufs.length; i++) {
          if (bufs[i] && bufs[i].length) {
            this.buffers.push(bufs[i]);
            this.byteLength += bufs[i].length;
          }
        }
      }
      peek() {
        if (this.buffers.length) {
          this.pack();
          return this.buffers[0];
        }
        return new Uint8Array(0);
      }
      size() {
        return this.byteLength;
      }
      length() {
        return this.buffers.length;
      }
    };
    __name(_DataBuffer, "DataBuffer");
    var DataBuffer = _DataBuffer;
    exports2.DataBuffer = DataBuffer;
  }
});

// node_modules/@nats-io/nats-core/lib/transport.js
var require_transport2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/transport.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LF = exports2.CR = exports2.CRLF = exports2.CR_LF_LEN = exports2.CR_LF = void 0;
    exports2.setTransportFactory = setTransportFactory;
    exports2.defaultPort = defaultPort;
    exports2.getUrlParseFn = getUrlParseFn;
    exports2.newTransport = newTransport;
    exports2.getResolveFn = getResolveFn;
    exports2.protoLen = protoLen;
    exports2.extractProtocolMessage = extractProtocolMessage;
    var encoders_1 = require_encoders2();
    var core_1 = require_core2();
    var databuffer_1 = require_databuffer2();
    var transportConfig;
    function setTransportFactory(config) {
      transportConfig = config;
    }
    __name(setTransportFactory, "setTransportFactory");
    function defaultPort() {
      return transportConfig !== void 0 && transportConfig.defaultPort !== void 0 ? transportConfig.defaultPort : core_1.DEFAULT_PORT;
    }
    __name(defaultPort, "defaultPort");
    function getUrlParseFn() {
      return transportConfig !== void 0 && transportConfig.urlParseFn ? transportConfig.urlParseFn : void 0;
    }
    __name(getUrlParseFn, "getUrlParseFn");
    function newTransport() {
      if (!transportConfig || typeof transportConfig.factory !== "function") {
        throw new Error("transport fn is not set");
      }
      return transportConfig.factory();
    }
    __name(newTransport, "newTransport");
    function getResolveFn() {
      return transportConfig !== void 0 && transportConfig.dnsResolveFn ? transportConfig.dnsResolveFn : void 0;
    }
    __name(getResolveFn, "getResolveFn");
    exports2.CR_LF = "\r\n";
    exports2.CR_LF_LEN = exports2.CR_LF.length;
    exports2.CRLF = databuffer_1.DataBuffer.fromAscii(exports2.CR_LF);
    exports2.CR = new Uint8Array(exports2.CRLF)[0];
    exports2.LF = new Uint8Array(exports2.CRLF)[1];
    function protoLen(ba) {
      for (let i = 0; i < ba.length; i++) {
        const n = i + 1;
        if (ba.byteLength > n && ba[i] === exports2.CR && ba[n] === exports2.LF) {
          return n + 1;
        }
      }
      return 0;
    }
    __name(protoLen, "protoLen");
    function extractProtocolMessage(a) {
      const len = protoLen(a);
      if (len > 0) {
        const ba = new Uint8Array(a);
        const out = ba.slice(0, len);
        return encoders_1.TD.decode(out);
      }
      return "";
    }
    __name(extractProtocolMessage, "extractProtocolMessage");
  }
});

// node_modules/@nats-io/nats-core/lib/ipparser.js
var require_ipparser2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/ipparser.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ipV4 = ipV4;
    exports2.isIP = isIP;
    exports2.parseIP = parseIP;
    var IPv4LEN = 4;
    var IPv6LEN = 16;
    var ASCII0 = 48;
    var ASCII9 = 57;
    var ASCIIA = 65;
    var ASCIIF = 70;
    var ASCIIa = 97;
    var ASCIIf = 102;
    var big = 16777215;
    function ipV4(a, b, c, d) {
      const ip = new Uint8Array(IPv6LEN);
      const prefix = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255];
      prefix.forEach((v, idx) => {
        ip[idx] = v;
      });
      ip[12] = a;
      ip[13] = b;
      ip[14] = c;
      ip[15] = d;
      return ip;
    }
    __name(ipV4, "ipV4");
    function isIP(h) {
      return parseIP(h) !== void 0;
    }
    __name(isIP, "isIP");
    function parseIP(h) {
      for (let i = 0; i < h.length; i++) {
        switch (h[i]) {
          case ".":
            return parseIPv4(h);
          case ":":
            return parseIPv6(h);
        }
      }
      return;
    }
    __name(parseIP, "parseIP");
    function parseIPv4(s) {
      const ip = new Uint8Array(IPv4LEN);
      for (let i = 0; i < IPv4LEN; i++) {
        if (s.length === 0) {
          return void 0;
        }
        if (i > 0) {
          if (s[0] !== ".") {
            return void 0;
          }
          s = s.substring(1);
        }
        const { n, c, ok } = dtoi(s);
        if (!ok || n > 255) {
          return void 0;
        }
        s = s.substring(c);
        ip[i] = n;
      }
      return ipV4(ip[0], ip[1], ip[2], ip[3]);
    }
    __name(parseIPv4, "parseIPv4");
    function parseIPv6(s) {
      const ip = new Uint8Array(IPv6LEN);
      let ellipsis = -1;
      if (s.length >= 2 && s[0] === ":" && s[1] === ":") {
        ellipsis = 0;
        s = s.substring(2);
        if (s.length === 0) {
          return ip;
        }
      }
      let i = 0;
      while (i < IPv6LEN) {
        const { n, c, ok } = xtoi(s);
        if (!ok || n > 65535) {
          return void 0;
        }
        if (c < s.length && s[c] === ".") {
          if (ellipsis < 0 && i != IPv6LEN - IPv4LEN) {
            return void 0;
          }
          if (i + IPv4LEN > IPv6LEN) {
            return void 0;
          }
          const ip4 = parseIPv4(s);
          if (ip4 === void 0) {
            return void 0;
          }
          ip[i] = ip4[12];
          ip[i + 1] = ip4[13];
          ip[i + 2] = ip4[14];
          ip[i + 3] = ip4[15];
          s = "";
          i += IPv4LEN;
          break;
        }
        ip[i] = n >> 8;
        ip[i + 1] = n;
        i += 2;
        s = s.substring(c);
        if (s.length === 0) {
          break;
        }
        if (s[0] !== ":" || s.length == 1) {
          return void 0;
        }
        s = s.substring(1);
        if (s[0] === ":") {
          if (ellipsis >= 0) {
            return void 0;
          }
          ellipsis = i;
          s = s.substring(1);
          if (s.length === 0) {
            break;
          }
        }
      }
      if (s.length !== 0) {
        return void 0;
      }
      if (i < IPv6LEN) {
        if (ellipsis < 0) {
          return void 0;
        }
        const n = IPv6LEN - i;
        for (let j = i - 1; j >= ellipsis; j--) {
          ip[j + n] = ip[j];
        }
        for (let j = ellipsis + n - 1; j >= ellipsis; j--) {
          ip[j] = 0;
        }
      } else if (ellipsis >= 0) {
        return void 0;
      }
      return ip;
    }
    __name(parseIPv6, "parseIPv6");
    function dtoi(s) {
      let i = 0;
      let n = 0;
      for (i = 0; i < s.length && ASCII0 <= s.charCodeAt(i) && s.charCodeAt(i) <= ASCII9; i++) {
        n = n * 10 + (s.charCodeAt(i) - ASCII0);
        if (n >= big) {
          return { n: big, c: i, ok: false };
        }
      }
      if (i === 0) {
        return { n: 0, c: 0, ok: false };
      }
      return { n, c: i, ok: true };
    }
    __name(dtoi, "dtoi");
    function xtoi(s) {
      let n = 0;
      let i = 0;
      for (i = 0; i < s.length; i++) {
        if (ASCII0 <= s.charCodeAt(i) && s.charCodeAt(i) <= ASCII9) {
          n *= 16;
          n += s.charCodeAt(i) - ASCII0;
        } else if (ASCIIa <= s.charCodeAt(i) && s.charCodeAt(i) <= ASCIIf) {
          n *= 16;
          n += s.charCodeAt(i) - ASCIIa + 10;
        } else if (ASCIIA <= s.charCodeAt(i) && s.charCodeAt(i) <= ASCIIF) {
          n *= 16;
          n += s.charCodeAt(i) - ASCIIA + 10;
        } else {
          break;
        }
        if (n >= big) {
          return { n: 0, c: i, ok: false };
        }
      }
      if (i === 0) {
        return { n: 0, c: i, ok: false };
      }
      return { n, c: i, ok: true };
    }
    __name(xtoi, "xtoi");
  }
});

// node_modules/@nats-io/nats-core/lib/servers.js
var require_servers2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/servers.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Servers = exports2.ServerImpl = void 0;
    exports2.isIPV4OrHostname = isIPV4OrHostname;
    exports2.hostPort = hostPort;
    var transport_1 = require_transport2();
    var util_1 = require_util3();
    var ipparser_1 = require_ipparser2();
    var core_1 = require_core2();
    function isIPV4OrHostname(hp) {
      if (hp.indexOf("[") !== -1 || hp.indexOf("::") !== -1) {
        return false;
      }
      if (hp.indexOf(".") !== -1) {
        return true;
      }
      if (hp.split(":").length <= 2) {
        return true;
      }
      return false;
    }
    __name(isIPV4OrHostname, "isIPV4OrHostname");
    function isIPV6(hp) {
      return !isIPV4OrHostname(hp);
    }
    __name(isIPV6, "isIPV6");
    function filterIpv6MappedToIpv4(hp) {
      const prefix = "::FFFF:";
      const idx = hp.toUpperCase().indexOf(prefix);
      if (idx !== -1 && hp.indexOf(".") !== -1) {
        let ip = hp.substring(idx + prefix.length);
        ip = ip.replace("[", "");
        return ip.replace("]", "");
      }
      return hp;
    }
    __name(filterIpv6MappedToIpv4, "filterIpv6MappedToIpv4");
    function hostPort(u) {
      u = u.trim();
      if (u.match(/^(.*:\/\/)(.*)/m)) {
        u = u.replace(/^(.*:\/\/)(.*)/gm, "$2");
      }
      u = filterIpv6MappedToIpv4(u);
      if (isIPV6(u) && u.indexOf("[") === -1) {
        u = `[${u}]`;
      }
      const op = isIPV6(u) ? u.match(/(]:)(\d+)/) : u.match(/(:)(\d+)/);
      const port = op && op.length === 3 && op[1] && op[2] ? parseInt(op[2]) : core_1.DEFAULT_PORT;
      const protocol = port === 80 ? "https" : "http";
      const url = new URL(`${protocol}://${u}`);
      url.port = `${port}`;
      let hostname = url.hostname;
      if (hostname.charAt(0) === "[") {
        hostname = hostname.substring(1, hostname.length - 1);
      }
      const listen = url.host;
      return { listen, hostname, port };
    }
    __name(hostPort, "hostPort");
    var _ServerImpl = class _ServerImpl {
      src;
      listen;
      hostname;
      port;
      didConnect;
      reconnects;
      lastConnect;
      gossiped;
      tlsName;
      resolves;
      constructor(u, gossiped = false) {
        this.src = u;
        this.tlsName = "";
        const v = hostPort(u);
        this.listen = v.listen;
        this.hostname = v.hostname;
        this.port = v.port;
        this.didConnect = false;
        this.reconnects = 0;
        this.lastConnect = 0;
        this.gossiped = gossiped;
      }
      toString() {
        return this.listen;
      }
      async resolve(opts) {
        if (!opts.fn || opts.resolve === false) {
          return [this];
        }
        const buf = [];
        if ((0, ipparser_1.isIP)(this.hostname)) {
          return [this];
        } else {
          const ips = await opts.fn(this.hostname);
          if (opts.debug) {
            console.log(`resolve ${this.hostname} = ${ips.join(",")}`);
          }
          for (const ip of ips) {
            const proto = this.port === 80 ? "https" : "http";
            const url = new URL(`${proto}://${isIPV6(ip) ? "[" + ip + "]" : ip}`);
            url.port = `${this.port}`;
            const ss = new _ServerImpl(url.host, false);
            ss.tlsName = this.hostname;
            buf.push(ss);
          }
        }
        if (opts.randomize) {
          (0, util_1.shuffle)(buf);
        }
        this.resolves = buf;
        return buf;
      }
    };
    __name(_ServerImpl, "ServerImpl");
    var ServerImpl = _ServerImpl;
    exports2.ServerImpl = ServerImpl;
    var _Servers = class _Servers {
      firstSelect;
      servers;
      currentServer;
      tlsName;
      randomize;
      constructor(listens = [], opts = {}) {
        this.firstSelect = true;
        this.servers = [];
        this.tlsName = "";
        this.randomize = opts.randomize || false;
        const urlParseFn = (0, transport_1.getUrlParseFn)();
        if (listens) {
          listens.forEach((hp) => {
            hp = urlParseFn ? urlParseFn(hp) : hp;
            this.servers.push(new ServerImpl(hp));
          });
          if (this.randomize) {
            this.servers = (0, util_1.shuffle)(this.servers);
          }
        }
        if (this.servers.length === 0) {
          this.addServer(`${core_1.DEFAULT_HOST}:${(0, transport_1.defaultPort)()}`, false);
        }
        this.currentServer = this.servers[0];
      }
      clear() {
        this.servers.length = 0;
      }
      updateTLSName() {
        const cs = this.getCurrentServer();
        if (!(0, ipparser_1.isIP)(cs.hostname)) {
          this.tlsName = cs.hostname;
          this.servers.forEach((s) => {
            if (s.gossiped) {
              s.tlsName = this.tlsName;
            }
          });
        }
      }
      getCurrentServer() {
        return this.currentServer;
      }
      addServer(u, implicit = false) {
        const urlParseFn = (0, transport_1.getUrlParseFn)();
        u = urlParseFn ? urlParseFn(u) : u;
        const s = new ServerImpl(u, implicit);
        if ((0, ipparser_1.isIP)(s.hostname)) {
          s.tlsName = this.tlsName;
        }
        this.servers.push(s);
      }
      selectServer() {
        if (this.firstSelect) {
          this.firstSelect = false;
          return this.currentServer;
        }
        const t = this.servers.shift();
        if (t) {
          this.servers.push(t);
          this.currentServer = t;
        }
        return t;
      }
      removeCurrentServer() {
        this.removeServer(this.currentServer);
      }
      removeServer(server) {
        if (server) {
          const index = this.servers.indexOf(server);
          this.servers.splice(index, 1);
        }
      }
      length() {
        return this.servers.length;
      }
      next() {
        return this.servers.length ? this.servers[0] : void 0;
      }
      getServers() {
        return this.servers;
      }
      update(info, encrypted) {
        const added = [];
        let deleted = [];
        const urlParseFn = (0, transport_1.getUrlParseFn)();
        const discovered = /* @__PURE__ */ new Map();
        if (info.connect_urls && info.connect_urls.length > 0) {
          info.connect_urls.forEach((hp) => {
            hp = urlParseFn ? urlParseFn(hp, encrypted) : hp;
            const s = new ServerImpl(hp, true);
            discovered.set(hp, s);
          });
        }
        const toDelete = [];
        this.servers.forEach((s, index) => {
          const u = s.listen;
          if (s.gossiped && this.currentServer.listen !== u && discovered.get(u) === void 0) {
            toDelete.push(index);
          }
          discovered.delete(u);
        });
        toDelete.reverse();
        toDelete.forEach((index) => {
          const removed = this.servers.splice(index, 1);
          deleted = deleted.concat(removed[0].listen);
        });
        discovered.forEach((v, k) => {
          this.servers.push(v);
          added.push(k);
        });
        return { added, deleted };
      }
    };
    __name(_Servers, "Servers");
    var Servers = _Servers;
    exports2.Servers = Servers;
  }
});

// node_modules/@nats-io/nats-core/lib/queued_iterator.js
var require_queued_iterator2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/queued_iterator.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.QueuedIteratorImpl = void 0;
    var util_1 = require_util3();
    var errors_1 = require_errors2();
    var _QueuedIteratorImpl = class _QueuedIteratorImpl {
      inflight;
      processed;
      // this is updated by the protocol
      received;
      noIterator;
      iterClosed;
      done;
      signal;
      yields;
      filtered;
      pendingFiltered;
      ctx;
      _data;
      //data is for use by extenders in any way they like
      err;
      time;
      profile;
      yielding;
      didBreak;
      constructor() {
        this.inflight = 0;
        this.filtered = 0;
        this.pendingFiltered = 0;
        this.processed = 0;
        this.received = 0;
        this.noIterator = false;
        this.done = false;
        this.signal = (0, util_1.deferred)();
        this.yields = [];
        this.iterClosed = (0, util_1.deferred)();
        this.time = 0;
        this.yielding = false;
        this.didBreak = false;
        this.profile = false;
      }
      [Symbol.asyncIterator]() {
        return this.iterate();
      }
      push(v) {
        if (this.done) {
          return;
        }
        if (this.didBreak) {
          if (typeof v === "function") {
            const cb = v;
            try {
              cb();
            } catch (_) {
            }
          }
          return;
        }
        if (typeof v === "function") {
          this.pendingFiltered++;
        }
        this.yields.push(v);
        this.signal.resolve();
      }
      async *iterate() {
        if (this.noIterator) {
          throw new errors_1.InvalidOperationError("iterator cannot be used when a callback is registered");
        }
        if (this.yielding) {
          throw new errors_1.InvalidOperationError("iterator is already yielding");
        }
        this.yielding = true;
        try {
          while (true) {
            if (this.yields.length === 0) {
              await this.signal;
            }
            if (this.err) {
              throw this.err;
            }
            const yields = this.yields;
            this.inflight = yields.length;
            this.yields = [];
            for (let i = 0; i < yields.length; i++) {
              if (typeof yields[i] === "function") {
                this.pendingFiltered--;
                const fn = yields[i];
                try {
                  fn();
                } catch (err) {
                  throw err;
                }
                if (this.err) {
                  throw this.err;
                }
                continue;
              }
              this.processed++;
              this.inflight--;
              const start = this.profile ? Date.now() : 0;
              yield yields[i];
              this.time = this.profile ? Date.now() - start : 0;
            }
            if (this.done) {
              break;
            } else if (this.yields.length === 0) {
              yields.length = 0;
              this.yields = yields;
              this.signal = (0, util_1.deferred)();
            }
          }
        } finally {
          this.didBreak = true;
          this.stop();
        }
      }
      stop(err) {
        if (this.done) {
          return;
        }
        this.err = err;
        this.done = true;
        this.signal.resolve();
        this.iterClosed.resolve(err);
      }
      getProcessed() {
        return this.noIterator ? this.received : this.processed;
      }
      getPending() {
        return this.yields.length + this.inflight - this.pendingFiltered;
      }
      getReceived() {
        return this.received - this.filtered;
      }
    };
    __name(_QueuedIteratorImpl, "QueuedIteratorImpl");
    var QueuedIteratorImpl = _QueuedIteratorImpl;
    exports2.QueuedIteratorImpl = QueuedIteratorImpl;
  }
});

// node_modules/@nats-io/nats-core/lib/muxsubscription.js
var require_muxsubscription2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/muxsubscription.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MuxSubscription = void 0;
    var core_1 = require_core2();
    var errors_1 = require_errors2();
    var _MuxSubscription = class _MuxSubscription {
      baseInbox;
      reqs;
      constructor() {
        this.reqs = /* @__PURE__ */ new Map();
      }
      size() {
        return this.reqs.size;
      }
      init(prefix) {
        this.baseInbox = `${(0, core_1.createInbox)(prefix)}.`;
        return this.baseInbox;
      }
      add(r) {
        if (!isNaN(r.received)) {
          r.received = 0;
        }
        this.reqs.set(r.token, r);
      }
      get(token) {
        return this.reqs.get(token);
      }
      cancel(r) {
        this.reqs.delete(r.token);
      }
      getToken(m) {
        const s = m.subject || "";
        if (s.indexOf(this.baseInbox) === 0) {
          return s.substring(this.baseInbox.length);
        }
        return null;
      }
      all() {
        return Array.from(this.reqs.values());
      }
      handleError(isMuxPermissionError, err) {
        if (isMuxPermissionError) {
          this.all().forEach((r) => {
            r.resolver(err, {});
          });
          return true;
        }
        if (err.operation === "publish") {
          const req = this.all().find((s) => {
            return s.requestSubject === err.subject;
          });
          if (req) {
            req.resolver(err, {});
            return true;
          }
        }
        return false;
      }
      dispatcher() {
        return (err, m) => {
          var _a, _b;
          const token = this.getToken(m);
          if (token) {
            const r = this.get(token);
            if (r) {
              if (err === null) {
                err = ((_a = m == null ? void 0 : m.data) == null ? void 0 : _a.length) === 0 && ((_b = m.headers) == null ? void 0 : _b.code) === 503 ? new errors_1.NoRespondersError(r.requestSubject) : null;
              }
              r.resolver(err, m);
            }
          }
        };
      }
      close() {
        const err = new errors_1.RequestError("connection closed");
        this.reqs.forEach((req) => {
          req.resolver(err, {});
        });
      }
    };
    __name(_MuxSubscription, "MuxSubscription");
    var MuxSubscription = _MuxSubscription;
    exports2.MuxSubscription = MuxSubscription;
  }
});

// node_modules/@nats-io/nats-core/lib/heartbeats.js
var require_heartbeats2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/heartbeats.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Heartbeat = void 0;
    var util_1 = require_util3();
    var _Heartbeat = class _Heartbeat {
      ph;
      interval;
      maxOut;
      timer;
      pendings;
      constructor(ph, interval, maxOut) {
        this.ph = ph;
        this.interval = interval;
        this.maxOut = maxOut;
        this.pendings = [];
      }
      // api to start the heartbeats, since this can be
      // spuriously called from dial, ensure we don't
      // leak timers
      start() {
        this.cancel();
        this._schedule();
      }
      // api for canceling the heartbeats, if stale is
      // true it will initiate a client disconnect
      cancel(stale) {
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = void 0;
        }
        this._reset();
        if (stale) {
          this.ph.disconnect();
        }
      }
      _schedule() {
        this.timer = setTimeout(() => {
          this.ph.dispatchStatus({ type: "ping", pendingPings: this.pendings.length + 1 });
          if (this.pendings.length === this.maxOut) {
            this.cancel(true);
            return;
          }
          const ping = (0, util_1.deferred)();
          this.ph.flush(ping).then(() => {
            this._reset();
          }).catch(() => {
            this.cancel();
          });
          this.pendings.push(ping);
          this._schedule();
        }, this.interval);
      }
      _reset() {
        this.pendings = this.pendings.filter((p) => {
          const d = p;
          d.resolve();
          return false;
        });
      }
    };
    __name(_Heartbeat, "Heartbeat");
    var Heartbeat = _Heartbeat;
    exports2.Heartbeat = Heartbeat;
  }
});

// node_modules/@nats-io/nats-core/lib/denobuffer.js
var require_denobuffer2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/denobuffer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DenoBuffer = exports2.MAX_SIZE = exports2.AssertionError = void 0;
    exports2.assert = assert;
    exports2.concat = concat;
    exports2.append = append;
    exports2.readAll = readAll;
    exports2.writeAll = writeAll;
    var encoders_1 = require_encoders2();
    var _AssertionError = class _AssertionError extends Error {
      constructor(msg) {
        super(msg);
        this.name = "AssertionError";
      }
    };
    __name(_AssertionError, "AssertionError");
    var AssertionError = _AssertionError;
    exports2.AssertionError = AssertionError;
    function assert(cond, msg = "Assertion failed.") {
      if (!cond) {
        throw new AssertionError(msg);
      }
    }
    __name(assert, "assert");
    var MIN_READ = 32 * 1024;
    exports2.MAX_SIZE = 2 ** 32 - 2;
    function copy(src, dst, off = 0) {
      const r = dst.byteLength - off;
      if (src.byteLength > r) {
        src = src.subarray(0, r);
      }
      dst.set(src, off);
      return src.byteLength;
    }
    __name(copy, "copy");
    function concat(origin, b) {
      if (origin === void 0 && b === void 0) {
        return new Uint8Array(0);
      }
      if (origin === void 0) {
        return b;
      }
      if (b === void 0) {
        return origin;
      }
      const output = new Uint8Array(origin.length + b.length);
      output.set(origin, 0);
      output.set(b, origin.length);
      return output;
    }
    __name(concat, "concat");
    function append(origin, b) {
      return concat(origin, Uint8Array.of(b));
    }
    __name(append, "append");
    var _DenoBuffer = class _DenoBuffer {
      _buf;
      // contents are the bytes _buf[off : len(_buf)]
      _off;
      // read at _buf[off], write at _buf[_buf.byteLength]
      constructor(ab) {
        this._off = 0;
        if (ab == null) {
          this._buf = new Uint8Array(0);
          return;
        }
        this._buf = new Uint8Array(ab);
      }
      bytes(options = { copy: true }) {
        if (options.copy === false)
          return this._buf.subarray(this._off);
        return this._buf.slice(this._off);
      }
      empty() {
        return this._buf.byteLength <= this._off;
      }
      get length() {
        return this._buf.byteLength - this._off;
      }
      get capacity() {
        return this._buf.buffer.byteLength;
      }
      truncate(n) {
        if (n === 0) {
          this.reset();
          return;
        }
        if (n < 0 || n > this.length) {
          throw Error("bytes.Buffer: truncation out of range");
        }
        this._reslice(this._off + n);
      }
      reset() {
        this._reslice(0);
        this._off = 0;
      }
      _tryGrowByReslice(n) {
        const l = this._buf.byteLength;
        if (n <= this.capacity - l) {
          this._reslice(l + n);
          return l;
        }
        return -1;
      }
      _reslice(len) {
        assert(len <= this._buf.buffer.byteLength);
        this._buf = new Uint8Array(this._buf.buffer, 0, len);
      }
      readByte() {
        const a = new Uint8Array(1);
        if (this.read(a)) {
          return a[0];
        }
        return null;
      }
      read(p) {
        if (this.empty()) {
          this.reset();
          if (p.byteLength === 0) {
            return 0;
          }
          return null;
        }
        const nread = copy(this._buf.subarray(this._off), p);
        this._off += nread;
        return nread;
      }
      writeByte(n) {
        return this.write(Uint8Array.of(n));
      }
      writeString(s) {
        return this.write(encoders_1.TE.encode(s));
      }
      write(p) {
        const m = this._grow(p.byteLength);
        return copy(p, this._buf, m);
      }
      _grow(n) {
        const m = this.length;
        if (m === 0 && this._off !== 0) {
          this.reset();
        }
        const i = this._tryGrowByReslice(n);
        if (i >= 0) {
          return i;
        }
        const c = this.capacity;
        if (n <= Math.floor(c / 2) - m) {
          copy(this._buf.subarray(this._off), this._buf);
        } else if (c + n > exports2.MAX_SIZE) {
          throw new Error("The buffer cannot be grown beyond the maximum size.");
        } else {
          const buf = new Uint8Array(Math.min(2 * c + n, exports2.MAX_SIZE));
          copy(this._buf.subarray(this._off), buf);
          this._buf = buf;
        }
        this._off = 0;
        this._reslice(Math.min(m + n, exports2.MAX_SIZE));
        return m;
      }
      grow(n) {
        if (n < 0) {
          throw Error("Buffer._grow: negative count");
        }
        const m = this._grow(n);
        this._reslice(m);
      }
      readFrom(r) {
        let n = 0;
        const tmp = new Uint8Array(MIN_READ);
        while (true) {
          const shouldGrow = this.capacity - this.length < MIN_READ;
          const buf = shouldGrow ? tmp : new Uint8Array(this._buf.buffer, this.length);
          const nread = r.read(buf);
          if (nread === null) {
            return n;
          }
          if (shouldGrow)
            this.write(buf.subarray(0, nread));
          else
            this._reslice(this.length + nread);
          n += nread;
        }
      }
    };
    __name(_DenoBuffer, "DenoBuffer");
    var DenoBuffer = _DenoBuffer;
    exports2.DenoBuffer = DenoBuffer;
    function readAll(r) {
      const buf = new DenoBuffer();
      buf.readFrom(r);
      return buf.bytes();
    }
    __name(readAll, "readAll");
    function writeAll(w, arr) {
      let nwritten = 0;
      while (nwritten < arr.length) {
        nwritten += w.write(arr.subarray(nwritten));
      }
    }
    __name(writeAll, "writeAll");
  }
});

// node_modules/@nats-io/nats-core/lib/parser.js
var require_parser2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/parser.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.cc = exports2.State = exports2.Parser = exports2.Kind = void 0;
    exports2.describe = describe;
    var denobuffer_1 = require_denobuffer2();
    var encoders_1 = require_encoders2();
    exports2.Kind = {
      OK: 0,
      ERR: 1,
      MSG: 2,
      INFO: 3,
      PING: 4,
      PONG: 5
    };
    function describe(e) {
      let ks;
      let data = "";
      switch (e.kind) {
        case exports2.Kind.MSG:
          ks = "MSG";
          break;
        case exports2.Kind.OK:
          ks = "OK";
          break;
        case exports2.Kind.ERR:
          ks = "ERR";
          data = encoders_1.TD.decode(e.data);
          break;
        case exports2.Kind.PING:
          ks = "PING";
          break;
        case exports2.Kind.PONG:
          ks = "PONG";
          break;
        case exports2.Kind.INFO:
          ks = "INFO";
          data = encoders_1.TD.decode(e.data);
      }
      return `${ks}: ${data}`;
    }
    __name(describe, "describe");
    function newMsgArg() {
      const ma = {};
      ma.sid = -1;
      ma.hdr = -1;
      ma.size = -1;
      return ma;
    }
    __name(newMsgArg, "newMsgArg");
    var ASCII_0 = 48;
    var ASCII_9 = 57;
    var _Parser = class _Parser {
      dispatcher;
      state;
      as;
      drop;
      hdr;
      ma;
      argBuf;
      msgBuf;
      constructor(dispatcher) {
        this.dispatcher = dispatcher;
        this.state = exports2.State.OP_START;
        this.as = 0;
        this.drop = 0;
        this.hdr = 0;
      }
      parse(buf) {
        let i;
        for (i = 0; i < buf.length; i++) {
          const b = buf[i];
          switch (this.state) {
            case exports2.State.OP_START:
              switch (b) {
                case exports2.cc.M:
                case exports2.cc.m:
                  this.state = exports2.State.OP_M;
                  this.hdr = -1;
                  this.ma = newMsgArg();
                  break;
                case exports2.cc.H:
                case exports2.cc.h:
                  this.state = exports2.State.OP_H;
                  this.hdr = 0;
                  this.ma = newMsgArg();
                  break;
                case exports2.cc.P:
                case exports2.cc.p:
                  this.state = exports2.State.OP_P;
                  break;
                case exports2.cc.PLUS:
                  this.state = exports2.State.OP_PLUS;
                  break;
                case exports2.cc.MINUS:
                  this.state = exports2.State.OP_MINUS;
                  break;
                case exports2.cc.I:
                case exports2.cc.i:
                  this.state = exports2.State.OP_I;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_H:
              switch (b) {
                case exports2.cc.M:
                case exports2.cc.m:
                  this.state = exports2.State.OP_M;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_M:
              switch (b) {
                case exports2.cc.S:
                case exports2.cc.s:
                  this.state = exports2.State.OP_MS;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_MS:
              switch (b) {
                case exports2.cc.G:
                case exports2.cc.g:
                  this.state = exports2.State.OP_MSG;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_MSG:
              switch (b) {
                case exports2.cc.SPACE:
                case exports2.cc.TAB:
                  this.state = exports2.State.OP_MSG_SPC;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_MSG_SPC:
              switch (b) {
                case exports2.cc.SPACE:
                case exports2.cc.TAB:
                  continue;
                default:
                  this.state = exports2.State.MSG_ARG;
                  this.as = i;
              }
              break;
            case exports2.State.MSG_ARG:
              switch (b) {
                case exports2.cc.CR:
                  this.drop = 1;
                  break;
                case exports2.cc.NL: {
                  const arg = this.argBuf ? this.argBuf.bytes() : buf.subarray(this.as, i - this.drop);
                  this.processMsgArgs(arg);
                  this.drop = 0;
                  this.as = i + 1;
                  this.state = exports2.State.MSG_PAYLOAD;
                  i = this.as + this.ma.size - 1;
                  break;
                }
                default:
                  if (this.argBuf) {
                    this.argBuf.writeByte(b);
                  }
              }
              break;
            case exports2.State.MSG_PAYLOAD:
              if (this.msgBuf) {
                if (this.msgBuf.length >= this.ma.size) {
                  const data = this.msgBuf.bytes({ copy: false });
                  this.dispatcher.push({ kind: exports2.Kind.MSG, msg: this.ma, data });
                  this.argBuf = void 0;
                  this.msgBuf = void 0;
                  this.state = exports2.State.MSG_END;
                } else {
                  let toCopy = this.ma.size - this.msgBuf.length;
                  const avail = buf.length - i;
                  if (avail < toCopy) {
                    toCopy = avail;
                  }
                  if (toCopy > 0) {
                    this.msgBuf.write(buf.subarray(i, i + toCopy));
                    i = i + toCopy - 1;
                  } else {
                    this.msgBuf.writeByte(b);
                  }
                }
              } else if (i - this.as >= this.ma.size) {
                this.dispatcher.push({ kind: exports2.Kind.MSG, msg: this.ma, data: buf.subarray(this.as, i) });
                this.argBuf = void 0;
                this.msgBuf = void 0;
                this.state = exports2.State.MSG_END;
              }
              break;
            case exports2.State.MSG_END:
              switch (b) {
                case exports2.cc.NL:
                  this.drop = 0;
                  this.as = i + 1;
                  this.state = exports2.State.OP_START;
                  break;
                default:
                  continue;
              }
              break;
            case exports2.State.OP_PLUS:
              switch (b) {
                case exports2.cc.O:
                case exports2.cc.o:
                  this.state = exports2.State.OP_PLUS_O;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_PLUS_O:
              switch (b) {
                case exports2.cc.K:
                case exports2.cc.k:
                  this.state = exports2.State.OP_PLUS_OK;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_PLUS_OK:
              switch (b) {
                case exports2.cc.NL:
                  this.dispatcher.push({ kind: exports2.Kind.OK });
                  this.drop = 0;
                  this.state = exports2.State.OP_START;
                  break;
              }
              break;
            case exports2.State.OP_MINUS:
              switch (b) {
                case exports2.cc.E:
                case exports2.cc.e:
                  this.state = exports2.State.OP_MINUS_E;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_MINUS_E:
              switch (b) {
                case exports2.cc.R:
                case exports2.cc.r:
                  this.state = exports2.State.OP_MINUS_ER;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_MINUS_ER:
              switch (b) {
                case exports2.cc.R:
                case exports2.cc.r:
                  this.state = exports2.State.OP_MINUS_ERR;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_MINUS_ERR:
              switch (b) {
                case exports2.cc.SPACE:
                case exports2.cc.TAB:
                  this.state = exports2.State.OP_MINUS_ERR_SPC;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_MINUS_ERR_SPC:
              switch (b) {
                case exports2.cc.SPACE:
                case exports2.cc.TAB:
                  continue;
                default:
                  this.state = exports2.State.MINUS_ERR_ARG;
                  this.as = i;
              }
              break;
            case exports2.State.MINUS_ERR_ARG:
              switch (b) {
                case exports2.cc.CR:
                  this.drop = 1;
                  break;
                case exports2.cc.NL: {
                  let arg;
                  if (this.argBuf) {
                    arg = this.argBuf.bytes();
                    this.argBuf = void 0;
                  } else {
                    arg = buf.subarray(this.as, i - this.drop);
                  }
                  this.dispatcher.push({ kind: exports2.Kind.ERR, data: arg });
                  this.drop = 0;
                  this.as = i + 1;
                  this.state = exports2.State.OP_START;
                  break;
                }
                default:
                  if (this.argBuf) {
                    this.argBuf.write(Uint8Array.of(b));
                  }
              }
              break;
            case exports2.State.OP_P:
              switch (b) {
                case exports2.cc.I:
                case exports2.cc.i:
                  this.state = exports2.State.OP_PI;
                  break;
                case exports2.cc.O:
                case exports2.cc.o:
                  this.state = exports2.State.OP_PO;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_PO:
              switch (b) {
                case exports2.cc.N:
                case exports2.cc.n:
                  this.state = exports2.State.OP_PON;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_PON:
              switch (b) {
                case exports2.cc.G:
                case exports2.cc.g:
                  this.state = exports2.State.OP_PONG;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_PONG:
              switch (b) {
                case exports2.cc.NL:
                  this.dispatcher.push({ kind: exports2.Kind.PONG });
                  this.drop = 0;
                  this.state = exports2.State.OP_START;
                  break;
              }
              break;
            case exports2.State.OP_PI:
              switch (b) {
                case exports2.cc.N:
                case exports2.cc.n:
                  this.state = exports2.State.OP_PIN;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_PIN:
              switch (b) {
                case exports2.cc.G:
                case exports2.cc.g:
                  this.state = exports2.State.OP_PING;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_PING:
              switch (b) {
                case exports2.cc.NL:
                  this.dispatcher.push({ kind: exports2.Kind.PING });
                  this.drop = 0;
                  this.state = exports2.State.OP_START;
                  break;
              }
              break;
            case exports2.State.OP_I:
              switch (b) {
                case exports2.cc.N:
                case exports2.cc.n:
                  this.state = exports2.State.OP_IN;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_IN:
              switch (b) {
                case exports2.cc.F:
                case exports2.cc.f:
                  this.state = exports2.State.OP_INF;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_INF:
              switch (b) {
                case exports2.cc.O:
                case exports2.cc.o:
                  this.state = exports2.State.OP_INFO;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_INFO:
              switch (b) {
                case exports2.cc.SPACE:
                case exports2.cc.TAB:
                  this.state = exports2.State.OP_INFO_SPC;
                  break;
                default:
                  throw this.fail(buf.subarray(i));
              }
              break;
            case exports2.State.OP_INFO_SPC:
              switch (b) {
                case exports2.cc.SPACE:
                case exports2.cc.TAB:
                  continue;
                default:
                  this.state = exports2.State.INFO_ARG;
                  this.as = i;
              }
              break;
            case exports2.State.INFO_ARG:
              switch (b) {
                case exports2.cc.CR:
                  this.drop = 1;
                  break;
                case exports2.cc.NL: {
                  let arg;
                  if (this.argBuf) {
                    arg = this.argBuf.bytes();
                    this.argBuf = void 0;
                  } else {
                    arg = buf.subarray(this.as, i - this.drop);
                  }
                  this.dispatcher.push({ kind: exports2.Kind.INFO, data: arg });
                  this.drop = 0;
                  this.as = i + 1;
                  this.state = exports2.State.OP_START;
                  break;
                }
                default:
                  if (this.argBuf) {
                    this.argBuf.writeByte(b);
                  }
              }
              break;
            default:
              throw this.fail(buf.subarray(i));
          }
        }
        if ((this.state === exports2.State.MSG_ARG || this.state === exports2.State.MINUS_ERR_ARG || this.state === exports2.State.INFO_ARG) && !this.argBuf) {
          this.argBuf = new denobuffer_1.DenoBuffer(buf.subarray(this.as, i - this.drop));
        }
        if (this.state === exports2.State.MSG_PAYLOAD && !this.msgBuf) {
          if (!this.argBuf) {
            this.cloneMsgArg();
          }
          this.msgBuf = new denobuffer_1.DenoBuffer(buf.subarray(this.as));
        }
      }
      cloneMsgArg() {
        const s = this.ma.subject.length;
        const r = this.ma.reply ? this.ma.reply.length : 0;
        const buf = new Uint8Array(s + r);
        buf.set(this.ma.subject);
        if (this.ma.reply) {
          buf.set(this.ma.reply, s);
        }
        this.argBuf = new denobuffer_1.DenoBuffer(buf);
        this.ma.subject = buf.subarray(0, s);
        if (this.ma.reply) {
          this.ma.reply = buf.subarray(s);
        }
      }
      processMsgArgs(arg) {
        if (this.hdr >= 0) {
          return this.processHeaderMsgArgs(arg);
        }
        const args = [];
        let start = -1;
        for (let i = 0; i < arg.length; i++) {
          const b = arg[i];
          switch (b) {
            case exports2.cc.SPACE:
            case exports2.cc.TAB:
            case exports2.cc.CR:
            case exports2.cc.NL:
              if (start >= 0) {
                args.push(arg.subarray(start, i));
                start = -1;
              }
              break;
            default:
              if (start < 0) {
                start = i;
              }
          }
        }
        if (start >= 0) {
          args.push(arg.subarray(start));
        }
        switch (args.length) {
          case 3:
            this.ma.subject = args[0];
            this.ma.sid = this.protoParseInt(args[1]);
            this.ma.reply = void 0;
            this.ma.size = this.protoParseInt(args[2]);
            break;
          case 4:
            this.ma.subject = args[0];
            this.ma.sid = this.protoParseInt(args[1]);
            this.ma.reply = args[2];
            this.ma.size = this.protoParseInt(args[3]);
            break;
          default:
            throw this.fail(arg, "processMsgArgs Parse Error");
        }
        if (this.ma.sid < 0) {
          throw this.fail(arg, "processMsgArgs Bad or Missing Sid Error");
        }
        if (this.ma.size < 0) {
          throw this.fail(arg, "processMsgArgs Bad or Missing Size Error");
        }
      }
      fail(data, label = "") {
        if (!label) {
          label = `parse error [${this.state}]`;
        } else {
          label = `${label} [${this.state}]`;
        }
        return new Error(`${label}: ${encoders_1.TD.decode(data)}`);
      }
      processHeaderMsgArgs(arg) {
        const args = [];
        let start = -1;
        for (let i = 0; i < arg.length; i++) {
          const b = arg[i];
          switch (b) {
            case exports2.cc.SPACE:
            case exports2.cc.TAB:
            case exports2.cc.CR:
            case exports2.cc.NL:
              if (start >= 0) {
                args.push(arg.subarray(start, i));
                start = -1;
              }
              break;
            default:
              if (start < 0) {
                start = i;
              }
          }
        }
        if (start >= 0) {
          args.push(arg.subarray(start));
        }
        switch (args.length) {
          case 4:
            this.ma.subject = args[0];
            this.ma.sid = this.protoParseInt(args[1]);
            this.ma.reply = void 0;
            this.ma.hdr = this.protoParseInt(args[2]);
            this.ma.size = this.protoParseInt(args[3]);
            break;
          case 5:
            this.ma.subject = args[0];
            this.ma.sid = this.protoParseInt(args[1]);
            this.ma.reply = args[2];
            this.ma.hdr = this.protoParseInt(args[3]);
            this.ma.size = this.protoParseInt(args[4]);
            break;
          default:
            throw this.fail(arg, "processHeaderMsgArgs Parse Error");
        }
        if (this.ma.sid < 0) {
          throw this.fail(arg, "processHeaderMsgArgs Bad or Missing Sid Error");
        }
        if (this.ma.hdr < 0 || this.ma.hdr > this.ma.size) {
          throw this.fail(arg, "processHeaderMsgArgs Bad or Missing Header Size Error");
        }
        if (this.ma.size < 0) {
          throw this.fail(arg, "processHeaderMsgArgs Bad or Missing Size Error");
        }
      }
      protoParseInt(a) {
        if (a.length === 0) {
          return -1;
        }
        let n = 0;
        for (let i = 0; i < a.length; i++) {
          if (a[i] < ASCII_0 || a[i] > ASCII_9) {
            return -1;
          }
          n = n * 10 + (a[i] - ASCII_0);
        }
        return n;
      }
    };
    __name(_Parser, "Parser");
    var Parser = _Parser;
    exports2.Parser = Parser;
    exports2.State = {
      OP_START: 0,
      OP_PLUS: 1,
      OP_PLUS_O: 2,
      OP_PLUS_OK: 3,
      OP_MINUS: 4,
      OP_MINUS_E: 5,
      OP_MINUS_ER: 6,
      OP_MINUS_ERR: 7,
      OP_MINUS_ERR_SPC: 8,
      MINUS_ERR_ARG: 9,
      OP_M: 10,
      OP_MS: 11,
      OP_MSG: 12,
      OP_MSG_SPC: 13,
      MSG_ARG: 14,
      MSG_PAYLOAD: 15,
      MSG_END: 16,
      OP_H: 17,
      OP_P: 18,
      OP_PI: 19,
      OP_PIN: 20,
      OP_PING: 21,
      OP_PO: 22,
      OP_PON: 23,
      OP_PONG: 24,
      OP_I: 25,
      OP_IN: 26,
      OP_INF: 27,
      OP_INFO: 28,
      OP_INFO_SPC: 29,
      INFO_ARG: 30
    };
    exports2.cc = {
      CR: "\r".charCodeAt(0),
      E: "E".charCodeAt(0),
      e: "e".charCodeAt(0),
      F: "F".charCodeAt(0),
      f: "f".charCodeAt(0),
      G: "G".charCodeAt(0),
      g: "g".charCodeAt(0),
      H: "H".charCodeAt(0),
      h: "h".charCodeAt(0),
      I: "I".charCodeAt(0),
      i: "i".charCodeAt(0),
      K: "K".charCodeAt(0),
      k: "k".charCodeAt(0),
      M: "M".charCodeAt(0),
      m: "m".charCodeAt(0),
      MINUS: "-".charCodeAt(0),
      N: "N".charCodeAt(0),
      n: "n".charCodeAt(0),
      NL: "\n".charCodeAt(0),
      O: "O".charCodeAt(0),
      o: "o".charCodeAt(0),
      P: "P".charCodeAt(0),
      p: "p".charCodeAt(0),
      PLUS: "+".charCodeAt(0),
      R: "R".charCodeAt(0),
      r: "r".charCodeAt(0),
      S: "S".charCodeAt(0),
      s: "s".charCodeAt(0),
      SPACE: " ".charCodeAt(0),
      TAB: "	".charCodeAt(0)
    };
  }
});

// node_modules/@nats-io/nats-core/lib/headers.js
var require_headers2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/headers.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MsgHdrsImpl = void 0;
    exports2.canonicalMIMEHeaderKey = canonicalMIMEHeaderKey;
    exports2.headers = headers2;
    var encoders_1 = require_encoders2();
    var core_1 = require_core2();
    var errors_1 = require_errors2();
    function canonicalMIMEHeaderKey(k) {
      const a = 97;
      const A = 65;
      const Z = 90;
      const z = 122;
      const dash = 45;
      const colon = 58;
      const start = 33;
      const end = 126;
      const toLower = a - A;
      let upper = true;
      const buf = new Array(k.length);
      for (let i = 0; i < k.length; i++) {
        let c = k.charCodeAt(i);
        if (c === colon || c < start || c > end) {
          throw errors_1.InvalidArgumentError.format("header", `'${k[i]}' is not a valid character in a header name`);
        }
        if (upper && a <= c && c <= z) {
          c -= toLower;
        } else if (!upper && A <= c && c <= Z) {
          c += toLower;
        }
        buf[i] = c;
        upper = c == dash;
      }
      return String.fromCharCode(...buf);
    }
    __name(canonicalMIMEHeaderKey, "canonicalMIMEHeaderKey");
    function headers2(code = 0, description = "") {
      if (code === 0 && description !== "" || code > 0 && description === "") {
        throw errors_1.InvalidArgumentError.format("description", "is required");
      }
      return new MsgHdrsImpl(code, description);
    }
    __name(headers2, "headers");
    var HEADER = "NATS/1.0";
    var _MsgHdrsImpl = class _MsgHdrsImpl {
      _code;
      headers;
      _description;
      constructor(code = 0, description = "") {
        this._code = code;
        this._description = description;
        this.headers = /* @__PURE__ */ new Map();
      }
      [Symbol.iterator]() {
        return this.headers.entries();
      }
      size() {
        return this.headers.size;
      }
      equals(mh) {
        if (mh && this.headers.size === mh.headers.size && this._code === mh._code) {
          for (const [k, v] of this.headers) {
            const a = mh.values(k);
            if (v.length !== a.length) {
              return false;
            }
            const vv = [...v].sort();
            const aa = [...a].sort();
            for (let i = 0; i < vv.length; i++) {
              if (vv[i] !== aa[i]) {
                return false;
              }
            }
          }
          return true;
        }
        return false;
      }
      static decode(a) {
        const mh = new _MsgHdrsImpl();
        const s = encoders_1.TD.decode(a);
        const lines = s.split("\r\n");
        const h = lines[0];
        if (h !== HEADER) {
          let str = h.replace(HEADER, "").trim();
          if (str.length > 0) {
            mh._code = parseInt(str, 10);
            if (isNaN(mh._code)) {
              mh._code = 0;
            }
            const scode = mh._code.toString();
            str = str.replace(scode, "");
            mh._description = str.trim();
          }
        }
        if (lines.length >= 1) {
          lines.slice(1).map((s2) => {
            if (s2) {
              const idx = s2.indexOf(":");
              if (idx > -1) {
                const k = s2.slice(0, idx);
                const v = s2.slice(idx + 1).trim();
                mh.append(k, v);
              }
            }
          });
        }
        return mh;
      }
      toString() {
        if (this.headers.size === 0 && this._code === 0) {
          return "";
        }
        let s = HEADER;
        if (this._code > 0 && this._description !== "") {
          s += ` ${this._code} ${this._description}`;
        }
        for (const [k, v] of this.headers) {
          for (let i = 0; i < v.length; i++) {
            s = `${s}\r
${k}: ${v[i]}`;
          }
        }
        return `${s}\r
\r
`;
      }
      encode() {
        return encoders_1.TE.encode(this.toString());
      }
      static validHeaderValue(k) {
        const inv = /[\r\n]/;
        if (inv.test(k)) {
          throw errors_1.InvalidArgumentError.format("header", "values cannot contain \\r or \\n");
        }
        return k.trim();
      }
      keys() {
        const keys = [];
        for (const sk of this.headers.keys()) {
          keys.push(sk);
        }
        return keys;
      }
      findKeys(k, match = core_1.Match.Exact) {
        const keys = this.keys();
        switch (match) {
          case core_1.Match.Exact:
            return keys.filter((v) => {
              return v === k;
            });
          case core_1.Match.CanonicalMIME:
            k = canonicalMIMEHeaderKey(k);
            return keys.filter((v) => {
              return v === k;
            });
          default: {
            const lci = k.toLowerCase();
            return keys.filter((v) => {
              return lci === v.toLowerCase();
            });
          }
        }
      }
      get(k, match = core_1.Match.Exact) {
        const keys = this.findKeys(k, match);
        if (keys.length) {
          const v = this.headers.get(keys[0]);
          if (v) {
            return Array.isArray(v) ? v[0] : v;
          }
        }
        return "";
      }
      last(k, match = core_1.Match.Exact) {
        const keys = this.findKeys(k, match);
        if (keys.length) {
          const v = this.headers.get(keys[0]);
          if (v) {
            return Array.isArray(v) ? v[v.length - 1] : v;
          }
        }
        return "";
      }
      has(k, match = core_1.Match.Exact) {
        return this.findKeys(k, match).length > 0;
      }
      set(k, v, match = core_1.Match.Exact) {
        this.delete(k, match);
        this.append(k, v, match);
      }
      append(k, v, match = core_1.Match.Exact) {
        const ck = canonicalMIMEHeaderKey(k);
        if (match === core_1.Match.CanonicalMIME) {
          k = ck;
        }
        const keys = this.findKeys(k, match);
        k = keys.length > 0 ? keys[0] : k;
        const value = _MsgHdrsImpl.validHeaderValue(v);
        let a = this.headers.get(k);
        if (!a) {
          a = [];
          this.headers.set(k, a);
        }
        a.push(value);
      }
      values(k, match = core_1.Match.Exact) {
        const buf = [];
        const keys = this.findKeys(k, match);
        keys.forEach((v) => {
          const values = this.headers.get(v);
          if (values) {
            buf.push(...values);
          }
        });
        return buf;
      }
      delete(k, match = core_1.Match.Exact) {
        const keys = this.findKeys(k, match);
        keys.forEach((v) => {
          this.headers.delete(v);
        });
      }
      get hasError() {
        return this._code >= 300;
      }
      get status() {
        return `${this._code} ${this._description}`.trim();
      }
      toRecord() {
        const data = {};
        this.keys().forEach((v) => {
          data[v] = this.values(v);
        });
        return data;
      }
      get code() {
        return this._code;
      }
      get description() {
        return this._description;
      }
      static fromRecord(r) {
        const h = new _MsgHdrsImpl();
        for (const k in r) {
          h.headers.set(k, r[k]);
        }
        return h;
      }
    };
    __name(_MsgHdrsImpl, "MsgHdrsImpl");
    var MsgHdrsImpl = _MsgHdrsImpl;
    exports2.MsgHdrsImpl = MsgHdrsImpl;
  }
});

// node_modules/@nats-io/nats-core/lib/msg.js
var require_msg2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/msg.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MsgImpl = void 0;
    var headers_1 = require_headers2();
    var encoders_1 = require_encoders2();
    var _MsgImpl = class _MsgImpl {
      _headers;
      _msg;
      _rdata;
      _reply;
      _subject;
      publisher;
      constructor(msg, data, publisher) {
        this._msg = msg;
        this._rdata = data;
        this.publisher = publisher;
      }
      get subject() {
        if (this._subject) {
          return this._subject;
        }
        this._subject = encoders_1.TD.decode(this._msg.subject);
        return this._subject;
      }
      get reply() {
        if (this._reply) {
          return this._reply;
        }
        this._reply = encoders_1.TD.decode(this._msg.reply);
        return this._reply;
      }
      get sid() {
        return this._msg.sid;
      }
      get headers() {
        if (this._msg.hdr > -1 && !this._headers) {
          const buf = this._rdata.subarray(0, this._msg.hdr);
          this._headers = headers_1.MsgHdrsImpl.decode(buf);
        }
        return this._headers;
      }
      get data() {
        if (!this._rdata) {
          return new Uint8Array(0);
        }
        return this._msg.hdr > -1 ? this._rdata.subarray(this._msg.hdr) : this._rdata;
      }
      // eslint-ignore-next-line @typescript-eslint/no-explicit-any
      respond(data = encoders_1.Empty, opts) {
        if (this.reply) {
          this.publisher.publish(this.reply, data, opts);
          return true;
        }
        return false;
      }
      size() {
        var _a;
        const subj = this._msg.subject.length;
        const reply = ((_a = this._msg.reply) == null ? void 0 : _a.length) || 0;
        const payloadAndHeaders = this._msg.size === -1 ? 0 : this._msg.size;
        return subj + reply + payloadAndHeaders;
      }
      json(reviver) {
        return JSON.parse(this.string(), reviver);
      }
      string() {
        return encoders_1.TD.decode(this.data);
      }
      requestInfo() {
        var _a;
        const v = (_a = this.headers) == null ? void 0 : _a.get("Nats-Request-Info");
        if (v) {
          return JSON.parse(v, function(key, value) {
            if ((key === "start" || key === "stop") && value !== "") {
              return new Date(Date.parse(value));
            }
            return value;
          });
        }
        return null;
      }
    };
    __name(_MsgImpl, "MsgImpl");
    var MsgImpl = _MsgImpl;
    exports2.MsgImpl = MsgImpl;
  }
});

// node_modules/@nats-io/nats-core/lib/semver.js
var require_semver2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/semver.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Features = exports2.Feature = void 0;
    exports2.parseSemVer = parseSemVer;
    exports2.compare = compare;
    function parseSemVer(s = "") {
      const m = s.match(/(\d+).(\d+).(\d+)/);
      if (m) {
        return {
          major: parseInt(m[1]),
          minor: parseInt(m[2]),
          micro: parseInt(m[3])
        };
      }
      throw new Error(`'${s}' is not a semver value`);
    }
    __name(parseSemVer, "parseSemVer");
    function compare(a, b) {
      if (a.major < b.major)
        return -1;
      if (a.major > b.major)
        return 1;
      if (a.minor < b.minor)
        return -1;
      if (a.minor > b.minor)
        return 1;
      if (a.micro < b.micro)
        return -1;
      if (a.micro > b.micro)
        return 1;
      return 0;
    }
    __name(compare, "compare");
    exports2.Feature = {
      JS_KV: "js_kv",
      JS_OBJECTSTORE: "js_objectstore",
      JS_PULL_MAX_BYTES: "js_pull_max_bytes",
      JS_NEW_CONSUMER_CREATE_API: "js_new_consumer_create",
      JS_ALLOW_DIRECT: "js_allow_direct",
      JS_MULTIPLE_CONSUMER_FILTER: "js_multiple_consumer_filter",
      JS_SIMPLIFICATION: "js_simplification",
      JS_STREAM_CONSUMER_METADATA: "js_stream_consumer_metadata",
      JS_CONSUMER_FILTER_SUBJECTS: "js_consumer_filter_subjects",
      JS_STREAM_FIRST_SEQ: "js_stream_first_seq",
      JS_STREAM_SUBJECT_TRANSFORM: "js_stream_subject_transform",
      JS_STREAM_SOURCE_SUBJECT_TRANSFORM: "js_stream_source_subject_transform",
      JS_STREAM_COMPRESSION: "js_stream_compression",
      JS_DEFAULT_CONSUMER_LIMITS: "js_default_consumer_limits",
      JS_BATCH_DIRECT_GET: "js_batch_direct_get",
      JS_PRIORITY_GROUPS: "js_priority_groups"
    };
    var _Features = class _Features {
      server;
      features;
      disabled;
      constructor(v) {
        this.features = /* @__PURE__ */ new Map();
        this.disabled = [];
        this.update(v);
      }
      /**
       * Removes all disabled entries
       */
      resetDisabled() {
        this.disabled.length = 0;
        this.update(this.server);
      }
      /**
       * Disables a particular feature.
       * @param f
       */
      disable(f) {
        this.disabled.push(f);
        this.update(this.server);
      }
      isDisabled(f) {
        return this.disabled.indexOf(f) !== -1;
      }
      update(v) {
        if (typeof v === "string") {
          v = parseSemVer(v);
        }
        this.server = v;
        this.set(exports2.Feature.JS_KV, "2.6.2");
        this.set(exports2.Feature.JS_OBJECTSTORE, "2.6.3");
        this.set(exports2.Feature.JS_PULL_MAX_BYTES, "2.8.3");
        this.set(exports2.Feature.JS_NEW_CONSUMER_CREATE_API, "2.9.0");
        this.set(exports2.Feature.JS_ALLOW_DIRECT, "2.9.0");
        this.set(exports2.Feature.JS_MULTIPLE_CONSUMER_FILTER, "2.10.0");
        this.set(exports2.Feature.JS_SIMPLIFICATION, "2.9.4");
        this.set(exports2.Feature.JS_STREAM_CONSUMER_METADATA, "2.10.0");
        this.set(exports2.Feature.JS_CONSUMER_FILTER_SUBJECTS, "2.10.0");
        this.set(exports2.Feature.JS_STREAM_FIRST_SEQ, "2.10.0");
        this.set(exports2.Feature.JS_STREAM_SUBJECT_TRANSFORM, "2.10.0");
        this.set(exports2.Feature.JS_STREAM_SOURCE_SUBJECT_TRANSFORM, "2.10.0");
        this.set(exports2.Feature.JS_STREAM_COMPRESSION, "2.10.0");
        this.set(exports2.Feature.JS_DEFAULT_CONSUMER_LIMITS, "2.10.0");
        this.set(exports2.Feature.JS_BATCH_DIRECT_GET, "2.11.0");
        this.set(exports2.Feature.JS_PRIORITY_GROUPS, "2.11.0");
        this.disabled.forEach((f) => {
          this.features.delete(f);
        });
      }
      /**
       * Register a feature that requires a particular server version.
       * @param f
       * @param requires
       */
      set(f, requires) {
        this.features.set(f, {
          min: requires,
          ok: compare(this.server, parseSemVer(requires)) >= 0
        });
      }
      /**
       * Returns whether the feature is available and the min server
       * version that supports it.
       * @param f
       */
      get(f) {
        return this.features.get(f) || { min: "unknown", ok: false };
      }
      /**
       * Returns true if the feature is supported
       * @param f
       */
      supports(f) {
        var _a;
        return ((_a = this.get(f)) == null ? void 0 : _a.ok) || false;
      }
      /**
       * Returns true if the server is at least the specified version
       * @param v
       */
      require(v) {
        if (typeof v === "string") {
          v = parseSemVer(v);
        }
        return compare(this.server, v) >= 0;
      }
    };
    __name(_Features, "Features");
    var Features = _Features;
    exports2.Features = Features;
  }
});

// node_modules/@nats-io/nats-core/lib/nkeys.js
var require_nkeys3 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/nkeys.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: /* @__PURE__ */ __name(function() {
          return m[k];
        }, "get") };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ function() {
      var ownKeys = /* @__PURE__ */ __name(function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      }, "ownKeys");
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    }();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.nkeys = void 0;
    exports2.nkeys = __importStar(require_mod());
  }
});

// node_modules/@nats-io/nats-core/lib/authenticator.js
var require_authenticator2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/authenticator.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.multiAuthenticator = multiAuthenticator;
    exports2.noAuthFn = noAuthFn;
    exports2.usernamePasswordAuthenticator = usernamePasswordAuthenticator2;
    exports2.tokenAuthenticator = tokenAuthenticator2;
    exports2.nkeyAuthenticator = nkeyAuthenticator2;
    exports2.jwtAuthenticator = jwtAuthenticator2;
    exports2.credsAuthenticator = credsAuthenticator2;
    var nkeys_1 = require_nkeys3();
    var encoders_1 = require_encoders2();
    function multiAuthenticator(authenticators) {
      return (nonce) => {
        let auth = {};
        authenticators.forEach((a) => {
          const args = a(nonce) || {};
          auth = Object.assign(auth, args);
        });
        return auth;
      };
    }
    __name(multiAuthenticator, "multiAuthenticator");
    function noAuthFn() {
      return () => {
        return;
      };
    }
    __name(noAuthFn, "noAuthFn");
    function usernamePasswordAuthenticator2(user, pass) {
      return () => {
        const u = typeof user === "function" ? user() : user;
        const p = typeof pass === "function" ? pass() : pass;
        return { user: u, pass: p };
      };
    }
    __name(usernamePasswordAuthenticator2, "usernamePasswordAuthenticator");
    function tokenAuthenticator2(token) {
      return () => {
        const auth_token = typeof token === "function" ? token() : token;
        return { auth_token };
      };
    }
    __name(tokenAuthenticator2, "tokenAuthenticator");
    function nkeyAuthenticator2(seed) {
      return (nonce) => {
        const s = typeof seed === "function" ? seed() : seed;
        const kp = s ? nkeys_1.nkeys.fromSeed(s) : void 0;
        const nkey = kp ? kp.getPublicKey() : "";
        const challenge = encoders_1.TE.encode(nonce || "");
        const sigBytes = kp !== void 0 && nonce ? kp.sign(challenge) : void 0;
        const sig = sigBytes ? nkeys_1.nkeys.encode(sigBytes) : "";
        return { nkey, sig };
      };
    }
    __name(nkeyAuthenticator2, "nkeyAuthenticator");
    function jwtAuthenticator2(ajwt, seed) {
      return (nonce) => {
        const jwt = typeof ajwt === "function" ? ajwt() : ajwt;
        const fn = nkeyAuthenticator2(seed);
        const { nkey, sig } = fn(nonce);
        return { jwt, nkey, sig };
      };
    }
    __name(jwtAuthenticator2, "jwtAuthenticator");
    function credsAuthenticator2(creds) {
      const fn = typeof creds !== "function" ? () => creds : creds;
      const parse = /* @__PURE__ */ __name(() => {
        const CREDS = /\s*(?:(?:[-]{3,}[^\n]*[-]{3,}\n)(.+)(?:\n\s*[-]{3,}[^\n]*[-]{3,}\n))/ig;
        const s = encoders_1.TD.decode(fn());
        let m = CREDS.exec(s);
        if (!m) {
          throw new Error("unable to parse credentials");
        }
        const jwt = m[1].trim();
        m = CREDS.exec(s);
        if (!m) {
          throw new Error("unable to parse credentials");
        }
        const seed = encoders_1.TE.encode(m[1].trim());
        return { jwt, seed };
      }, "parse");
      const jwtFn = /* @__PURE__ */ __name(() => {
        const { jwt } = parse();
        return jwt;
      }, "jwtFn");
      const nkeyFn = /* @__PURE__ */ __name(() => {
        const { seed } = parse();
        return seed;
      }, "nkeyFn");
      return jwtAuthenticator2(jwtFn, nkeyFn);
    }
    __name(credsAuthenticator2, "credsAuthenticator");
  }
});

// node_modules/@nats-io/nats-core/lib/options.js
var require_options2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/options.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_RECONNECT_TIME_WAIT = exports2.DEFAULT_MAX_PING_OUT = exports2.DEFAULT_PING_INTERVAL = exports2.DEFAULT_JITTER_TLS = exports2.DEFAULT_JITTER = exports2.DEFAULT_MAX_RECONNECT_ATTEMPTS = void 0;
    exports2.defaultOptions = defaultOptions;
    exports2.hasWsProtocol = hasWsProtocol;
    exports2.buildAuthenticator = buildAuthenticator;
    exports2.parseOptions = parseOptions;
    exports2.checkOptions = checkOptions;
    exports2.checkUnsupportedOption = checkUnsupportedOption;
    var util_1 = require_util3();
    var transport_1 = require_transport2();
    var core_1 = require_core2();
    var authenticator_1 = require_authenticator2();
    var errors_1 = require_errors2();
    exports2.DEFAULT_MAX_RECONNECT_ATTEMPTS = 10;
    exports2.DEFAULT_JITTER = 100;
    exports2.DEFAULT_JITTER_TLS = 1e3;
    exports2.DEFAULT_PING_INTERVAL = 2 * 60 * 1e3;
    exports2.DEFAULT_MAX_PING_OUT = 2;
    exports2.DEFAULT_RECONNECT_TIME_WAIT = 2 * 1e3;
    function defaultOptions() {
      return {
        maxPingOut: exports2.DEFAULT_MAX_PING_OUT,
        maxReconnectAttempts: exports2.DEFAULT_MAX_RECONNECT_ATTEMPTS,
        noRandomize: false,
        pedantic: false,
        pingInterval: exports2.DEFAULT_PING_INTERVAL,
        reconnect: true,
        reconnectJitter: exports2.DEFAULT_JITTER,
        reconnectJitterTLS: exports2.DEFAULT_JITTER_TLS,
        reconnectTimeWait: exports2.DEFAULT_RECONNECT_TIME_WAIT,
        tls: void 0,
        verbose: false,
        waitOnFirstConnect: false,
        ignoreAuthErrorAbort: false
      };
    }
    __name(defaultOptions, "defaultOptions");
    function hasWsProtocol(opts) {
      if (opts) {
        let { servers } = opts;
        if (typeof servers === "string") {
          servers = [servers];
        }
        if (servers) {
          for (let i = 0; i < servers.length; i++) {
            const s = servers[i].toLowerCase();
            if (s.startsWith("ws://") || s.startsWith("wss://")) {
              return true;
            }
          }
        }
      }
      return false;
    }
    __name(hasWsProtocol, "hasWsProtocol");
    function buildAuthenticator(opts) {
      const buf = [];
      if (typeof opts.authenticator === "function") {
        buf.push(opts.authenticator);
      }
      if (Array.isArray(opts.authenticator)) {
        buf.push(...opts.authenticator);
      }
      if (opts.token) {
        buf.push((0, authenticator_1.tokenAuthenticator)(opts.token));
      }
      if (opts.user) {
        buf.push((0, authenticator_1.usernamePasswordAuthenticator)(opts.user, opts.pass));
      }
      return buf.length === 0 ? (0, authenticator_1.noAuthFn)() : (0, authenticator_1.multiAuthenticator)(buf);
    }
    __name(buildAuthenticator, "buildAuthenticator");
    function parseOptions(opts) {
      const dhp = `${core_1.DEFAULT_HOST}:${(0, transport_1.defaultPort)()}`;
      opts = opts || { servers: [dhp] };
      opts.servers = opts.servers || [];
      if (typeof opts.servers === "string") {
        opts.servers = [opts.servers];
      }
      if (opts.servers.length > 0 && opts.port) {
        throw errors_1.InvalidArgumentError.format(["servers", "port"], "are mutually exclusive");
      }
      if (opts.servers.length === 0 && opts.port) {
        opts.servers = [`${core_1.DEFAULT_HOST}:${opts.port}`];
      }
      if (opts.servers && opts.servers.length === 0) {
        opts.servers = [dhp];
      }
      const options = (0, util_1.extend)(defaultOptions(), opts);
      options.authenticator = buildAuthenticator(options);
      ["reconnectDelayHandler", "authenticator"].forEach((n) => {
        if (options[n] && typeof options[n] !== "function") {
          throw TypeError(`'${n}' must be a function`);
        }
      });
      if (!options.reconnectDelayHandler) {
        options.reconnectDelayHandler = () => {
          let extra = options.tls ? options.reconnectJitterTLS : options.reconnectJitter;
          if (extra) {
            extra++;
            extra = Math.floor(Math.random() * extra);
          }
          return options.reconnectTimeWait + extra;
        };
      }
      if (options.inboxPrefix) {
        (0, core_1.createInbox)(options.inboxPrefix);
      }
      if (options.resolve === void 0) {
        options.resolve = typeof (0, transport_1.getResolveFn)() === "function";
      }
      if (options.resolve) {
        if (typeof (0, transport_1.getResolveFn)() !== "function") {
          throw errors_1.InvalidArgumentError.format("resolve", "is not supported in the current runtime");
        }
      }
      return options;
    }
    __name(parseOptions, "parseOptions");
    function checkOptions(info, options) {
      const { proto, tls_required: tlsRequired, tls_available: tlsAvailable } = info;
      if ((proto === void 0 || proto < 1) && options.noEcho) {
        throw new errors_1.errors.ConnectionError(`server does not support 'noEcho'`);
      }
      const tls = tlsRequired || tlsAvailable || false;
      if (options.tls && !tls) {
        throw new errors_1.errors.ConnectionError(`server does not support 'tls'`);
      }
    }
    __name(checkOptions, "checkOptions");
    function checkUnsupportedOption(prop, v) {
      if (v) {
        throw errors_1.InvalidArgumentError.format(prop, "is not supported");
      }
    }
    __name(checkUnsupportedOption, "checkUnsupportedOption");
  }
});

// node_modules/@nats-io/nats-core/lib/protocol.js
var require_protocol2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/protocol.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProtocolHandler = exports2.Subscriptions = exports2.SubscriptionImpl = exports2.Connect = exports2.INFO = void 0;
    var encoders_1 = require_encoders2();
    var transport_1 = require_transport2();
    var util_1 = require_util3();
    var databuffer_1 = require_databuffer2();
    var servers_1 = require_servers2();
    var queued_iterator_1 = require_queued_iterator2();
    var muxsubscription_1 = require_muxsubscription2();
    var heartbeats_1 = require_heartbeats2();
    var parser_1 = require_parser2();
    var msg_1 = require_msg2();
    var semver_1 = require_semver2();
    var options_1 = require_options2();
    var errors_1 = require_errors2();
    var FLUSH_THRESHOLD = 1024 * 32;
    exports2.INFO = /^INFO\s+([^\r\n]+)\r\n/i;
    var PONG_CMD = (0, encoders_1.encode)("PONG\r\n");
    var PING_CMD = (0, encoders_1.encode)("PING\r\n");
    var _Connect = class _Connect {
      echo;
      no_responders;
      protocol;
      verbose;
      pedantic;
      jwt;
      nkey;
      sig;
      user;
      pass;
      auth_token;
      tls_required;
      name;
      lang;
      version;
      headers;
      constructor(transport, opts, nonce) {
        this.protocol = 1;
        this.version = transport.version;
        this.lang = transport.lang;
        this.echo = opts.noEcho ? false : void 0;
        this.verbose = opts.verbose;
        this.pedantic = opts.pedantic;
        this.tls_required = opts.tls ? true : void 0;
        this.name = opts.name;
        const creds = (opts && typeof opts.authenticator === "function" ? opts.authenticator(nonce) : {}) || {};
        (0, util_1.extend)(this, creds);
      }
    };
    __name(_Connect, "Connect");
    var Connect = _Connect;
    exports2.Connect = Connect;
    var _SlowNotifier = class _SlowNotifier {
      slow;
      cb;
      notified;
      constructor(slow, cb) {
        this.slow = slow;
        this.cb = cb;
        this.notified = false;
      }
      maybeNotify(pending) {
        if (pending <= this.slow) {
          this.notified = false;
        } else {
          if (!this.notified) {
            this.cb(pending);
            this.notified = true;
          }
        }
      }
    };
    __name(_SlowNotifier, "SlowNotifier");
    var SlowNotifier = _SlowNotifier;
    var _SubscriptionImpl = class _SubscriptionImpl extends queued_iterator_1.QueuedIteratorImpl {
      sid;
      queue;
      draining;
      max;
      subject;
      drained;
      protocol;
      timer;
      info;
      cleanupFn;
      closed;
      requestSubject;
      slow;
      constructor(protocol, subject, opts = {}) {
        var _a;
        super();
        (0, util_1.extend)(this, opts);
        this.protocol = protocol;
        this.subject = subject;
        this.draining = false;
        this.noIterator = typeof opts.callback === "function";
        this.closed = (0, util_1.deferred)();
        const asyncTraces = !(((_a = protocol.options) == null ? void 0 : _a.noAsyncTraces) || false);
        if (opts.timeout) {
          this.timer = (0, util_1.timeout)(opts.timeout, asyncTraces);
          this.timer.then(() => {
            this.timer = void 0;
          }).catch((err) => {
            this.stop(err);
            if (this.noIterator) {
              this.callback(err, {});
            }
          });
        }
        if (!this.noIterator) {
          this.iterClosed.then((err) => {
            this.closed.resolve(err);
            this.unsubscribe();
          });
        }
      }
      setSlowNotificationFn(slow, fn) {
        this.slow = void 0;
        if (fn) {
          if (this.noIterator) {
            throw new Error("callbacks don't support slow notifications");
          }
          this.slow = new SlowNotifier(slow, fn);
        }
      }
      callback(err, msg) {
        this.cancelTimeout();
        err ? this.stop(err) : this.push(msg);
        if (!err && this.slow) {
          this.slow.maybeNotify(this.getPending());
        }
      }
      close(err) {
        if (!this.isClosed()) {
          this.cancelTimeout();
          const fn = /* @__PURE__ */ __name(() => {
            this.stop();
            if (this.cleanupFn) {
              try {
                this.cleanupFn(this, this.info);
              } catch (_err) {
              }
            }
            this.closed.resolve(err);
          }, "fn");
          if (this.noIterator) {
            fn();
          } else {
            this.push(fn);
          }
        }
      }
      unsubscribe(max) {
        this.protocol.unsubscribe(this, max);
      }
      cancelTimeout() {
        if (this.timer) {
          this.timer.cancel();
          this.timer = void 0;
        }
      }
      drain() {
        if (this.protocol.isClosed()) {
          return Promise.reject(new errors_1.errors.ClosedConnectionError());
        }
        if (this.isClosed()) {
          return Promise.reject(new errors_1.errors.InvalidOperationError("subscription is already closed"));
        }
        if (!this.drained) {
          this.draining = true;
          this.protocol.unsub(this);
          this.drained = this.protocol.flush((0, util_1.deferred)()).then(() => {
            this.protocol.subscriptions.cancel(this);
          }).catch(() => {
            this.protocol.subscriptions.cancel(this);
          });
        }
        return this.drained;
      }
      isDraining() {
        return this.draining;
      }
      isClosed() {
        return this.done;
      }
      getSubject() {
        return this.subject;
      }
      getMax() {
        return this.max;
      }
      getID() {
        return this.sid;
      }
    };
    __name(_SubscriptionImpl, "SubscriptionImpl");
    var SubscriptionImpl = _SubscriptionImpl;
    exports2.SubscriptionImpl = SubscriptionImpl;
    var _Subscriptions = class _Subscriptions {
      mux;
      subs;
      sidCounter;
      constructor() {
        this.sidCounter = 0;
        this.mux = null;
        this.subs = /* @__PURE__ */ new Map();
      }
      size() {
        return this.subs.size;
      }
      add(s) {
        this.sidCounter++;
        s.sid = this.sidCounter;
        this.subs.set(s.sid, s);
        return s;
      }
      setMux(s) {
        this.mux = s;
        return s;
      }
      getMux() {
        return this.mux;
      }
      get(sid) {
        return this.subs.get(sid);
      }
      resub(s) {
        this.sidCounter++;
        this.subs.delete(s.sid);
        s.sid = this.sidCounter;
        this.subs.set(s.sid, s);
        return s;
      }
      all() {
        return Array.from(this.subs.values());
      }
      cancel(s) {
        if (s) {
          s.close();
          this.subs.delete(s.sid);
        }
      }
      handleError(err) {
        const subs = this.all();
        let sub;
        if (err.operation === "subscription") {
          sub = subs.find((s) => {
            return s.subject === err.subject && s.queue === err.queue;
          });
        } else if (err.operation === "publish") {
          sub = subs.find((s) => {
            return s.requestSubject === err.subject;
          });
        }
        if (sub) {
          sub.callback(err, {});
          sub.close(err);
          this.subs.delete(sub.sid);
          return sub !== this.mux;
        }
        return false;
      }
      close() {
        this.subs.forEach((sub) => {
          sub.close();
        });
      }
    };
    __name(_Subscriptions, "Subscriptions");
    var Subscriptions = _Subscriptions;
    exports2.Subscriptions = Subscriptions;
    var _ProtocolHandler = class _ProtocolHandler {
      connected;
      connectedOnce;
      infoReceived;
      info;
      muxSubscriptions;
      options;
      outbound;
      pongs;
      subscriptions;
      transport;
      noMorePublishing;
      connectError;
      publisher;
      _closed;
      closed;
      listeners;
      heartbeats;
      parser;
      outMsgs;
      inMsgs;
      outBytes;
      inBytes;
      pendingLimit;
      lastError;
      abortReconnect;
      whyClosed;
      servers;
      server;
      features;
      connectPromise;
      dialDelay;
      raceTimer;
      constructor(options, publisher) {
        this._closed = false;
        this.connected = false;
        this.connectedOnce = false;
        this.infoReceived = false;
        this.noMorePublishing = false;
        this.abortReconnect = false;
        this.listeners = [];
        this.pendingLimit = FLUSH_THRESHOLD;
        this.outMsgs = 0;
        this.inMsgs = 0;
        this.outBytes = 0;
        this.inBytes = 0;
        this.options = options;
        this.publisher = publisher;
        this.subscriptions = new Subscriptions();
        this.muxSubscriptions = new muxsubscription_1.MuxSubscription();
        this.outbound = new databuffer_1.DataBuffer();
        this.pongs = [];
        this.whyClosed = "";
        this.pendingLimit = options.pendingLimit || this.pendingLimit;
        this.features = new semver_1.Features({ major: 0, minor: 0, micro: 0 });
        this.connectPromise = null;
        this.dialDelay = null;
        const servers = typeof options.servers === "string" ? [options.servers] : options.servers;
        this.servers = new servers_1.Servers(servers, {
          randomize: !options.noRandomize
        });
        this.closed = (0, util_1.deferred)();
        this.parser = new parser_1.Parser(this);
        this.heartbeats = new heartbeats_1.Heartbeat(this, this.options.pingInterval || options_1.DEFAULT_PING_INTERVAL, this.options.maxPingOut || options_1.DEFAULT_MAX_PING_OUT);
      }
      resetOutbound() {
        this.outbound.reset();
        const pongs = this.pongs;
        this.pongs = [];
        const err = new errors_1.errors.RequestError("connection disconnected");
        err.stack = "";
        pongs.forEach((p) => {
          p.reject(err);
        });
        this.parser = new parser_1.Parser(this);
        this.infoReceived = false;
      }
      dispatchStatus(status) {
        this.listeners.forEach((q) => {
          q.push(status);
        });
      }
      prepare() {
        if (this.transport) {
          this.transport.discard();
        }
        this.info = void 0;
        this.resetOutbound();
        const pong = (0, util_1.deferred)();
        pong.catch(() => {
        });
        this.pongs.unshift(pong);
        this.connectError = (err) => {
          pong.reject(err);
        };
        this.transport = (0, transport_1.newTransport)();
        this.transport.closed().then(async (_err) => {
          this.connected = false;
          if (!this.isClosed()) {
            await this.disconnected(this.transport.closeError || this.lastError);
            return;
          }
        });
        return pong;
      }
      disconnect() {
        this.dispatchStatus({ type: "staleConnection" });
        this.transport.disconnect();
      }
      reconnect() {
        if (this.connected) {
          this.dispatchStatus({
            type: "forceReconnect"
          });
          this.transport.disconnect();
        }
        return Promise.resolve();
      }
      async disconnected(err) {
        this.dispatchStatus({
          type: "disconnect",
          server: this.servers.getCurrentServer().toString()
        });
        if (this.options.reconnect) {
          await this.dialLoop().then(() => {
            this.dispatchStatus({
              type: "reconnect",
              server: this.servers.getCurrentServer().toString()
            });
            if (this.lastError instanceof errors_1.errors.UserAuthenticationExpiredError) {
              this.lastError = void 0;
            }
          }).catch((err2) => {
            this.close(err2).catch();
          });
        } else {
          await this.close(err).catch();
        }
      }
      async dial(srv) {
        var _a, _b;
        const pong = this.prepare();
        try {
          this.raceTimer = (0, util_1.timeout)(this.options.timeout || 2e4);
          const cp = this.transport.connect(srv, this.options);
          await Promise.race([cp, this.raceTimer]);
          (async () => {
            try {
              for await (const b of this.transport) {
                this.parser.parse(b);
              }
            } catch (err) {
              console.log("reader closed", err);
            }
          })().then();
        } catch (err) {
          pong.reject(err);
        }
        try {
          await Promise.race([this.raceTimer, pong]);
          (_a = this.raceTimer) == null ? void 0 : _a.cancel();
          this.connected = true;
          this.connectError = void 0;
          this.sendSubscriptions();
          this.connectedOnce = true;
          this.server.didConnect = true;
          this.server.reconnects = 0;
          this.flushPending();
          this.heartbeats.start();
        } catch (err) {
          (_b = this.raceTimer) == null ? void 0 : _b.cancel();
          await this.transport.close(err);
          throw err;
        }
      }
      async _doDial(srv) {
        const { resolve } = this.options;
        const alts = await srv.resolve({
          fn: (0, transport_1.getResolveFn)(),
          debug: this.options.debug,
          randomize: !this.options.noRandomize,
          resolve
        });
        let lastErr = null;
        for (const a of alts) {
          try {
            lastErr = null;
            this.dispatchStatus({ type: "reconnecting" });
            await this.dial(a);
            return;
          } catch (err) {
            lastErr = err;
          }
        }
        throw lastErr;
      }
      dialLoop() {
        if (this.connectPromise === null) {
          this.connectPromise = this.dodialLoop();
          this.connectPromise.then(() => {
          }).catch(() => {
          }).finally(() => {
            this.connectPromise = null;
          });
        }
        return this.connectPromise;
      }
      async dodialLoop() {
        let lastError;
        while (true) {
          if (this._closed) {
            this.servers.clear();
          }
          const wait = this.options.reconnectDelayHandler ? this.options.reconnectDelayHandler() : options_1.DEFAULT_RECONNECT_TIME_WAIT;
          let maxWait = wait;
          const srv = this.selectServer();
          if (!srv || this.abortReconnect) {
            if (lastError) {
              throw lastError;
            } else if (this.lastError) {
              throw this.lastError;
            } else {
              throw new errors_1.errors.ConnectionError("connection refused");
            }
          }
          const now = Date.now();
          if (srv.lastConnect === 0 || srv.lastConnect + wait <= now) {
            srv.lastConnect = Date.now();
            try {
              await this._doDial(srv);
              break;
            } catch (err) {
              lastError = err;
              if (!this.connectedOnce) {
                if (this.options.waitOnFirstConnect) {
                  continue;
                }
                this.servers.removeCurrentServer();
              }
              srv.reconnects++;
              const mra = this.options.maxReconnectAttempts || 0;
              if (mra !== -1 && srv.reconnects >= mra) {
                this.servers.removeCurrentServer();
              }
            }
          } else {
            maxWait = Math.min(maxWait, srv.lastConnect + wait - now);
            this.dialDelay = (0, util_1.delay)(maxWait);
            await this.dialDelay;
          }
        }
      }
      static async connect(options, publisher) {
        const h = new _ProtocolHandler(options, publisher);
        await h.dialLoop();
        return h;
      }
      static toError(s) {
        let err = errors_1.errors.PermissionViolationError.parse(s);
        if (err) {
          return err;
        }
        err = errors_1.errors.UserAuthenticationExpiredError.parse(s);
        if (err) {
          return err;
        }
        err = errors_1.errors.AuthorizationError.parse(s);
        if (err) {
          return err;
        }
        return new errors_1.errors.ProtocolError(s);
      }
      processMsg(msg, data) {
        this.inMsgs++;
        this.inBytes += data.length;
        if (!this.subscriptions.sidCounter) {
          return;
        }
        const sub = this.subscriptions.get(msg.sid);
        if (!sub) {
          return;
        }
        sub.received += 1;
        if (sub.callback) {
          sub.callback(null, new msg_1.MsgImpl(msg, data, this));
        }
        if (sub.max !== void 0 && sub.received >= sub.max) {
          sub.unsubscribe();
        }
      }
      processError(m) {
        let s = (0, encoders_1.decode)(m);
        if (s.startsWith("'") && s.endsWith("'")) {
          s = s.slice(1, s.length - 1);
        }
        const err = _ProtocolHandler.toError(s);
        switch (err.constructor) {
          case errors_1.errors.PermissionViolationError: {
            const pe = err;
            const mux = this.subscriptions.getMux();
            const isMuxPermission = mux ? pe.subject === mux.subject : false;
            this.subscriptions.handleError(pe);
            this.muxSubscriptions.handleError(isMuxPermission, pe);
            if (isMuxPermission) {
              this.subscriptions.setMux(null);
            }
          }
        }
        this.dispatchStatus({ type: "error", error: err });
        this.handleError(err);
      }
      handleError(err) {
        if (err instanceof errors_1.errors.UserAuthenticationExpiredError || err instanceof errors_1.errors.AuthorizationError) {
          this.handleAuthError(err);
        }
        if (!(err instanceof errors_1.errors.PermissionViolationError)) {
          this.lastError = err;
        }
      }
      handleAuthError(err) {
        if ((this.lastError instanceof errors_1.errors.UserAuthenticationExpiredError || this.lastError instanceof errors_1.errors.AuthorizationError) && this.options.ignoreAuthErrorAbort === false) {
          this.abortReconnect = true;
        }
        if (this.connectError) {
          this.connectError(err);
        } else {
          this.disconnect();
        }
      }
      processPing() {
        this.transport.send(PONG_CMD);
      }
      processPong() {
        const cb = this.pongs.shift();
        if (cb) {
          cb.resolve();
        }
      }
      processInfo(m) {
        const info = JSON.parse((0, encoders_1.decode)(m));
        this.info = info;
        const updates = this.options && this.options.ignoreClusterUpdates ? void 0 : this.servers.update(info, this.transport.isEncrypted());
        if (!this.infoReceived) {
          this.features.update((0, semver_1.parseSemVer)(info.version));
          this.infoReceived = true;
          if (this.transport.isEncrypted()) {
            this.servers.updateTLSName();
          }
          const { version, lang } = this.transport;
          try {
            const c = new Connect({ version, lang }, this.options, info.nonce);
            if (info.headers) {
              c.headers = true;
              c.no_responders = true;
            }
            const cs = JSON.stringify(c);
            this.transport.send((0, encoders_1.encode)(`CONNECT ${cs}${transport_1.CR_LF}`));
            this.transport.send(PING_CMD);
          } catch (err) {
            this.close(err).catch();
          }
        }
        if (updates) {
          const { added, deleted } = updates;
          this.dispatchStatus({ type: "update", added, deleted });
        }
        const ldm = info.ldm !== void 0 ? info.ldm : false;
        if (ldm) {
          this.dispatchStatus({
            type: "ldm",
            server: this.servers.getCurrentServer().toString()
          });
        }
      }
      push(e) {
        switch (e.kind) {
          case parser_1.Kind.MSG: {
            const { msg, data } = e;
            this.processMsg(msg, data);
            break;
          }
          case parser_1.Kind.OK:
            break;
          case parser_1.Kind.ERR:
            this.processError(e.data);
            break;
          case parser_1.Kind.PING:
            this.processPing();
            break;
          case parser_1.Kind.PONG:
            this.processPong();
            break;
          case parser_1.Kind.INFO:
            this.processInfo(e.data);
            break;
        }
      }
      sendCommand(cmd, ...payloads) {
        const len = this.outbound.length();
        let buf;
        if (typeof cmd === "string") {
          buf = (0, encoders_1.encode)(cmd);
        } else {
          buf = cmd;
        }
        this.outbound.fill(buf, ...payloads);
        if (len === 0) {
          queueMicrotask(() => {
            this.flushPending();
          });
        } else if (this.outbound.size() >= this.pendingLimit) {
          this.flushPending();
        }
      }
      publish(subject, payload = encoders_1.Empty, options) {
        let data;
        if (payload instanceof Uint8Array) {
          data = payload;
        } else if (typeof payload === "string") {
          data = encoders_1.TE.encode(payload);
        } else {
          throw new TypeError("payload types can be strings or Uint8Array");
        }
        let len = data.length;
        options = options || {};
        options.reply = options.reply || "";
        let headers2 = encoders_1.Empty;
        let hlen = 0;
        if (options.headers) {
          if (this.info && !this.info.headers) {
            errors_1.InvalidArgumentError.format("headers", "are not available on this server");
          }
          const hdrs = options.headers;
          headers2 = hdrs.encode();
          hlen = headers2.length;
          len = data.length + hlen;
        }
        if (this.info && len > this.info.max_payload) {
          throw errors_1.InvalidArgumentError.format("payload", "max_payload size exceeded");
        }
        this.outBytes += len;
        this.outMsgs++;
        let proto;
        if (options.headers) {
          if (options.reply) {
            proto = `HPUB ${subject} ${options.reply} ${hlen} ${len}\r
`;
          } else {
            proto = `HPUB ${subject} ${hlen} ${len}\r
`;
          }
          this.sendCommand(proto, headers2, data, transport_1.CRLF);
        } else {
          if (options.reply) {
            proto = `PUB ${subject} ${options.reply} ${len}\r
`;
          } else {
            proto = `PUB ${subject} ${len}\r
`;
          }
          this.sendCommand(proto, data, transport_1.CRLF);
        }
      }
      request(r) {
        this.initMux();
        this.muxSubscriptions.add(r);
        return r;
      }
      subscribe(s) {
        this.subscriptions.add(s);
        this._subunsub(s);
        return s;
      }
      _sub(s) {
        if (s.queue) {
          this.sendCommand(`SUB ${s.subject} ${s.queue} ${s.sid}\r
`);
        } else {
          this.sendCommand(`SUB ${s.subject} ${s.sid}\r
`);
        }
      }
      _subunsub(s) {
        this._sub(s);
        if (s.max) {
          this.unsubscribe(s, s.max);
        }
        return s;
      }
      unsubscribe(s, max) {
        this.unsub(s, max);
        if (s.max === void 0 || s.received >= s.max) {
          this.subscriptions.cancel(s);
        }
      }
      unsub(s, max) {
        if (!s || this.isClosed()) {
          return;
        }
        if (max) {
          this.sendCommand(`UNSUB ${s.sid} ${max}\r
`);
        } else {
          this.sendCommand(`UNSUB ${s.sid}\r
`);
        }
        s.max = max;
      }
      resub(s, subject) {
        if (!s || this.isClosed()) {
          return;
        }
        this.unsub(s);
        s.subject = subject;
        this.subscriptions.resub(s);
        this._sub(s);
      }
      flush(p) {
        if (!p) {
          p = (0, util_1.deferred)();
        }
        this.pongs.push(p);
        this.outbound.fill(PING_CMD);
        this.flushPending();
        return p;
      }
      sendSubscriptions() {
        const cmds = [];
        this.subscriptions.all().forEach((s) => {
          const sub = s;
          if (sub.queue) {
            cmds.push(`SUB ${sub.subject} ${sub.queue} ${sub.sid}${transport_1.CR_LF}`);
          } else {
            cmds.push(`SUB ${sub.subject} ${sub.sid}${transport_1.CR_LF}`);
          }
        });
        if (cmds.length) {
          this.transport.send((0, encoders_1.encode)(cmds.join("")));
        }
      }
      async close(err) {
        var _a, _b;
        if (this._closed) {
          return;
        }
        this.whyClosed = new Error("close trace").stack || "";
        this.heartbeats.cancel();
        if (this.connectError) {
          this.connectError(err);
          this.connectError = void 0;
        }
        this.muxSubscriptions.close();
        this.subscriptions.close();
        const proms = [];
        for (let i = 0; i < this.listeners.length; i++) {
          const qi = this.listeners[i];
          if (qi) {
            qi.stop();
            proms.push(qi.iterClosed);
          }
        }
        if (proms.length) {
          await Promise.all(proms);
        }
        this._closed = true;
        await this.transport.close(err);
        (_a = this.raceTimer) == null ? void 0 : _a.cancel();
        (_b = this.dialDelay) == null ? void 0 : _b.cancel();
        this.closed.resolve(err);
      }
      isClosed() {
        return this._closed;
      }
      async drain() {
        const subs = this.subscriptions.all();
        const promises = [];
        subs.forEach((sub) => {
          promises.push(sub.drain());
        });
        try {
          await Promise.allSettled(promises);
        } catch {
        } finally {
          this.noMorePublishing = true;
          await this.flush();
        }
        return this.close();
      }
      flushPending() {
        if (!this.infoReceived || !this.connected) {
          return;
        }
        if (this.outbound.size()) {
          const d = this.outbound.drain();
          this.transport.send(d);
        }
      }
      initMux() {
        const mux = this.subscriptions.getMux();
        if (!mux) {
          const inbox = this.muxSubscriptions.init(this.options.inboxPrefix);
          const sub = new SubscriptionImpl(this, `${inbox}*`);
          sub.callback = this.muxSubscriptions.dispatcher();
          this.subscriptions.setMux(sub);
          this.subscribe(sub);
        }
      }
      selectServer() {
        const server = this.servers.selectServer();
        if (server === void 0) {
          return void 0;
        }
        this.server = server;
        return this.server;
      }
      getServer() {
        return this.server;
      }
    };
    __name(_ProtocolHandler, "ProtocolHandler");
    var ProtocolHandler = _ProtocolHandler;
    exports2.ProtocolHandler = ProtocolHandler;
  }
});

// node_modules/@nats-io/nats-core/lib/request.js
var require_request2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/request.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RequestOne = exports2.RequestMany = exports2.BaseRequest = void 0;
    var util_1 = require_util3();
    var nuid_1 = require_nuid3();
    var errors_1 = require_errors2();
    var _BaseRequest = class _BaseRequest {
      token;
      received;
      ctx;
      requestSubject;
      mux;
      constructor(mux, requestSubject, asyncTraces = true) {
        this.mux = mux;
        this.requestSubject = requestSubject;
        this.received = 0;
        this.token = nuid_1.nuid.next();
        if (asyncTraces) {
          this.ctx = new errors_1.RequestError();
        }
      }
    };
    __name(_BaseRequest, "BaseRequest");
    var BaseRequest = _BaseRequest;
    exports2.BaseRequest = BaseRequest;
    var _RequestMany = class _RequestMany extends BaseRequest {
      callback;
      done;
      timer;
      max;
      opts;
      constructor(mux, requestSubject, opts = { maxWait: 1e3 }) {
        super(mux, requestSubject);
        this.opts = opts;
        if (typeof this.opts.callback !== "function") {
          throw new TypeError("callback must be a function");
        }
        this.callback = this.opts.callback;
        this.max = typeof opts.maxMessages === "number" && opts.maxMessages > 0 ? opts.maxMessages : -1;
        this.done = (0, util_1.deferred)();
        this.done.then(() => {
          this.callback(null, null);
        });
        this.timer = setTimeout(() => {
          this.cancel();
        }, opts.maxWait);
      }
      cancel(err) {
        if (err) {
          this.callback(err, null);
        }
        clearTimeout(this.timer);
        this.mux.cancel(this);
        this.done.resolve();
      }
      resolver(err, msg) {
        if (err) {
          if (this.ctx) {
            err.stack += `

${this.ctx.stack}`;
          }
          this.cancel(err);
        } else {
          this.callback(null, msg);
          if (this.opts.strategy === "count") {
            this.max--;
            if (this.max === 0) {
              this.cancel();
            }
          }
          if (this.opts.strategy === "stall") {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
              this.cancel();
            }, this.opts.stall || 300);
          }
          if (this.opts.strategy === "sentinel") {
            if (msg && msg.data.length === 0) {
              this.cancel();
            }
          }
        }
      }
    };
    __name(_RequestMany, "RequestMany");
    var RequestMany = _RequestMany;
    exports2.RequestMany = RequestMany;
    var _RequestOne = class _RequestOne extends BaseRequest {
      deferred;
      timer;
      constructor(mux, requestSubject, opts = { timeout: 1e3 }, asyncTraces = true) {
        super(mux, requestSubject, asyncTraces);
        this.deferred = (0, util_1.deferred)();
        this.timer = (0, util_1.timeout)(opts.timeout, asyncTraces);
      }
      resolver(err, msg) {
        if (this.timer) {
          this.timer.cancel();
        }
        if (err) {
          if (!(err instanceof errors_1.TimeoutError)) {
            if (this.ctx) {
              this.ctx.message = err.message;
              this.ctx.cause = err;
              err = this.ctx;
            } else {
              err = new errors_1.errors.RequestError(err.message, { cause: err });
            }
          }
          this.deferred.reject(err);
        } else {
          this.deferred.resolve(msg);
        }
        this.cancel();
      }
      cancel(err) {
        if (this.timer) {
          this.timer.cancel();
        }
        this.mux.cancel(this);
        this.deferred.reject(err ? err : new errors_1.RequestError("cancelled"));
      }
    };
    __name(_RequestOne, "RequestOne");
    var RequestOne = _RequestOne;
    exports2.RequestOne = RequestOne;
  }
});

// node_modules/@nats-io/nats-core/lib/nats.js
var require_nats2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/nats.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NatsConnectionImpl = void 0;
    var util_1 = require_util3();
    var protocol_1 = require_protocol2();
    var encoders_1 = require_encoders2();
    var semver_1 = require_semver2();
    var options_1 = require_options2();
    var queued_iterator_1 = require_queued_iterator2();
    var request_1 = require_request2();
    var core_1 = require_core2();
    var errors_1 = require_errors2();
    var _NatsConnectionImpl = class _NatsConnectionImpl {
      options;
      protocol;
      draining;
      closeListeners;
      constructor(opts) {
        this.draining = false;
        this.options = (0, options_1.parseOptions)(opts);
      }
      static connect(opts = {}) {
        return new Promise((resolve, reject) => {
          const nc = new _NatsConnectionImpl(opts);
          protocol_1.ProtocolHandler.connect(nc.options, nc).then((ph) => {
            nc.protocol = ph;
            resolve(nc);
          }).catch((err) => {
            reject(err);
          });
        });
      }
      closed() {
        return this.protocol.closed;
      }
      async close() {
        await this.protocol.close();
      }
      _check(subject, sub, pub) {
        if (this.isClosed()) {
          throw new errors_1.errors.ClosedConnectionError();
        }
        if (sub && this.isDraining()) {
          throw new errors_1.errors.DrainingConnectionError();
        }
        if (pub && this.protocol.noMorePublishing) {
          throw new errors_1.errors.DrainingConnectionError();
        }
        subject = subject || "";
        if (subject.length === 0) {
          throw new errors_1.errors.InvalidSubjectError(subject);
        }
      }
      publish(subject, data, options) {
        this._check(subject, false, true);
        if (options == null ? void 0 : options.reply) {
          this._check(options.reply, false, true);
        }
        this.protocol.publish(subject, data, options);
      }
      publishMessage(msg) {
        return this.publish(msg.subject, msg.data, {
          reply: msg.reply,
          headers: msg.headers
        });
      }
      respondMessage(msg) {
        if (msg.reply) {
          this.publish(msg.reply, msg.data, {
            reply: msg.reply,
            headers: msg.headers
          });
          return true;
        }
        return false;
      }
      subscribe(subject, opts = {}) {
        this._check(subject, true, false);
        const sub = new protocol_1.SubscriptionImpl(this.protocol, subject, opts);
        if (typeof opts.callback !== "function" && typeof opts.slow === "number") {
          sub.setSlowNotificationFn(opts.slow, (pending) => {
            this.protocol.dispatchStatus({
              type: "slowConsumer",
              sub,
              pending
            });
          });
        }
        this.protocol.subscribe(sub);
        return sub;
      }
      _resub(s, subject, max) {
        this._check(subject, true, false);
        const si = s;
        si.max = max;
        if (max) {
          si.max = max + si.received;
        }
        this.protocol.resub(si, subject);
      }
      // possibilities are:
      // stop on error or any non-100 status
      // AND:
      // - wait for timer
      // - wait for n messages or timer
      // - wait for unknown messages, done when empty or reset timer expires (with possible alt wait)
      // - wait for unknown messages, done when an empty payload is received or timer expires (with possible alt wait)
      requestMany(subject, data = encoders_1.Empty, opts = { maxWait: 1e3, maxMessages: -1 }) {
        const asyncTraces = !(this.protocol.options.noAsyncTraces || false);
        try {
          this._check(subject, true, true);
        } catch (err) {
          return Promise.reject(err);
        }
        opts.strategy = opts.strategy || "timer";
        opts.maxWait = opts.maxWait || 1e3;
        if (opts.maxWait < 1) {
          return Promise.reject(errors_1.InvalidArgumentError.format("timeout", "must be greater than 0"));
        }
        const qi = new queued_iterator_1.QueuedIteratorImpl();
        function stop(err) {
          qi.push(() => {
            qi.stop(err);
          });
        }
        __name(stop, "stop");
        function callback(err, msg) {
          if (err || msg === null) {
            stop(err === null ? void 0 : err);
          } else {
            qi.push(msg);
          }
        }
        __name(callback, "callback");
        if (opts.noMux) {
          const stack = asyncTraces ? new Error().stack : null;
          let max = typeof opts.maxMessages === "number" && opts.maxMessages > 0 ? opts.maxMessages : -1;
          const sub = this.subscribe((0, core_1.createInbox)(this.options.inboxPrefix), {
            callback: /* @__PURE__ */ __name((err, msg) => {
              var _a, _b;
              if (((_a = msg == null ? void 0 : msg.data) == null ? void 0 : _a.length) === 0 && ((_b = msg == null ? void 0 : msg.headers) == null ? void 0 : _b.status) === "503") {
                err = new errors_1.errors.NoRespondersError(subject);
              }
              if (err) {
                if (stack) {
                  err.stack += `

${stack}`;
                }
                cancel(err);
                return;
              }
              callback(null, msg);
              if (opts.strategy === "count") {
                max--;
                if (max === 0) {
                  cancel();
                }
              }
              if (opts.strategy === "stall") {
                clearTimers();
                timer = setTimeout(() => {
                  cancel();
                }, 300);
              }
              if (opts.strategy === "sentinel") {
                if (msg && msg.data.length === 0) {
                  cancel();
                }
              }
            }, "callback")
          });
          sub.requestSubject = subject;
          sub.closed.then(() => {
            stop();
          }).catch((err) => {
            qi.stop(err);
          });
          const cancel = /* @__PURE__ */ __name((err) => {
            if (err) {
              qi.push(() => {
                throw err;
              });
            }
            clearTimers();
            sub.drain().then(() => {
              stop();
            }).catch((_err) => {
              stop();
            });
          }, "cancel");
          qi.iterClosed.then(() => {
            clearTimers();
            sub == null ? void 0 : sub.unsubscribe();
          }).catch((_err) => {
            clearTimers();
            sub == null ? void 0 : sub.unsubscribe();
          });
          try {
            this.publish(subject, data, { reply: sub.getSubject() });
          } catch (err) {
            cancel(err);
          }
          let timer = setTimeout(() => {
            cancel();
          }, opts.maxWait);
          const clearTimers = /* @__PURE__ */ __name(() => {
            if (timer) {
              clearTimeout(timer);
            }
          }, "clearTimers");
        } else {
          const rmo = opts;
          rmo.callback = callback;
          qi.iterClosed.then(() => {
            r.cancel();
          }).catch((err) => {
            r.cancel(err);
          });
          const r = new request_1.RequestMany(this.protocol.muxSubscriptions, subject, rmo);
          this.protocol.request(r);
          try {
            this.publish(subject, data, {
              reply: `${this.protocol.muxSubscriptions.baseInbox}${r.token}`,
              headers: opts.headers
            });
          } catch (err) {
            r.cancel(err);
          }
        }
        return Promise.resolve(qi);
      }
      request(subject, data, opts = { timeout: 1e3, noMux: false }) {
        try {
          this._check(subject, true, true);
        } catch (err) {
          return Promise.reject(err);
        }
        const asyncTraces = !(this.protocol.options.noAsyncTraces || false);
        opts.timeout = opts.timeout || 1e3;
        if (opts.timeout < 1) {
          return Promise.reject(errors_1.InvalidArgumentError.format("timeout", `must be greater than 0`));
        }
        if (!opts.noMux && opts.reply) {
          return Promise.reject(errors_1.InvalidArgumentError.format(["reply", "noMux"], "are mutually exclusive"));
        }
        if (opts.noMux) {
          const inbox = opts.reply ? opts.reply : (0, core_1.createInbox)(this.options.inboxPrefix);
          const d = (0, util_1.deferred)();
          const errCtx = asyncTraces ? new errors_1.errors.RequestError("") : null;
          const sub = this.subscribe(inbox, {
            max: 1,
            timeout: opts.timeout,
            callback: /* @__PURE__ */ __name((err, msg) => {
              var _a, _b;
              if (msg && ((_a = msg.data) == null ? void 0 : _a.length) === 0 && ((_b = msg.headers) == null ? void 0 : _b.code) === 503) {
                err = new errors_1.errors.NoRespondersError(subject);
              }
              if (err) {
                if (!(err instanceof errors_1.TimeoutError)) {
                  if (errCtx) {
                    errCtx.message = err.message;
                    errCtx.cause = err;
                    err = errCtx;
                  } else {
                    err = new errors_1.errors.RequestError(err.message, { cause: err });
                  }
                }
                d.reject(err);
                sub.unsubscribe();
              } else {
                d.resolve(msg);
              }
            }, "callback")
          });
          sub.requestSubject = subject;
          this.protocol.publish(subject, data, {
            reply: inbox,
            headers: opts.headers
          });
          return d;
        } else {
          const r = new request_1.RequestOne(this.protocol.muxSubscriptions, subject, opts, asyncTraces);
          this.protocol.request(r);
          try {
            this.publish(subject, data, {
              reply: `${this.protocol.muxSubscriptions.baseInbox}${r.token}`,
              headers: opts.headers
            });
          } catch (err) {
            r.cancel(err);
          }
          const p = Promise.race([r.timer, r.deferred]);
          p.catch(() => {
            r.cancel();
          });
          return p;
        }
      }
      /** *
       * Flushes to the server. Promise resolves when round-trip completes.
       * @returns {Promise<void>}
       */
      flush() {
        if (this.isClosed()) {
          return Promise.reject(new errors_1.errors.ClosedConnectionError());
        }
        return this.protocol.flush();
      }
      drain() {
        if (this.isClosed()) {
          return Promise.reject(new errors_1.errors.ClosedConnectionError());
        }
        if (this.isDraining()) {
          return Promise.reject(new errors_1.errors.DrainingConnectionError());
        }
        this.draining = true;
        return this.protocol.drain();
      }
      isClosed() {
        return this.protocol.isClosed();
      }
      isDraining() {
        return this.draining;
      }
      getServer() {
        const srv = this.protocol.getServer();
        return srv ? srv.listen : "";
      }
      status() {
        const iter = new queued_iterator_1.QueuedIteratorImpl();
        iter.iterClosed.then(() => {
          const idx = this.protocol.listeners.indexOf(iter);
          if (idx > -1) {
            this.protocol.listeners.splice(idx, 1);
          }
        });
        this.protocol.listeners.push(iter);
        return iter;
      }
      get info() {
        return this.protocol.isClosed() ? void 0 : this.protocol.info;
      }
      async context() {
        const r = await this.request(`$SYS.REQ.USER.INFO`);
        return r.json((key, value) => {
          if (key === "time") {
            return new Date(Date.parse(value));
          }
          return value;
        });
      }
      stats() {
        return {
          inBytes: this.protocol.inBytes,
          outBytes: this.protocol.outBytes,
          inMsgs: this.protocol.inMsgs,
          outMsgs: this.protocol.outMsgs
        };
      }
      getServerVersion() {
        const info = this.info;
        return info ? (0, semver_1.parseSemVer)(info.version) : void 0;
      }
      async rtt() {
        if (this.isClosed()) {
          throw new errors_1.errors.ClosedConnectionError();
        }
        if (!this.protocol.connected) {
          throw new errors_1.errors.RequestError("connection disconnected");
        }
        const start = Date.now();
        await this.flush();
        return Date.now() - start;
      }
      get features() {
        return this.protocol.features;
      }
      reconnect() {
        if (this.isClosed()) {
          return Promise.reject(new errors_1.errors.ClosedConnectionError());
        }
        if (this.isDraining()) {
          return Promise.reject(new errors_1.errors.DrainingConnectionError());
        }
        return this.protocol.reconnect();
      }
      // internal
      addCloseListener(listener) {
        if (this.closeListeners === void 0) {
          this.closeListeners = new CloseListeners(this.closed());
        }
        this.closeListeners.add(listener);
      }
      // internal
      removeCloseListener(listener) {
        if (this.closeListeners) {
          this.closeListeners.remove(listener);
        }
      }
    };
    __name(_NatsConnectionImpl, "NatsConnectionImpl");
    var NatsConnectionImpl = _NatsConnectionImpl;
    exports2.NatsConnectionImpl = NatsConnectionImpl;
    var _CloseListeners = class _CloseListeners {
      listeners;
      constructor(closed) {
        this.listeners = [];
        closed.then((err) => {
          this.notify(err);
        });
      }
      add(listener) {
        this.listeners.push(listener);
      }
      remove(listener) {
        this.listeners = this.listeners.filter((l) => l !== listener);
      }
      notify(err) {
        this.listeners.forEach((l) => {
          if (typeof l.connectionClosedCallback === "function") {
            try {
              l.connectionClosedCallback(err);
            } catch (_) {
            }
          }
        });
        this.listeners = [];
      }
    };
    __name(_CloseListeners, "CloseListeners");
    var CloseListeners = _CloseListeners;
  }
});

// node_modules/@nats-io/nats-core/lib/types.js
var require_types2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Empty = void 0;
    var encoders_1 = require_encoders2();
    Object.defineProperty(exports2, "Empty", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return encoders_1.Empty;
    }, "get") });
  }
});

// node_modules/@nats-io/nats-core/lib/bench.js
var require_bench2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/bench.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Bench = exports2.Metric = void 0;
    exports2.throughput = throughput;
    exports2.msgThroughput = msgThroughput;
    exports2.humanizeBytes = humanizeBytes;
    var types_1 = require_types2();
    var nuid_1 = require_nuid3();
    var util_1 = require_util3();
    var _Metric = class _Metric {
      name;
      duration;
      date;
      payload;
      msgs;
      lang;
      version;
      bytes;
      asyncRequests;
      min;
      max;
      constructor(name, duration) {
        this.name = name;
        this.duration = duration;
        this.date = Date.now();
        this.payload = 0;
        this.msgs = 0;
        this.bytes = 0;
      }
      toString() {
        const sec = this.duration / 1e3;
        const mps = Math.round(this.msgs / sec);
        const label = this.asyncRequests ? "asyncRequests" : "";
        let minmax = "";
        if (this.max) {
          minmax = `${this.min}/${this.max}`;
        }
        return `${this.name}${label ? " [asyncRequests]" : ""} ${humanizeNumber(mps)} msgs/sec - [${sec.toFixed(2)} secs] ~ ${throughput(this.bytes, sec)} ${minmax}`;
      }
      toCsv() {
        return `"${this.name}",${new Date(this.date).toISOString()},${this.lang},${this.version},${this.msgs},${this.payload},${this.bytes},${this.duration},${this.asyncRequests ? this.asyncRequests : false}
`;
      }
      static header() {
        return `Test,Date,Lang,Version,Count,MsgPayload,Bytes,Millis,Async
`;
      }
    };
    __name(_Metric, "Metric");
    var Metric = _Metric;
    exports2.Metric = Metric;
    var _Bench = class _Bench {
      nc;
      callbacks;
      msgs;
      size;
      subject;
      asyncRequests;
      pub;
      sub;
      req;
      rep;
      perf;
      payload;
      constructor(nc, opts = {
        msgs: 1e5,
        size: 128,
        subject: "",
        asyncRequests: false,
        pub: false,
        sub: false,
        req: false,
        rep: false
      }) {
        this.nc = nc;
        this.callbacks = opts.callbacks || false;
        this.msgs = opts.msgs || 0;
        this.size = opts.size || 0;
        this.subject = opts.subject || nuid_1.nuid.next();
        this.asyncRequests = opts.asyncRequests || false;
        this.pub = opts.pub || false;
        this.sub = opts.sub || false;
        this.req = opts.req || false;
        this.rep = opts.rep || false;
        this.perf = new util_1.Perf();
        this.payload = this.size ? new Uint8Array(this.size) : types_1.Empty;
        if (!this.pub && !this.sub && !this.req && !this.rep) {
          throw new Error("no options selected");
        }
      }
      async run() {
        this.nc.closed().then((err) => {
          if (err) {
            throw err;
          }
        });
        if (this.callbacks) {
          await this.runCallbacks();
        } else {
          await this.runAsync();
        }
        return this.processMetrics();
      }
      processMetrics() {
        const nc = this.nc;
        const { lang, version } = nc.protocol.transport;
        if (this.pub && this.sub) {
          this.perf.measure("pubsub", "pubStart", "subStop");
        }
        if (this.req && this.rep) {
          this.perf.measure("reqrep", "reqStart", "reqStop");
        }
        const measures = this.perf.getEntries();
        const pubsub = measures.find((m) => m.name === "pubsub");
        const reqrep = measures.find((m) => m.name === "reqrep");
        const req = measures.find((m) => m.name === "req");
        const rep = measures.find((m) => m.name === "rep");
        const pub = measures.find((m) => m.name === "pub");
        const sub = measures.find((m) => m.name === "sub");
        const stats = this.nc.stats();
        const metrics = [];
        if (pubsub) {
          const { name, duration } = pubsub;
          const m = new Metric(name, duration);
          m.msgs = this.msgs * 2;
          m.bytes = stats.inBytes + stats.outBytes;
          m.lang = lang;
          m.version = version;
          m.payload = this.payload.length;
          metrics.push(m);
        }
        if (reqrep) {
          const { name, duration } = reqrep;
          const m = new Metric(name, duration);
          m.msgs = this.msgs * 2;
          m.bytes = stats.inBytes + stats.outBytes;
          m.lang = lang;
          m.version = version;
          m.payload = this.payload.length;
          metrics.push(m);
        }
        if (pub) {
          const { name, duration } = pub;
          const m = new Metric(name, duration);
          m.msgs = this.msgs;
          m.bytes = stats.outBytes;
          m.lang = lang;
          m.version = version;
          m.payload = this.payload.length;
          metrics.push(m);
        }
        if (sub) {
          const { name, duration } = sub;
          const m = new Metric(name, duration);
          m.msgs = this.msgs;
          m.bytes = stats.inBytes;
          m.lang = lang;
          m.version = version;
          m.payload = this.payload.length;
          metrics.push(m);
        }
        if (rep) {
          const { name, duration } = rep;
          const m = new Metric(name, duration);
          m.msgs = this.msgs;
          m.bytes = stats.inBytes + stats.outBytes;
          m.lang = lang;
          m.version = version;
          m.payload = this.payload.length;
          metrics.push(m);
        }
        if (req) {
          const { name, duration } = req;
          const m = new Metric(name, duration);
          m.msgs = this.msgs;
          m.bytes = stats.inBytes + stats.outBytes;
          m.lang = lang;
          m.version = version;
          m.payload = this.payload.length;
          metrics.push(m);
        }
        return metrics;
      }
      async runCallbacks() {
        const jobs = [];
        if (this.sub) {
          const d = (0, util_1.deferred)();
          jobs.push(d);
          let i = 0;
          this.nc.subscribe(this.subject, {
            max: this.msgs,
            callback: /* @__PURE__ */ __name(() => {
              i++;
              if (i === 1) {
                this.perf.mark("subStart");
              }
              if (i === this.msgs) {
                this.perf.mark("subStop");
                this.perf.measure("sub", "subStart", "subStop");
                d.resolve();
              }
            }, "callback")
          });
        }
        if (this.rep) {
          const d = (0, util_1.deferred)();
          jobs.push(d);
          let i = 0;
          this.nc.subscribe(this.subject, {
            max: this.msgs,
            callback: /* @__PURE__ */ __name((_, m) => {
              m.respond(this.payload);
              i++;
              if (i === 1) {
                this.perf.mark("repStart");
              }
              if (i === this.msgs) {
                this.perf.mark("repStop");
                this.perf.measure("rep", "repStart", "repStop");
                d.resolve();
              }
            }, "callback")
          });
        }
        if (this.pub) {
          const job = (async () => {
            this.perf.mark("pubStart");
            for (let i = 0; i < this.msgs; i++) {
              this.nc.publish(this.subject, this.payload);
            }
            await this.nc.flush();
            this.perf.mark("pubStop");
            this.perf.measure("pub", "pubStart", "pubStop");
          })();
          jobs.push(job);
        }
        if (this.req) {
          const job = (async () => {
            if (this.asyncRequests) {
              this.perf.mark("reqStart");
              const a = [];
              for (let i = 0; i < this.msgs; i++) {
                a.push(this.nc.request(this.subject, this.payload, { timeout: 2e4 }));
              }
              await Promise.all(a);
              this.perf.mark("reqStop");
              this.perf.measure("req", "reqStart", "reqStop");
            } else {
              this.perf.mark("reqStart");
              for (let i = 0; i < this.msgs; i++) {
                await this.nc.request(this.subject);
              }
              this.perf.mark("reqStop");
              this.perf.measure("req", "reqStart", "reqStop");
            }
          })();
          jobs.push(job);
        }
        await Promise.all(jobs);
      }
      async runAsync() {
        const jobs = [];
        if (this.rep) {
          let first = false;
          const sub = this.nc.subscribe(this.subject, { max: this.msgs });
          const job = (async () => {
            for await (const m of sub) {
              if (!first) {
                this.perf.mark("repStart");
                first = true;
              }
              m.respond(this.payload);
            }
            await this.nc.flush();
            this.perf.mark("repStop");
            this.perf.measure("rep", "repStart", "repStop");
          })();
          jobs.push(job);
        }
        if (this.sub) {
          let first = false;
          const sub = this.nc.subscribe(this.subject, { max: this.msgs });
          const job = (async () => {
            for await (const _m of sub) {
              if (!first) {
                this.perf.mark("subStart");
                first = true;
              }
            }
            this.perf.mark("subStop");
            this.perf.measure("sub", "subStart", "subStop");
          })();
          jobs.push(job);
        }
        if (this.pub) {
          const job = (async () => {
            this.perf.mark("pubStart");
            for (let i = 0; i < this.msgs; i++) {
              this.nc.publish(this.subject, this.payload);
            }
            await this.nc.flush();
            this.perf.mark("pubStop");
            this.perf.measure("pub", "pubStart", "pubStop");
          })();
          jobs.push(job);
        }
        if (this.req) {
          const job = (async () => {
            if (this.asyncRequests) {
              this.perf.mark("reqStart");
              const a = [];
              for (let i = 0; i < this.msgs; i++) {
                a.push(this.nc.request(this.subject, this.payload, { timeout: 2e4 }));
              }
              await Promise.all(a);
              this.perf.mark("reqStop");
              this.perf.measure("req", "reqStart", "reqStop");
            } else {
              this.perf.mark("reqStart");
              for (let i = 0; i < this.msgs; i++) {
                await this.nc.request(this.subject);
              }
              this.perf.mark("reqStop");
              this.perf.measure("req", "reqStart", "reqStop");
            }
          })();
          jobs.push(job);
        }
        await Promise.all(jobs);
      }
    };
    __name(_Bench, "Bench");
    var Bench = _Bench;
    exports2.Bench = Bench;
    function throughput(bytes, seconds) {
      return `${humanizeBytes(bytes / seconds)}/sec`;
    }
    __name(throughput, "throughput");
    function msgThroughput(msgs, seconds) {
      return `${Math.floor(msgs / seconds)} msgs/sec`;
    }
    __name(msgThroughput, "msgThroughput");
    function humanizeBytes(bytes, si = false) {
      const base = si ? 1e3 : 1024;
      const pre = si ? ["k", "M", "G", "T", "P", "E"] : ["K", "M", "G", "T", "P", "E"];
      const post = si ? "iB" : "B";
      if (bytes < base) {
        return `${bytes.toFixed(2)} ${post}`;
      }
      const exp = parseInt(Math.log(bytes) / Math.log(base) + "");
      const index = parseInt(exp - 1 + "");
      return `${(bytes / Math.pow(base, exp)).toFixed(2)} ${pre[index]}${post}`;
    }
    __name(humanizeBytes, "humanizeBytes");
    function humanizeNumber(n) {
      return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    __name(humanizeNumber, "humanizeNumber");
  }
});

// node_modules/@nats-io/nats-core/lib/idleheartbeat_monitor.js
var require_idleheartbeat_monitor2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/idleheartbeat_monitor.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IdleHeartbeatMonitor = void 0;
    var _IdleHeartbeatMonitor = class _IdleHeartbeatMonitor {
      interval;
      maxOut;
      cancelAfter;
      timer;
      autoCancelTimer;
      last;
      missed;
      count;
      callback;
      /**
       * Constructor
       * @param interval in millis to check
       * @param cb a callback to report when heartbeats are missed
       * @param opts monitor options @see IdleHeartbeatOptions
       */
      constructor(interval, cb, opts = { maxOut: 2 }) {
        this.interval = interval;
        this.maxOut = (opts == null ? void 0 : opts.maxOut) || 2;
        this.cancelAfter = (opts == null ? void 0 : opts.cancelAfter) || 0;
        this.last = Date.now();
        this.missed = 0;
        this.count = 0;
        this.callback = cb;
        this._schedule();
      }
      /**
       * cancel monitoring
       */
      cancel() {
        if (this.autoCancelTimer) {
          clearTimeout(this.autoCancelTimer);
        }
        if (this.timer) {
          clearInterval(this.timer);
        }
        this.timer = 0;
        this.autoCancelTimer = 0;
        this.missed = 0;
      }
      /**
       * work signals that there was work performed
       */
      work() {
        this.last = Date.now();
        this.missed = 0;
      }
      /**
       * internal api to change the interval, cancelAfter and maxOut
       * @param interval
       * @param cancelAfter
       * @param maxOut
       */
      _change(interval, cancelAfter = 0, maxOut = 2) {
        this.interval = interval;
        this.maxOut = maxOut;
        this.cancelAfter = cancelAfter;
        this.restart();
      }
      /**
       * cancels and restarts the monitoring
       */
      restart() {
        this.cancel();
        this._schedule();
      }
      /**
       * internal api called to start monitoring
       */
      _schedule() {
        if (this.cancelAfter > 0) {
          this.autoCancelTimer = setTimeout(() => {
            this.cancel();
          }, this.cancelAfter);
        }
        this.timer = setInterval(() => {
          this.count++;
          if (Date.now() - this.last > this.interval) {
            this.missed++;
          }
          if (this.missed >= this.maxOut) {
            try {
              if (this.callback(this.missed) === true) {
                this.cancel();
              }
            } catch (err) {
              console.log(err);
            }
          }
        }, this.interval);
      }
    };
    __name(_IdleHeartbeatMonitor, "IdleHeartbeatMonitor");
    var IdleHeartbeatMonitor = _IdleHeartbeatMonitor;
    exports2.IdleHeartbeatMonitor = IdleHeartbeatMonitor;
  }
});

// node_modules/@nats-io/nats-core/lib/version.js
var require_version4 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/version.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.version = void 0;
    exports2.version = "3.0.2";
  }
});

// node_modules/@nats-io/nats-core/lib/ws_transport.js
var require_ws_transport2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/ws_transport.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WsTransport = void 0;
    exports2.wsUrlParseFn = wsUrlParseFn;
    exports2.wsconnect = wsconnect;
    var util_1 = require_util3();
    var transport_1 = require_transport2();
    var options_1 = require_options2();
    var databuffer_1 = require_databuffer2();
    var protocol_1 = require_protocol2();
    var nats_1 = require_nats2();
    var version_1 = require_version4();
    var errors_1 = require_errors2();
    var VERSION = version_1.version;
    var LANG = "nats.ws";
    var _WsTransport = class _WsTransport {
      version;
      lang;
      closeError;
      connected;
      done;
      // @ts-ignore: expecting global WebSocket
      socket;
      options;
      socketClosed;
      encrypted;
      peeked;
      yields;
      signal;
      closedNotification;
      constructor() {
        this.version = VERSION;
        this.lang = LANG;
        this.connected = false;
        this.done = false;
        this.socketClosed = false;
        this.encrypted = false;
        this.peeked = false;
        this.yields = [];
        this.signal = (0, util_1.deferred)();
        this.closedNotification = (0, util_1.deferred)();
      }
      async connect(server, options) {
        const connected = false;
        const ok = (0, util_1.deferred)();
        this.options = options;
        const u = server.src;
        if (options.wsFactory) {
          const { socket, encrypted } = await options.wsFactory(server.src, options);
          this.socket = socket;
          this.encrypted = encrypted;
        } else {
          this.encrypted = u.indexOf("wss://") === 0;
          this.socket = new WebSocket(u);
        }
        this.socket.binaryType = "arraybuffer";
        this.socket.onopen = () => {
          if (this.done) {
            this._closed(new Error("aborted"));
          }
        };
        this.socket.onmessage = (me) => {
          if (this.done) {
            return;
          }
          this.yields.push(new Uint8Array(me.data));
          if (this.peeked) {
            this.signal.resolve();
            return;
          }
          const t = databuffer_1.DataBuffer.concat(...this.yields);
          const pm = (0, transport_1.extractProtocolMessage)(t);
          if (pm !== "") {
            const m = protocol_1.INFO.exec(pm);
            if (!m) {
              if (options.debug) {
                console.error("!!!", (0, util_1.render)(t));
              }
              ok.reject(new Error("unexpected response from server"));
              return;
            }
            try {
              const info = JSON.parse(m[1]);
              (0, options_1.checkOptions)(info, this.options);
              this.peeked = true;
              this.connected = true;
              this.signal.resolve();
              ok.resolve();
            } catch (err) {
              ok.reject(err);
              return;
            }
          }
        };
        this.socket.onclose = (evt) => {
          let reason;
          if (!evt.wasClean && evt.reason !== "") {
            reason = new Error(evt.reason);
          }
          this._closed(reason);
          this._cleanup();
        };
        this.socket.onerror = (e) => {
          if (this.done) {
            return;
          }
          const evt = e;
          const err = new errors_1.errors.ConnectionError(evt.message);
          if (!connected) {
            ok.reject(err);
          } else {
            this._closed(err);
          }
          this._cleanup();
        };
        return ok;
      }
      _cleanup() {
        if (this.socketClosed === false) {
          this.socketClosed = true;
          this.socket.onopen = null;
          this.socket.onmessage = null;
          this.socket.onerror = null;
          this.socket.onclose = null;
          this.closedNotification.resolve(this.closeError);
        }
      }
      disconnect() {
        this._closed(void 0, true);
      }
      async _closed(err, _internal = true) {
        if (this.done) {
          try {
            this.socket.close();
          } catch (_) {
          }
          return;
        }
        this.closeError = err;
        if (!err) {
          while (!this.socketClosed && this.socket.bufferedAmount > 0) {
            await (0, util_1.delay)(100);
          }
        }
        this.done = true;
        try {
          this.socket.close();
        } catch (_) {
        }
        return this.closedNotification;
      }
      get isClosed() {
        return this.done;
      }
      [Symbol.asyncIterator]() {
        return this.iterate();
      }
      async *iterate() {
        while (true) {
          if (this.done) {
            return;
          }
          if (this.yields.length === 0) {
            await this.signal;
          }
          const yields = this.yields;
          this.yields = [];
          for (let i = 0; i < yields.length; i++) {
            if (this.options.debug) {
              console.info(`> ${(0, util_1.render)(yields[i])}`);
            }
            yield yields[i];
          }
          if (this.done) {
            break;
          } else if (this.yields.length === 0) {
            yields.length = 0;
            this.yields = yields;
            this.signal = (0, util_1.deferred)();
          }
        }
      }
      isEncrypted() {
        return this.connected && this.encrypted;
      }
      send(frame) {
        if (this.done) {
          return;
        }
        try {
          this.socket.send(frame.buffer);
          if (this.options.debug) {
            console.info(`< ${(0, util_1.render)(frame)}`);
          }
          return;
        } catch (err) {
          if (this.options.debug) {
            console.error(`!!! ${(0, util_1.render)(frame)}: ${err}`);
          }
        }
      }
      close(err) {
        return this._closed(err, false);
      }
      closed() {
        return this.closedNotification;
      }
      // this is to allow a force discard on a connection
      // if the connection fails during the handshake protocol.
      // Firefox for example, will keep connections going,
      // so eventually if it succeeds, the client will have
      // an additional transport running. With this
      discard() {
        var _a;
        (_a = this.socket) == null ? void 0 : _a.close();
      }
    };
    __name(_WsTransport, "WsTransport");
    var WsTransport = _WsTransport;
    exports2.WsTransport = WsTransport;
    function wsUrlParseFn(u, encrypted) {
      const ut = /^(.*:\/\/)(.*)/;
      if (!ut.test(u)) {
        if (typeof encrypted === "boolean") {
          u = `${encrypted === true ? "https" : "http"}://${u}`;
        } else {
          u = `https://${u}`;
        }
      }
      let url = new URL(u);
      const srcProto = url.protocol.toLowerCase();
      if (srcProto === "ws:") {
        encrypted = false;
      }
      if (srcProto === "wss:") {
        encrypted = true;
      }
      if (srcProto !== "https:" && srcProto !== "http") {
        u = u.replace(/^(.*:\/\/)(.*)/gm, "$2");
        url = new URL(`http://${u}`);
      }
      let protocol;
      let port;
      const host = url.hostname;
      const path = url.pathname;
      const search = url.search || "";
      switch (srcProto) {
        case "http:":
        case "ws:":
        case "nats:":
          port = url.port || "80";
          protocol = "ws:";
          break;
        case "https:":
        case "wss:":
        case "tls:":
          port = url.port || "443";
          protocol = "wss:";
          break;
        default:
          port = url.port || encrypted === true ? "443" : "80";
          protocol = encrypted === true ? "wss:" : "ws:";
          break;
      }
      return `${protocol}//${host}:${port}${path}${search}`;
    }
    __name(wsUrlParseFn, "wsUrlParseFn");
    function wsconnect(opts = {}) {
      (0, transport_1.setTransportFactory)({
        defaultPort: 443,
        urlParseFn: wsUrlParseFn,
        factory: /* @__PURE__ */ __name(() => {
          if (opts.tls) {
            throw errors_1.InvalidArgumentError.format("tls", "is not configurable on w3c websocket connections");
          }
          return new WsTransport();
        }, "factory")
      });
      return nats_1.NatsConnectionImpl.connect(opts);
    }
    __name(wsconnect, "wsconnect");
  }
});

// node_modules/@nats-io/nats-core/lib/internal_mod.js
var require_internal_mod2 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/internal_mod.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: /* @__PURE__ */ __name(function() {
          return m[k];
        }, "get") };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TD = exports2.Metric = exports2.Bench = exports2.writeAll = exports2.readAll = exports2.MAX_SIZE = exports2.DenoBuffer = exports2.State = exports2.Parser = exports2.Kind = exports2.QueuedIteratorImpl = exports2.usernamePasswordAuthenticator = exports2.tokenAuthenticator = exports2.nkeyAuthenticator = exports2.jwtAuthenticator = exports2.credsAuthenticator = exports2.RequestOne = exports2.parseOptions = exports2.hasWsProtocol = exports2.defaultOptions = exports2.DEFAULT_MAX_RECONNECT_ATTEMPTS = exports2.checkUnsupportedOption = exports2.checkOptions = exports2.buildAuthenticator = exports2.DataBuffer = exports2.MuxSubscription = exports2.Heartbeat = exports2.MsgHdrsImpl = exports2.headers = exports2.canonicalMIMEHeaderKey = exports2.timeout = exports2.SimpleMutex = exports2.render = exports2.nanos = exports2.millis = exports2.extend = exports2.delay = exports2.deferred = exports2.deadline = exports2.collect = exports2.backoff = exports2.ProtocolHandler = exports2.INFO = exports2.Connect = exports2.setTransportFactory = exports2.getResolveFn = exports2.MsgImpl = exports2.nuid = exports2.Nuid = exports2.NatsConnectionImpl = void 0;
    exports2.UserAuthenticationExpiredError = exports2.TimeoutError = exports2.RequestError = exports2.ProtocolError = exports2.PermissionViolationError = exports2.NoRespondersError = exports2.InvalidSubjectError = exports2.InvalidOperationError = exports2.InvalidArgumentError = exports2.errors = exports2.DrainingConnectionError = exports2.ConnectionError = exports2.ClosedConnectionError = exports2.AuthorizationError = exports2.wsUrlParseFn = exports2.wsconnect = exports2.Servers = exports2.isIPV4OrHostname = exports2.IdleHeartbeatMonitor = exports2.Subscriptions = exports2.SubscriptionImpl = exports2.syncIterator = exports2.Match = exports2.createInbox = exports2.protoLen = exports2.extractProtocolMessage = exports2.Empty = exports2.parseSemVer = exports2.Features = exports2.Feature = exports2.compare = exports2.parseIP = exports2.isIP = exports2.ipV4 = exports2.TE = void 0;
    var nats_1 = require_nats2();
    Object.defineProperty(exports2, "NatsConnectionImpl", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nats_1.NatsConnectionImpl;
    }, "get") });
    var nuid_1 = require_nuid3();
    Object.defineProperty(exports2, "Nuid", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nuid_1.Nuid;
    }, "get") });
    Object.defineProperty(exports2, "nuid", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return nuid_1.nuid;
    }, "get") });
    var msg_1 = require_msg2();
    Object.defineProperty(exports2, "MsgImpl", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return msg_1.MsgImpl;
    }, "get") });
    var transport_1 = require_transport2();
    Object.defineProperty(exports2, "getResolveFn", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return transport_1.getResolveFn;
    }, "get") });
    Object.defineProperty(exports2, "setTransportFactory", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return transport_1.setTransportFactory;
    }, "get") });
    var protocol_1 = require_protocol2();
    Object.defineProperty(exports2, "Connect", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return protocol_1.Connect;
    }, "get") });
    Object.defineProperty(exports2, "INFO", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return protocol_1.INFO;
    }, "get") });
    Object.defineProperty(exports2, "ProtocolHandler", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return protocol_1.ProtocolHandler;
    }, "get") });
    var util_1 = require_util3();
    Object.defineProperty(exports2, "backoff", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.backoff;
    }, "get") });
    Object.defineProperty(exports2, "collect", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.collect;
    }, "get") });
    Object.defineProperty(exports2, "deadline", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.deadline;
    }, "get") });
    Object.defineProperty(exports2, "deferred", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.deferred;
    }, "get") });
    Object.defineProperty(exports2, "delay", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.delay;
    }, "get") });
    Object.defineProperty(exports2, "extend", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.extend;
    }, "get") });
    Object.defineProperty(exports2, "millis", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.millis;
    }, "get") });
    Object.defineProperty(exports2, "nanos", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.nanos;
    }, "get") });
    Object.defineProperty(exports2, "render", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.render;
    }, "get") });
    Object.defineProperty(exports2, "SimpleMutex", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.SimpleMutex;
    }, "get") });
    Object.defineProperty(exports2, "timeout", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return util_1.timeout;
    }, "get") });
    var headers_1 = require_headers2();
    Object.defineProperty(exports2, "canonicalMIMEHeaderKey", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return headers_1.canonicalMIMEHeaderKey;
    }, "get") });
    Object.defineProperty(exports2, "headers", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return headers_1.headers;
    }, "get") });
    Object.defineProperty(exports2, "MsgHdrsImpl", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return headers_1.MsgHdrsImpl;
    }, "get") });
    var heartbeats_1 = require_heartbeats2();
    Object.defineProperty(exports2, "Heartbeat", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return heartbeats_1.Heartbeat;
    }, "get") });
    var muxsubscription_1 = require_muxsubscription2();
    Object.defineProperty(exports2, "MuxSubscription", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return muxsubscription_1.MuxSubscription;
    }, "get") });
    var databuffer_1 = require_databuffer2();
    Object.defineProperty(exports2, "DataBuffer", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return databuffer_1.DataBuffer;
    }, "get") });
    var options_1 = require_options2();
    Object.defineProperty(exports2, "buildAuthenticator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return options_1.buildAuthenticator;
    }, "get") });
    Object.defineProperty(exports2, "checkOptions", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return options_1.checkOptions;
    }, "get") });
    Object.defineProperty(exports2, "checkUnsupportedOption", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return options_1.checkUnsupportedOption;
    }, "get") });
    Object.defineProperty(exports2, "DEFAULT_MAX_RECONNECT_ATTEMPTS", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return options_1.DEFAULT_MAX_RECONNECT_ATTEMPTS;
    }, "get") });
    Object.defineProperty(exports2, "defaultOptions", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return options_1.defaultOptions;
    }, "get") });
    Object.defineProperty(exports2, "hasWsProtocol", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return options_1.hasWsProtocol;
    }, "get") });
    Object.defineProperty(exports2, "parseOptions", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return options_1.parseOptions;
    }, "get") });
    var request_1 = require_request2();
    Object.defineProperty(exports2, "RequestOne", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return request_1.RequestOne;
    }, "get") });
    var authenticator_1 = require_authenticator2();
    Object.defineProperty(exports2, "credsAuthenticator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return authenticator_1.credsAuthenticator;
    }, "get") });
    Object.defineProperty(exports2, "jwtAuthenticator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return authenticator_1.jwtAuthenticator;
    }, "get") });
    Object.defineProperty(exports2, "nkeyAuthenticator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return authenticator_1.nkeyAuthenticator;
    }, "get") });
    Object.defineProperty(exports2, "tokenAuthenticator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return authenticator_1.tokenAuthenticator;
    }, "get") });
    Object.defineProperty(exports2, "usernamePasswordAuthenticator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return authenticator_1.usernamePasswordAuthenticator;
    }, "get") });
    __exportStar(require_nkeys3(), exports2);
    var queued_iterator_1 = require_queued_iterator2();
    Object.defineProperty(exports2, "QueuedIteratorImpl", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return queued_iterator_1.QueuedIteratorImpl;
    }, "get") });
    var parser_1 = require_parser2();
    Object.defineProperty(exports2, "Kind", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return parser_1.Kind;
    }, "get") });
    Object.defineProperty(exports2, "Parser", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return parser_1.Parser;
    }, "get") });
    Object.defineProperty(exports2, "State", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return parser_1.State;
    }, "get") });
    var denobuffer_1 = require_denobuffer2();
    Object.defineProperty(exports2, "DenoBuffer", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return denobuffer_1.DenoBuffer;
    }, "get") });
    Object.defineProperty(exports2, "MAX_SIZE", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return denobuffer_1.MAX_SIZE;
    }, "get") });
    Object.defineProperty(exports2, "readAll", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return denobuffer_1.readAll;
    }, "get") });
    Object.defineProperty(exports2, "writeAll", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return denobuffer_1.writeAll;
    }, "get") });
    var bench_1 = require_bench2();
    Object.defineProperty(exports2, "Bench", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return bench_1.Bench;
    }, "get") });
    Object.defineProperty(exports2, "Metric", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return bench_1.Metric;
    }, "get") });
    var encoders_1 = require_encoders2();
    Object.defineProperty(exports2, "TD", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return encoders_1.TD;
    }, "get") });
    Object.defineProperty(exports2, "TE", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return encoders_1.TE;
    }, "get") });
    var ipparser_1 = require_ipparser2();
    Object.defineProperty(exports2, "ipV4", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return ipparser_1.ipV4;
    }, "get") });
    Object.defineProperty(exports2, "isIP", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return ipparser_1.isIP;
    }, "get") });
    Object.defineProperty(exports2, "parseIP", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return ipparser_1.parseIP;
    }, "get") });
    var semver_1 = require_semver2();
    Object.defineProperty(exports2, "compare", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return semver_1.compare;
    }, "get") });
    Object.defineProperty(exports2, "Feature", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return semver_1.Feature;
    }, "get") });
    Object.defineProperty(exports2, "Features", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return semver_1.Features;
    }, "get") });
    Object.defineProperty(exports2, "parseSemVer", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return semver_1.parseSemVer;
    }, "get") });
    var types_1 = require_types2();
    Object.defineProperty(exports2, "Empty", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return types_1.Empty;
    }, "get") });
    var transport_2 = require_transport2();
    Object.defineProperty(exports2, "extractProtocolMessage", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return transport_2.extractProtocolMessage;
    }, "get") });
    Object.defineProperty(exports2, "protoLen", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return transport_2.protoLen;
    }, "get") });
    var core_1 = require_core2();
    Object.defineProperty(exports2, "createInbox", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return core_1.createInbox;
    }, "get") });
    Object.defineProperty(exports2, "Match", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return core_1.Match;
    }, "get") });
    Object.defineProperty(exports2, "syncIterator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return core_1.syncIterator;
    }, "get") });
    var protocol_2 = require_protocol2();
    Object.defineProperty(exports2, "SubscriptionImpl", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return protocol_2.SubscriptionImpl;
    }, "get") });
    Object.defineProperty(exports2, "Subscriptions", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return protocol_2.Subscriptions;
    }, "get") });
    var idleheartbeat_monitor_1 = require_idleheartbeat_monitor2();
    Object.defineProperty(exports2, "IdleHeartbeatMonitor", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return idleheartbeat_monitor_1.IdleHeartbeatMonitor;
    }, "get") });
    var servers_1 = require_servers2();
    Object.defineProperty(exports2, "isIPV4OrHostname", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return servers_1.isIPV4OrHostname;
    }, "get") });
    Object.defineProperty(exports2, "Servers", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return servers_1.Servers;
    }, "get") });
    var ws_transport_1 = require_ws_transport2();
    Object.defineProperty(exports2, "wsconnect", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return ws_transport_1.wsconnect;
    }, "get") });
    Object.defineProperty(exports2, "wsUrlParseFn", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return ws_transport_1.wsUrlParseFn;
    }, "get") });
    var errors_1 = require_errors2();
    Object.defineProperty(exports2, "AuthorizationError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.AuthorizationError;
    }, "get") });
    Object.defineProperty(exports2, "ClosedConnectionError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.ClosedConnectionError;
    }, "get") });
    Object.defineProperty(exports2, "ConnectionError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.ConnectionError;
    }, "get") });
    Object.defineProperty(exports2, "DrainingConnectionError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.DrainingConnectionError;
    }, "get") });
    Object.defineProperty(exports2, "errors", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.errors;
    }, "get") });
    Object.defineProperty(exports2, "InvalidArgumentError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.InvalidArgumentError;
    }, "get") });
    Object.defineProperty(exports2, "InvalidOperationError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.InvalidOperationError;
    }, "get") });
    Object.defineProperty(exports2, "InvalidSubjectError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.InvalidSubjectError;
    }, "get") });
    Object.defineProperty(exports2, "NoRespondersError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.NoRespondersError;
    }, "get") });
    Object.defineProperty(exports2, "PermissionViolationError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.PermissionViolationError;
    }, "get") });
    Object.defineProperty(exports2, "ProtocolError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.ProtocolError;
    }, "get") });
    Object.defineProperty(exports2, "RequestError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.RequestError;
    }, "get") });
    Object.defineProperty(exports2, "TimeoutError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.TimeoutError;
    }, "get") });
    Object.defineProperty(exports2, "UserAuthenticationExpiredError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return errors_1.UserAuthenticationExpiredError;
    }, "get") });
  }
});

// node_modules/@nats-io/nats-core/lib/mod.js
var require_mod3 = __commonJS({
  "node_modules/@nats-io/nats-core/lib/mod.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.wsconnect = exports2.usernamePasswordAuthenticator = exports2.UserAuthenticationExpiredError = exports2.tokenAuthenticator = exports2.TimeoutError = exports2.syncIterator = exports2.RequestError = exports2.ProtocolError = exports2.PermissionViolationError = exports2.nuid = exports2.Nuid = exports2.NoRespondersError = exports2.nkeys = exports2.nkeyAuthenticator = exports2.nanos = exports2.MsgHdrsImpl = exports2.millis = exports2.Metric = exports2.Match = exports2.jwtAuthenticator = exports2.InvalidSubjectError = exports2.InvalidOperationError = exports2.InvalidArgumentError = exports2.headers = exports2.hasWsProtocol = exports2.errors = exports2.Empty = exports2.DrainingConnectionError = exports2.delay = exports2.deferred = exports2.deadline = exports2.credsAuthenticator = exports2.createInbox = exports2.ConnectionError = exports2.ClosedConnectionError = exports2.canonicalMIMEHeaderKey = exports2.buildAuthenticator = exports2.Bench = exports2.backoff = exports2.AuthorizationError = void 0;
    var internal_mod_1 = require_internal_mod2();
    Object.defineProperty(exports2, "AuthorizationError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.AuthorizationError;
    }, "get") });
    Object.defineProperty(exports2, "backoff", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.backoff;
    }, "get") });
    Object.defineProperty(exports2, "Bench", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.Bench;
    }, "get") });
    Object.defineProperty(exports2, "buildAuthenticator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.buildAuthenticator;
    }, "get") });
    Object.defineProperty(exports2, "canonicalMIMEHeaderKey", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.canonicalMIMEHeaderKey;
    }, "get") });
    Object.defineProperty(exports2, "ClosedConnectionError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.ClosedConnectionError;
    }, "get") });
    Object.defineProperty(exports2, "ConnectionError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.ConnectionError;
    }, "get") });
    Object.defineProperty(exports2, "createInbox", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.createInbox;
    }, "get") });
    Object.defineProperty(exports2, "credsAuthenticator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.credsAuthenticator;
    }, "get") });
    Object.defineProperty(exports2, "deadline", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.deadline;
    }, "get") });
    Object.defineProperty(exports2, "deferred", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.deferred;
    }, "get") });
    Object.defineProperty(exports2, "delay", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.delay;
    }, "get") });
    Object.defineProperty(exports2, "DrainingConnectionError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.DrainingConnectionError;
    }, "get") });
    Object.defineProperty(exports2, "Empty", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.Empty;
    }, "get") });
    Object.defineProperty(exports2, "errors", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.errors;
    }, "get") });
    Object.defineProperty(exports2, "hasWsProtocol", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.hasWsProtocol;
    }, "get") });
    Object.defineProperty(exports2, "headers", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.headers;
    }, "get") });
    Object.defineProperty(exports2, "InvalidArgumentError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.InvalidArgumentError;
    }, "get") });
    Object.defineProperty(exports2, "InvalidOperationError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.InvalidOperationError;
    }, "get") });
    Object.defineProperty(exports2, "InvalidSubjectError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.InvalidSubjectError;
    }, "get") });
    Object.defineProperty(exports2, "jwtAuthenticator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.jwtAuthenticator;
    }, "get") });
    Object.defineProperty(exports2, "Match", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.Match;
    }, "get") });
    Object.defineProperty(exports2, "Metric", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.Metric;
    }, "get") });
    Object.defineProperty(exports2, "millis", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.millis;
    }, "get") });
    Object.defineProperty(exports2, "MsgHdrsImpl", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.MsgHdrsImpl;
    }, "get") });
    Object.defineProperty(exports2, "nanos", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.nanos;
    }, "get") });
    Object.defineProperty(exports2, "nkeyAuthenticator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.nkeyAuthenticator;
    }, "get") });
    Object.defineProperty(exports2, "nkeys", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.nkeys;
    }, "get") });
    Object.defineProperty(exports2, "NoRespondersError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.NoRespondersError;
    }, "get") });
    Object.defineProperty(exports2, "Nuid", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.Nuid;
    }, "get") });
    Object.defineProperty(exports2, "nuid", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.nuid;
    }, "get") });
    Object.defineProperty(exports2, "PermissionViolationError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.PermissionViolationError;
    }, "get") });
    Object.defineProperty(exports2, "ProtocolError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.ProtocolError;
    }, "get") });
    Object.defineProperty(exports2, "RequestError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.RequestError;
    }, "get") });
    Object.defineProperty(exports2, "syncIterator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.syncIterator;
    }, "get") });
    Object.defineProperty(exports2, "TimeoutError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.TimeoutError;
    }, "get") });
    Object.defineProperty(exports2, "tokenAuthenticator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.tokenAuthenticator;
    }, "get") });
    Object.defineProperty(exports2, "UserAuthenticationExpiredError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.UserAuthenticationExpiredError;
    }, "get") });
    Object.defineProperty(exports2, "usernamePasswordAuthenticator", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.usernamePasswordAuthenticator;
    }, "get") });
    Object.defineProperty(exports2, "wsconnect", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.wsconnect;
    }, "get") });
  }
});

// node_modules/@nats-io/jetstream/lib/types.js
var require_types3 = __commonJS({
  "node_modules/@nats-io/jetstream/lib/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RepublishHeaders = exports2.DirectMsgHeaders = exports2.JsHeaders = exports2.AdvisoryKind = void 0;
    exports2.isOrderedPushConsumerOptions = isOrderedPushConsumerOptions;
    exports2.isPullConsumer = isPullConsumer;
    exports2.isPushConsumer = isPushConsumer;
    exports2.isBoundPushConsumerOptions = isBoundPushConsumerOptions;
    function isOrderedPushConsumerOptions(v) {
      if (v && typeof v === "object") {
        return "name_prefix" in v || "deliver_subject_prefix" in v || "filter_subjects" in v || "filter_subject" in v || "deliver_policy" in v || "opt_start_seq" in v || "opt_start_time" in v || "replay_policy" in v || "inactive_threshold" in v || "headers_only" in v || "deliver_prefix" in v;
      }
      return false;
    }
    __name(isOrderedPushConsumerOptions, "isOrderedPushConsumerOptions");
    function isPullConsumer(v) {
      return v.isPullConsumer();
    }
    __name(isPullConsumer, "isPullConsumer");
    function isPushConsumer(v) {
      return v.isPushConsumer();
    }
    __name(isPushConsumer, "isPushConsumer");
    function isBoundPushConsumerOptions(v) {
      if (v && typeof v === "object") {
        return "deliver_subject" in v || "deliver_group" in v || "idle_heartbeat" in v;
      }
      return false;
    }
    __name(isBoundPushConsumerOptions, "isBoundPushConsumerOptions");
    exports2.AdvisoryKind = {
      API: "api_audit",
      StreamAction: "stream_action",
      ConsumerAction: "consumer_action",
      SnapshotCreate: "snapshot_create",
      SnapshotComplete: "snapshot_complete",
      RestoreCreate: "restore_create",
      RestoreComplete: "restore_complete",
      MaxDeliver: "max_deliver",
      Terminated: "terminated",
      Ack: "consumer_ack",
      StreamLeaderElected: "stream_leader_elected",
      StreamQuorumLost: "stream_quorum_lost",
      ConsumerLeaderElected: "consumer_leader_elected",
      ConsumerQuorumLost: "consumer_quorum_lost"
    };
    exports2.JsHeaders = {
      /**
       * Set if message is from a stream source - format is `stream seq`
       */
      StreamSourceHdr: "Nats-Stream-Source",
      /**
       * Set for heartbeat messages
       */
      LastConsumerSeqHdr: "Nats-Last-Consumer",
      /**
       * Set for heartbeat messages
       */
      LastStreamSeqHdr: "Nats-Last-Stream",
      /**
       * Set for heartbeat messages if the consumer is stalled
       */
      ConsumerStalledHdr: "Nats-Consumer-Stalled",
      /**
       * Set for headers_only consumers indicates the number of bytes in the payload
       */
      MessageSizeHdr: "Nats-Msg-Size",
      // rollup header
      RollupHdr: "Nats-Rollup",
      // value for rollup header when rolling up a subject
      RollupValueSubject: "sub",
      // value for rollup header when rolling up all subjects
      RollupValueAll: "all",
      /**
       * Set on protocol messages to indicate pull request message count that
       * was not honored.
       */
      PendingMessagesHdr: "Nats-Pending-Messages",
      /**
       * Set on protocol messages to indicate pull request byte count that
       * was not honored
       */
      PendingBytesHdr: "Nats-Pending-Bytes"
    };
    exports2.DirectMsgHeaders = {
      Stream: "Nats-Stream",
      Sequence: "Nats-Sequence",
      TimeStamp: "Nats-Time-Stamp",
      Subject: "Nats-Subject",
      LastSequence: "Nats-Last-Sequence",
      NumPending: "Nats-Num-Pending"
    };
    exports2.RepublishHeaders = {
      /**
       * The source stream of the message
       */
      Stream: "Nats-Stream",
      /**
       * The original subject of the message
       */
      Subject: "Nats-Subject",
      /**
       * The sequence of the republished message
       */
      Sequence: "Nats-Sequence",
      /**
       * The stream sequence id of the last message ingested to the same original subject (or 0 if none or deleted)
       */
      LastSequence: "Nats-Last-Sequence",
      /**
       * The size in bytes of the message's body - Only if {@link Republish#headers_only} is set.
       */
      Size: "Nats-Msg-Size"
    };
  }
});

// node_modules/@nats-io/jetstream/lib/jserrors.js
var require_jserrors = __commonJS({
  "node_modules/@nats-io/jetstream/lib/jserrors.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.jserrors = exports2.StreamNotFoundError = exports2.ConsumerNotFoundError = exports2.JetStreamApiError = exports2.InvalidNameError = exports2.JetStreamApiCodes = exports2.JetStreamStatus = exports2.JetStreamStatusError = exports2.JetStreamError = exports2.JetStreamNotEnabled = void 0;
    exports2.isMessageNotFound = isMessageNotFound;
    var types_1 = require_types3();
    var _JetStreamNotEnabled = class _JetStreamNotEnabled extends Error {
      constructor(message, opts) {
        super(message, opts);
        this.name = "JetStreamNotEnabled";
      }
    };
    __name(_JetStreamNotEnabled, "JetStreamNotEnabled");
    var JetStreamNotEnabled = _JetStreamNotEnabled;
    exports2.JetStreamNotEnabled = JetStreamNotEnabled;
    var _JetStreamError = class _JetStreamError extends Error {
      constructor(message, opts) {
        super(message, opts);
        this.name = "JetStreamError";
      }
    };
    __name(_JetStreamError, "JetStreamError");
    var JetStreamError = _JetStreamError;
    exports2.JetStreamError = JetStreamError;
    var _JetStreamStatusError = class _JetStreamStatusError extends JetStreamError {
      code;
      constructor(message, code, opts) {
        super(message, opts);
        this.code = code;
        this.name = "JetStreamStatusError";
      }
    };
    __name(_JetStreamStatusError, "JetStreamStatusError");
    var JetStreamStatusError = _JetStreamStatusError;
    exports2.JetStreamStatusError = JetStreamStatusError;
    var _JetStreamStatus = class _JetStreamStatus {
      msg;
      _description;
      constructor(msg) {
        this.msg = msg;
        this._description = "";
      }
      static maybeParseStatus(msg) {
        const status = new _JetStreamStatus(msg);
        return status.code === 0 ? null : status;
      }
      toError() {
        return new JetStreamStatusError(this.description, this.code);
      }
      debug() {
        console.log({
          subject: this.msg.subject,
          reply: this.msg.reply,
          description: this.description,
          status: this.code,
          headers: this.msg.headers
        });
      }
      get code() {
        var _a;
        return ((_a = this.msg.headers) == null ? void 0 : _a.code) || 0;
      }
      get description() {
        var _a, _b;
        if (this._description === "") {
          this._description = ((_b = (_a = this.msg.headers) == null ? void 0 : _a.description) == null ? void 0 : _b.toLowerCase()) || "";
          if (this._description === "") {
            this._description = this.code === 503 ? "no responders" : "unknown";
          }
        }
        return this._description;
      }
      isIdleHeartbeat() {
        return this.code === 100 && this.description === "idle heartbeat";
      }
      isFlowControlRequest() {
        return this.code === 100 && this.description === "flowcontrol request";
      }
      parseHeartbeat() {
        var _a, _b;
        if (this.isIdleHeartbeat()) {
          return {
            type: "heartbeat",
            lastConsumerSequence: parseInt(((_a = this.msg.headers) == null ? void 0 : _a.get("Nats-Last-Consumer")) || "0"),
            lastStreamSequence: parseInt(((_b = this.msg.headers) == null ? void 0 : _b.get("Nats-Last-Stream")) || "0")
          };
        }
        return null;
      }
      isRequestTimeout() {
        return this.code === 408 && this.description === "request timeout";
      }
      parseDiscard() {
        var _a, _b;
        const discard = {
          msgsLeft: 0,
          bytesLeft: 0
        };
        const msgsLeft = (_a = this.msg.headers) == null ? void 0 : _a.get(types_1.JsHeaders.PendingMessagesHdr);
        if (msgsLeft) {
          discard.msgsLeft = parseInt(msgsLeft);
        }
        const bytesLeft = (_b = this.msg.headers) == null ? void 0 : _b.get(types_1.JsHeaders.PendingBytesHdr);
        if (bytesLeft) {
          discard.bytesLeft = parseInt(bytesLeft);
        }
        return discard;
      }
      isBadRequest() {
        return this.code === 400;
      }
      isConsumerDeleted() {
        return this.code === 409 && this.description === "consumer deleted";
      }
      isStreamDeleted() {
        return this.code === 409 && this.description === "stream deleted";
      }
      isIdleHeartbeatMissed() {
        return this.code === 409 && this.description === "idle heartbeats missed";
      }
      isMaxWaitingExceeded() {
        return this.code === 409 && this.description === "exceeded maxwaiting";
      }
      isConsumerIsPushBased() {
        return this.code === 409 && this.description === "consumer is push based";
      }
      isExceededMaxWaiting() {
        return this.code === 409 && this.description.includes("exceeded maxwaiting");
      }
      isExceededMaxRequestBatch() {
        return this.code === 409 && this.description.includes("exceeded maxrequestbatch");
      }
      isExceededMaxExpires() {
        return this.code === 409 && this.description.includes("exceeded maxrequestexpires");
      }
      isExceededLimit() {
        return this.isExceededMaxExpires() || this.isExceededMaxWaiting() || this.isExceededMaxRequestBatch();
      }
      isMessageNotFound() {
        return this.code === 404 && this.description === "message not found";
      }
      isEndOfBatch() {
        return this.code === 204 && this.description === "eob";
      }
    };
    __name(_JetStreamStatus, "JetStreamStatus");
    var JetStreamStatus = _JetStreamStatus;
    exports2.JetStreamStatus = JetStreamStatus;
    exports2.JetStreamApiCodes = {
      ConsumerNotFound: 10014,
      StreamNotFound: 10059,
      JetStreamNotEnabledForAccount: 10039,
      StreamWrongLastSequence: 10071,
      NoMessageFound: 10037
    };
    function isMessageNotFound(err) {
      return err instanceof JetStreamApiError && err.code === exports2.JetStreamApiCodes.NoMessageFound;
    }
    __name(isMessageNotFound, "isMessageNotFound");
    var _InvalidNameError = class _InvalidNameError extends Error {
      constructor(message = "", opts) {
        super(message, opts);
        this.name = "InvalidNameError";
      }
    };
    __name(_InvalidNameError, "InvalidNameError");
    var InvalidNameError = _InvalidNameError;
    exports2.InvalidNameError = InvalidNameError;
    var _apiError;
    var _JetStreamApiError = class _JetStreamApiError extends Error {
      constructor(jsErr, opts) {
        super(jsErr.description, opts);
        __privateAdd(this, _apiError);
        __privateSet(this, _apiError, jsErr);
        this.name = "JetStreamApiError";
      }
      get code() {
        return __privateGet(this, _apiError).err_code;
      }
      get status() {
        return __privateGet(this, _apiError).code;
      }
      apiError() {
        return Object.assign({}, __privateGet(this, _apiError));
      }
    };
    _apiError = new WeakMap();
    __name(_JetStreamApiError, "JetStreamApiError");
    var JetStreamApiError = _JetStreamApiError;
    exports2.JetStreamApiError = JetStreamApiError;
    var _ConsumerNotFoundError = class _ConsumerNotFoundError extends JetStreamApiError {
      constructor(jsErr, opts) {
        super(jsErr, opts);
        this.name = "ConsumerNotFoundError";
      }
    };
    __name(_ConsumerNotFoundError, "ConsumerNotFoundError");
    var ConsumerNotFoundError = _ConsumerNotFoundError;
    exports2.ConsumerNotFoundError = ConsumerNotFoundError;
    var _StreamNotFoundError = class _StreamNotFoundError extends JetStreamApiError {
      constructor(jsErr, opts) {
        super(jsErr, opts);
        this.name = "StreamNotFoundError";
      }
      static fromMessage(message) {
        return new _StreamNotFoundError({
          err_code: exports2.JetStreamApiCodes.StreamNotFound,
          description: message,
          code: 404
        });
      }
    };
    __name(_StreamNotFoundError, "StreamNotFoundError");
    var StreamNotFoundError = _StreamNotFoundError;
    exports2.StreamNotFoundError = StreamNotFoundError;
    exports2.jserrors = {
      InvalidNameError,
      ConsumerNotFoundError,
      StreamNotFoundError,
      JetStreamError,
      JetStreamApiError,
      JetStreamNotEnabled
    };
  }
});

// node_modules/@nats-io/jetstream/lib/jsbaseclient_api.js
var require_jsbaseclient_api = __commonJS({
  "node_modules/@nats-io/jetstream/lib/jsbaseclient_api.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BaseApiClientImpl = void 0;
    exports2.defaultJsOptions = defaultJsOptions;
    var internal_1 = require_internal_mod2();
    var jserrors_1 = require_jserrors();
    var defaultPrefix = "$JS.API";
    var defaultTimeout = 5e3;
    function defaultJsOptions(opts) {
      opts = opts || {};
      if (opts.domain) {
        opts.apiPrefix = `$JS.${opts.domain}.API`;
        delete opts.domain;
      }
      return (0, internal_1.extend)({ apiPrefix: defaultPrefix, timeout: defaultTimeout }, opts);
    }
    __name(defaultJsOptions, "defaultJsOptions");
    var _BaseApiClientImpl = class _BaseApiClientImpl {
      nc;
      opts;
      prefix;
      timeout;
      constructor(nc, opts) {
        this.nc = nc;
        this.opts = defaultJsOptions(opts);
        this._parseOpts();
        this.prefix = this.opts.apiPrefix;
        this.timeout = this.opts.timeout;
      }
      getOptions() {
        return Object.assign({}, this.opts);
      }
      _parseOpts() {
        let prefix = this.opts.apiPrefix;
        if (!prefix || prefix.length === 0) {
          throw internal_1.errors.InvalidArgumentError.format("prefix", "cannot be empty");
        }
        const c = prefix[prefix.length - 1];
        if (c === ".") {
          prefix = prefix.substr(0, prefix.length - 1);
        }
        this.opts.apiPrefix = prefix;
      }
      async _request(subj, data = null, opts) {
        opts = opts || {};
        opts.timeout = this.timeout;
        let a = internal_1.Empty;
        if (data) {
          a = new TextEncoder().encode(JSON.stringify(data));
        }
        let { retries } = opts;
        retries = retries || 1;
        retries = retries === -1 ? Number.MAX_SAFE_INTEGER : retries;
        const bo = (0, internal_1.backoff)();
        for (let i = 0; i < retries; i++) {
          try {
            const m = await this.nc.request(subj, a, opts);
            return this.parseJsResponse(m);
          } catch (err) {
            const re = err instanceof internal_1.RequestError ? err : null;
            if ((err instanceof internal_1.errors.TimeoutError || (re == null ? void 0 : re.isNoResponders())) && i + 1 < retries) {
              await (0, internal_1.delay)(bo.backoff(i));
            } else {
              throw (re == null ? void 0 : re.isNoResponders()) ? new jserrors_1.JetStreamNotEnabled("jetstream is not enabled", {
                cause: err
              }) : err;
            }
          }
        }
      }
      async findStream(subject) {
        const q = { subject };
        const r = await this._request(`${this.prefix}.STREAM.NAMES`, q);
        const names = r;
        if (!names.streams || names.streams.length !== 1) {
          throw jserrors_1.StreamNotFoundError.fromMessage("no stream matches subject");
        }
        return names.streams[0];
      }
      getConnection() {
        return this.nc;
      }
      parseJsResponse(m) {
        const v = JSON.parse(new TextDecoder().decode(m.data));
        const r = v;
        if (r.error) {
          switch (r.error.err_code) {
            case jserrors_1.JetStreamApiCodes.ConsumerNotFound:
              throw new jserrors_1.ConsumerNotFoundError(r.error);
            case jserrors_1.JetStreamApiCodes.StreamNotFound:
              throw new jserrors_1.StreamNotFoundError(r.error);
            case jserrors_1.JetStreamApiCodes.JetStreamNotEnabledForAccount: {
              const jserr = new jserrors_1.JetStreamApiError(r.error);
              throw new jserrors_1.JetStreamNotEnabled(jserr.message, { cause: jserr });
            }
            default:
              throw new jserrors_1.JetStreamApiError(r.error);
          }
        }
        return v;
      }
    };
    __name(_BaseApiClientImpl, "BaseApiClientImpl");
    var BaseApiClientImpl = _BaseApiClientImpl;
    exports2.BaseApiClientImpl = BaseApiClientImpl;
  }
});

// node_modules/@nats-io/jetstream/lib/jslister.js
var require_jslister = __commonJS({
  "node_modules/@nats-io/jetstream/lib/jslister.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ListerImpl = void 0;
    var internal_1 = require_internal_mod2();
    var _ListerImpl = class _ListerImpl {
      err;
      offset;
      pageInfo;
      subject;
      jsm;
      filter;
      payload;
      constructor(subject, filter, jsm, payload) {
        if (!subject) {
          throw internal_1.errors.InvalidArgumentError.format("subject", "is required");
        }
        this.subject = subject;
        this.jsm = jsm;
        this.offset = 0;
        this.pageInfo = {};
        this.filter = filter;
        this.payload = payload || {};
      }
      async next() {
        if (this.err) {
          return [];
        }
        if (this.pageInfo && this.offset >= this.pageInfo.total) {
          return [];
        }
        const offset = { offset: this.offset };
        if (this.payload) {
          Object.assign(offset, this.payload);
        }
        try {
          const r = await this.jsm._request(this.subject, offset, { timeout: this.jsm.timeout });
          this.pageInfo = r;
          const count = this.countResponse(r);
          if (count === 0) {
            return [];
          }
          this.offset += count;
          return this.filter(r);
        } catch (err) {
          this.err = err;
          throw err;
        }
      }
      countResponse(r) {
        var _a, _b, _c;
        switch (r == null ? void 0 : r.type) {
          case "io.nats.jetstream.api.v1.stream_names_response":
          case "io.nats.jetstream.api.v1.stream_list_response":
            return ((_a = r.streams) == null ? void 0 : _a.length) || 0;
          case "io.nats.jetstream.api.v1.consumer_list_response":
            return ((_b = r.consumers) == null ? void 0 : _b.length) || 0;
          default:
            console.error(`jslister.ts: unknown API response for paged output: ${r == null ? void 0 : r.type}`);
            return ((_c = r.streams) == null ? void 0 : _c.length) || 0;
        }
      }
      async *[Symbol.asyncIterator]() {
        let page = await this.next();
        while (page.length > 0) {
          for (const item of page) {
            yield item;
          }
          page = await this.next();
        }
      }
    };
    __name(_ListerImpl, "ListerImpl");
    var ListerImpl = _ListerImpl;
    exports2.ListerImpl = ListerImpl;
  }
});

// node_modules/@nats-io/jetstream/lib/jsutil.js
var require_jsutil = __commonJS({
  "node_modules/@nats-io/jetstream/lib/jsutil.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.validateDurableName = validateDurableName;
    exports2.validateStreamName = validateStreamName;
    exports2.minValidation = minValidation;
    exports2.validateName = validateName;
    exports2.validName = validName;
    var jserrors_1 = require_jserrors();
    function validateDurableName(name) {
      return minValidation("durable", name);
    }
    __name(validateDurableName, "validateDurableName");
    function validateStreamName(name) {
      return minValidation("stream", name);
    }
    __name(validateStreamName, "validateStreamName");
    function minValidation(context, name = "") {
      if (name === "") {
        throw Error(`${context} name required`);
      }
      const bad = [".", "*", ">", "/", "\\", " ", "	", "\n", "\r"];
      bad.forEach((v) => {
        if (name.indexOf(v) !== -1) {
          switch (v) {
            case "\n":
              v = "\\n";
              break;
            case "\r":
              v = "\\r";
              break;
            case "	":
              v = "\\t";
              break;
            default:
          }
          throw new jserrors_1.InvalidNameError(`${context} name ('${name}') cannot contain '${v}'`);
        }
      });
      return "";
    }
    __name(minValidation, "minValidation");
    function validateName(context, name = "") {
      if (name === "") {
        throw Error(`${context} name required`);
      }
      const m = validName(name);
      if (m.length) {
        throw new Error(`invalid ${context} name - ${context} name ${m}`);
      }
    }
    __name(validateName, "validateName");
    function validName(name = "") {
      if (name === "") {
        throw Error(`name required`);
      }
      const RE = /^[-\w]+$/g;
      const m = name.match(RE);
      if (m === null) {
        for (const c of name.split("")) {
          const mm = c.match(RE);
          if (mm === null) {
            return `cannot contain '${c}'`;
          }
        }
      }
      return "";
    }
    __name(validName, "validName");
  }
});

// node_modules/@nats-io/jetstream/lib/jsapi_types.js
var require_jsapi_types = __commonJS({
  "node_modules/@nats-io/jetstream/lib/jsapi_types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PubHeaders = exports2.PriorityPolicy = exports2.ConsumerApiAction = exports2.StoreCompression = exports2.ReplayPolicy = exports2.AckPolicy = exports2.DeliverPolicy = exports2.StorageType = exports2.DiscardPolicy = exports2.RetentionPolicy = void 0;
    exports2.defaultConsumer = defaultConsumer;
    var nats_core_1 = require_mod3();
    exports2.RetentionPolicy = {
      /**
       * Retain messages until the limits are reached, then trigger the discard policy.
       */
      Limits: "limits",
      /**
       * Retain messages while there is consumer interest on the particular subject.
       */
      Interest: "interest",
      /**
       * Retain messages until acknowledged
       */
      Workqueue: "workqueue"
    };
    exports2.DiscardPolicy = {
      /**
       * Discard old messages to make room for the new ones
       */
      Old: "old",
      /**
       * Discard the new messages
       */
      New: "new"
    };
    exports2.StorageType = {
      /**
       * Store persistently on files
       */
      File: "file",
      /**
       * Store in server memory - doesn't survive server restarts
       */
      Memory: "memory"
    };
    exports2.DeliverPolicy = {
      /**
       * Deliver all messages
       */
      All: "all",
      /**
       * Deliver starting with the last message
       */
      Last: "last",
      /**
       * Deliver starting with new messages
       */
      New: "new",
      /**
       * Deliver starting with the specified sequence
       */
      StartSequence: "by_start_sequence",
      /**
       * Deliver starting with the specified time
       */
      StartTime: "by_start_time",
      /**
       * Deliver starting with the last messages for every subject
       */
      LastPerSubject: "last_per_subject"
    };
    exports2.AckPolicy = {
      /**
       * Messages don't need to be Ack'ed.
       */
      None: "none",
      /**
       * Ack, acknowledges all messages with a lower sequence
       */
      All: "all",
      /**
       * All sequences must be explicitly acknowledged
       */
      Explicit: "explicit",
      /**
       * @ignore
       */
      NotSet: ""
    };
    exports2.ReplayPolicy = {
      /**
       * Replays messages as fast as possible
       */
      Instant: "instant",
      /**
       * Replays messages following the original delay between messages
       */
      Original: "original"
    };
    exports2.StoreCompression = {
      /**
       * No compression
       */
      None: "none",
      /**
       * S2 compression
       */
      S2: "s2"
    };
    exports2.ConsumerApiAction = {
      CreateOrUpdate: "",
      Update: "update",
      Create: "create"
    };
    exports2.PriorityPolicy = {
      None: "none",
      Overflow: "overflow"
    };
    function defaultConsumer(name, opts = {}) {
      return Object.assign({
        name,
        deliver_policy: exports2.DeliverPolicy.All,
        ack_policy: exports2.AckPolicy.Explicit,
        ack_wait: (0, nats_core_1.nanos)(30 * 1e3),
        replay_policy: exports2.ReplayPolicy.Instant
      }, opts);
    }
    __name(defaultConsumer, "defaultConsumer");
    exports2.PubHeaders = {
      MsgIdHdr: "Nats-Msg-Id",
      ExpectedStreamHdr: "Nats-Expected-Stream",
      ExpectedLastSeqHdr: "Nats-Expected-Last-Sequence",
      ExpectedLastMsgIdHdr: "Nats-Expected-Last-Msg-Id",
      ExpectedLastSubjectSequenceHdr: "Nats-Expected-Last-Subject-Sequence"
    };
  }
});

// node_modules/@nats-io/jetstream/lib/jsmconsumer_api.js
var require_jsmconsumer_api = __commonJS({
  "node_modules/@nats-io/jetstream/lib/jsmconsumer_api.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConsumerAPIImpl = void 0;
    var jsbaseclient_api_1 = require_jsbaseclient_api();
    var jslister_1 = require_jslister();
    var jsutil_1 = require_jsutil();
    var internal_1 = require_internal_mod2();
    var jsapi_types_1 = require_jsapi_types();
    var _ConsumerAPIImpl = class _ConsumerAPIImpl extends jsbaseclient_api_1.BaseApiClientImpl {
      constructor(nc, opts) {
        super(nc, opts);
      }
      async add(stream, cfg, action = jsapi_types_1.ConsumerApiAction.Create) {
        (0, jsutil_1.validateStreamName)(stream);
        if (cfg.deliver_group && cfg.flow_control) {
          throw internal_1.InvalidArgumentError.format(["flow_control", "deliver_group"], "are mutually exclusive");
        }
        if (cfg.deliver_group && cfg.idle_heartbeat) {
          throw internal_1.InvalidArgumentError.format(["idle_heartbeat", "deliver_group"], "are mutually exclusive");
        }
        if (isPriorityGroup(cfg)) {
          const { min: min2, ok } = this.nc.features.get(internal_1.Feature.JS_PRIORITY_GROUPS);
          if (!ok) {
            throw new Error(`priority_groups require server ${min2}`);
          }
          if (cfg.deliver_subject) {
            throw internal_1.InvalidArgumentError.format("deliver_subject", "cannot be set when using priority groups");
          }
          validatePriorityGroups(cfg);
        }
        const cr = {};
        cr.config = cfg;
        cr.stream_name = stream;
        cr.action = action;
        if (cr.config.durable_name) {
          (0, jsutil_1.validateDurableName)(cr.config.durable_name);
        }
        const nci = this.nc;
        let { min, ok: newAPI } = nci.features.get(internal_1.Feature.JS_NEW_CONSUMER_CREATE_API);
        const name = cfg.name === "" ? void 0 : cfg.name;
        if (name && !newAPI) {
          throw internal_1.InvalidArgumentError.format("name", `requires server ${min}`);
        }
        if (name) {
          try {
            (0, jsutil_1.minValidation)("name", name);
          } catch (err) {
            const m = err.message;
            const idx = m.indexOf("cannot contain");
            if (idx !== -1) {
              throw new Error(`consumer 'name' ${m.substring(idx)}`);
            }
            throw err;
          }
        }
        let subj;
        let consumerName = "";
        if (Array.isArray(cfg.filter_subjects)) {
          const { min: min2, ok } = nci.features.get(internal_1.Feature.JS_MULTIPLE_CONSUMER_FILTER);
          if (!ok) {
            throw internal_1.InvalidArgumentError.format("filter_subjects", `requires server ${min2}`);
          }
          newAPI = false;
        }
        if (cfg.metadata) {
          const { min: min2, ok } = nci.features.get(internal_1.Feature.JS_STREAM_CONSUMER_METADATA);
          if (!ok) {
            throw internal_1.InvalidArgumentError.format("metadata", `requires server ${min2}`);
          }
        }
        if (newAPI) {
          consumerName = cfg.name ?? cfg.durable_name ?? "";
        }
        if (consumerName !== "") {
          let fs = cfg.filter_subject ?? void 0;
          if (fs === ">") {
            fs = void 0;
          }
          subj = fs !== void 0 ? `${this.prefix}.CONSUMER.CREATE.${stream}.${consumerName}.${fs}` : `${this.prefix}.CONSUMER.CREATE.${stream}.${consumerName}`;
        } else {
          subj = cfg.durable_name ? `${this.prefix}.CONSUMER.DURABLE.CREATE.${stream}.${cfg.durable_name}` : `${this.prefix}.CONSUMER.CREATE.${stream}`;
        }
        const r = await this._request(subj, cr);
        return r;
      }
      async update(stream, durable, cfg) {
        const ci = await this.info(stream, durable);
        const changable = cfg;
        return this.add(stream, Object.assign(ci.config, changable), jsapi_types_1.ConsumerApiAction.Update);
      }
      async info(stream, name) {
        (0, jsutil_1.validateStreamName)(stream);
        (0, jsutil_1.validateDurableName)(name);
        const r = await this._request(`${this.prefix}.CONSUMER.INFO.${stream}.${name}`);
        return r;
      }
      async delete(stream, name) {
        (0, jsutil_1.validateStreamName)(stream);
        (0, jsutil_1.validateDurableName)(name);
        const r = await this._request(`${this.prefix}.CONSUMER.DELETE.${stream}.${name}`);
        const cr = r;
        return cr.success;
      }
      list(stream) {
        (0, jsutil_1.validateStreamName)(stream);
        const filter = /* @__PURE__ */ __name((v) => {
          const clr = v;
          return clr.consumers;
        }, "filter");
        const subj = `${this.prefix}.CONSUMER.LIST.${stream}`;
        return new jslister_1.ListerImpl(subj, filter, this);
      }
      // Fixme: the API returns the number of nanoseconds, but really should return
      //  millis,
      pause(stream, name, until) {
        const subj = `${this.prefix}.CONSUMER.PAUSE.${stream}.${name}`;
        const opts = {
          pause_until: until.toISOString()
        };
        return this._request(subj, opts);
      }
      // Fixme: the API returns the number of nanoseconds, but really should return
      //  millis,
      resume(stream, name) {
        return this.pause(stream, name, /* @__PURE__ */ new Date(0));
      }
    };
    __name(_ConsumerAPIImpl, "ConsumerAPIImpl");
    var ConsumerAPIImpl = _ConsumerAPIImpl;
    exports2.ConsumerAPIImpl = ConsumerAPIImpl;
    function isPriorityGroup(config) {
      const pg = config;
      return pg && pg.priority_groups !== void 0 || pg.priority_policy !== void 0;
    }
    __name(isPriorityGroup, "isPriorityGroup");
    function validatePriorityGroups(pg) {
      if (isPriorityGroup(pg)) {
        if (!Array.isArray(pg.priority_groups)) {
          throw internal_1.InvalidArgumentError.format(["priority_groups"], "must be an array");
        }
        if (pg.priority_groups.length === 0) {
          throw internal_1.InvalidArgumentError.format(["priority_groups"], "must have at least one group");
        }
        pg.priority_groups.forEach((g) => {
          (0, jsutil_1.minValidation)("priority_group", g);
          if (g.length > 16) {
            throw internal_1.errors.InvalidArgumentError.format("group", "must be 16 characters or less");
          }
        });
        if (pg.priority_policy !== jsapi_types_1.PriorityPolicy.None && pg.priority_policy !== jsapi_types_1.PriorityPolicy.Overflow) {
          throw internal_1.InvalidArgumentError.format(["priority_policy"], "must be 'none' or 'overflow'");
        }
      }
    }
    __name(validatePriorityGroups, "validatePriorityGroups");
  }
});

// node_modules/@nats-io/jetstream/lib/jsmsg.js
var require_jsmsg = __commonJS({
  "node_modules/@nats-io/jetstream/lib/jsmsg.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.JsMsgImpl = exports2.ACK = void 0;
    exports2.toJsMsg = toJsMsg;
    exports2.parseInfo = parseInfo;
    var internal_1 = require_internal_mod2();
    exports2.ACK = Uint8Array.of(43, 65, 67, 75);
    var NAK = Uint8Array.of(45, 78, 65, 75);
    var WPI = Uint8Array.of(43, 87, 80, 73);
    var NXT = Uint8Array.of(43, 78, 88, 84);
    var TERM = Uint8Array.of(43, 84, 69, 82, 77);
    var SPACE = Uint8Array.of(32);
    function toJsMsg(m, ackTimeout = 5e3) {
      return new JsMsgImpl(m, ackTimeout);
    }
    __name(toJsMsg, "toJsMsg");
    function parseInfo(s) {
      const tokens = s.split(".");
      if (tokens.length === 9) {
        tokens.splice(2, 0, "_", "");
      }
      if (tokens.length < 11 || tokens[0] !== "$JS" || tokens[1] !== "ACK") {
        throw new Error(`unable to parse delivery info - not a jetstream message`);
      }
      const di = {};
      di.domain = tokens[2] === "_" ? "" : tokens[2];
      di.account_hash = tokens[3];
      di.stream = tokens[4];
      di.consumer = tokens[5];
      di.deliveryCount = parseInt(tokens[6], 10);
      di.redelivered = di.deliveryCount > 1;
      di.streamSequence = parseInt(tokens[7], 10);
      di.deliverySequence = parseInt(tokens[8], 10);
      di.timestampNanos = parseInt(tokens[9], 10);
      di.pending = parseInt(tokens[10], 10);
      return di;
    }
    __name(parseInfo, "parseInfo");
    function parseTimestampNanos(s) {
      const tokens = s.split(".");
      if (tokens.length === 9) {
        tokens.splice(2, 0, "_", "");
      }
      if (tokens.length < 11 || tokens[0] !== "$JS" || tokens[1] !== "ACK") {
        throw new Error(`unable to parse delivery info - not a jetstream message`);
      }
      return BigInt(tokens[9]);
    }
    __name(parseTimestampNanos, "parseTimestampNanos");
    var _JsMsgImpl = class _JsMsgImpl {
      msg;
      di;
      didAck;
      timeout;
      constructor(msg, timeout) {
        this.msg = msg;
        this.didAck = false;
        this.timeout = timeout;
      }
      get subject() {
        return this.msg.subject;
      }
      get sid() {
        return this.msg.sid;
      }
      get data() {
        return this.msg.data;
      }
      get headers() {
        return this.msg.headers;
      }
      get info() {
        if (!this.di) {
          this.di = parseInfo(this.reply);
        }
        return this.di;
      }
      get redelivered() {
        return this.info.deliveryCount > 1;
      }
      get reply() {
        return this.msg.reply || "";
      }
      get seq() {
        return this.info.streamSequence;
      }
      get time() {
        const ms = (0, internal_1.millis)(this.info.timestampNanos);
        return new Date(ms);
      }
      get timestamp() {
        return this.time.toISOString();
      }
      get timestampNanos() {
        return parseTimestampNanos(this.reply);
      }
      doAck(payload) {
        if (!this.didAck) {
          this.didAck = !this.isWIP(payload);
          this.msg.respond(payload);
        }
      }
      isWIP(p) {
        return p.length === 4 && p[0] === WPI[0] && p[1] === WPI[1] && p[2] === WPI[2] && p[3] === WPI[3];
      }
      // this has to dig into the internals as the message has access
      // to the protocol but not the high-level client.
      async ackAck(opts) {
        var _a;
        const d = (0, internal_1.deferred)();
        if (!this.didAck) {
          this.didAck = true;
          if (this.msg.reply) {
            opts = opts || {};
            opts.timeout = opts.timeout || this.timeout;
            const mi = this.msg;
            const proto = mi.publisher;
            const trace = !(((_a = proto.options) == null ? void 0 : _a.noAsyncTraces) || false);
            const r = new internal_1.RequestOne(proto.muxSubscriptions, this.msg.reply, {
              timeout: opts.timeout
            }, trace);
            proto.request(r);
            try {
              proto.publish(this.msg.reply, exports2.ACK, {
                reply: `${proto.muxSubscriptions.baseInbox}${r.token}`
              });
            } catch (err) {
              r.cancel(err);
            }
            try {
              await Promise.race([r.timer, r.deferred]);
              d.resolve(true);
            } catch (err) {
              r.cancel(err);
              d.reject(err);
            }
          } else {
            d.resolve(false);
          }
        } else {
          d.resolve(false);
        }
        return d;
      }
      ack() {
        this.doAck(exports2.ACK);
      }
      nak(millis) {
        let payload = NAK;
        if (millis) {
          payload = new TextEncoder().encode(`-NAK ${JSON.stringify({ delay: (0, internal_1.nanos)(millis) })}`);
        }
        this.doAck(payload);
      }
      working() {
        this.doAck(WPI);
      }
      next(subj, opts = { batch: 1 }) {
        const args = {};
        args.batch = opts.batch || 1;
        args.no_wait = opts.no_wait || false;
        if (opts.expires && opts.expires > 0) {
          args.expires = (0, internal_1.nanos)(opts.expires);
        }
        const data = new TextEncoder().encode(JSON.stringify(args));
        const payload = internal_1.DataBuffer.concat(NXT, SPACE, data);
        const reqOpts = subj ? { reply: subj } : void 0;
        this.msg.respond(payload, reqOpts);
      }
      term(reason = "") {
        let term = TERM;
        if ((reason == null ? void 0 : reason.length) > 0) {
          term = new TextEncoder().encode(`+TERM ${reason}`);
        }
        this.doAck(term);
      }
      json() {
        return this.msg.json();
      }
      string() {
        return this.msg.string();
      }
    };
    __name(_JsMsgImpl, "JsMsgImpl");
    var JsMsgImpl = _JsMsgImpl;
    exports2.JsMsgImpl = JsMsgImpl;
  }
});

// node_modules/@nats-io/jetstream/lib/consumer.js
var require_consumer = __commonJS({
  "node_modules/@nats-io/jetstream/lib/consumer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PullConsumerImpl = exports2.PullConsumerMessagesImpl = exports2.PullConsumerType = void 0;
    exports2.isOverflowOptions = isOverflowOptions;
    exports2.validateOverflowPullOptions = validateOverflowPullOptions;
    var internal_1 = require_internal_mod2();
    var jsmsg_1 = require_jsmsg();
    var jsapi_types_1 = require_jsapi_types();
    var jserrors_1 = require_jserrors();
    var jsutil_1 = require_jsutil();
    exports2.PullConsumerType = {
      Unset: "",
      Consume: "consume",
      Fetch: "fetch"
    };
    function isOverflowOptions(opts) {
      const oo = opts;
      return oo && typeof oo.group === "string" || typeof oo.min_pending === "number" || typeof oo.min_ack_pending === "number";
    }
    __name(isOverflowOptions, "isOverflowOptions");
    var _PullConsumerMessagesImpl = class _PullConsumerMessagesImpl extends internal_1.QueuedIteratorImpl {
      consumer;
      opts;
      sub;
      monitor;
      pending;
      isConsume;
      callback;
      listeners;
      statusIterator;
      abortOnMissingResource;
      bind;
      inboxPrefix;
      inbox;
      cancelables;
      inReset;
      closeListener;
      // callback: ConsumerCallbackFn;
      constructor(c, opts, refilling = false) {
        super();
        this.consumer = c;
        this.isConsume = refilling;
        this.cancelables = [];
        this.inboxPrefix = (0, internal_1.createInbox)(this.consumer.api.nc.options.inboxPrefix);
        this.inbox = `${this.inboxPrefix}.${this.consumer.serial}`;
        this.inReset = false;
        if (this.consumer.ordered) {
          if (isOverflowOptions(opts)) {
            throw internal_1.errors.InvalidArgumentError.format([
              "group",
              "min_pending",
              "min_ack_pending"
            ], "cannot be specified for ordered consumers");
          }
          if (this.consumer.orderedConsumerState === void 0) {
            const ocs = {};
            const iopts = c.opts;
            ocs.namePrefix = iopts.name_prefix ?? `oc_${internal_1.nuid.next()}`;
            ocs.opts = iopts;
            ocs.cursor = { stream_seq: 1, deliver_seq: 0 };
            const startSeq = c._info.config.opt_start_seq || 0;
            ocs.cursor.stream_seq = startSeq > 0 ? startSeq - 1 : 0;
            ocs.createFails = 0;
            this.consumer.orderedConsumerState = ocs;
          }
        }
        const copts = opts;
        this.opts = this.parseOptions(opts, this.isConsume);
        this.callback = copts.callback || null;
        this.noIterator = typeof this.callback === "function";
        this.monitor = null;
        this.pending = { msgs: 0, bytes: 0, requests: 0 };
        this.listeners = [];
        this.abortOnMissingResource = copts.abort_on_missing_resource === true;
        this.bind = copts.bind === true;
        this.closeListener = {
          // we don't propagate the error here
          connectionClosedCallback: /* @__PURE__ */ __name(() => {
            this._push(() => {
              this.stop();
            });
          }, "connectionClosedCallback")
        };
        this.consumer.api.nc.addCloseListener(this.closeListener);
        this.start();
      }
      start() {
        const { max_messages, max_bytes, idle_heartbeat, threshold_bytes, threshold_messages } = this.opts;
        this.sub = this.consumer.api.nc.subscribe(this.inbox, {
          callback: /* @__PURE__ */ __name((err, msg) => {
            var _a;
            if (err) {
              this.stop(err);
              return;
            }
            (_a = this.monitor) == null ? void 0 : _a.work();
            const isProtocol = this.consumer.ordered ? msg.subject.indexOf(this == null ? void 0 : this.inboxPrefix) === 0 : msg.subject === this.inbox;
            if (isProtocol) {
              if (msg.subject !== this.sub.subject) {
                return;
              }
              const status = new jserrors_1.JetStreamStatus(msg);
              const hb = status.parseHeartbeat();
              if (hb) {
                this.notify(hb);
                return;
              }
              const code = status.code;
              const description = status.description;
              const { msgsLeft, bytesLeft } = status.parseDiscard();
              if (msgsLeft && msgsLeft > 0 || bytesLeft && bytesLeft > 0) {
                this.pending.msgs -= msgsLeft;
                this.pending.bytes -= bytesLeft;
                this.pending.requests--;
                this.notify({
                  type: "discard",
                  messagesLeft: msgsLeft,
                  bytesLeft
                });
              } else {
                switch (code) {
                  case 400:
                    this.stop(status.toError());
                    return;
                  case 409: {
                    const err2 = this.handle409(status);
                    if (err2) {
                      this.stop(err2);
                      return;
                    }
                    break;
                  }
                  case 503:
                    this.notify({ type: "no_responders", code });
                    if (this.consumer.ordered) {
                      const ocs = this.consumer.orderedConsumerState;
                      ocs.needsReset = true;
                    }
                    if (!this.isConsume) {
                      this.stop(status.toError());
                      return;
                    }
                    break;
                  default:
                    this.notify({ type: "debug", code, description });
                }
              }
            } else {
              const m = (0, jsmsg_1.toJsMsg)(msg, this.consumer.api.timeout);
              if (this.consumer.ordered) {
                const cursor = this.consumer.orderedConsumerState.cursor;
                const dseq = m.info.deliverySequence;
                const sseq = m.info.streamSequence;
                const expected_dseq = cursor.deliver_seq + 1;
                if (dseq !== expected_dseq) {
                  this.reset();
                  return;
                }
                cursor.deliver_seq = dseq;
                cursor.stream_seq = sseq;
              }
              this._push(m);
              this.received++;
              if (this.pending.msgs) {
                this.pending.msgs--;
              }
              if (this.pending.bytes) {
                this.pending.bytes -= msg.size();
              }
            }
            if (this.pending.msgs === 0 && this.pending.bytes === 0) {
              this.pending.requests = 0;
            }
            if (this.isConsume) {
              if (max_messages && this.pending.msgs <= threshold_messages || max_bytes && this.pending.bytes <= threshold_bytes) {
                const batch = this.pullOptions();
                this.pull(batch);
              }
            } else if (this.pending.requests === 0) {
              this._push(() => {
                this.stop();
              });
            }
          }, "callback")
        });
        if (idle_heartbeat) {
          this.monitor = new internal_1.IdleHeartbeatMonitor(idle_heartbeat, (count) => {
            this.notify({ type: "heartbeats_missed", count });
            if (!this.isConsume && !this.consumer.ordered) {
              this.stop(new jserrors_1.JetStreamError("heartbeats missed"));
              return true;
            }
            this.resetPending().then(() => {
            }).catch(() => {
            });
            return false;
          }, { maxOut: 2 });
        }
        (async () => {
          var _a;
          const status = this.consumer.api.nc.status();
          this.statusIterator = status;
          for await (const s of status) {
            switch (s.type) {
              case "disconnect":
                (_a = this.monitor) == null ? void 0 : _a.cancel();
                break;
              case "reconnect":
                this.resetPending().then((ok) => {
                  var _a2;
                  if (ok) {
                    (_a2 = this.monitor) == null ? void 0 : _a2.restart();
                  }
                }).catch(() => {
                });
                break;
              default:
            }
          }
        })();
        this.sub.closed.then(() => {
          if (this.sub.draining) {
            this._push(() => {
              this.stop();
            });
          }
        });
        this.pull(this.pullOptions());
      }
      /**
       * Handle the notification of 409 error and whether
       * it should reject the operation by returning an Error or null
       * @param status
       */
      handle409(status) {
        const { code, description } = status;
        if (status.isConsumerDeleted()) {
          this.notify({ type: "consumer_deleted", code, description });
        } else if (status.isExceededLimit()) {
          this.notify({ type: "exceeded_limits", code, description });
        }
        if (!this.isConsume) {
          return status.toError();
        }
        if (status.isConsumerDeleted() && this.abortOnMissingResource) {
          return status.toError();
        }
        return null;
      }
      reset() {
        var _a, _b;
        (_a = this.monitor) == null ? void 0 : _a.cancel();
        const ocs = this.consumer.orderedConsumerState;
        const { name } = (_b = this.consumer._info) == null ? void 0 : _b.config;
        if (name) {
          this.notify({ type: "reset", name });
          this.consumer.api.delete(this.consumer.stream, name).catch(() => {
          });
        }
        const config = this.consumer.getConsumerOpts();
        this.inbox = `${this.inboxPrefix}.${this.consumer.serial}`;
        ocs.cursor.deliver_seq = 0;
        this.consumer.name = config.name;
        this.consumer.api.nc._resub(this.sub, this.inbox);
        this.consumer.api.add(this.consumer.stream, config).then((ci) => {
          var _a2;
          ocs.createFails = 0;
          this.consumer._info = ci;
          this.notify({ type: "ordered_consumer_recreated", name: ci.name });
          (_a2 = this.monitor) == null ? void 0 : _a2.restart();
          this.pull(this.pullOptions());
        }).catch((err) => {
          ocs.createFails++;
          if (err.message === "stream not found") {
            this.notify({
              type: "stream_not_found",
              consumerCreateFails: ocs.createFails,
              name: this.consumer.stream
            });
            if (this.abortOnMissingResource) {
              this.stop(err);
              return;
            }
          }
          if (ocs.createFails >= 30 && this.received === 0) {
            this.stop(err);
          }
          const bo = (0, internal_1.backoff)();
          const c = (0, internal_1.delay)(bo.backoff(ocs.createFails));
          c.then(() => {
            const idx = this.cancelables.indexOf(c);
            if (idx !== -1) {
              this.cancelables = this.cancelables.splice(idx, idx);
            }
            if (!this.done) {
              this.reset();
            }
          }).catch((_) => {
          });
          this.cancelables.push(c);
        });
      }
      _push(r) {
        if (!this.callback) {
          super.push(r);
        } else {
          const fn = typeof r === "function" ? r : null;
          try {
            if (!fn) {
              const m = r;
              this.callback(m);
            } else {
              fn();
            }
          } catch (err) {
            this.stop(err);
          }
        }
      }
      notify(n) {
        if (this.listeners.length > 0) {
          (() => {
            this.listeners.forEach((l) => {
              const qi = l;
              if (!qi.done) {
                qi.push(n);
              }
            });
          })();
        }
      }
      async resetPending() {
        if (this.inReset) {
          return Promise.resolve(true);
        }
        this.inReset = true;
        const v = this.bind ? this.resetPendingNoInfo() : this.resetPendingWithInfo();
        const tf = await v;
        this.inReset = false;
        return tf;
      }
      resetPendingNoInfo() {
        this.pending.msgs = 0;
        this.pending.bytes = 0;
        this.pending.requests = 0;
        this.pull(this.pullOptions());
        return Promise.resolve(true);
      }
      async resetPendingWithInfo() {
        let notFound = 0;
        let streamNotFound = 0;
        const bo = (0, internal_1.backoff)([this.opts.expires || 3e4]);
        let attempt = 0;
        while (true) {
          if (this.done) {
            return false;
          }
          if (this.consumer.api.nc.isClosed()) {
            return false;
          }
          try {
            await this.consumer.info();
            notFound = 0;
            this.pending.msgs = 0;
            this.pending.bytes = 0;
            this.pending.requests = 0;
            this.pull(this.pullOptions());
            return true;
          } catch (err) {
            if (err instanceof internal_1.errors.ClosedConnectionError) {
              this.stop(err);
              return false;
            }
            if (err.message === "stream not found") {
              streamNotFound++;
              this.notify({ type: "stream_not_found", name: this.consumer.stream });
              if (!this.isConsume || this.abortOnMissingResource) {
                this.stop(err);
                return false;
              }
            } else if (err.message === "consumer not found") {
              notFound++;
              this.notify({
                type: "consumer_not_found",
                name: this.consumer.name,
                stream: this.consumer.stream,
                count: notFound
              });
              if (!this.isConsume || this.abortOnMissingResource) {
                if (this.consumer.ordered) {
                  const ocs = this.consumer.orderedConsumerState;
                  ocs.needsReset = true;
                }
                this.stop(err);
                return false;
              }
              if (this.consumer.ordered) {
                this.reset();
                return false;
              }
            } else {
              notFound = 0;
              streamNotFound = 0;
            }
            const to = bo.backoff(attempt);
            const de = (0, internal_1.delay)(to);
            await Promise.race([de, this.consumer.api.nc.closed()]);
            de.cancel();
            attempt++;
          }
        }
      }
      pull(opts) {
        this.pending.bytes += opts.max_bytes ?? 0;
        this.pending.msgs += opts.batch ?? 0;
        this.pending.requests++;
        const nc = this.consumer.api.nc;
        const subj = `${this.consumer.api.prefix}.CONSUMER.MSG.NEXT.${this.consumer.stream}.${this.consumer._info.name}`;
        this._push(() => {
          nc.publish(subj, JSON.stringify(opts), { reply: this.inbox });
          this.notify({ type: "next", options: opts });
        });
      }
      pullOptions() {
        const batch = this.opts.max_messages - this.pending.msgs;
        const max_bytes = this.opts.max_bytes - this.pending.bytes;
        const idle_heartbeat = (0, internal_1.nanos)(this.opts.idle_heartbeat);
        const expires = (0, internal_1.nanos)(this.opts.expires);
        const opts = { batch, max_bytes, idle_heartbeat, expires };
        if (isOverflowOptions(this.opts)) {
          opts.group = this.opts.group;
          if (this.opts.min_pending) {
            opts.min_pending = this.opts.min_pending;
          }
          if (this.opts.min_ack_pending) {
            opts.min_ack_pending = this.opts.min_ack_pending;
          }
        }
        return opts;
      }
      close() {
        this.stop();
        return this.iterClosed;
      }
      closed() {
        return this.iterClosed;
      }
      clearTimers() {
        var _a;
        (_a = this.monitor) == null ? void 0 : _a.cancel();
        this.monitor = null;
      }
      stop(err) {
        var _a, _b;
        if (this.done) {
          return;
        }
        this.consumer.api.nc.removeCloseListener(this.closeListener);
        (_a = this.sub) == null ? void 0 : _a.unsubscribe();
        this.clearTimers();
        (_b = this.statusIterator) == null ? void 0 : _b.stop();
        this._push(() => {
          super.stop(err);
          this.listeners.forEach((iter) => {
            iter.stop();
          });
        });
      }
      parseOptions(opts, refilling = false) {
        const args = opts || {};
        args.max_messages = args.max_messages || 0;
        args.max_bytes = args.max_bytes || 0;
        if (args.max_messages !== 0 && args.max_bytes !== 0) {
          throw internal_1.errors.InvalidArgumentError.format(["max_messages", "max_bytes"], "are mutually exclusive");
        }
        if (args.max_messages === 0) {
          args.max_messages = 100;
        }
        args.expires = args.expires || 3e4;
        if (args.expires < 1e3) {
          throw internal_1.errors.InvalidArgumentError.format("expires", "must be at least 1000ms");
        }
        args.idle_heartbeat = args.idle_heartbeat || args.expires / 2;
        args.idle_heartbeat = args.idle_heartbeat > 3e4 ? 3e4 : args.idle_heartbeat;
        if (args.idle_heartbeat < 500) {
          args.idle_heartbeat = 500;
        }
        if (refilling) {
          const minMsgs = Math.round(args.max_messages * 0.75) || 1;
          args.threshold_messages = args.threshold_messages || minMsgs;
          const minBytes = Math.round(args.max_bytes * 0.75) || 1;
          args.threshold_bytes = args.threshold_bytes || minBytes;
        }
        if (isOverflowOptions(opts)) {
          const { min, ok } = this.consumer.api.nc.features.get(internal_1.Feature.JS_PRIORITY_GROUPS);
          if (!ok) {
            throw new Error(`priority_groups require server ${min}`);
          }
          validateOverflowPullOptions(opts);
          if (opts.group) {
            args.group = opts.group;
          }
          if (opts.min_ack_pending) {
            args.min_ack_pending = opts.min_ack_pending;
          }
          if (opts.min_pending) {
            args.min_pending = opts.min_pending;
          }
        }
        return args;
      }
      status() {
        const iter = new internal_1.QueuedIteratorImpl();
        this.listeners.push(iter);
        return iter;
      }
    };
    __name(_PullConsumerMessagesImpl, "PullConsumerMessagesImpl");
    var PullConsumerMessagesImpl = _PullConsumerMessagesImpl;
    exports2.PullConsumerMessagesImpl = PullConsumerMessagesImpl;
    var _PullConsumerImpl = class _PullConsumerImpl {
      api;
      _info;
      stream;
      name;
      opts;
      type;
      messages;
      ordered;
      serial;
      orderedConsumerState;
      constructor(api, info, opts = null) {
        this.api = api;
        this._info = info;
        this.name = info.name;
        this.stream = info.stream_name;
        this.ordered = opts !== null;
        this.opts = opts || {};
        this.serial = 1;
        this.type = exports2.PullConsumerType.Unset;
      }
      debug() {
        var _a;
        console.log({
          serial: this.serial,
          cursor: (_a = this.orderedConsumerState) == null ? void 0 : _a.cursor
        });
      }
      isPullConsumer() {
        return true;
      }
      isPushConsumer() {
        return false;
      }
      consume(opts = {
        max_messages: 100,
        expires: 3e4
      }) {
        opts = { ...opts };
        if (this.ordered) {
          if (opts.bind) {
            return Promise.reject(internal_1.errors.InvalidArgumentError.format("bind", "is not supported"));
          }
          if (this.type === exports2.PullConsumerType.Fetch) {
            return Promise.reject(new internal_1.errors.InvalidOperationError("ordered consumer initialized as fetch"));
          }
          if (this.type === exports2.PullConsumerType.Consume) {
            return Promise.reject(new internal_1.errors.InvalidOperationError("ordered consumer doesn't support concurrent consume"));
          }
          this.type = exports2.PullConsumerType.Consume;
        }
        return Promise.resolve(new PullConsumerMessagesImpl(this, opts, true));
      }
      async fetch(opts = {
        max_messages: 100,
        expires: 3e4
      }) {
        var _a, _b, _c, _d, _e;
        opts = { ...opts };
        if (this.ordered) {
          if (opts.bind) {
            return Promise.reject(internal_1.errors.InvalidArgumentError.format("bind", "is not supported"));
          }
          if (this.type === exports2.PullConsumerType.Consume) {
            return Promise.reject(new internal_1.errors.InvalidOperationError("ordered consumer already initialized as consume"));
          }
          if (((_a = this.messages) == null ? void 0 : _a.done) === false) {
            return Promise.reject(new internal_1.errors.InvalidOperationError("ordered consumer doesn't support concurrent fetch"));
          }
          if (this.ordered) {
            if ((_c = (_b = this.orderedConsumerState) == null ? void 0 : _b.cursor) == null ? void 0 : _c.deliver_seq) {
              this._info.config.opt_start_seq = ((_d = this.orderedConsumerState) == null ? void 0 : _d.cursor.stream_seq) + 1;
            }
            if (((_e = this.orderedConsumerState) == null ? void 0 : _e.needsReset) === true) {
              await this._reset();
            }
          }
          this.type = exports2.PullConsumerType.Fetch;
        }
        const m = new PullConsumerMessagesImpl(this, opts);
        if (this.ordered) {
          this.messages = m;
        }
        return Promise.resolve(m);
      }
      async next(opts = { expires: 3e4 }) {
        opts = { ...opts };
        const fopts = opts;
        fopts.max_messages = 1;
        const iter = await this.fetch(fopts);
        try {
          for await (const m of iter) {
            return m;
          }
        } catch (err) {
          return Promise.reject(err);
        }
        return null;
      }
      delete() {
        const { stream_name, name } = this._info;
        return this.api.delete(stream_name, name);
      }
      getConsumerOpts() {
        const ocs = this.orderedConsumerState;
        this.serial++;
        this.name = `${ocs.namePrefix}_${this.serial}`;
        const conf = Object.assign({}, this._info.config, {
          name: this.name,
          deliver_policy: jsapi_types_1.DeliverPolicy.StartSequence,
          opt_start_seq: ocs.cursor.stream_seq + 1,
          ack_policy: jsapi_types_1.AckPolicy.None,
          inactive_threshold: (0, internal_1.nanos)(5 * 60 * 1e3),
          num_replicas: 1
        });
        delete conf.metadata;
        return conf;
      }
      async _reset() {
        if (this.messages === void 0) {
          throw new Error("not possible to reset");
        }
        this.delete().catch(() => {
        });
        const conf = this.getConsumerOpts();
        const ci = await this.api.add(this.stream, conf);
        this._info = ci;
        return ci;
      }
      async info(cached = false) {
        if (cached) {
          return Promise.resolve(this._info);
        }
        const { stream_name, name } = this._info;
        this._info = await this.api.info(stream_name, name);
        return this._info;
      }
    };
    __name(_PullConsumerImpl, "PullConsumerImpl");
    var PullConsumerImpl = _PullConsumerImpl;
    exports2.PullConsumerImpl = PullConsumerImpl;
    function validateOverflowPullOptions(opts) {
      if (isOverflowOptions(opts)) {
        (0, jsutil_1.minValidation)("group", opts.group);
        if (opts.group.length > 16) {
          throw internal_1.errors.InvalidArgumentError.format("group", "must be 16 characters or less");
        }
        const { min_pending, min_ack_pending } = opts;
        if (!min_pending && !min_ack_pending) {
          throw internal_1.errors.InvalidArgumentError.format(["min_pending", "min_ack_pending"], "at least one must be specified");
        }
        if (min_pending && typeof min_pending !== "number") {
          throw internal_1.errors.InvalidArgumentError.format(["min_pending"], "must be a number");
        }
        if (min_ack_pending && typeof min_ack_pending !== "number") {
          throw internal_1.errors.InvalidArgumentError.format(["min_ack_pending"], "must be a number");
        }
      }
    }
    __name(validateOverflowPullOptions, "validateOverflowPullOptions");
  }
});

// node_modules/@nats-io/jetstream/lib/pushconsumer.js
var require_pushconsumer = __commonJS({
  "node_modules/@nats-io/jetstream/lib/pushconsumer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PushConsumerImpl = exports2.PushConsumerMessagesImpl = void 0;
    var jsmsg_1 = require_jsmsg();
    var jsapi_types_1 = require_jsapi_types();
    var internal_1 = require_internal_mod2();
    var jserrors_1 = require_jserrors();
    var _PushConsumerMessagesImpl = class _PushConsumerMessagesImpl extends internal_1.QueuedIteratorImpl {
      consumer;
      sub;
      monitor;
      listeners;
      abortOnMissingResource;
      callback;
      ordered;
      cursor;
      namePrefix;
      deliverPrefix;
      serial;
      createFails;
      statusIterator;
      cancelables;
      constructor(c, userOptions = {}, internalOptions = {}) {
        super();
        this.consumer = c;
        this.monitor = null;
        this.listeners = [];
        this.cancelables = [];
        this.abortOnMissingResource = userOptions.abort_on_missing_resource === true;
        this.callback = userOptions.callback || null;
        this.noIterator = this.callback !== null;
        this.namePrefix = null;
        this.deliverPrefix = null;
        this.ordered = internalOptions.ordered === true;
        this.serial = 1;
        if (this.ordered) {
          this.namePrefix = internalOptions.name_prefix ?? `oc_${internal_1.nuid.next()}`;
          this.deliverPrefix = internalOptions.deliver_prefix ?? (0, internal_1.createInbox)(this.consumer.api.nc.options.inboxPrefix);
          this.cursor = { stream_seq: 1, deliver_seq: 0 };
          const startSeq = c._info.config.opt_start_seq || 0;
          this.cursor.stream_seq = startSeq > 0 ? startSeq - 1 : 0;
          this.createFails = 0;
        }
        this.start();
      }
      reset() {
        var _a;
        const { name } = (_a = this.consumer._info) == null ? void 0 : _a.config;
        if (name) {
          this.consumer.api.delete(this.consumer.stream, name).catch(() => {
          });
        }
        const config = this.getConsumerOpts();
        this.cursor.deliver_seq = 0;
        this.consumer.name = config.name;
        this.consumer.serial = this.serial;
        this.consumer.api.nc._resub(this.sub, config.deliver_subject);
        this.consumer.api.add(this.consumer.stream, config).then((ci) => {
          this.createFails = 0;
          this.consumer._info = ci;
          this.notify({ type: "ordered_consumer_recreated", name: ci.name });
        }).catch((err) => {
          this.createFails++;
          if (err.message === "stream not found") {
            this.notify({
              type: "stream_not_found",
              name: this.consumer.stream,
              consumerCreateFails: this.createFails
            });
            if (this.abortOnMissingResource) {
              this.stop(err);
              return;
            }
          }
          if (this.createFails >= 30 && this.received === 0) {
            this.stop(err);
          }
          const bo = (0, internal_1.backoff)();
          const c = (0, internal_1.delay)(bo.backoff(this.createFails));
          c.then(() => {
            if (!this.done) {
              this.reset();
            }
          }).catch(() => {
          }).finally(() => {
            const idx = this.cancelables.indexOf(c);
            if (idx !== -1) {
              this.cancelables = this.cancelables.splice(idx, idx);
            }
          });
          this.cancelables.push(c);
        });
      }
      getConsumerOpts() {
        const src = Object.assign({}, this.consumer._info.config);
        this.serial++;
        const name = `${this.namePrefix}_${this.serial}`;
        return Object.assign(src, {
          name,
          deliver_policy: jsapi_types_1.DeliverPolicy.StartSequence,
          opt_start_seq: this.cursor.stream_seq + 1,
          ack_policy: jsapi_types_1.AckPolicy.None,
          inactive_threshold: (0, internal_1.nanos)(5 * 60 * 1e3),
          num_replicas: 1,
          flow_control: true,
          idle_heartbeat: (0, internal_1.nanos)(30 * 1e3),
          deliver_subject: `${this.deliverPrefix}.${this.serial}`
        });
      }
      closed() {
        return this.iterClosed;
      }
      close() {
        this.stop();
        return this.iterClosed;
      }
      stop(err) {
        var _a, _b;
        if (this.done) {
          return;
        }
        (_a = this.statusIterator) == null ? void 0 : _a.stop();
        (_b = this.monitor) == null ? void 0 : _b.cancel();
        this.monitor = null;
        this.cancelables.forEach((c) => {
          c.cancel();
        });
        Promise.all(this.cancelables).then(() => {
          this.cancelables = [];
        }).catch(() => {
        }).finally(() => {
          this._push(() => {
            super.stop(err);
            this.listeners.forEach((n) => {
              n.stop();
            });
          });
        });
      }
      _push(r) {
        if (!this.callback) {
          super.push(r);
        } else {
          const fn = typeof r === "function" ? r : null;
          try {
            if (!fn) {
              const m = r;
              this.received++;
              this.callback(m);
              this.processed++;
            } else {
              fn();
            }
          } catch (err) {
            this.stop(err);
          }
        }
      }
      status() {
        const iter = new internal_1.QueuedIteratorImpl();
        this.listeners.push(iter);
        return iter;
      }
      start() {
        const { deliver_subject: subject, deliver_group: queue, idle_heartbeat: hbNanos } = this.consumer._info.config;
        if (!subject) {
          throw new Error("bad consumer info");
        }
        if (hbNanos) {
          const ms = (0, internal_1.millis)(hbNanos);
          this.monitor = new internal_1.IdleHeartbeatMonitor(ms, (count) => {
            this.notify({ type: "heartbeats_missed", count });
            if (this.ordered) {
              this.reset();
            }
            return false;
          }, { maxOut: 2 });
          (async () => {
            var _a, _b;
            this.statusIterator = this.consumer.api.nc.status();
            for await (const s of this.statusIterator) {
              switch (s.type) {
                case "disconnect":
                  (_a = this.monitor) == null ? void 0 : _a.cancel();
                  break;
                case "reconnect":
                  (_b = this.monitor) == null ? void 0 : _b.restart();
                  break;
                default:
              }
            }
          })();
        }
        this.sub = this.consumer.api.nc.subscribe(subject, {
          queue,
          callback: /* @__PURE__ */ __name((err, msg) => {
            var _a, _b, _c;
            if (err) {
              this.stop(err);
              return;
            }
            (_a = this.monitor) == null ? void 0 : _a.work();
            const isProtocol = this.ordered ? msg.subject.indexOf(this == null ? void 0 : this.deliverPrefix) === 0 : msg.subject === subject;
            if (isProtocol) {
              if (msg.subject !== this.sub.subject) {
                return;
              }
              const status = new jserrors_1.JetStreamStatus(msg);
              if (status.isFlowControlRequest()) {
                this._push(() => {
                  msg.respond();
                  this.notify({ type: "flow_control" });
                });
                return;
              }
              if (status.isIdleHeartbeat()) {
                const lastConsumerSequence = parseInt(((_b = msg.headers) == null ? void 0 : _b.get("Nats-Last-Consumer")) || "0");
                const lastStreamSequence = parseInt(((_c = msg.headers) == null ? void 0 : _c.get("Nats-Last-Stream")) ?? "0");
                this.notify({
                  type: "heartbeat",
                  lastStreamSequence,
                  lastConsumerSequence
                });
                return;
              }
              const code = status.code;
              const description = status.description;
              if (status.isConsumerDeleted()) {
                this.notify({ type: "consumer_deleted", code, description });
              }
              if (this.abortOnMissingResource) {
                this._push(() => {
                  this.stop(status.toError());
                });
                return;
              }
            } else {
              const m = (0, jsmsg_1.toJsMsg)(msg);
              if (this.ordered) {
                const dseq = m.info.deliverySequence;
                if (dseq !== this.cursor.deliver_seq + 1) {
                  this.reset();
                  return;
                }
                this.cursor.deliver_seq = dseq;
                this.cursor.stream_seq = m.info.streamSequence;
              }
              this._push(m);
            }
          }, "callback")
        });
        this.sub.closed.then(() => {
          this._push(() => {
            this.stop();
          });
        });
        this.closed().then(() => {
          var _a;
          (_a = this.sub) == null ? void 0 : _a.unsubscribe();
        });
      }
      notify(n) {
        if (this.listeners.length > 0) {
          (() => {
            this.listeners.forEach((l) => {
              const qi = l;
              if (!qi.done) {
                qi.push(n);
              }
            });
          })();
        }
      }
    };
    __name(_PushConsumerMessagesImpl, "PushConsumerMessagesImpl");
    var PushConsumerMessagesImpl = _PushConsumerMessagesImpl;
    exports2.PushConsumerMessagesImpl = PushConsumerMessagesImpl;
    var _PushConsumerImpl = class _PushConsumerImpl {
      api;
      _info;
      stream;
      name;
      bound;
      ordered;
      started;
      serial;
      opts;
      constructor(api, info, opts = {}) {
        this.api = api;
        this._info = info;
        this.stream = info.stream_name;
        this.name = info.name;
        this.bound = opts.bound === true;
        this.started = false;
        this.opts = opts;
        this.serial = 0;
        this.ordered = opts.ordered || false;
        if (this.ordered) {
          this.serial = 1;
        }
      }
      consume(userOptions = {}) {
        userOptions = { ...userOptions };
        if (this.started) {
          return Promise.reject(new internal_1.errors.InvalidOperationError("consumer already started"));
        }
        if (!this._info.config.deliver_subject) {
          return Promise.reject(new Error("deliver_subject is not set, not a push consumer"));
        }
        if (!this._info.config.deliver_group && this._info.push_bound) {
          return Promise.reject(new internal_1.errors.InvalidOperationError("consumer is already bound"));
        }
        const v = new PushConsumerMessagesImpl(this, userOptions, this.opts);
        this.started = true;
        v.closed().then(() => {
          this.started = false;
        });
        return Promise.resolve(v);
      }
      delete() {
        if (this.bound) {
          return Promise.reject(new internal_1.errors.InvalidOperationError("bound consumers cannot delete"));
        }
        const { stream_name, name } = this._info;
        return this.api.delete(stream_name, name);
      }
      async info(cached) {
        if (this.bound) {
          return Promise.reject(new internal_1.errors.InvalidOperationError("bound consumers cannot info"));
        }
        if (cached) {
          return Promise.resolve(this._info);
        }
        const info = await this.api.info(this.stream, this.name);
        this._info = info;
        return info;
      }
      isPullConsumer() {
        return false;
      }
      isPushConsumer() {
        return true;
      }
    };
    __name(_PushConsumerImpl, "PushConsumerImpl");
    var PushConsumerImpl = _PushConsumerImpl;
    exports2.PushConsumerImpl = PushConsumerImpl;
  }
});

// node_modules/@nats-io/jetstream/lib/jsmstream_api.js
var require_jsmstream_api = __commonJS({
  "node_modules/@nats-io/jetstream/lib/jsmstream_api.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StreamsImpl = exports2.StoredMsgImpl = exports2.StreamAPIImpl = exports2.StreamImpl = exports2.ConsumersImpl = void 0;
    exports2.convertStreamSourceDomain = convertStreamSourceDomain;
    var internal_1 = require_internal_mod2();
    var jsbaseclient_api_1 = require_jsbaseclient_api();
    var jslister_1 = require_jslister();
    var jsutil_1 = require_jsutil();
    var types_1 = require_types3();
    var jsapi_types_1 = require_jsapi_types();
    var consumer_1 = require_consumer();
    var jsmconsumer_api_1 = require_jsmconsumer_api();
    var pushconsumer_1 = require_pushconsumer();
    var jserrors_1 = require_jserrors();
    function convertStreamSourceDomain(s) {
      if (s === void 0) {
        return void 0;
      }
      const { domain } = s;
      if (domain === void 0) {
        return s;
      }
      const copy = Object.assign({}, s);
      delete copy.domain;
      if (domain === "") {
        return copy;
      }
      if (copy.external) {
        throw internal_1.InvalidArgumentError.format(["domain", "external"], "are mutually exclusive");
      }
      copy.external = { api: `$JS.${domain}.API` };
      return copy;
    }
    __name(convertStreamSourceDomain, "convertStreamSourceDomain");
    var _ConsumersImpl = class _ConsumersImpl {
      api;
      notified;
      constructor(api) {
        this.api = api;
        this.notified = false;
      }
      checkVersion() {
        const fv = this.api.nc.features.get(internal_1.Feature.JS_SIMPLIFICATION);
        if (!fv.ok) {
          return Promise.reject(new Error(`consumers framework is only supported on servers ${fv.min} or better`));
        }
        return Promise.resolve();
      }
      async getPushConsumer(stream, name) {
        await this.checkVersion();
        (0, jsutil_1.minValidation)("stream", stream);
        if (typeof name === "string") {
          (0, jsutil_1.minValidation)("name", name);
          const ci = await this.api.info(stream, name);
          if (typeof ci.config.deliver_subject !== "string") {
            return Promise.reject(new Error("not a push consumer"));
          }
          return new pushconsumer_1.PushConsumerImpl(this.api, ci);
        } else if (name === void 0) {
          return this.getOrderedPushConsumer(stream);
        } else if ((0, types_1.isOrderedPushConsumerOptions)(name)) {
          const opts = name;
          return this.getOrderedPushConsumer(stream, opts);
        }
        return Promise.reject(new Error("unsupported push consumer type"));
      }
      async getOrderedPushConsumer(stream, opts = {}) {
        opts = Object.assign({}, opts);
        let { name_prefix, deliver_prefix, filter_subjects } = opts;
        delete opts.deliver_prefix;
        delete opts.name_prefix;
        delete opts.filter_subjects;
        if (typeof opts.opt_start_seq === "number") {
          opts.deliver_policy = jsapi_types_1.DeliverPolicy.StartSequence;
        }
        if (typeof opts.opt_start_time === "string") {
          opts.deliver_policy = jsapi_types_1.DeliverPolicy.StartTime;
        }
        name_prefix = name_prefix || `oc_${internal_1.nuid.next()}`;
        (0, jsutil_1.minValidation)("name_prefix", name_prefix);
        deliver_prefix = deliver_prefix || (0, internal_1.createInbox)(this.api.nc.options.inboxPrefix);
        (0, jsutil_1.minValidation)("deliver_prefix", name_prefix);
        const cc = Object.assign({}, opts);
        cc.ack_policy = jsapi_types_1.AckPolicy.None;
        cc.inactive_threshold = (0, internal_1.nanos)(5 * 60 * 1e3);
        cc.num_replicas = 1;
        cc.max_deliver = 1;
        cc.flow_control = true;
        cc.idle_heartbeat = (0, internal_1.nanos)(3e4);
        if (Array.isArray(filter_subjects)) {
          cc.filter_subjects = filter_subjects;
        }
        if (typeof filter_subjects === "string") {
          cc.filter_subject = filter_subjects;
        }
        if (typeof cc.filter_subjects === "undefined" && typeof cc.filter_subject === "undefined") {
          cc.filter_subject = ">";
        }
        cc.name = `${name_prefix}_1`;
        cc.deliver_subject = `${deliver_prefix}.1`;
        const ci = await this.api.add(stream, cc);
        const iopts = {
          name_prefix,
          deliver_prefix,
          ordered: true
        };
        return new pushconsumer_1.PushConsumerImpl(this.api, ci, iopts);
      }
      getBoundPushConsumer(opts) {
        if ((0, types_1.isBoundPushConsumerOptions)(opts)) {
          const ci = { config: opts };
          return Promise.resolve(new pushconsumer_1.PushConsumerImpl(this.api, ci, { bound: true }));
        } else {
          return Promise.reject(internal_1.errors.InvalidArgumentError.format("deliver_subject", "is required"));
        }
      }
      async get(stream, name) {
        await this.checkVersion();
        if (typeof name === "string") {
          const ci = await this.api.info(stream, name);
          if (typeof ci.config.deliver_subject === "string") {
            return Promise.reject(new Error("not a pull consumer"));
          } else {
            return new consumer_1.PullConsumerImpl(this.api, ci);
          }
        } else {
          return this.ordered(stream, name);
        }
      }
      getConsumerFromInfo(ci) {
        if (typeof ci.config.deliver_subject === "string") {
          throw new Error("not a pull consumer");
        }
        return new consumer_1.PullConsumerImpl(this.api, ci);
      }
      async ordered(stream, opts = {}) {
        await this.checkVersion();
        const impl = this.api;
        const sapi = new StreamAPIImpl(impl.nc, impl.opts);
        await sapi.info(stream);
        if (typeof opts.name_prefix === "string") {
          (0, jsutil_1.minValidation)("name_prefix", opts.name_prefix);
        }
        opts.name_prefix = opts.name_prefix || internal_1.nuid.next();
        const name = `${opts.name_prefix}_1`;
        const config = {
          name,
          deliver_policy: jsapi_types_1.DeliverPolicy.StartSequence,
          opt_start_seq: opts.opt_start_seq || 1,
          ack_policy: jsapi_types_1.AckPolicy.None,
          inactive_threshold: (0, internal_1.nanos)(5 * 60 * 1e3),
          num_replicas: 1,
          max_deliver: 1,
          mem_storage: true
        };
        if (opts.headers_only === true) {
          config.headers_only = true;
        }
        if (Array.isArray(opts.filter_subjects)) {
          config.filter_subjects = opts.filter_subjects;
        }
        if (typeof opts.filter_subjects === "string") {
          config.filter_subject = opts.filter_subjects;
        }
        if (opts.replay_policy) {
          config.replay_policy = opts.replay_policy;
        }
        config.deliver_policy = opts.deliver_policy || jsapi_types_1.DeliverPolicy.StartSequence;
        if (opts.deliver_policy === jsapi_types_1.DeliverPolicy.All || opts.deliver_policy === jsapi_types_1.DeliverPolicy.LastPerSubject || opts.deliver_policy === jsapi_types_1.DeliverPolicy.New || opts.deliver_policy === jsapi_types_1.DeliverPolicy.Last) {
          delete config.opt_start_seq;
          config.deliver_policy = opts.deliver_policy;
        }
        if (config.deliver_policy === jsapi_types_1.DeliverPolicy.LastPerSubject) {
          if (typeof config.filter_subjects === "undefined" && typeof config.filter_subject === "undefined") {
            config.filter_subject = ">";
          }
        }
        if (opts.opt_start_time) {
          delete config.opt_start_seq;
          config.deliver_policy = jsapi_types_1.DeliverPolicy.StartTime;
          config.opt_start_time = opts.opt_start_time;
        }
        if (opts.inactive_threshold) {
          config.inactive_threshold = (0, internal_1.nanos)(opts.inactive_threshold);
        }
        const ci = await this.api.add(stream, config);
        return Promise.resolve(new consumer_1.PullConsumerImpl(this.api, ci, opts));
      }
    };
    __name(_ConsumersImpl, "ConsumersImpl");
    var ConsumersImpl = _ConsumersImpl;
    exports2.ConsumersImpl = ConsumersImpl;
    var _StreamImpl = class _StreamImpl {
      api;
      _info;
      constructor(api, info) {
        this.api = api;
        this._info = info;
      }
      get name() {
        return this._info.config.name;
      }
      alternates() {
        return this.info().then((si) => {
          return si.alternates ? si.alternates : [];
        });
      }
      async best() {
        await this.info();
        if (this._info.alternates) {
          const asi = await this.api.info(this._info.alternates[0].name);
          return new _StreamImpl(this.api, asi);
        } else {
          return this;
        }
      }
      info(cached = false, opts) {
        if (cached) {
          return Promise.resolve(this._info);
        }
        return this.api.info(this.name, opts).then((si) => {
          this._info = si;
          return this._info;
        });
      }
      getConsumer(name) {
        return new ConsumersImpl(new jsmconsumer_api_1.ConsumerAPIImpl(this.api.nc, this.api.opts)).get(this.name, name);
      }
      getPushConsumer(name) {
        return new ConsumersImpl(new jsmconsumer_api_1.ConsumerAPIImpl(this.api.nc, this.api.opts)).getPushConsumer(this.name, name);
      }
      getMessage(query) {
        return this.api.getMessage(this.name, query);
      }
      deleteMessage(seq, erase) {
        return this.api.deleteMessage(this.name, seq, erase);
      }
    };
    __name(_StreamImpl, "StreamImpl");
    var StreamImpl = _StreamImpl;
    exports2.StreamImpl = StreamImpl;
    var _StreamAPIImpl = class _StreamAPIImpl extends jsbaseclient_api_1.BaseApiClientImpl {
      constructor(nc, opts) {
        super(nc, opts);
      }
      checkStreamConfigVersions(cfg) {
        const nci = this.nc;
        if (cfg.metadata) {
          const { min, ok } = nci.features.get(internal_1.Feature.JS_STREAM_CONSUMER_METADATA);
          if (!ok) {
            throw new Error(`stream 'metadata' requires server ${min}`);
          }
        }
        if (cfg.first_seq) {
          const { min, ok } = nci.features.get(internal_1.Feature.JS_STREAM_FIRST_SEQ);
          if (!ok) {
            throw new Error(`stream 'first_seq' requires server ${min}`);
          }
        }
        if (cfg.subject_transform) {
          const { min, ok } = nci.features.get(internal_1.Feature.JS_STREAM_SUBJECT_TRANSFORM);
          if (!ok) {
            throw new Error(`stream 'subject_transform' requires server ${min}`);
          }
        }
        if (cfg.compression) {
          const { min, ok } = nci.features.get(internal_1.Feature.JS_STREAM_COMPRESSION);
          if (!ok) {
            throw new Error(`stream 'compression' requires server ${min}`);
          }
        }
        if (cfg.consumer_limits) {
          const { min, ok } = nci.features.get(internal_1.Feature.JS_DEFAULT_CONSUMER_LIMITS);
          if (!ok) {
            throw new Error(`stream 'consumer_limits' requires server ${min}`);
          }
        }
        function validateStreamSource(context, src) {
          var _a;
          const count = ((_a = src == null ? void 0 : src.subject_transforms) == null ? void 0 : _a.length) || 0;
          if (count > 0) {
            const { min, ok } = nci.features.get(internal_1.Feature.JS_STREAM_SOURCE_SUBJECT_TRANSFORM);
            if (!ok) {
              throw new Error(`${context} 'subject_transforms' requires server ${min}`);
            }
          }
        }
        __name(validateStreamSource, "validateStreamSource");
        if (cfg.sources) {
          cfg.sources.forEach((src) => {
            validateStreamSource("stream sources", src);
          });
        }
        if (cfg.mirror) {
          validateStreamSource("stream mirror", cfg.mirror);
        }
      }
      async add(cfg) {
        var _a;
        this.checkStreamConfigVersions(cfg);
        (0, jsutil_1.validateStreamName)(cfg.name);
        cfg.mirror = convertStreamSourceDomain(cfg.mirror);
        cfg.sources = (_a = cfg.sources) == null ? void 0 : _a.map(convertStreamSourceDomain);
        const r = await this._request(`${this.prefix}.STREAM.CREATE.${cfg.name}`, cfg);
        const si = r;
        this._fixInfo(si);
        return si;
      }
      async delete(stream) {
        (0, jsutil_1.validateStreamName)(stream);
        const r = await this._request(`${this.prefix}.STREAM.DELETE.${stream}`);
        const cr = r;
        return cr.success;
      }
      async update(name, cfg = {}) {
        var _a;
        if (typeof name === "object") {
          const sc = name;
          name = sc.name;
          cfg = sc;
          console.trace(`\x1B[33m >> streams.update(config: StreamConfig) api changed to streams.update(name: string, config: StreamUpdateConfig) - this shim will be removed - update your code.  \x1B[0m`);
        }
        this.checkStreamConfigVersions(cfg);
        (0, jsutil_1.validateStreamName)(name);
        const old = await this.info(name);
        const update = Object.assign(old.config, cfg);
        update.mirror = convertStreamSourceDomain(update.mirror);
        update.sources = (_a = update.sources) == null ? void 0 : _a.map(convertStreamSourceDomain);
        const r = await this._request(`${this.prefix}.STREAM.UPDATE.${name}`, update);
        const si = r;
        this._fixInfo(si);
        return si;
      }
      async info(name, data) {
        (0, jsutil_1.validateStreamName)(name);
        const subj = `${this.prefix}.STREAM.INFO.${name}`;
        const r = await this._request(subj, data);
        let si = r;
        let { total, limit } = si;
        let have = si.state.subjects ? Object.getOwnPropertyNames(si.state.subjects).length : 1;
        if (total && total > have) {
          const infos = [si];
          const paged = data || {};
          let i = 0;
          while (total > have) {
            i++;
            paged.offset = limit * i;
            const r2 = await this._request(subj, paged);
            total = r2.total;
            infos.push(r2);
            const count = Object.getOwnPropertyNames(r2.state.subjects).length;
            have += count;
            if (count < limit) {
              break;
            }
          }
          let subjects = {};
          for (let i2 = 0; i2 < infos.length; i2++) {
            si = infos[i2];
            if (si.state.subjects) {
              subjects = Object.assign(subjects, si.state.subjects);
            }
          }
          si.offset = 0;
          si.total = 0;
          si.limit = 0;
          si.state.subjects = subjects;
        }
        this._fixInfo(si);
        return si;
      }
      list(subject = "") {
        const payload = (subject == null ? void 0 : subject.length) ? { subject } : {};
        const listerFilter = /* @__PURE__ */ __name((v) => {
          const slr = v;
          slr.streams.forEach((si) => {
            this._fixInfo(si);
          });
          return slr.streams;
        }, "listerFilter");
        const subj = `${this.prefix}.STREAM.LIST`;
        return new jslister_1.ListerImpl(subj, listerFilter, this, payload);
      }
      // FIXME: init of sealed, deny_delete, deny_purge shouldn't be necessary
      //  https://github.com/nats-io/nats-server/issues/2633
      _fixInfo(si) {
        si.config.sealed = si.config.sealed || false;
        si.config.deny_delete = si.config.deny_delete || false;
        si.config.deny_purge = si.config.deny_purge || false;
        si.config.allow_rollup_hdrs = si.config.allow_rollup_hdrs || false;
      }
      async purge(name, opts) {
        if (opts) {
          const { keep, seq } = opts;
          if (typeof keep === "number" && typeof seq === "number") {
            throw internal_1.InvalidArgumentError.format(["keep", "seq"], "are mutually exclusive");
          }
        }
        (0, jsutil_1.validateStreamName)(name);
        const v = await this._request(`${this.prefix}.STREAM.PURGE.${name}`, opts);
        return v;
      }
      async deleteMessage(stream, seq, erase = true) {
        (0, jsutil_1.validateStreamName)(stream);
        const dr = { seq };
        if (!erase) {
          dr.no_erase = true;
        }
        const r = await this._request(`${this.prefix}.STREAM.MSG.DELETE.${stream}`, dr);
        const cr = r;
        return cr.success;
      }
      async getMessage(stream, query) {
        (0, jsutil_1.validateStreamName)(stream);
        try {
          const r = await this._request(`${this.prefix}.STREAM.MSG.GET.${stream}`, query);
          const sm = r;
          return new StoredMsgImpl(sm);
        } catch (err) {
          if (err instanceof jserrors_1.JetStreamApiError && err.code === jserrors_1.JetStreamApiCodes.NoMessageFound) {
            return null;
          }
          return Promise.reject(err);
        }
      }
      find(subject) {
        return this.findStream(subject);
      }
      names(subject = "") {
        const payload = (subject == null ? void 0 : subject.length) ? { subject } : {};
        const listerFilter = /* @__PURE__ */ __name((v) => {
          const sr = v;
          return sr.streams;
        }, "listerFilter");
        const subj = `${this.prefix}.STREAM.NAMES`;
        return new jslister_1.ListerImpl(subj, listerFilter, this, payload);
      }
      async get(name) {
        const si = await this.info(name);
        return Promise.resolve(new StreamImpl(this, si));
      }
    };
    __name(_StreamAPIImpl, "StreamAPIImpl");
    var StreamAPIImpl = _StreamAPIImpl;
    exports2.StreamAPIImpl = StreamAPIImpl;
    var _StoredMsgImpl = class _StoredMsgImpl {
      _header;
      smr;
      constructor(smr) {
        this.smr = smr;
      }
      get pending() {
        return 0;
      }
      get lastSequence() {
        return 0;
      }
      get subject() {
        return this.smr.message.subject;
      }
      get seq() {
        return this.smr.message.seq;
      }
      get timestamp() {
        return this.smr.message.time;
      }
      get time() {
        return new Date(Date.parse(this.timestamp));
      }
      get data() {
        return this.smr.message.data ? this._parse(this.smr.message.data) : internal_1.Empty;
      }
      get header() {
        if (!this._header) {
          if (this.smr.message.hdrs) {
            const hd = this._parse(this.smr.message.hdrs);
            this._header = internal_1.MsgHdrsImpl.decode(hd);
          } else {
            this._header = (0, internal_1.headers)();
          }
        }
        return this._header;
      }
      _parse(s) {
        const bs = atob(s);
        const len = bs.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = bs.charCodeAt(i);
        }
        return bytes;
      }
      json(reviver) {
        return JSON.parse(new TextDecoder().decode(this.data), reviver);
      }
      string() {
        return internal_1.TD.decode(this.data);
      }
    };
    __name(_StoredMsgImpl, "StoredMsgImpl");
    __publicField(_StoredMsgImpl, "jc");
    var StoredMsgImpl = _StoredMsgImpl;
    exports2.StoredMsgImpl = StoredMsgImpl;
    var _StreamsImpl = class _StreamsImpl {
      api;
      constructor(api) {
        this.api = api;
      }
      get(stream) {
        return this.api.info(stream).then((si) => {
          return new StreamImpl(this.api, si);
        });
      }
    };
    __name(_StreamsImpl, "StreamsImpl");
    var StreamsImpl = _StreamsImpl;
    exports2.StreamsImpl = StreamsImpl;
  }
});

// node_modules/@nats-io/jetstream/lib/jsm_direct.js
var require_jsm_direct = __commonJS({
  "node_modules/@nats-io/jetstream/lib/jsm_direct.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DirectConsumer = exports2.DirectMsgImpl = exports2.DirectStreamAPIImpl = void 0;
    var jsbaseclient_api_1 = require_jsbaseclient_api();
    var types_1 = require_types3();
    var internal_1 = require_internal_mod2();
    var jsutil_1 = require_jsutil();
    var jserrors_1 = require_jserrors();
    var _DirectStreamAPIImpl = class _DirectStreamAPIImpl extends jsbaseclient_api_1.BaseApiClientImpl {
      constructor(nc, opts) {
        super(nc, opts);
      }
      async getMessage(stream, query) {
        var _a;
        (0, jsutil_1.validateStreamName)(stream);
        if ("start_time" in query) {
          const { min, ok } = this.nc.features.get(internal_1.Feature.JS_BATCH_DIRECT_GET);
          if (!ok) {
            throw new Error(`start_time direct option require server ${min}`);
          }
        }
        let qq = query;
        const { last_by_subj } = qq;
        if (last_by_subj) {
          qq = null;
        }
        const payload = qq ? JSON.stringify(qq) : internal_1.Empty;
        const pre = this.opts.apiPrefix || "$JS.API";
        const subj = last_by_subj ? `${pre}.DIRECT.GET.${stream}.${last_by_subj}` : `${pre}.DIRECT.GET.${stream}`;
        const r = await this.nc.request(subj, payload, { timeout: this.timeout });
        if (((_a = r.headers) == null ? void 0 : _a.code) !== 0) {
          const status = new jserrors_1.JetStreamStatus(r);
          if (status.isMessageNotFound()) {
            return Promise.resolve(null);
          } else {
            return Promise.reject(status.toError());
          }
        }
        const dm = new DirectMsgImpl(r);
        return Promise.resolve(dm);
      }
      getBatch(stream, opts) {
        opts.batch = opts.batch || 1024;
        return this.get(stream, opts);
      }
      getLastMessagesFor(stream, opts) {
        return this.get(stream, opts);
      }
      get(stream, opts) {
        opts = { ...opts };
        const { min, ok } = this.nc.features.get(internal_1.Feature.JS_BATCH_DIRECT_GET);
        if (!ok) {
          return Promise.reject(new Error(`batch direct require server ${min}`));
        }
        (0, jsutil_1.validateStreamName)(stream);
        const callback = typeof opts.callback === "function" ? opts.callback : null;
        const iter = new internal_1.QueuedIteratorImpl();
        function pushIter(done, d) {
          if (done) {
            iter.push(() => {
              done.err ? iter.stop(done.err) : iter.stop();
            });
            return;
          }
          iter.push(d);
        }
        __name(pushIter, "pushIter");
        function pushCb(done, m) {
          const cb = callback;
          if (typeof m === "function") {
            m();
            return;
          }
          cb(done, m);
        }
        __name(pushCb, "pushCb");
        if (callback) {
          iter.iterClosed.then((err) => {
            push({ err: err ? err : void 0 }, {});
            sub.unsubscribe();
          });
        }
        const push = callback ? pushCb : pushIter;
        const inbox = (0, internal_1.createInbox)(this.nc.options.inboxPrefix);
        let batchSupported = false;
        const sub = this.nc.subscribe(inbox, {
          timeout: 5e3,
          callback: /* @__PURE__ */ __name((err, msg) => {
            var _a;
            if (err) {
              iter.stop(err);
              sub.unsubscribe();
              return;
            }
            const status = jserrors_1.JetStreamStatus.maybeParseStatus(msg);
            if (status) {
              if (status.isEndOfBatch()) {
                push({}, () => {
                  iter.stop();
                });
              } else {
                const err2 = status.toError();
                push({ err: err2 }, () => {
                  iter.stop(err2);
                });
              }
              return;
            }
            if (!batchSupported) {
              if (typeof ((_a = msg.headers) == null ? void 0 : _a.get("Nats-Num-Pending")) !== "string") {
                sub.unsubscribe();
                push({}, () => {
                  iter.stop();
                });
              } else {
                batchSupported = true;
              }
            }
            push(null, new DirectMsgImpl(msg));
          }, "callback")
        });
        const pre = this.opts.apiPrefix || "$JS.API";
        const subj = `${pre}.DIRECT.GET.${stream}`;
        const payload = JSON.stringify(opts, (key, value) => {
          if ((key === "up_to_time" || key === "start_time") && value instanceof Date) {
            return value.toISOString();
          }
          return value;
        });
        this.nc.publish(subj, payload, { reply: inbox });
        return Promise.resolve(iter);
      }
    };
    __name(_DirectStreamAPIImpl, "DirectStreamAPIImpl");
    var DirectStreamAPIImpl = _DirectStreamAPIImpl;
    exports2.DirectStreamAPIImpl = DirectStreamAPIImpl;
    var _DirectMsgImpl = class _DirectMsgImpl {
      data;
      header;
      constructor(m) {
        if (!m.headers) {
          throw new Error("headers expected");
        }
        this.data = m.data;
        this.header = m.headers;
      }
      get subject() {
        return this.header.last(types_1.DirectMsgHeaders.Subject);
      }
      get seq() {
        const v = this.header.last(types_1.DirectMsgHeaders.Sequence);
        return typeof v === "string" ? parseInt(v) : 0;
      }
      get time() {
        return new Date(Date.parse(this.timestamp));
      }
      get timestamp() {
        return this.header.last(types_1.DirectMsgHeaders.TimeStamp);
      }
      get stream() {
        return this.header.last(types_1.DirectMsgHeaders.Stream);
      }
      get lastSequence() {
        const v = this.header.last(types_1.DirectMsgHeaders.LastSequence);
        return typeof v === "string" ? parseInt(v) : 0;
      }
      get pending() {
        const v = this.header.last(types_1.DirectMsgHeaders.NumPending);
        return typeof v === "string" ? parseInt(v) - 1 : -1;
      }
      json(reviver) {
        return JSON.parse(new TextDecoder().decode(this.data), reviver);
      }
      string() {
        return internal_1.TD.decode(this.data);
      }
    };
    __name(_DirectMsgImpl, "DirectMsgImpl");
    var DirectMsgImpl = _DirectMsgImpl;
    exports2.DirectMsgImpl = DirectMsgImpl;
    function isDirectBatchStartTime(t) {
      return typeof t === "object" && "start_time" in t;
    }
    __name(isDirectBatchStartTime, "isDirectBatchStartTime");
    function isMaxBytes(t) {
      return typeof t === "object" && "max_bytes" in t;
    }
    __name(isMaxBytes, "isMaxBytes");
    var _DirectConsumer = class _DirectConsumer {
      stream;
      api;
      cursor;
      listeners;
      start;
      constructor(stream, api, start) {
        this.stream = stream;
        this.api = api;
        this.cursor = { last: 0 };
        this.listeners = [];
        this.start = start;
      }
      getOptions(opts) {
        opts = opts || {};
        const dbo = {};
        if (this.cursor.last === 0) {
          if (isDirectBatchStartTime(this.start)) {
            dbo.start_time = this.start.start_time;
          } else {
            dbo.seq = this.start.seq || 1;
          }
        } else {
          dbo.seq = this.cursor.last + 1;
        }
        if (isMaxBytes(opts)) {
          dbo.max_bytes = opts.max_bytes;
        } else {
          dbo.batch = opts.batch ?? 100;
        }
        return dbo;
      }
      status() {
        const iter = new internal_1.QueuedIteratorImpl();
        this.listeners.push(iter);
        return iter;
      }
      notify(n) {
        if (this.listeners.length > 0) {
          (() => {
            const remove = [];
            this.listeners.forEach((l) => {
              const qi = l;
              if (!qi.done) {
                qi.push(n);
              } else {
                remove.push(qi);
              }
            });
            this.listeners = this.listeners.filter((l) => !remove.includes(l));
          })();
        }
      }
      debug() {
        console.log(this.cursor);
      }
      consume(opts) {
        let pending;
        let requestDone;
        const qi = new internal_1.QueuedIteratorImpl();
        (async () => {
          while (true) {
            if (this.cursor.pending === 0) {
              this.notify({
                type: "debug",
                code: 0,
                description: "sleeping for 2500"
              });
              pending = (0, internal_1.delay)(2500);
              await pending;
            }
            if (qi.done) {
              break;
            }
            requestDone = (0, internal_1.deferred)();
            const dbo = this.getOptions(opts);
            this.notify({
              type: "next",
              options: Object.assign({}, opts)
            });
            dbo.callback = (r, sm) => {
              if (r) {
                if (r.err) {
                  if (r.err instanceof jserrors_1.JetStreamStatusError) {
                    this.notify({
                      type: "debug",
                      code: r.err.code,
                      description: r.err.message
                    });
                  } else {
                    this.notify({
                      type: "debug",
                      code: 0,
                      description: r.err.message
                    });
                  }
                }
                requestDone.resolve();
              } else if (sm.lastSequence > 0 && sm.lastSequence !== this.cursor.last) {
                src.stop();
                requestDone.resolve();
                this.notify({
                  type: "reset",
                  name: "direct"
                });
              } else {
                qi.push(sm);
                qi.received++;
                this.cursor.last = sm.seq;
                this.cursor.pending = sm.pending;
              }
            };
            const src = await this.api.getBatch(this.stream, dbo);
            qi.iterClosed.then(() => {
              src.stop();
              pending == null ? void 0 : pending.cancel();
              requestDone == null ? void 0 : requestDone.resolve();
            });
            await requestDone;
          }
        })().catch((err) => {
          qi.stop(err);
        });
        return Promise.resolve(qi);
      }
      async fetch(opts) {
        const dbo = this.getOptions(opts);
        const qi = new internal_1.QueuedIteratorImpl();
        const src = await this.api.get(this.stream, Object.assign({
          callback: /* @__PURE__ */ __name((done, sm) => {
            if (done) {
              qi.push(() => {
                done.err ? qi.stop(done.err) : qi.stop();
              });
            } else if (sm.lastSequence > 0 && sm.lastSequence !== this.cursor.last) {
              qi.push(() => {
                qi.stop();
              });
              src.stop();
            } else {
              qi.push(sm);
              qi.received++;
              this.cursor.last = sm.seq;
              this.cursor.pending = sm.pending;
            }
          }, "callback")
        }, dbo));
        qi.iterClosed.then(() => {
          src.stop();
        });
        return qi;
      }
      async next() {
        const sm = await this.api.getMessage(this.stream, {
          seq: this.cursor.last + 1
        });
        const seq = sm == null ? void 0 : sm.seq;
        if (seq) {
          this.cursor.last = seq;
        }
        return sm;
      }
    };
    __name(_DirectConsumer, "DirectConsumer");
    var DirectConsumer = _DirectConsumer;
    exports2.DirectConsumer = DirectConsumer;
  }
});

// node_modules/@nats-io/jetstream/lib/jsclient.js
var require_jsclient = __commonJS({
  "node_modules/@nats-io/jetstream/lib/jsclient.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.JetStreamClientImpl = exports2.JetStreamManagerImpl = void 0;
    exports2.toJetStreamClient = toJetStreamClient;
    exports2.jetstream = jetstream2;
    exports2.jetstreamManager = jetstreamManager2;
    var jsbaseclient_api_1 = require_jsbaseclient_api();
    var jsmconsumer_api_1 = require_jsmconsumer_api();
    var internal_1 = require_internal_mod2();
    var jsmstream_api_1 = require_jsmstream_api();
    var internal_2 = require_internal_mod2();
    var jsapi_types_1 = require_jsapi_types();
    var jserrors_1 = require_jserrors();
    var jsm_direct_1 = require_jsm_direct();
    function toJetStreamClient(nc) {
      if (typeof nc.nc === "undefined") {
        return jetstream2(nc);
      }
      return nc;
    }
    __name(toJetStreamClient, "toJetStreamClient");
    function jetstream2(nc, opts = {}) {
      return new JetStreamClientImpl(nc, opts);
    }
    __name(jetstream2, "jetstream");
    async function jetstreamManager2(nc, opts = {}) {
      const adm = new JetStreamManagerImpl(nc, opts);
      if (opts.checkAPI !== false) {
        try {
          await adm.getAccountInfo();
        } catch (err) {
          throw err;
        }
      }
      return adm;
    }
    __name(jetstreamManager2, "jetstreamManager");
    var _JetStreamManagerImpl = class _JetStreamManagerImpl extends jsbaseclient_api_1.BaseApiClientImpl {
      streams;
      consumers;
      direct;
      constructor(nc, opts) {
        super(nc, opts);
        this.streams = new jsmstream_api_1.StreamAPIImpl(nc, opts);
        this.consumers = new jsmconsumer_api_1.ConsumerAPIImpl(nc, opts);
        this.direct = new jsm_direct_1.DirectStreamAPIImpl(nc, opts);
      }
      async getAccountInfo() {
        const r = await this._request(`${this.prefix}.INFO`);
        return r;
      }
      jetstream() {
        return jetstream2(this.nc, this.getOptions());
      }
      advisories() {
        const iter = new internal_1.QueuedIteratorImpl();
        this.nc.subscribe(`$JS.EVENT.ADVISORY.>`, {
          callback: /* @__PURE__ */ __name((err, msg) => {
            if (err) {
              throw err;
            }
            try {
              const d = this.parseJsResponse(msg);
              const chunks = d.type.split(".");
              const kind = chunks[chunks.length - 1];
              iter.push({ kind, data: d });
            } catch (err2) {
              iter.stop(err2);
            }
          }, "callback")
        });
        return iter;
      }
    };
    __name(_JetStreamManagerImpl, "JetStreamManagerImpl");
    var JetStreamManagerImpl = _JetStreamManagerImpl;
    exports2.JetStreamManagerImpl = JetStreamManagerImpl;
    var _JetStreamClientImpl = class _JetStreamClientImpl extends jsbaseclient_api_1.BaseApiClientImpl {
      consumers;
      streams;
      consumerAPI;
      streamAPI;
      constructor(nc, opts) {
        super(nc, opts);
        this.consumerAPI = new jsmconsumer_api_1.ConsumerAPIImpl(nc, opts);
        this.streamAPI = new jsmstream_api_1.StreamAPIImpl(nc, opts);
        this.consumers = new jsmstream_api_1.ConsumersImpl(this.consumerAPI);
        this.streams = new jsmstream_api_1.StreamsImpl(this.streamAPI);
      }
      jetstreamManager(checkAPI) {
        if (checkAPI === void 0) {
          checkAPI = this.opts.checkAPI;
        }
        const opts = Object.assign({}, this.opts, { checkAPI });
        return jetstreamManager2(this.nc, opts);
      }
      get apiPrefix() {
        return this.prefix;
      }
      async publish(subj, data = internal_1.Empty, opts) {
        opts = opts || {};
        opts = { ...opts };
        opts.expect = opts.expect || {};
        const mh = (opts == null ? void 0 : opts.headers) || (0, internal_2.headers)();
        if (opts) {
          if (opts.msgID) {
            mh.set(jsapi_types_1.PubHeaders.MsgIdHdr, opts.msgID);
          }
          if (opts.expect.lastMsgID) {
            mh.set(jsapi_types_1.PubHeaders.ExpectedLastMsgIdHdr, opts.expect.lastMsgID);
          }
          if (opts.expect.streamName) {
            mh.set(jsapi_types_1.PubHeaders.ExpectedStreamHdr, opts.expect.streamName);
          }
          if (typeof opts.expect.lastSequence === "number") {
            mh.set(jsapi_types_1.PubHeaders.ExpectedLastSeqHdr, `${opts.expect.lastSequence}`);
          }
          if (typeof opts.expect.lastSubjectSequence === "number") {
            mh.set(jsapi_types_1.PubHeaders.ExpectedLastSubjectSequenceHdr, `${opts.expect.lastSubjectSequence}`);
          }
        }
        const to = opts.timeout || this.timeout;
        const ro = {};
        if (to) {
          ro.timeout = to;
        }
        if (opts) {
          ro.headers = mh;
        }
        let { retries } = opts;
        retries = retries || 1;
        const bo = (0, internal_1.backoff)();
        let r = null;
        for (let i = 0; i < retries; i++) {
          try {
            r = await this.nc.request(subj, data, ro);
            break;
          } catch (err) {
            const re = err instanceof internal_2.RequestError ? err : null;
            if ((err instanceof internal_2.errors.TimeoutError || (re == null ? void 0 : re.isNoResponders())) && i + 1 < retries) {
              await (0, internal_1.delay)(bo.backoff(i));
            } else {
              throw (re == null ? void 0 : re.isNoResponders()) ? new jserrors_1.JetStreamNotEnabled(`jetstream is not enabled`, {
                cause: err
              }) : err;
            }
          }
        }
        const pa = this.parseJsResponse(r);
        if (pa.stream === "") {
          throw new jserrors_1.JetStreamError("invalid ack response");
        }
        pa.duplicate = pa.duplicate ? pa.duplicate : false;
        return pa;
      }
    };
    __name(_JetStreamClientImpl, "JetStreamClientImpl");
    var JetStreamClientImpl = _JetStreamClientImpl;
    exports2.JetStreamClientImpl = JetStreamClientImpl;
  }
});

// node_modules/@nats-io/jetstream/lib/internal_mod.js
var require_internal_mod3 = __commonJS({
  "node_modules/@nats-io/jetstream/lib/internal_mod.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.jserrors = exports2.JetStreamError = exports2.JetStreamApiError = exports2.JetStreamApiCodes = exports2.isMessageNotFound = exports2.ListerImpl = exports2.StoreCompression = exports2.StorageType = exports2.RetentionPolicy = exports2.ReplayPolicy = exports2.PubHeaders = exports2.DiscardPolicy = exports2.DeliverPolicy = exports2.AckPolicy = exports2.toJetStreamClient = exports2.jetstreamManager = exports2.JetStreamClientImpl = exports2.jetstream = exports2.RepublishHeaders = exports2.JsHeaders = exports2.isPushConsumer = exports2.isPullConsumer = exports2.isOrderedPushConsumerOptions = exports2.isBoundPushConsumerOptions = exports2.DirectMsgHeaders = exports2.AdvisoryKind = void 0;
    var types_1 = require_types3();
    Object.defineProperty(exports2, "AdvisoryKind", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return types_1.AdvisoryKind;
    }, "get") });
    Object.defineProperty(exports2, "DirectMsgHeaders", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return types_1.DirectMsgHeaders;
    }, "get") });
    Object.defineProperty(exports2, "isBoundPushConsumerOptions", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return types_1.isBoundPushConsumerOptions;
    }, "get") });
    Object.defineProperty(exports2, "isOrderedPushConsumerOptions", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return types_1.isOrderedPushConsumerOptions;
    }, "get") });
    Object.defineProperty(exports2, "isPullConsumer", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return types_1.isPullConsumer;
    }, "get") });
    Object.defineProperty(exports2, "isPushConsumer", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return types_1.isPushConsumer;
    }, "get") });
    Object.defineProperty(exports2, "JsHeaders", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return types_1.JsHeaders;
    }, "get") });
    Object.defineProperty(exports2, "RepublishHeaders", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return types_1.RepublishHeaders;
    }, "get") });
    var jsclient_1 = require_jsclient();
    Object.defineProperty(exports2, "jetstream", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jsclient_1.jetstream;
    }, "get") });
    Object.defineProperty(exports2, "JetStreamClientImpl", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jsclient_1.JetStreamClientImpl;
    }, "get") });
    Object.defineProperty(exports2, "jetstreamManager", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jsclient_1.jetstreamManager;
    }, "get") });
    Object.defineProperty(exports2, "toJetStreamClient", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jsclient_1.toJetStreamClient;
    }, "get") });
    var jsapi_types_1 = require_jsapi_types();
    Object.defineProperty(exports2, "AckPolicy", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jsapi_types_1.AckPolicy;
    }, "get") });
    Object.defineProperty(exports2, "DeliverPolicy", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jsapi_types_1.DeliverPolicy;
    }, "get") });
    Object.defineProperty(exports2, "DiscardPolicy", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jsapi_types_1.DiscardPolicy;
    }, "get") });
    Object.defineProperty(exports2, "PubHeaders", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jsapi_types_1.PubHeaders;
    }, "get") });
    Object.defineProperty(exports2, "ReplayPolicy", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jsapi_types_1.ReplayPolicy;
    }, "get") });
    Object.defineProperty(exports2, "RetentionPolicy", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jsapi_types_1.RetentionPolicy;
    }, "get") });
    Object.defineProperty(exports2, "StorageType", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jsapi_types_1.StorageType;
    }, "get") });
    Object.defineProperty(exports2, "StoreCompression", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jsapi_types_1.StoreCompression;
    }, "get") });
    var jslister_1 = require_jslister();
    Object.defineProperty(exports2, "ListerImpl", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jslister_1.ListerImpl;
    }, "get") });
    var jserrors_1 = require_jserrors();
    Object.defineProperty(exports2, "isMessageNotFound", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jserrors_1.isMessageNotFound;
    }, "get") });
    Object.defineProperty(exports2, "JetStreamApiCodes", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jserrors_1.JetStreamApiCodes;
    }, "get") });
    Object.defineProperty(exports2, "JetStreamApiError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jserrors_1.JetStreamApiError;
    }, "get") });
    Object.defineProperty(exports2, "JetStreamError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jserrors_1.JetStreamError;
    }, "get") });
    Object.defineProperty(exports2, "jserrors", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jserrors_1.jserrors;
    }, "get") });
  }
});

// node_modules/@nats-io/jetstream/lib/mod.js
var require_mod4 = __commonJS({
  "node_modules/@nats-io/jetstream/lib/mod.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StoreCompression = exports2.StorageType = exports2.RetentionPolicy = exports2.RepublishHeaders = exports2.ReplayPolicy = exports2.JsHeaders = exports2.JetStreamError = exports2.JetStreamApiError = exports2.JetStreamApiCodes = exports2.isPushConsumer = exports2.isPullConsumer = exports2.DiscardPolicy = exports2.DirectMsgHeaders = exports2.DeliverPolicy = exports2.AdvisoryKind = exports2.AckPolicy = exports2.jetstreamManager = exports2.jetstream = void 0;
    var internal_mod_1 = require_internal_mod3();
    Object.defineProperty(exports2, "jetstream", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.jetstream;
    }, "get") });
    Object.defineProperty(exports2, "jetstreamManager", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.jetstreamManager;
    }, "get") });
    var internal_mod_2 = require_internal_mod3();
    Object.defineProperty(exports2, "AckPolicy", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.AckPolicy;
    }, "get") });
    Object.defineProperty(exports2, "AdvisoryKind", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.AdvisoryKind;
    }, "get") });
    Object.defineProperty(exports2, "DeliverPolicy", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.DeliverPolicy;
    }, "get") });
    Object.defineProperty(exports2, "DirectMsgHeaders", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.DirectMsgHeaders;
    }, "get") });
    Object.defineProperty(exports2, "DiscardPolicy", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.DiscardPolicy;
    }, "get") });
    Object.defineProperty(exports2, "isPullConsumer", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.isPullConsumer;
    }, "get") });
    Object.defineProperty(exports2, "isPushConsumer", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.isPushConsumer;
    }, "get") });
    Object.defineProperty(exports2, "JetStreamApiCodes", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.JetStreamApiCodes;
    }, "get") });
    Object.defineProperty(exports2, "JetStreamApiError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.JetStreamApiError;
    }, "get") });
    Object.defineProperty(exports2, "JetStreamError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.JetStreamError;
    }, "get") });
    Object.defineProperty(exports2, "JsHeaders", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.JsHeaders;
    }, "get") });
    Object.defineProperty(exports2, "ReplayPolicy", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.ReplayPolicy;
    }, "get") });
    Object.defineProperty(exports2, "RepublishHeaders", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.RepublishHeaders;
    }, "get") });
    Object.defineProperty(exports2, "RetentionPolicy", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.RetentionPolicy;
    }, "get") });
    Object.defineProperty(exports2, "StorageType", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.StorageType;
    }, "get") });
    Object.defineProperty(exports2, "StoreCompression", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.StoreCompression;
    }, "get") });
  }
});

// node_modules/@nats-io/kv/lib/types.js
var require_types4 = __commonJS({
  "node_modules/@nats-io/kv/lib/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.kvPrefix = exports2.KvWatchInclude = void 0;
    exports2.KvWatchInclude = {
      /**
       * Include the last value for all the keys
       */
      LastValue: "",
      /**
       * Include all available history for all keys
       */
      AllHistory: "history",
      /**
       * Don't include history or last values, only notify
       * of updates
       */
      UpdatesOnly: "updates"
    };
    exports2.kvPrefix = "KV_";
  }
});

// node_modules/@nats-io/kv/lib/kv.js
var require_kv = __commonJS({
  "node_modules/@nats-io/kv/lib/kv.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.KvStatusImpl = exports2.Bucket = exports2.Kvm = exports2.kvOperationHdr = void 0;
    exports2.Base64KeyCodec = Base64KeyCodec;
    exports2.NoopKvCodecs = NoopKvCodecs;
    exports2.defaultBucketOpts = defaultBucketOpts;
    exports2.validateKey = validateKey;
    exports2.validateSearchKey = validateSearchKey;
    exports2.hasWildcards = hasWildcards;
    exports2.validateBucket = validateBucket;
    var internal_1 = require_internal_mod2();
    var internal_2 = require_internal_mod3();
    var types_1 = require_types4();
    function Base64KeyCodec() {
      return {
        encode(key) {
          return btoa(key);
        },
        decode(bkey) {
          return atob(bkey);
        }
      };
    }
    __name(Base64KeyCodec, "Base64KeyCodec");
    function NoopKvCodecs() {
      return {
        key: {
          encode(k) {
            return k;
          },
          decode(k) {
            return k;
          }
        },
        value: {
          encode(v) {
            return v;
          },
          decode(v) {
            return v;
          }
        }
      };
    }
    __name(NoopKvCodecs, "NoopKvCodecs");
    function defaultBucketOpts() {
      return {
        replicas: 1,
        history: 1,
        timeout: 2e3,
        max_bytes: -1,
        maxValueSize: -1,
        codec: NoopKvCodecs(),
        storage: internal_2.StorageType.File
      };
    }
    __name(defaultBucketOpts, "defaultBucketOpts");
    exports2.kvOperationHdr = "KV-Operation";
    var kvSubjectPrefix = "$KV";
    var validKeyRe = /^[-/=.\w]+$/;
    var validSearchKey = /^[-/=.>*\w]+$/;
    var validBucketRe = /^[-\w]+$/;
    function validateKey(k) {
      if (k.startsWith(".") || k.endsWith(".") || !validKeyRe.test(k)) {
        throw new Error(`invalid key: ${k}`);
      }
    }
    __name(validateKey, "validateKey");
    function validateSearchKey(k) {
      if (k.startsWith(".") || k.endsWith(".") || !validSearchKey.test(k)) {
        throw new Error(`invalid key: ${k}`);
      }
    }
    __name(validateSearchKey, "validateSearchKey");
    function hasWildcards(k) {
      if (k.startsWith(".") || k.endsWith(".")) {
        throw new Error(`invalid key: ${k}`);
      }
      const chunks = k.split(".");
      let hasWildcards2 = false;
      for (let i = 0; i < chunks.length; i++) {
        switch (chunks[i]) {
          case "*":
            hasWildcards2 = true;
            break;
          case ">":
            if (i !== chunks.length - 1) {
              throw new Error(`invalid key: ${k}`);
            }
            hasWildcards2 = true;
            break;
          default:
        }
      }
      return hasWildcards2;
    }
    __name(hasWildcards, "hasWildcards");
    function validateBucket(name) {
      if (!validBucketRe.test(name)) {
        throw new Error(`invalid bucket name: ${name}`);
      }
    }
    __name(validateBucket, "validateBucket");
    var _Kvm_instances, maybeCreate_fn;
    var _Kvm = class _Kvm {
      /**
       * Creates an instance of the Kv that allows you to create and access KV stores.
       * Note that if the argument is a NatsConnection, default JetStream Options are
       * used. If you want to set some options, please provide a JetStreamClient instead.
       * @param nc
       */
      constructor(nc) {
        __privateAdd(this, _Kvm_instances);
        __publicField(this, "js");
        this.js = (0, internal_2.toJetStreamClient)(nc);
      }
      /**
       * Creates and opens the specified KV. If the KV already exists, it opens the existing KV.
       * @param name
       * @param opts
       */
      create(name, opts = {}) {
        return __privateMethod(this, _Kvm_instances, maybeCreate_fn).call(this, name, opts);
      }
      /**
       * Open to the specified KV. If the KV doesn't exist, this API will fail.
       * @param name
       * @param opts
       */
      open(name, opts = {}) {
        opts.bindOnly = true;
        return __privateMethod(this, _Kvm_instances, maybeCreate_fn).call(this, name, opts);
      }
      /**
       * Lists all available KVs
       */
      list() {
        const filter = /* @__PURE__ */ __name((v) => {
          var _a;
          const slr = v;
          const kvStreams = slr.streams.filter((v2) => {
            return v2.config.name.startsWith(types_1.kvPrefix);
          });
          kvStreams.forEach((si) => {
            si.config.sealed = si.config.sealed || false;
            si.config.deny_delete = si.config.deny_delete || false;
            si.config.deny_purge = si.config.deny_purge || false;
            si.config.allow_rollup_hdrs = si.config.allow_rollup_hdrs || false;
          });
          let cluster = "";
          if (kvStreams.length) {
            cluster = ((_a = this.js.nc.info) == null ? void 0 : _a.cluster) ?? "";
          }
          return kvStreams.map((si) => {
            return new KvStatusImpl(si, cluster);
          });
        }, "filter");
        const subj = `${this.js.prefix}.STREAM.LIST`;
        return new internal_2.ListerImpl(subj, filter, this.js);
      }
    };
    _Kvm_instances = new WeakSet();
    maybeCreate_fn = /* @__PURE__ */ __name(function(name, opts = {}) {
      const { ok, min } = this.js.nc.features.get(internal_1.Feature.JS_KV);
      if (!ok) {
        return Promise.reject(new Error(`kv is only supported on servers ${min} or better`));
      }
      if (opts.bindOnly) {
        return Bucket.bind(this.js, name, opts);
      }
      return Bucket.create(this.js, name, opts);
    }, "#maybeCreate");
    __name(_Kvm, "Kvm");
    var Kvm2 = _Kvm;
    exports2.Kvm = Kvm2;
    var _Bucket = class _Bucket {
      js;
      jsm;
      stream;
      bucket;
      direct;
      codec;
      prefix;
      editPrefix;
      useJsPrefix;
      _prefixLen;
      constructor(bucket, js, jsm) {
        validateBucket(bucket);
        this.js = js;
        this.jsm = jsm;
        this.bucket = bucket;
        this.prefix = kvSubjectPrefix;
        this.editPrefix = "";
        this.useJsPrefix = false;
        this._prefixLen = 0;
      }
      static async create(js, name, opts = {}) {
        validateBucket(name);
        const jsm = await js.jetstreamManager();
        const bucket = new _Bucket(name, js, jsm);
        await bucket.init(opts);
        return bucket;
      }
      static async bind(js, name, opts = {}) {
        const jsm = await js.jetstreamManager();
        const info = {
          config: {
            allow_direct: opts.allow_direct
          }
        };
        validateBucket(name);
        const bucket = new _Bucket(name, js, jsm);
        info.config.name = opts.streamName ?? bucket.bucketName();
        Object.assign(bucket, info);
        bucket.stream = info.config.name;
        bucket.codec = opts.codec || NoopKvCodecs();
        bucket.direct = info.config.allow_direct ?? false;
        bucket.initializePrefixes(info);
        return bucket;
      }
      async init(opts = {}) {
        const bo = Object.assign(defaultBucketOpts(), opts);
        this.codec = bo.codec;
        const sc = {};
        this.stream = sc.name = opts.streamName ?? this.bucketName();
        sc.retention = internal_2.RetentionPolicy.Limits;
        sc.max_msgs_per_subject = bo.history;
        if (bo.max_bytes) {
          sc.max_bytes = bo.max_bytes;
        }
        sc.max_msg_size = bo.maxValueSize;
        sc.storage = bo.storage;
        if (opts.placement) {
          sc.placement = opts.placement;
        }
        if (opts.republish) {
          sc.republish = opts.republish;
        }
        if (opts.description) {
          sc.description = opts.description;
        }
        if (opts.mirror) {
          const mirror = Object.assign({}, opts.mirror);
          if (!mirror.name.startsWith(types_1.kvPrefix)) {
            mirror.name = `${types_1.kvPrefix}${mirror.name}`;
          }
          sc.mirror = mirror;
          sc.mirror_direct = true;
        } else if (opts.sources) {
          const sources = opts.sources.map((s) => {
            const c = Object.assign({}, s);
            const srcBucketName = c.name.startsWith(types_1.kvPrefix) ? c.name.substring(types_1.kvPrefix.length) : c.name;
            if (!c.name.startsWith(types_1.kvPrefix)) {
              c.name = `${types_1.kvPrefix}${c.name}`;
            }
            if (!s.external && srcBucketName !== this.bucket) {
              c.subject_transforms = [
                { src: `$KV.${srcBucketName}.>`, dest: `$KV.${this.bucket}.>` }
              ];
            }
            return c;
          });
          sc.sources = sources;
          sc.subjects = [this.subjectForBucket()];
        } else {
          sc.subjects = [this.subjectForBucket()];
        }
        if (opts.metadata) {
          sc.metadata = opts.metadata;
        }
        if (typeof opts.compression === "boolean") {
          sc.compression = opts.compression ? internal_2.StoreCompression.S2 : internal_2.StoreCompression.None;
        }
        const nci = this.js.nc;
        const have = nci.getServerVersion();
        const discardNew = have ? (0, internal_1.compare)(have, (0, internal_1.parseSemVer)("2.7.2")) >= 0 : false;
        sc.discard = discardNew ? internal_2.DiscardPolicy.New : internal_2.DiscardPolicy.Old;
        const { ok: direct, min } = nci.features.get(internal_1.Feature.JS_ALLOW_DIRECT);
        if (!direct && opts.allow_direct === true) {
          const v = have ? `${have.major}.${have.minor}.${have.micro}` : "unknown";
          return Promise.reject(new Error(`allow_direct is not available on server version ${v} - requires ${min}`));
        }
        opts.allow_direct = typeof opts.allow_direct === "boolean" ? opts.allow_direct : direct;
        sc.allow_direct = opts.allow_direct;
        this.direct = sc.allow_direct;
        sc.num_replicas = bo.replicas;
        if (bo.ttl) {
          sc.max_age = (0, internal_1.nanos)(bo.ttl);
        }
        sc.allow_rollup_hdrs = true;
        let info;
        try {
          info = await this.jsm.streams.info(sc.name);
          if (!info.config.allow_direct && this.direct === true) {
            this.direct = false;
          }
        } catch (err) {
          if (err.message === "stream not found") {
            info = await this.jsm.streams.add(sc);
          } else {
            throw err;
          }
        }
        this.initializePrefixes(info);
      }
      initializePrefixes(info) {
        this._prefixLen = 0;
        this.prefix = `$KV.${this.bucket}`;
        this.useJsPrefix = this.js.apiPrefix !== "$JS.API";
        const { mirror } = info.config;
        if (mirror) {
          let n = mirror.name;
          if (n.startsWith(types_1.kvPrefix)) {
            n = n.substring(types_1.kvPrefix.length);
          }
          if (mirror.external && mirror.external.api !== "") {
            const mb = mirror.name.substring(types_1.kvPrefix.length);
            this.useJsPrefix = false;
            this.prefix = `$KV.${mb}`;
            this.editPrefix = `${mirror.external.api}.$KV.${n}`;
          } else {
            this.editPrefix = this.prefix;
          }
        }
      }
      bucketName() {
        return this.stream ?? `${types_1.kvPrefix}${this.bucket}`;
      }
      subjectForBucket() {
        return `${this.prefix}.${this.bucket}.>`;
      }
      subjectForKey(k, edit = false) {
        const builder = [];
        if (edit) {
          if (this.useJsPrefix) {
            builder.push(this.js.apiPrefix);
          }
          if (this.editPrefix !== "") {
            builder.push(this.editPrefix);
          } else {
            builder.push(this.prefix);
          }
        } else {
          if (this.prefix) {
            builder.push(this.prefix);
          }
        }
        builder.push(k);
        return builder.join(".");
      }
      fullKeyName(k) {
        if (this.prefix !== "") {
          return `${this.prefix}.${k}`;
        }
        return `${kvSubjectPrefix}.${this.bucket}.${k}`;
      }
      get prefixLen() {
        if (this._prefixLen === 0) {
          this._prefixLen = this.prefix.length + 1;
        }
        return this._prefixLen;
      }
      encodeKey(key) {
        const chunks = [];
        for (const t of key.split(".")) {
          switch (t) {
            case ">":
            case "*":
              chunks.push(t);
              break;
            default:
              chunks.push(this.codec.key.encode(t));
              break;
          }
        }
        return chunks.join(".");
      }
      decodeKey(ekey) {
        const chunks = [];
        for (const t of ekey.split(".")) {
          switch (t) {
            case ">":
            case "*":
              chunks.push(t);
              break;
            default:
              chunks.push(this.codec.key.decode(t));
              break;
          }
        }
        return chunks.join(".");
      }
      validateKey = validateKey;
      validateSearchKey = validateSearchKey;
      hasWildcards = hasWildcards;
      close() {
        return Promise.resolve();
      }
      dataLen(data, h) {
        const slen = h ? h.get(internal_2.JsHeaders.MessageSizeHdr) || "" : "";
        if (slen !== "") {
          return parseInt(slen, 10);
        }
        return data.length;
      }
      smToEntry(sm) {
        return new KvStoredEntryImpl(this.bucket, this.prefixLen, sm);
      }
      jmToWatchEntry(jm, isUpdate) {
        const key = this.decodeKey(jm.subject.substring(this.prefixLen));
        return new KvJsMsgEntryImpl(this.bucket, key, jm, isUpdate);
      }
      async create(k, data) {
        let firstErr;
        try {
          const n = await this.put(k, data, { previousSeq: 0 });
          return Promise.resolve(n);
        } catch (err) {
          firstErr = err;
          if (err instanceof internal_2.JetStreamApiError) {
            const jserr = err;
            if (jserr.code !== internal_2.JetStreamApiCodes.StreamWrongLastSequence) {
              return Promise.reject(err);
            }
          }
        }
        let rev = 0;
        try {
          const e = await this.get(k);
          if ((e == null ? void 0 : e.operation) === "DEL" || (e == null ? void 0 : e.operation) === "PURGE") {
            rev = e !== null ? e.revision : 0;
            return this.update(k, data, rev);
          } else {
            return Promise.reject(firstErr);
          }
        } catch (err) {
          return Promise.reject(err);
        }
      }
      update(k, data, version) {
        if (version <= 0) {
          throw new Error("version must be greater than 0");
        }
        return this.put(k, data, { previousSeq: version });
      }
      async put(k, data, opts = {}) {
        const ek = this.encodeKey(k);
        this.validateKey(ek);
        const o = {};
        if (opts.previousSeq !== void 0) {
          const h = (0, internal_1.headers)();
          o.headers = h;
          h.set(internal_2.PubHeaders.ExpectedLastSubjectSequenceHdr, `${opts.previousSeq}`);
        }
        try {
          const pa = await this.js.publish(this.subjectForKey(ek, true), data, o);
          return pa.seq;
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async get(k, opts) {
        const ek = this.encodeKey(k);
        this.validateKey(ek);
        let arg = { last_by_subj: this.subjectForKey(ek) };
        if (opts && opts.revision > 0) {
          arg = { seq: opts.revision };
        }
        let sm = null;
        try {
          if (this.direct) {
            const direct = this.jsm.direct;
            sm = await direct.getMessage(this.bucketName(), arg);
          } else {
            sm = await this.jsm.streams.getMessage(this.bucketName(), arg);
          }
          if (sm === null) {
            return null;
          }
          const ke = this.smToEntry(sm);
          if (ke.key !== ek) {
            return null;
          }
          return ke;
        } catch (err) {
          throw err;
        }
      }
      purge(k, opts) {
        return this._deleteOrPurge(k, "PURGE", opts);
      }
      delete(k, opts) {
        return this._deleteOrPurge(k, "DEL", opts);
      }
      async purgeDeletes(olderMillis = 30 * 60 * 1e3) {
        const buf = [];
        const i = await this.history({
          key: ">"
        });
        await (async () => {
          for await (const e of i) {
            if (e.operation === "DEL" || e.operation === "PURGE") {
              buf.push(e);
            }
          }
        })().then();
        i.stop();
        const min = Date.now() - olderMillis;
        const proms = buf.map((e) => {
          const subj = this.subjectForKey(e.key);
          if (e.created.getTime() >= min) {
            return this.jsm.streams.purge(this.stream, { filter: subj, keep: 1 });
          } else {
            return this.jsm.streams.purge(this.stream, { filter: subj, keep: 0 });
          }
        });
        const purged = await Promise.all(proms);
        purged.unshift({ success: true, purged: 0 });
        return purged.reduce((pv, cv) => {
          pv.purged += cv.purged;
          return pv;
        });
      }
      async _deleteOrPurge(k, op, opts) {
        if (!this.hasWildcards(k)) {
          return this._doDeleteOrPurge(k, op, opts);
        }
        const iter = await this.keys(k);
        const buf = [];
        for await (const k2 of iter) {
          buf.push(this._doDeleteOrPurge(k2, op));
          if (buf.length === 100) {
            await Promise.all(buf);
            buf.length = 0;
          }
        }
        if (buf.length > 0) {
          await Promise.all(buf);
        }
      }
      async _doDeleteOrPurge(k, op, opts) {
        const ek = this.encodeKey(k);
        this.validateKey(ek);
        const h = (0, internal_1.headers)();
        h.set(exports2.kvOperationHdr, op);
        if (op === "PURGE") {
          h.set(internal_2.JsHeaders.RollupHdr, internal_2.JsHeaders.RollupValueSubject);
        }
        if (opts == null ? void 0 : opts.previousSeq) {
          h.set(internal_2.PubHeaders.ExpectedLastSubjectSequenceHdr, `${opts.previousSeq}`);
        }
        await this.js.publish(this.subjectForKey(ek, true), internal_1.Empty, { headers: h });
      }
      _buildCC(k, content, opts = {}) {
        const a = !Array.isArray(k) ? [k] : k;
        let filter_subjects = a.map((k2) => {
          const ek = this.encodeKey(k2);
          this.validateSearchKey(k2);
          return this.fullKeyName(ek);
        });
        let deliver_policy = internal_2.DeliverPolicy.LastPerSubject;
        if (content === types_1.KvWatchInclude.AllHistory) {
          deliver_policy = internal_2.DeliverPolicy.All;
        }
        if (content === types_1.KvWatchInclude.UpdatesOnly) {
          deliver_policy = internal_2.DeliverPolicy.New;
        }
        let filter_subject = void 0;
        if (filter_subjects.length === 1) {
          filter_subject = filter_subjects[0];
          filter_subjects = void 0;
        }
        return Object.assign({
          deliver_policy,
          "ack_policy": internal_2.AckPolicy.None,
          filter_subjects,
          filter_subject,
          "flow_control": true,
          "idle_heartbeat": (0, internal_1.nanos)(5 * 1e3)
        }, opts);
      }
      remove(k) {
        return this.purge(k);
      }
      async history(opts = {}) {
        const k = opts.key ?? ">";
        const co = {};
        co.headers_only = opts.headers_only || false;
        const qi = new internal_1.QueuedIteratorImpl();
        const fn = /* @__PURE__ */ __name(() => {
          qi.stop();
        }, "fn");
        const cc = this._buildCC(k, types_1.KvWatchInclude.AllHistory, co);
        const oc = await this.js.consumers.getPushConsumer(this.stream, cc);
        qi._data = oc;
        const info = await oc.info(true);
        if (info.num_pending === 0) {
          qi.push(fn);
          return qi;
        }
        const iter = await oc.consume({
          callback: /* @__PURE__ */ __name((m) => {
            const e = this.jmToWatchEntry(m, false);
            qi.push(e);
            qi.received++;
            if (m.info.pending === 0) {
              qi.push(fn);
            }
          }, "callback")
        });
        iter.closed().then(() => {
          qi.push(fn);
        });
        (async () => {
          for await (const s of iter.status()) {
            switch (s.type) {
              // if we get a heartbeat we got all the keys
              case "heartbeat":
                qi.push(() => {
                  qi.stop();
                });
                break;
            }
          }
        })().then();
        qi.iterClosed.then(() => {
          iter.stop();
        });
        return qi;
      }
      canSetWatcherName() {
        const nci = this.js.nc;
        const { ok } = nci.features.get(internal_1.Feature.JS_NEW_CONSUMER_CREATE_API);
        return ok;
      }
      async watch(opts = {}) {
        const k = opts.key ?? ">";
        const qi = new internal_1.QueuedIteratorImpl();
        const co = {};
        co.headers_only = opts.headers_only || false;
        let content = types_1.KvWatchInclude.LastValue;
        if (opts.include === types_1.KvWatchInclude.AllHistory) {
          content = types_1.KvWatchInclude.AllHistory;
        } else if (opts.include === types_1.KvWatchInclude.UpdatesOnly) {
          content = types_1.KvWatchInclude.UpdatesOnly;
        }
        const ignoreDeletes = opts.ignoreDeletes === true;
        const cc = this._buildCC(k, content, co);
        cc.name = `KV_WATCHER_${internal_1.nuid.next()}`;
        if (opts.resumeFromRevision && opts.resumeFromRevision > 0) {
          cc.deliver_policy = internal_2.DeliverPolicy.StartSequence;
          cc.opt_start_seq = opts.resumeFromRevision;
        }
        const oc = await this.js.consumers.getPushConsumer(this.stream, cc);
        const info = await oc.info(true);
        const count = info.num_pending;
        let isUpdate = content === types_1.KvWatchInclude.UpdatesOnly || count === 0;
        qi._data = oc;
        let i = 0;
        const iter = await oc.consume({
          callback: /* @__PURE__ */ __name((m) => {
            if (!isUpdate) {
              i++;
              isUpdate = i >= count;
            }
            const e = this.jmToWatchEntry(m, isUpdate);
            if (ignoreDeletes && e.operation === "DEL") {
              return;
            }
            qi.push(e);
            qi.received++;
          }, "callback")
        });
        qi.iterClosed.then(() => {
          iter.stop();
        });
        iter.closed().then(() => {
          qi.push(() => {
            qi.stop();
          });
        });
        return qi;
      }
      async keys(k = ">") {
        const keys = new internal_1.QueuedIteratorImpl();
        const cc = this._buildCC(k, types_1.KvWatchInclude.LastValue, {
          headers_only: true
        });
        const oc = await this.js.consumers.getPushConsumer(this.stream, cc);
        const info = await oc.info();
        if (info.num_pending === 0) {
          keys.stop();
          return keys;
        }
        keys._data = oc;
        const iter = await oc.consume({
          callback: /* @__PURE__ */ __name((m) => {
            var _a;
            const op = (_a = m.headers) == null ? void 0 : _a.get(exports2.kvOperationHdr);
            if (op !== "DEL" && op !== "PURGE") {
              const key = this.decodeKey(m.subject.substring(this.prefixLen));
              keys.push(key);
            }
            if (m.info.pending === 0) {
              iter.stop();
            }
          }, "callback")
        });
        (async () => {
          for await (const s of iter.status()) {
            switch (s.type) {
              // if we get a heartbeat we got all the keys
              case "heartbeat":
                keys.push(() => {
                  keys.stop();
                });
                break;
            }
          }
        })().then();
        iter.closed().then(() => {
          keys.push(() => {
            keys.stop();
          });
        });
        keys.iterClosed.then(() => {
          iter.stop();
        });
        return keys;
      }
      purgeBucket(opts) {
        return this.jsm.streams.purge(this.bucketName(), opts);
      }
      destroy() {
        return this.jsm.streams.delete(this.bucketName());
      }
      async status() {
        var _a;
        const nc = this.js.nc;
        const cluster = ((_a = nc.info) == null ? void 0 : _a.cluster) ?? "";
        const bn = this.bucketName();
        const si = await this.jsm.streams.info(bn);
        return new KvStatusImpl(si, cluster);
      }
    };
    __name(_Bucket, "Bucket");
    var Bucket = _Bucket;
    exports2.Bucket = Bucket;
    var _KvStatusImpl = class _KvStatusImpl {
      si;
      cluster;
      constructor(si, cluster = "") {
        this.si = si;
        this.cluster = cluster;
      }
      get bucket() {
        return this.si.config.name.startsWith(types_1.kvPrefix) ? this.si.config.name.substring(types_1.kvPrefix.length) : this.si.config.name;
      }
      get values() {
        return this.si.state.messages;
      }
      get history() {
        return this.si.config.max_msgs_per_subject;
      }
      get ttl() {
        return (0, internal_1.millis)(this.si.config.max_age);
      }
      get bucket_location() {
        return this.cluster;
      }
      get backingStore() {
        return this.si.config.storage;
      }
      get storage() {
        return this.si.config.storage;
      }
      get replicas() {
        return this.si.config.num_replicas;
      }
      get description() {
        return this.si.config.description ?? "";
      }
      get maxBucketSize() {
        return this.si.config.max_bytes;
      }
      get maxValueSize() {
        return this.si.config.max_msg_size;
      }
      get max_bytes() {
        return this.si.config.max_bytes;
      }
      get placement() {
        return this.si.config.placement || { cluster: "", tags: [] };
      }
      get placementCluster() {
        var _a;
        return ((_a = this.si.config.placement) == null ? void 0 : _a.cluster) ?? "";
      }
      get republish() {
        return this.si.config.republish ?? { src: "", dest: "" };
      }
      get streamInfo() {
        return this.si;
      }
      get size() {
        return this.si.state.bytes;
      }
      get metadata() {
        return this.si.config.metadata ?? {};
      }
      get compression() {
        if (this.si.config.compression) {
          return this.si.config.compression !== internal_2.StoreCompression.None;
        }
        return false;
      }
    };
    __name(_KvStatusImpl, "KvStatusImpl");
    var KvStatusImpl = _KvStatusImpl;
    exports2.KvStatusImpl = KvStatusImpl;
    var _KvStoredEntryImpl = class _KvStoredEntryImpl {
      bucket;
      sm;
      prefixLen;
      constructor(bucket, prefixLen, sm) {
        this.bucket = bucket;
        this.prefixLen = prefixLen;
        this.sm = sm;
      }
      get key() {
        return this.sm.subject.substring(this.prefixLen);
      }
      get value() {
        return this.sm.data;
      }
      get delta() {
        return 0;
      }
      get created() {
        return this.sm.time;
      }
      get revision() {
        return this.sm.seq;
      }
      get operation() {
        return this.sm.header.get(exports2.kvOperationHdr) || "PUT";
      }
      get length() {
        const slen = this.sm.header.get(internal_2.JsHeaders.MessageSizeHdr) || "";
        if (slen !== "") {
          return parseInt(slen, 10);
        }
        return this.sm.data.length;
      }
      json() {
        return this.sm.json();
      }
      string() {
        return this.sm.string();
      }
    };
    __name(_KvStoredEntryImpl, "KvStoredEntryImpl");
    var KvStoredEntryImpl = _KvStoredEntryImpl;
    var _KvJsMsgEntryImpl = class _KvJsMsgEntryImpl {
      bucket;
      key;
      sm;
      update;
      constructor(bucket, key, sm, isUpdate) {
        this.bucket = bucket;
        this.key = key;
        this.sm = sm;
        this.update = isUpdate;
      }
      get value() {
        return this.sm.data;
      }
      get created() {
        return new Date((0, internal_1.millis)(this.sm.info.timestampNanos));
      }
      get revision() {
        return this.sm.seq;
      }
      get operation() {
        var _a;
        return ((_a = this.sm.headers) == null ? void 0 : _a.get(exports2.kvOperationHdr)) || "PUT";
      }
      get delta() {
        return this.sm.info.pending;
      }
      get length() {
        var _a;
        const slen = ((_a = this.sm.headers) == null ? void 0 : _a.get(internal_2.JsHeaders.MessageSizeHdr)) || "";
        if (slen !== "") {
          return parseInt(slen, 10);
        }
        return this.sm.data.length;
      }
      get isUpdate() {
        return this.update;
      }
      json() {
        return this.sm.json();
      }
      string() {
        return this.sm.string();
      }
    };
    __name(_KvJsMsgEntryImpl, "KvJsMsgEntryImpl");
    var KvJsMsgEntryImpl = _KvJsMsgEntryImpl;
  }
});

// node_modules/@nats-io/kv/lib/internal_mod.js
var require_internal_mod4 = __commonJS({
  "node_modules/@nats-io/kv/lib/internal_mod.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.validateKey = exports2.validateBucket = exports2.NoopKvCodecs = exports2.Kvm = exports2.defaultBucketOpts = exports2.Bucket = exports2.Base64KeyCodec = exports2.KvWatchInclude = exports2.kvPrefix = void 0;
    var types_1 = require_types4();
    Object.defineProperty(exports2, "kvPrefix", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return types_1.kvPrefix;
    }, "get") });
    Object.defineProperty(exports2, "KvWatchInclude", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return types_1.KvWatchInclude;
    }, "get") });
    var kv_1 = require_kv();
    Object.defineProperty(exports2, "Base64KeyCodec", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return kv_1.Base64KeyCodec;
    }, "get") });
    Object.defineProperty(exports2, "Bucket", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return kv_1.Bucket;
    }, "get") });
    Object.defineProperty(exports2, "defaultBucketOpts", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return kv_1.defaultBucketOpts;
    }, "get") });
    Object.defineProperty(exports2, "Kvm", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return kv_1.Kvm;
    }, "get") });
    Object.defineProperty(exports2, "NoopKvCodecs", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return kv_1.NoopKvCodecs;
    }, "get") });
    Object.defineProperty(exports2, "validateBucket", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return kv_1.validateBucket;
    }, "get") });
    Object.defineProperty(exports2, "validateKey", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return kv_1.validateKey;
    }, "get") });
  }
});

// node_modules/@nats-io/kv/lib/mod.js
var require_mod5 = __commonJS({
  "node_modules/@nats-io/kv/lib/mod.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NoopKvCodecs = exports2.Kvm = exports2.defaultBucketOpts = exports2.Bucket = exports2.Base64KeyCodec = exports2.KvWatchInclude = void 0;
    var internal_mod_1 = require_internal_mod4();
    Object.defineProperty(exports2, "KvWatchInclude", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.KvWatchInclude;
    }, "get") });
    var internal_mod_2 = require_internal_mod4();
    Object.defineProperty(exports2, "Base64KeyCodec", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.Base64KeyCodec;
    }, "get") });
    Object.defineProperty(exports2, "Bucket", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.Bucket;
    }, "get") });
    Object.defineProperty(exports2, "defaultBucketOpts", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.defaultBucketOpts;
    }, "get") });
    Object.defineProperty(exports2, "Kvm", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.Kvm;
    }, "get") });
    Object.defineProperty(exports2, "NoopKvCodecs", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.NoopKvCodecs;
    }, "get") });
  }
});

// node_modules/@nats-io/obj/lib/types.js
var require_types5 = __commonJS({
  "node_modules/@nats-io/obj/lib/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StorageType = void 0;
    var jetstream_1 = require_mod4();
    Object.defineProperty(exports2, "StorageType", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return jetstream_1.StorageType;
    }, "get") });
  }
});

// node_modules/@nats-io/obj/lib/base64.js
var require_base64 = __commonJS({
  "node_modules/@nats-io/obj/lib/base64.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Base64UrlPaddedCodec = exports2.Base64UrlCodec = exports2.Base64Codec = void 0;
    var _Base64Codec = class _Base64Codec {
      static encode(bytes) {
        if (typeof bytes === "string") {
          return btoa(bytes);
        }
        const a = Array.from(bytes);
        return btoa(String.fromCharCode(...a));
      }
      static decode(s, binary = false) {
        const bin = atob(s);
        if (!binary) {
          return bin;
        }
        return Uint8Array.from(bin, (c) => c.charCodeAt(0));
      }
    };
    __name(_Base64Codec, "Base64Codec");
    var Base64Codec = _Base64Codec;
    exports2.Base64Codec = Base64Codec;
    var _Base64UrlCodec = class _Base64UrlCodec {
      static encode(bytes) {
        return _Base64UrlCodec.toB64URLEncoding(Base64Codec.encode(bytes));
      }
      static decode(s, binary = false) {
        return Base64Codec.decode(_Base64UrlCodec.fromB64URLEncoding(s), binary);
      }
      static toB64URLEncoding(b64str) {
        return b64str.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      }
      static fromB64URLEncoding(b64str) {
        return b64str.replace(/_/g, "/").replace(/-/g, "+");
      }
    };
    __name(_Base64UrlCodec, "Base64UrlCodec");
    var Base64UrlCodec = _Base64UrlCodec;
    exports2.Base64UrlCodec = Base64UrlCodec;
    var _Base64UrlPaddedCodec = class _Base64UrlPaddedCodec {
      static encode(bytes) {
        return _Base64UrlPaddedCodec.toB64URLEncoding(Base64Codec.encode(bytes));
      }
      static decode(s, binary = false) {
        return Base64UrlCodec.decode(_Base64UrlPaddedCodec.fromB64URLEncoding(s), binary);
      }
      static toB64URLEncoding(b64str) {
        return b64str.replace(/\+/g, "-").replace(/\//g, "_");
      }
      static fromB64URLEncoding(b64str) {
        return b64str.replace(/_/g, "/").replace(/-/g, "+");
      }
    };
    __name(_Base64UrlPaddedCodec, "Base64UrlPaddedCodec");
    var Base64UrlPaddedCodec = _Base64UrlPaddedCodec;
    exports2.Base64UrlPaddedCodec = Base64UrlPaddedCodec;
  }
});

// node_modules/js-sha256/src/sha256.js
var require_sha256 = __commonJS({
  "node_modules/js-sha256/src/sha256.js"(exports2, module2) {
    (function() {
      "use strict";
      var ERROR = "input is invalid type";
      var WINDOW = typeof window === "object";
      var root = WINDOW ? window : {};
      if (root.JS_SHA256_NO_WINDOW) {
        WINDOW = false;
      }
      var WEB_WORKER = !WINDOW && typeof self === "object";
      var NODE_JS = !root.JS_SHA256_NO_NODE_JS && typeof process === "object" && process.versions && process.versions.node && process.type != "renderer";
      if (NODE_JS) {
        root = global;
      } else if (WEB_WORKER) {
        root = self;
      }
      var COMMON_JS = !root.JS_SHA256_NO_COMMON_JS && typeof module2 === "object" && module2.exports;
      var AMD = typeof define === "function" && define.amd;
      var ARRAY_BUFFER = !root.JS_SHA256_NO_ARRAY_BUFFER && typeof ArrayBuffer !== "undefined";
      var HEX_CHARS = "0123456789abcdef".split("");
      var EXTRA = [-2147483648, 8388608, 32768, 128];
      var SHIFT = [24, 16, 8, 0];
      var K = [
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ];
      var OUTPUT_TYPES = ["hex", "array", "digest", "arrayBuffer"];
      var blocks = [];
      if (root.JS_SHA256_NO_NODE_JS || !Array.isArray) {
        Array.isArray = function(obj) {
          return Object.prototype.toString.call(obj) === "[object Array]";
        };
      }
      if (ARRAY_BUFFER && (root.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
        ArrayBuffer.isView = function(obj) {
          return typeof obj === "object" && obj.buffer && obj.buffer.constructor === ArrayBuffer;
        };
      }
      var createOutputMethod = /* @__PURE__ */ __name(function(outputType, is224) {
        return function(message) {
          return new Sha256(is224, true).update(message)[outputType]();
        };
      }, "createOutputMethod");
      var createMethod = /* @__PURE__ */ __name(function(is224) {
        var method = createOutputMethod("hex", is224);
        if (NODE_JS) {
          method = nodeWrap(method, is224);
        }
        method.create = function() {
          return new Sha256(is224);
        };
        method.update = function(message) {
          return method.create().update(message);
        };
        for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
          var type = OUTPUT_TYPES[i];
          method[type] = createOutputMethod(type, is224);
        }
        return method;
      }, "createMethod");
      var nodeWrap = /* @__PURE__ */ __name(function(method, is224) {
        var crypto2 = require("crypto");
        var Buffer2 = require("buffer").Buffer;
        var algorithm = is224 ? "sha224" : "sha256";
        var bufferFrom;
        if (Buffer2.from && !root.JS_SHA256_NO_BUFFER_FROM) {
          bufferFrom = Buffer2.from;
        } else {
          bufferFrom = /* @__PURE__ */ __name(function(message) {
            return new Buffer2(message);
          }, "bufferFrom");
        }
        var nodeMethod = /* @__PURE__ */ __name(function(message) {
          if (typeof message === "string") {
            return crypto2.createHash(algorithm).update(message, "utf8").digest("hex");
          } else {
            if (message === null || message === void 0) {
              throw new Error(ERROR);
            } else if (message.constructor === ArrayBuffer) {
              message = new Uint8Array(message);
            }
          }
          if (Array.isArray(message) || ArrayBuffer.isView(message) || message.constructor === Buffer2) {
            return crypto2.createHash(algorithm).update(bufferFrom(message)).digest("hex");
          } else {
            return method(message);
          }
        }, "nodeMethod");
        return nodeMethod;
      }, "nodeWrap");
      var createHmacOutputMethod = /* @__PURE__ */ __name(function(outputType, is224) {
        return function(key, message) {
          return new HmacSha256(key, is224, true).update(message)[outputType]();
        };
      }, "createHmacOutputMethod");
      var createHmacMethod = /* @__PURE__ */ __name(function(is224) {
        var method = createHmacOutputMethod("hex", is224);
        method.create = function(key) {
          return new HmacSha256(key, is224);
        };
        method.update = function(key, message) {
          return method.create(key).update(message);
        };
        for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
          var type = OUTPUT_TYPES[i];
          method[type] = createHmacOutputMethod(type, is224);
        }
        return method;
      }, "createHmacMethod");
      function Sha256(is224, sharedMemory) {
        if (sharedMemory) {
          blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
          this.blocks = blocks;
        } else {
          this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
        if (is224) {
          this.h0 = 3238371032;
          this.h1 = 914150663;
          this.h2 = 812702999;
          this.h3 = 4144912697;
          this.h4 = 4290775857;
          this.h5 = 1750603025;
          this.h6 = 1694076839;
          this.h7 = 3204075428;
        } else {
          this.h0 = 1779033703;
          this.h1 = 3144134277;
          this.h2 = 1013904242;
          this.h3 = 2773480762;
          this.h4 = 1359893119;
          this.h5 = 2600822924;
          this.h6 = 528734635;
          this.h7 = 1541459225;
        }
        this.block = this.start = this.bytes = this.hBytes = 0;
        this.finalized = this.hashed = false;
        this.first = true;
        this.is224 = is224;
      }
      __name(Sha256, "Sha256");
      Sha256.prototype.update = function(message) {
        if (this.finalized) {
          return;
        }
        var notString, type = typeof message;
        if (type !== "string") {
          if (type === "object") {
            if (message === null) {
              throw new Error(ERROR);
            } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
              message = new Uint8Array(message);
            } else if (!Array.isArray(message)) {
              if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
                throw new Error(ERROR);
              }
            }
          } else {
            throw new Error(ERROR);
          }
          notString = true;
        }
        var code, index = 0, i, length = message.length, blocks2 = this.blocks;
        while (index < length) {
          if (this.hashed) {
            this.hashed = false;
            blocks2[0] = this.block;
            this.block = blocks2[16] = blocks2[1] = blocks2[2] = blocks2[3] = blocks2[4] = blocks2[5] = blocks2[6] = blocks2[7] = blocks2[8] = blocks2[9] = blocks2[10] = blocks2[11] = blocks2[12] = blocks2[13] = blocks2[14] = blocks2[15] = 0;
          }
          if (notString) {
            for (i = this.start; index < length && i < 64; ++index) {
              blocks2[i >>> 2] |= message[index] << SHIFT[i++ & 3];
            }
          } else {
            for (i = this.start; index < length && i < 64; ++index) {
              code = message.charCodeAt(index);
              if (code < 128) {
                blocks2[i >>> 2] |= code << SHIFT[i++ & 3];
              } else if (code < 2048) {
                blocks2[i >>> 2] |= (192 | code >>> 6) << SHIFT[i++ & 3];
                blocks2[i >>> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
              } else if (code < 55296 || code >= 57344) {
                blocks2[i >>> 2] |= (224 | code >>> 12) << SHIFT[i++ & 3];
                blocks2[i >>> 2] |= (128 | code >>> 6 & 63) << SHIFT[i++ & 3];
                blocks2[i >>> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
              } else {
                code = 65536 + ((code & 1023) << 10 | message.charCodeAt(++index) & 1023);
                blocks2[i >>> 2] |= (240 | code >>> 18) << SHIFT[i++ & 3];
                blocks2[i >>> 2] |= (128 | code >>> 12 & 63) << SHIFT[i++ & 3];
                blocks2[i >>> 2] |= (128 | code >>> 6 & 63) << SHIFT[i++ & 3];
                blocks2[i >>> 2] |= (128 | code & 63) << SHIFT[i++ & 3];
              }
            }
          }
          this.lastByteIndex = i;
          this.bytes += i - this.start;
          if (i >= 64) {
            this.block = blocks2[16];
            this.start = i - 64;
            this.hash();
            this.hashed = true;
          } else {
            this.start = i;
          }
        }
        if (this.bytes > 4294967295) {
          this.hBytes += this.bytes / 4294967296 << 0;
          this.bytes = this.bytes % 4294967296;
        }
        return this;
      };
      Sha256.prototype.finalize = function() {
        if (this.finalized) {
          return;
        }
        this.finalized = true;
        var blocks2 = this.blocks, i = this.lastByteIndex;
        blocks2[16] = this.block;
        blocks2[i >>> 2] |= EXTRA[i & 3];
        this.block = blocks2[16];
        if (i >= 56) {
          if (!this.hashed) {
            this.hash();
          }
          blocks2[0] = this.block;
          blocks2[16] = blocks2[1] = blocks2[2] = blocks2[3] = blocks2[4] = blocks2[5] = blocks2[6] = blocks2[7] = blocks2[8] = blocks2[9] = blocks2[10] = blocks2[11] = blocks2[12] = blocks2[13] = blocks2[14] = blocks2[15] = 0;
        }
        blocks2[14] = this.hBytes << 3 | this.bytes >>> 29;
        blocks2[15] = this.bytes << 3;
        this.hash();
      };
      Sha256.prototype.hash = function() {
        var a = this.h0, b = this.h1, c = this.h2, d = this.h3, e = this.h4, f = this.h5, g = this.h6, h = this.h7, blocks2 = this.blocks, j, s0, s1, maj, t1, t2, ch, ab, da, cd, bc;
        for (j = 16; j < 64; ++j) {
          t1 = blocks2[j - 15];
          s0 = (t1 >>> 7 | t1 << 25) ^ (t1 >>> 18 | t1 << 14) ^ t1 >>> 3;
          t1 = blocks2[j - 2];
          s1 = (t1 >>> 17 | t1 << 15) ^ (t1 >>> 19 | t1 << 13) ^ t1 >>> 10;
          blocks2[j] = blocks2[j - 16] + s0 + blocks2[j - 7] + s1 << 0;
        }
        bc = b & c;
        for (j = 0; j < 64; j += 4) {
          if (this.first) {
            if (this.is224) {
              ab = 300032;
              t1 = blocks2[0] - 1413257819;
              h = t1 - 150054599 << 0;
              d = t1 + 24177077 << 0;
            } else {
              ab = 704751109;
              t1 = blocks2[0] - 210244248;
              h = t1 - 1521486534 << 0;
              d = t1 + 143694565 << 0;
            }
            this.first = false;
          } else {
            s0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
            s1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
            ab = a & b;
            maj = ab ^ a & c ^ bc;
            ch = e & f ^ ~e & g;
            t1 = h + s1 + ch + K[j] + blocks2[j];
            t2 = s0 + maj;
            h = d + t1 << 0;
            d = t1 + t2 << 0;
          }
          s0 = (d >>> 2 | d << 30) ^ (d >>> 13 | d << 19) ^ (d >>> 22 | d << 10);
          s1 = (h >>> 6 | h << 26) ^ (h >>> 11 | h << 21) ^ (h >>> 25 | h << 7);
          da = d & a;
          maj = da ^ d & b ^ ab;
          ch = h & e ^ ~h & f;
          t1 = g + s1 + ch + K[j + 1] + blocks2[j + 1];
          t2 = s0 + maj;
          g = c + t1 << 0;
          c = t1 + t2 << 0;
          s0 = (c >>> 2 | c << 30) ^ (c >>> 13 | c << 19) ^ (c >>> 22 | c << 10);
          s1 = (g >>> 6 | g << 26) ^ (g >>> 11 | g << 21) ^ (g >>> 25 | g << 7);
          cd = c & d;
          maj = cd ^ c & a ^ da;
          ch = g & h ^ ~g & e;
          t1 = f + s1 + ch + K[j + 2] + blocks2[j + 2];
          t2 = s0 + maj;
          f = b + t1 << 0;
          b = t1 + t2 << 0;
          s0 = (b >>> 2 | b << 30) ^ (b >>> 13 | b << 19) ^ (b >>> 22 | b << 10);
          s1 = (f >>> 6 | f << 26) ^ (f >>> 11 | f << 21) ^ (f >>> 25 | f << 7);
          bc = b & c;
          maj = bc ^ b & d ^ cd;
          ch = f & g ^ ~f & h;
          t1 = e + s1 + ch + K[j + 3] + blocks2[j + 3];
          t2 = s0 + maj;
          e = a + t1 << 0;
          a = t1 + t2 << 0;
          this.chromeBugWorkAround = true;
        }
        this.h0 = this.h0 + a << 0;
        this.h1 = this.h1 + b << 0;
        this.h2 = this.h2 + c << 0;
        this.h3 = this.h3 + d << 0;
        this.h4 = this.h4 + e << 0;
        this.h5 = this.h5 + f << 0;
        this.h6 = this.h6 + g << 0;
        this.h7 = this.h7 + h << 0;
      };
      Sha256.prototype.hex = function() {
        this.finalize();
        var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5, h6 = this.h6, h7 = this.h7;
        var hex = HEX_CHARS[h0 >>> 28 & 15] + HEX_CHARS[h0 >>> 24 & 15] + HEX_CHARS[h0 >>> 20 & 15] + HEX_CHARS[h0 >>> 16 & 15] + HEX_CHARS[h0 >>> 12 & 15] + HEX_CHARS[h0 >>> 8 & 15] + HEX_CHARS[h0 >>> 4 & 15] + HEX_CHARS[h0 & 15] + HEX_CHARS[h1 >>> 28 & 15] + HEX_CHARS[h1 >>> 24 & 15] + HEX_CHARS[h1 >>> 20 & 15] + HEX_CHARS[h1 >>> 16 & 15] + HEX_CHARS[h1 >>> 12 & 15] + HEX_CHARS[h1 >>> 8 & 15] + HEX_CHARS[h1 >>> 4 & 15] + HEX_CHARS[h1 & 15] + HEX_CHARS[h2 >>> 28 & 15] + HEX_CHARS[h2 >>> 24 & 15] + HEX_CHARS[h2 >>> 20 & 15] + HEX_CHARS[h2 >>> 16 & 15] + HEX_CHARS[h2 >>> 12 & 15] + HEX_CHARS[h2 >>> 8 & 15] + HEX_CHARS[h2 >>> 4 & 15] + HEX_CHARS[h2 & 15] + HEX_CHARS[h3 >>> 28 & 15] + HEX_CHARS[h3 >>> 24 & 15] + HEX_CHARS[h3 >>> 20 & 15] + HEX_CHARS[h3 >>> 16 & 15] + HEX_CHARS[h3 >>> 12 & 15] + HEX_CHARS[h3 >>> 8 & 15] + HEX_CHARS[h3 >>> 4 & 15] + HEX_CHARS[h3 & 15] + HEX_CHARS[h4 >>> 28 & 15] + HEX_CHARS[h4 >>> 24 & 15] + HEX_CHARS[h4 >>> 20 & 15] + HEX_CHARS[h4 >>> 16 & 15] + HEX_CHARS[h4 >>> 12 & 15] + HEX_CHARS[h4 >>> 8 & 15] + HEX_CHARS[h4 >>> 4 & 15] + HEX_CHARS[h4 & 15] + HEX_CHARS[h5 >>> 28 & 15] + HEX_CHARS[h5 >>> 24 & 15] + HEX_CHARS[h5 >>> 20 & 15] + HEX_CHARS[h5 >>> 16 & 15] + HEX_CHARS[h5 >>> 12 & 15] + HEX_CHARS[h5 >>> 8 & 15] + HEX_CHARS[h5 >>> 4 & 15] + HEX_CHARS[h5 & 15] + HEX_CHARS[h6 >>> 28 & 15] + HEX_CHARS[h6 >>> 24 & 15] + HEX_CHARS[h6 >>> 20 & 15] + HEX_CHARS[h6 >>> 16 & 15] + HEX_CHARS[h6 >>> 12 & 15] + HEX_CHARS[h6 >>> 8 & 15] + HEX_CHARS[h6 >>> 4 & 15] + HEX_CHARS[h6 & 15];
        if (!this.is224) {
          hex += HEX_CHARS[h7 >>> 28 & 15] + HEX_CHARS[h7 >>> 24 & 15] + HEX_CHARS[h7 >>> 20 & 15] + HEX_CHARS[h7 >>> 16 & 15] + HEX_CHARS[h7 >>> 12 & 15] + HEX_CHARS[h7 >>> 8 & 15] + HEX_CHARS[h7 >>> 4 & 15] + HEX_CHARS[h7 & 15];
        }
        return hex;
      };
      Sha256.prototype.toString = Sha256.prototype.hex;
      Sha256.prototype.digest = function() {
        this.finalize();
        var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3, h4 = this.h4, h5 = this.h5, h6 = this.h6, h7 = this.h7;
        var arr = [
          h0 >>> 24 & 255,
          h0 >>> 16 & 255,
          h0 >>> 8 & 255,
          h0 & 255,
          h1 >>> 24 & 255,
          h1 >>> 16 & 255,
          h1 >>> 8 & 255,
          h1 & 255,
          h2 >>> 24 & 255,
          h2 >>> 16 & 255,
          h2 >>> 8 & 255,
          h2 & 255,
          h3 >>> 24 & 255,
          h3 >>> 16 & 255,
          h3 >>> 8 & 255,
          h3 & 255,
          h4 >>> 24 & 255,
          h4 >>> 16 & 255,
          h4 >>> 8 & 255,
          h4 & 255,
          h5 >>> 24 & 255,
          h5 >>> 16 & 255,
          h5 >>> 8 & 255,
          h5 & 255,
          h6 >>> 24 & 255,
          h6 >>> 16 & 255,
          h6 >>> 8 & 255,
          h6 & 255
        ];
        if (!this.is224) {
          arr.push(h7 >>> 24 & 255, h7 >>> 16 & 255, h7 >>> 8 & 255, h7 & 255);
        }
        return arr;
      };
      Sha256.prototype.array = Sha256.prototype.digest;
      Sha256.prototype.arrayBuffer = function() {
        this.finalize();
        var buffer = new ArrayBuffer(this.is224 ? 28 : 32);
        var dataView = new DataView(buffer);
        dataView.setUint32(0, this.h0);
        dataView.setUint32(4, this.h1);
        dataView.setUint32(8, this.h2);
        dataView.setUint32(12, this.h3);
        dataView.setUint32(16, this.h4);
        dataView.setUint32(20, this.h5);
        dataView.setUint32(24, this.h6);
        if (!this.is224) {
          dataView.setUint32(28, this.h7);
        }
        return buffer;
      };
      function HmacSha256(key, is224, sharedMemory) {
        var i, type = typeof key;
        if (type === "string") {
          var bytes = [], length = key.length, index = 0, code;
          for (i = 0; i < length; ++i) {
            code = key.charCodeAt(i);
            if (code < 128) {
              bytes[index++] = code;
            } else if (code < 2048) {
              bytes[index++] = 192 | code >>> 6;
              bytes[index++] = 128 | code & 63;
            } else if (code < 55296 || code >= 57344) {
              bytes[index++] = 224 | code >>> 12;
              bytes[index++] = 128 | code >>> 6 & 63;
              bytes[index++] = 128 | code & 63;
            } else {
              code = 65536 + ((code & 1023) << 10 | key.charCodeAt(++i) & 1023);
              bytes[index++] = 240 | code >>> 18;
              bytes[index++] = 128 | code >>> 12 & 63;
              bytes[index++] = 128 | code >>> 6 & 63;
              bytes[index++] = 128 | code & 63;
            }
          }
          key = bytes;
        } else {
          if (type === "object") {
            if (key === null) {
              throw new Error(ERROR);
            } else if (ARRAY_BUFFER && key.constructor === ArrayBuffer) {
              key = new Uint8Array(key);
            } else if (!Array.isArray(key)) {
              if (!ARRAY_BUFFER || !ArrayBuffer.isView(key)) {
                throw new Error(ERROR);
              }
            }
          } else {
            throw new Error(ERROR);
          }
        }
        if (key.length > 64) {
          key = new Sha256(is224, true).update(key).array();
        }
        var oKeyPad = [], iKeyPad = [];
        for (i = 0; i < 64; ++i) {
          var b = key[i] || 0;
          oKeyPad[i] = 92 ^ b;
          iKeyPad[i] = 54 ^ b;
        }
        Sha256.call(this, is224, sharedMemory);
        this.update(iKeyPad);
        this.oKeyPad = oKeyPad;
        this.inner = true;
        this.sharedMemory = sharedMemory;
      }
      __name(HmacSha256, "HmacSha256");
      HmacSha256.prototype = new Sha256();
      HmacSha256.prototype.finalize = function() {
        Sha256.prototype.finalize.call(this);
        if (this.inner) {
          this.inner = false;
          var innerHash = this.array();
          Sha256.call(this, this.is224, this.sharedMemory);
          this.update(this.oKeyPad);
          this.update(innerHash);
          Sha256.prototype.finalize.call(this);
        }
      };
      var exports3 = createMethod();
      exports3.sha256 = exports3;
      exports3.sha224 = createMethod(true);
      exports3.sha256.hmac = createHmacMethod();
      exports3.sha224.hmac = createHmacMethod(true);
      if (COMMON_JS) {
        module2.exports = exports3;
      } else {
        root.sha256 = exports3.sha256;
        root.sha224 = exports3.sha224;
        if (AMD) {
          define(function() {
            return exports3;
          });
        }
      }
    })();
  }
});

// node_modules/@nats-io/obj/lib/sha_digest.parser.js
var require_sha_digest_parser = __commonJS({
  "node_modules/@nats-io/obj/lib/sha_digest.parser.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.parseSha256 = parseSha256;
    exports2.checkSha256 = checkSha256;
    function parseSha256(s) {
      return toByteArray(s);
    }
    __name(parseSha256, "parseSha256");
    function isHex(s) {
      const hexRegex = /^[0-9A-Fa-f]+$/;
      if (!hexRegex.test(s)) {
        return false;
      }
      const isAllUpperCase = /^[0-9A-F]+$/.test(s);
      const isAllLowerCase = /^[0-9a-f]+$/.test(s);
      if (!(isAllUpperCase || isAllLowerCase)) {
        return false;
      }
      return s.length % 2 === 0;
    }
    __name(isHex, "isHex");
    function isBase64(s) {
      return /^[A-Za-z0-9\-_]*(={0,2})?$/.test(s) || /^[A-Za-z0-9+/]*(={0,2})?$/.test(s);
    }
    __name(isBase64, "isBase64");
    function detectEncoding(input) {
      if (isHex(input)) {
        return "hex";
      } else if (isBase64(input)) {
        return "b64";
      }
      return "";
    }
    __name(detectEncoding, "detectEncoding");
    function hexToByteArray(s) {
      if (s.length % 2 !== 0) {
        throw new Error("hex string must have an even length");
      }
      const a = new Uint8Array(s.length / 2);
      for (let i = 0; i < s.length; i += 2) {
        a[i / 2] = parseInt(s.substring(i, i + 2), 16);
      }
      return a;
    }
    __name(hexToByteArray, "hexToByteArray");
    function base64ToByteArray(s) {
      s = s.replace(/-/g, "+");
      s = s.replace(/_/g, "/");
      const sbin = atob(s);
      return Uint8Array.from(sbin, (c) => c.charCodeAt(0));
    }
    __name(base64ToByteArray, "base64ToByteArray");
    function toByteArray(input) {
      const encoding = detectEncoding(input);
      switch (encoding) {
        case "hex":
          return hexToByteArray(input);
        case "b64":
          return base64ToByteArray(input);
      }
      return null;
    }
    __name(toByteArray, "toByteArray");
    function checkSha256(a, b) {
      const aBytes = typeof a === "string" ? parseSha256(a) : a;
      const bBytes = typeof b === "string" ? parseSha256(b) : b;
      if (aBytes === null || bBytes === null) {
        return false;
      }
      if (aBytes.length !== bBytes.length) {
        return false;
      }
      for (let i = 0; i < aBytes.length; i++) {
        if (aBytes[i] !== bBytes[i]) {
          return false;
        }
      }
      return true;
    }
    __name(checkSha256, "checkSha256");
  }
});

// node_modules/@nats-io/obj/lib/objectstore.js
var require_objectstore = __commonJS({
  "node_modules/@nats-io/obj/lib/objectstore.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ObjectStoreImpl = exports2.ObjectStoreStatusImpl = exports2.Objm = exports2.digestType = exports2.osPrefix = void 0;
    exports2.objectStoreStreamName = objectStoreStreamName;
    exports2.objectStoreBucketName = objectStoreBucketName;
    exports2.validateBucket = validateBucket;
    var internal_1 = require_internal_mod2();
    var internal_2 = require_internal_mod3();
    var base64_1 = require_base64();
    var js_sha256_1 = require_sha256();
    var sha_digest_parser_1 = require_sha_digest_parser();
    exports2.osPrefix = "OBJ_";
    exports2.digestType = "SHA-256=";
    function objectStoreStreamName(bucket) {
      validateBucket(bucket);
      return `${exports2.osPrefix}${bucket}`;
    }
    __name(objectStoreStreamName, "objectStoreStreamName");
    function objectStoreBucketName(stream) {
      if (stream.startsWith(exports2.osPrefix)) {
        return stream.substring(4);
      }
      return stream;
    }
    __name(objectStoreBucketName, "objectStoreBucketName");
    var _Objm_instances, maybeCreate_fn;
    var _Objm = class _Objm {
      /**
       * Creates an instance of the Objm that allows you to create and access ObjectStore.
       * Note that if the argument is a NatsConnection, default JetStream Options are
       * used. If you want to set some options, please provide a JetStreamClient instead.
       * @param nc
       */
      constructor(nc) {
        __privateAdd(this, _Objm_instances);
        __publicField(this, "js");
        this.js = (0, internal_2.toJetStreamClient)(nc);
      }
      /**
       * Creates and opens the specified ObjectStore. If the ObjectStore already exists,
       * it opens the existing ObjectStore.
       * @param name
       * @param opts
       */
      create(name, opts = {}) {
        return __privateMethod(this, _Objm_instances, maybeCreate_fn).call(this, name, opts);
      }
      /**
       * Opens the specified ObjectStore
       * @param name
       * @param check - if set to false, it will not check if the ObjectStore exists.
       */
      async open(name, check = true) {
        const jsm = await this.js.jetstreamManager();
        const os = new ObjectStoreImpl(name, jsm, this.js);
        os.stream = objectStoreStreamName(name);
        if (check) {
          await os.status();
        }
        return Promise.resolve(os);
      }
      /**
       * Returns a list of ObjectStoreStatus for all streams that are identified as
       * being a ObjectStore (that is having names that have the prefix `OBJ_`)
       */
      list() {
        const filter = /* @__PURE__ */ __name((v) => {
          const slr = v;
          const streams = slr.streams.filter((v2) => {
            return v2.config.name.startsWith(exports2.osPrefix);
          });
          streams.forEach((si) => {
            si.config.sealed = si.config.sealed || false;
            si.config.deny_delete = si.config.deny_delete || false;
            si.config.deny_purge = si.config.deny_purge || false;
            si.config.allow_rollup_hdrs = si.config.allow_rollup_hdrs || false;
          });
          return streams.map((si) => {
            return new ObjectStoreStatusImpl(si);
          });
        }, "filter");
        const subj = `${this.js.prefix}.STREAM.LIST`;
        return new internal_2.ListerImpl(subj, filter, this.js);
      }
    };
    _Objm_instances = new WeakSet();
    maybeCreate_fn = /* @__PURE__ */ __name(function(name, opts = {}) {
      var _a;
      if (typeof ((_a = crypto == null ? void 0 : crypto.subtle) == null ? void 0 : _a.digest) !== "function") {
        return Promise.reject(new Error("objectstore: unable to calculate hashes - crypto.subtle.digest with sha256 support is required"));
      }
      const { ok, min } = this.js.nc.features.get(internal_1.Feature.JS_OBJECTSTORE);
      if (!ok) {
        return Promise.reject(new Error(`objectstore is only supported on servers ${min} or better`));
      }
      return ObjectStoreImpl.create(this.js, name, opts);
    }, "#maybeCreate");
    __name(_Objm, "Objm");
    var Objm2 = _Objm;
    exports2.Objm = Objm2;
    var _ObjectStoreStatusImpl = class _ObjectStoreStatusImpl {
      si;
      backingStore;
      constructor(si) {
        this.si = si;
        this.backingStore = "JetStream";
      }
      get bucket() {
        return objectStoreBucketName(this.si.config.name);
      }
      get description() {
        return this.si.config.description ?? "";
      }
      get ttl() {
        return this.si.config.max_age;
      }
      get storage() {
        return this.si.config.storage;
      }
      get replicas() {
        return this.si.config.num_replicas;
      }
      get sealed() {
        return this.si.config.sealed;
      }
      get size() {
        return this.si.state.bytes;
      }
      get streamInfo() {
        return this.si;
      }
      get metadata() {
        return this.si.config.metadata;
      }
      get compression() {
        if (this.si.config.compression) {
          return this.si.config.compression !== internal_2.StoreCompression.None;
        }
        return false;
      }
    };
    __name(_ObjectStoreStatusImpl, "ObjectStoreStatusImpl");
    var ObjectStoreStatusImpl = _ObjectStoreStatusImpl;
    exports2.ObjectStoreStatusImpl = ObjectStoreStatusImpl;
    function validateBucket(name) {
      const validBucketRe = /^[-\w]+$/;
      if (!validBucketRe.test(name)) {
        throw new Error(`invalid bucket name: ${name}`);
      }
    }
    __name(validateBucket, "validateBucket");
    var _ObjectInfoImpl = class _ObjectInfoImpl {
      info;
      hdrs;
      constructor(oi) {
        this.info = oi;
      }
      get name() {
        return this.info.name;
      }
      get description() {
        return this.info.description ?? "";
      }
      get headers() {
        if (!this.hdrs) {
          this.hdrs = internal_1.MsgHdrsImpl.fromRecord(this.info.headers || {});
        }
        return this.hdrs;
      }
      get options() {
        return this.info.options;
      }
      get bucket() {
        return this.info.bucket;
      }
      get chunks() {
        return this.info.chunks;
      }
      get deleted() {
        return this.info.deleted ?? false;
      }
      get digest() {
        return this.info.digest;
      }
      get mtime() {
        return this.info.mtime;
      }
      get nuid() {
        return this.info.nuid;
      }
      get size() {
        return this.info.size;
      }
      get revision() {
        return this.info.revision;
      }
      get metadata() {
        return this.info.metadata || {};
      }
      isLink() {
        var _a, _b;
        return ((_a = this.info.options) == null ? void 0 : _a.link) !== void 0 && ((_b = this.info.options) == null ? void 0 : _b.link) !== null;
      }
    };
    __name(_ObjectInfoImpl, "ObjectInfoImpl");
    var ObjectInfoImpl = _ObjectInfoImpl;
    function toServerObjectStoreMeta(meta) {
      const v = {
        name: meta.name,
        description: meta.description ?? "",
        options: meta.options,
        metadata: meta.metadata
      };
      if (meta.headers) {
        const mhi = meta.headers;
        v.headers = mhi.toRecord();
      }
      return v;
    }
    __name(toServerObjectStoreMeta, "toServerObjectStoreMeta");
    function emptyReadableStream() {
      return new ReadableStream({
        pull(c) {
          c.enqueue(new Uint8Array(0));
          c.close();
        }
      });
    }
    __name(emptyReadableStream, "emptyReadableStream");
    var _ObjectStoreImpl = class _ObjectStoreImpl {
      jsm;
      js;
      stream;
      name;
      constructor(name, jsm, js) {
        this.name = name;
        this.jsm = jsm;
        this.js = js;
      }
      _checkNotEmpty(name) {
        if (!name || name.length === 0) {
          return { name, error: new Error("name cannot be empty") };
        }
        return { name };
      }
      async info(name) {
        const info = await this.rawInfo(name);
        return info ? new ObjectInfoImpl(info) : null;
      }
      async list() {
        const buf = [];
        const iter = await this.watch({
          ignoreDeletes: true,
          includeHistory: true,
          //@ts-ignore: hidden
          historyOnly: true
        });
        for await (const info of iter) {
          buf.push(info);
        }
        return Promise.resolve(buf);
      }
      async rawInfo(name) {
        const { name: obj, error } = this._checkNotEmpty(name);
        if (error) {
          return Promise.reject(error);
        }
        const meta = this._metaSubject(obj);
        try {
          const m = await this.jsm.streams.getMessage(this.stream, {
            last_by_subj: meta
          });
          if (m === null) {
            return null;
          }
          const soi = m.json();
          soi.revision = m.seq;
          return soi;
        } catch (err) {
          return Promise.reject(err);
        }
      }
      async _si(opts) {
        try {
          return await this.jsm.streams.info(this.stream, opts);
        } catch (err) {
          if (err instanceof internal_2.JetStreamApiError && err.code === internal_2.JetStreamApiCodes.StreamNotFound) {
            return null;
          }
          return Promise.reject(err);
        }
      }
      async seal() {
        let info = await this._si();
        if (info === null) {
          return Promise.reject(new Error("object store not found"));
        }
        info.config.sealed = true;
        info = await this.jsm.streams.update(this.stream, info.config);
        return Promise.resolve(new ObjectStoreStatusImpl(info));
      }
      async status(opts) {
        const info = await this._si(opts);
        if (info === null) {
          return Promise.reject(new Error("object store not found"));
        }
        return Promise.resolve(new ObjectStoreStatusImpl(info));
      }
      destroy() {
        return this.jsm.streams.delete(this.stream);
      }
      async _put(meta, rs, opts) {
        var _a;
        const jsopts = this.js.getOptions();
        opts = opts || { timeout: jsopts.timeout };
        opts.timeout = opts.timeout || jsopts.timeout;
        opts.previousRevision = opts.previousRevision ?? void 0;
        const { timeout, previousRevision } = opts;
        const si = this.js.nc.info;
        const maxPayload = (si == null ? void 0 : si.max_payload) || 1024;
        meta = meta || {};
        meta.options = meta.options || {};
        let maxChunk = ((_a = meta.options) == null ? void 0 : _a.max_chunk_size) || 128 * 1024;
        maxChunk = maxChunk > maxPayload ? maxPayload : maxChunk;
        meta.options.max_chunk_size = maxChunk;
        const old = await this.info(meta.name);
        const { name: n, error } = this._checkNotEmpty(meta.name);
        if (error) {
          return Promise.reject(error);
        }
        const id = internal_1.nuid.next();
        const chunkSubj = this._chunkSubject(id);
        const metaSubj = this._metaSubject(n);
        const info = Object.assign({
          bucket: this.name,
          nuid: id,
          size: 0,
          chunks: 0
        }, toServerObjectStoreMeta(meta));
        const d = (0, internal_1.deferred)();
        const db = new internal_1.DataBuffer();
        try {
          const reader = rs ? rs.getReader() : null;
          const sha = js_sha256_1.sha256.create();
          while (true) {
            const { done, value } = reader ? await reader.read() : { done: true, value: void 0 };
            if (done) {
              if (db.size() > 0) {
                const payload = db.drain();
                sha.update(payload);
                info.chunks++;
                info.size += payload.length;
                await this.js.publish(chunkSubj, payload, { timeout });
              }
              info.mtime = (/* @__PURE__ */ new Date()).toISOString();
              const digest = base64_1.Base64UrlPaddedCodec.encode(Uint8Array.from(sha.digest()));
              info.digest = `${exports2.digestType}${digest}`;
              info.deleted = false;
              const h = (0, internal_1.headers)();
              if (typeof previousRevision === "number") {
                h.set(internal_2.PubHeaders.ExpectedLastSubjectSequenceHdr, `${previousRevision}`);
              }
              h.set(internal_2.JsHeaders.RollupHdr, internal_2.JsHeaders.RollupValueSubject);
              const pa = await this.js.publish(metaSubj, JSON.stringify(info), {
                headers: h,
                timeout
              });
              info.revision = pa.seq;
              if (old) {
                try {
                  await this.jsm.streams.purge(this.stream, {
                    filter: `$O.${this.name}.C.${old.nuid}`
                  });
                } catch (_err) {
                }
              }
              d.resolve(new ObjectInfoImpl(info));
              break;
            }
            if (value) {
              db.fill(value);
              while (db.size() > maxChunk) {
                info.chunks++;
                info.size += maxChunk;
                const payload = db.drain(meta.options.max_chunk_size);
                sha.update(payload);
                await this.js.publish(chunkSubj, payload, { timeout });
              }
            }
          }
        } catch (err) {
          await this.jsm.streams.purge(this.stream, { filter: chunkSubj });
          d.reject(err);
        }
        return d;
      }
      putBlob(meta, data, opts) {
        function readableStreamFrom(data2) {
          return new ReadableStream({
            pull(controller) {
              controller.enqueue(data2);
              controller.close();
            }
          });
        }
        __name(readableStreamFrom, "readableStreamFrom");
        if (data === null) {
          data = new Uint8Array(0);
        }
        return this.put(meta, readableStreamFrom(data), opts);
      }
      put(meta, rs, opts) {
        var _a;
        if ((_a = meta == null ? void 0 : meta.options) == null ? void 0 : _a.link) {
          return Promise.reject(new Error("link cannot be set when putting the object in bucket"));
        }
        return this._put(meta, rs, opts);
      }
      async getBlob(name) {
        async function fromReadableStream(rs) {
          const buf = new internal_1.DataBuffer();
          const reader = rs.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              return buf.drain();
            }
            if (value && value.length) {
              buf.fill(value);
            }
          }
        }
        __name(fromReadableStream, "fromReadableStream");
        const r = await this.get(name);
        if (r === null) {
          return Promise.resolve(null);
        }
        const vs = await Promise.all([r.error, fromReadableStream(r.data)]);
        if (vs[0]) {
          return Promise.reject(vs[0]);
        } else {
          return Promise.resolve(vs[1]);
        }
      }
      async get(name) {
        const info = await this.rawInfo(name);
        if (info === null) {
          return Promise.resolve(null);
        }
        if (info.deleted) {
          return Promise.resolve(null);
        }
        if (info.options && info.options.link) {
          const ln = info.options.link.name || "";
          if (ln === "") {
            throw new Error("link is a bucket");
          }
          const os = info.options.link.bucket !== this.name ? await _ObjectStoreImpl.create(this.js, info.options.link.bucket) : this;
          return os.get(ln);
        }
        if (!info.digest.startsWith(exports2.digestType)) {
          return Promise.reject(new Error(`unknown digest type: ${info.digest}`));
        }
        const digest = (0, sha_digest_parser_1.parseSha256)(info.digest.substring(8));
        if (digest === null) {
          return Promise.reject(new Error(`unable to parse digest: ${info.digest}`));
        }
        const d = (0, internal_1.deferred)();
        const r = {
          info: new ObjectInfoImpl(info),
          error: d
        };
        if (info.size === 0) {
          r.data = emptyReadableStream();
          d.resolve(null);
          return Promise.resolve(r);
        }
        const sha = js_sha256_1.sha256.create();
        let controller;
        const cc = {};
        cc.filter_subject = `$O.${this.name}.C.${info.nuid}`;
        cc.idle_heartbeat = (0, internal_1.nanos)(3e4);
        cc.flow_control = true;
        const oc = await this.js.consumers.getPushConsumer(this.stream, cc);
        const iter = await oc.consume();
        (async () => {
          for await (const jm of iter) {
            if (jm.data.length > 0) {
              sha.update(jm.data);
              controller.enqueue(jm.data);
            }
            if (jm.info.pending === 0) {
              const digest2 = Uint8Array.from(sha.digest());
              if (!(0, sha_digest_parser_1.checkSha256)(digest2, Uint8Array.from(sha.digest()))) {
                controller.error(new Error(`received a corrupt object, digests do not match received: ${info.digest} calculated ${digest2}`));
              } else {
                controller.close();
              }
              break;
            }
          }
        })().then(() => {
          d.resolve();
        }).catch((err) => {
          controller.error(err);
          d.reject(err);
        });
        r.data = new ReadableStream({
          start(c) {
            controller = c;
          },
          cancel() {
            iter.stop();
          }
        });
        return r;
      }
      linkStore(name, bucket) {
        if (!(bucket instanceof _ObjectStoreImpl)) {
          return Promise.reject("bucket required");
        }
        const osi = bucket;
        const { name: n, error } = this._checkNotEmpty(name);
        if (error) {
          return Promise.reject(error);
        }
        const meta = {
          name: n,
          options: { link: { bucket: osi.name } }
        };
        return this._put(meta, null);
      }
      async link(name, info) {
        const { name: n, error } = this._checkNotEmpty(name);
        if (error) {
          return Promise.reject(error);
        }
        if (info.deleted) {
          return Promise.reject(new Error("src object is deleted"));
        }
        if (info.isLink()) {
          return Promise.reject(new Error("src object is a link"));
        }
        const dest = await this.rawInfo(name);
        if (dest !== null && !dest.deleted) {
          return Promise.reject(new Error("an object already exists with that name"));
        }
        const link = { bucket: info.bucket, name: info.name };
        const mm = {
          name: n,
          bucket: info.bucket,
          options: { link }
        };
        await this.js.publish(this._metaSubject(name), JSON.stringify(mm));
        const i = await this.info(name);
        return Promise.resolve(i);
      }
      async delete(name) {
        const info = await this.rawInfo(name);
        if (info === null) {
          return Promise.resolve({ purged: 0, success: false });
        }
        info.deleted = true;
        info.size = 0;
        info.chunks = 0;
        info.digest = "";
        const h = (0, internal_1.headers)();
        h.set(internal_2.JsHeaders.RollupHdr, internal_2.JsHeaders.RollupValueSubject);
        await this.js.publish(this._metaSubject(info.name), JSON.stringify(info), {
          headers: h
        });
        return this.jsm.streams.purge(this.stream, {
          filter: this._chunkSubject(info.nuid)
        });
      }
      async update(name, meta = {}) {
        const info = await this.rawInfo(name);
        if (info === null) {
          return Promise.reject(new Error("object not found"));
        }
        if (info.deleted) {
          return Promise.reject(new Error("cannot update meta for a deleted object"));
        }
        meta.name = meta.name ?? info.name;
        const { name: n, error } = this._checkNotEmpty(meta.name);
        if (error) {
          return Promise.reject(error);
        }
        if (name !== meta.name) {
          const i = await this.info(meta.name);
          if (i && !i.deleted) {
            return Promise.reject(new Error("an object already exists with that name"));
          }
        }
        meta.name = n;
        const ii = Object.assign({}, info, toServerObjectStoreMeta(meta));
        const ack = await this.js.publish(this._metaSubject(ii.name), JSON.stringify(ii));
        if (name !== meta.name) {
          await this.jsm.streams.purge(this.stream, {
            filter: this._metaSubject(name)
          });
        }
        return Promise.resolve(ack);
      }
      async watch(opts = {}) {
        opts.includeHistory = opts.includeHistory ?? false;
        opts.ignoreDeletes = opts.ignoreDeletes ?? false;
        const historyOnly = opts.historyOnly ?? false;
        const qi = new internal_1.QueuedIteratorImpl();
        const subj = this._metaSubjectAll();
        try {
          await this.jsm.streams.getMessage(this.stream, { last_by_subj: subj });
        } catch (err) {
          if (!(0, internal_2.isMessageNotFound)(err)) {
            qi.stop(err);
          }
        }
        const cc = {};
        cc.name = `OBJ_WATCHER_${internal_1.nuid.next()}`;
        cc.filter_subject = subj;
        if (opts.includeHistory) {
          cc.deliver_policy = internal_2.DeliverPolicy.LastPerSubject;
        } else {
          cc.deliver_policy = internal_2.DeliverPolicy.New;
        }
        const oc = await this.js.consumers.getPushConsumer(this.stream, cc);
        const info = await oc.info(true);
        const count = info.num_pending;
        let isUpdate = cc.deliver_policy === internal_2.DeliverPolicy.New || count === 0;
        qi._data = oc;
        let i = 0;
        const iter = await oc.consume({
          callback: /* @__PURE__ */ __name((jm) => {
            if (!isUpdate) {
              i++;
              isUpdate = i >= count;
            }
            const oi = jm.json();
            oi.isUpdate = isUpdate;
            if (oi.deleted && opts.ignoreDeletes === true) {
            } else {
              qi.push(oi);
            }
            if (historyOnly && i === count) {
              iter.stop();
            }
          }, "callback")
        });
        (async () => {
          for await (const s of iter.status()) {
            switch (s.type) {
              case "heartbeat":
                if (historyOnly) {
                  qi.push(() => {
                    qi.stop();
                  });
                }
            }
          }
        })().then();
        if (historyOnly && count === 0) {
          iter.stop();
        }
        iter.closed().then(() => {
          qi.push(() => {
            qi.stop();
          });
        });
        qi.iterClosed.then(() => {
          iter.stop();
        });
        return qi;
      }
      _chunkSubject(id) {
        return `$O.${this.name}.C.${id}`;
      }
      _metaSubject(n) {
        return `$O.${this.name}.M.${base64_1.Base64UrlPaddedCodec.encode(n)}`;
      }
      _metaSubjectAll() {
        return `$O.${this.name}.M.>`;
      }
      async init(opts = {}) {
        try {
          this.stream = objectStoreStreamName(this.name);
        } catch (err) {
          return Promise.reject(err);
        }
        const max_age = (opts == null ? void 0 : opts.ttl) || 0;
        delete opts.ttl;
        const sc = Object.assign({ max_age }, opts);
        sc.name = this.stream;
        sc.allow_direct = true;
        sc.allow_rollup_hdrs = true;
        sc.num_replicas = opts.replicas || 1;
        sc.discard = internal_2.DiscardPolicy.New;
        sc.subjects = [`$O.${this.name}.C.>`, `$O.${this.name}.M.>`];
        if (opts.placement) {
          sc.placement = opts.placement;
        }
        if (opts.metadata) {
          sc.metadata = opts.metadata;
        }
        if (typeof opts.compression === "boolean") {
          sc.compression = opts.compression ? internal_2.StoreCompression.S2 : internal_2.StoreCompression.None;
        }
        try {
          await this.jsm.streams.info(sc.name);
        } catch (err) {
          if (err.message === "stream not found") {
            await this.jsm.streams.add(sc);
          }
        }
      }
      static async create(js, name, opts = {}) {
        const jsm = await js.jetstreamManager();
        const os = new _ObjectStoreImpl(name, jsm, js);
        await os.init(opts);
        return Promise.resolve(os);
      }
    };
    __name(_ObjectStoreImpl, "ObjectStoreImpl");
    var ObjectStoreImpl = _ObjectStoreImpl;
    exports2.ObjectStoreImpl = ObjectStoreImpl;
  }
});

// node_modules/@nats-io/obj/lib/internal_mod.js
var require_internal_mod5 = __commonJS({
  "node_modules/@nats-io/obj/lib/internal_mod.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Base64UrlPaddedCodec = exports2.Base64UrlCodec = exports2.Base64Codec = exports2.Objm = exports2.StorageType = void 0;
    var types_1 = require_types5();
    Object.defineProperty(exports2, "StorageType", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return types_1.StorageType;
    }, "get") });
    var objectstore_1 = require_objectstore();
    Object.defineProperty(exports2, "Objm", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return objectstore_1.Objm;
    }, "get") });
    var base64_1 = require_base64();
    Object.defineProperty(exports2, "Base64Codec", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return base64_1.Base64Codec;
    }, "get") });
    Object.defineProperty(exports2, "Base64UrlCodec", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return base64_1.Base64UrlCodec;
    }, "get") });
    Object.defineProperty(exports2, "Base64UrlPaddedCodec", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return base64_1.Base64UrlPaddedCodec;
    }, "get") });
  }
});

// node_modules/@nats-io/obj/lib/mod.js
var require_mod6 = __commonJS({
  "node_modules/@nats-io/obj/lib/mod.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Base64UrlPaddedCodec = exports2.Base64UrlCodec = exports2.Base64Codec = exports2.Objm = exports2.StorageType = void 0;
    var internal_mod_1 = require_internal_mod5();
    Object.defineProperty(exports2, "StorageType", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_1.StorageType;
    }, "get") });
    var internal_mod_2 = require_internal_mod5();
    Object.defineProperty(exports2, "Objm", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_2.Objm;
    }, "get") });
    var internal_mod_3 = require_internal_mod5();
    Object.defineProperty(exports2, "Base64Codec", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_3.Base64Codec;
    }, "get") });
    Object.defineProperty(exports2, "Base64UrlCodec", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_3.Base64UrlCodec;
    }, "get") });
    Object.defineProperty(exports2, "Base64UrlPaddedCodec", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return internal_mod_3.Base64UrlPaddedCodec;
    }, "get") });
  }
});

// bundled/nats-bundle-entry.ts
var nats_bundle_entry_exports = {};
__export(nats_bundle_entry_exports, {
  Empty: () => import_nats_core.Empty,
  JSONCodec: () => JSONCodec,
  Kvm: () => import_kv.Kvm,
  Objm: () => import_obj.Objm,
  StringCodec: () => StringCodec,
  connect: () => import_transport_node.connect,
  consumerOpts: () => consumerOpts,
  createInbox: () => import_nats_core.createInbox,
  credsAuthenticator: () => import_nats_core.credsAuthenticator,
  headers: () => import_nats_core.headers,
  jetstream: () => jetstream,
  jetstreamManager: () => jetstreamManager,
  jwtAuthenticator: () => import_nats_core.jwtAuthenticator,
  nkeyAuthenticator: () => import_nats_core.nkeyAuthenticator,
  tokenAuthenticator: () => import_nats_core.tokenAuthenticator,
  usernamePasswordAuthenticator: () => import_nats_core.usernamePasswordAuthenticator
});
module.exports = __toCommonJS(nats_bundle_entry_exports);
var import_transport_node = __toESM(require_transport_node());
var import_nats_core = __toESM(require_mod3());
var import_jetstream = __toESM(require_mod4());
var import_kv = __toESM(require_mod5());
var import_obj = __toESM(require_mod6());
__reExport(nats_bundle_entry_exports, __toESM(require_transport_node()), module.exports);
__reExport(nats_bundle_entry_exports, __toESM(require_mod3()), module.exports);
__reExport(nats_bundle_entry_exports, __toESM(require_mod4()), module.exports);
__reExport(nats_bundle_entry_exports, __toESM(require_mod5()), module.exports);
__reExport(nats_bundle_entry_exports, __toESM(require_mod6()), module.exports);
var te = new TextEncoder();
var td = new TextDecoder();
function StringCodec() {
  return {
    encode(input) {
      return te.encode(input);
    },
    decode(input) {
      return td.decode(input);
    }
  };
}
__name(StringCodec, "StringCodec");
function JSONCodec() {
  return {
    encode(input) {
      const json = JSON.stringify(input);
      return te.encode(json);
    },
    decode(input) {
      const str = td.decode(input);
      return JSON.parse(str);
    }
  };
}
__name(JSONCodec, "JSONCodec");
function consumerOpts() {
  const opts = {};
  const builder = {
    deliverAll() {
      opts.deliver_policy = "all";
      return this;
    },
    deliverNew() {
      opts.deliver_policy = "new";
      return this;
    },
    deliverLast() {
      opts.deliver_policy = "last";
      return this;
    },
    deliverLastPerSubject() {
      opts.deliver_policy = "last_per_subject";
      return this;
    },
    ackExplicit() {
      opts.ack_policy = "explicit";
      return this;
    },
    manualAck() {
      opts.ack_policy = "explicit";
      return this;
    },
    bind(stream, durable) {
      opts.stream = stream;
      opts.durable = durable;
      return this;
    },
    build() {
      return opts;
    }
  };
  return builder;
}
__name(consumerOpts, "consumerOpts");
var jetstream = import_jetstream.jetstream;
var jetstreamManager = import_jetstream.jetstreamManager;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Empty,
  JSONCodec,
  Kvm,
  Objm,
  StringCodec,
  connect,
  consumerOpts,
  createInbox,
  credsAuthenticator,
  headers,
  jetstream,
  jetstreamManager,
  jwtAuthenticator,
  nkeyAuthenticator,
  tokenAuthenticator,
  usernamePasswordAuthenticator
});
/*! Bundled license information:

js-sha256/src/sha256.js:
  (**
   * [js-sha256]{@link https://github.com/emn178/js-sha256}
   *
   * @version 0.11.1
   * @author Chen, Yi-Cyuan [emn178@gmail.com]
   * @copyright Chen, Yi-Cyuan 2014-2025
   * @license MIT
   *)
*/
