var util = require('util');
var stream = require('stream');

var readable = (function() {
    util.inherits(Readable, stream.Readable);

    function Readable(_readCb, opt) {
        stream.Readable.call(this, opt);
        this._readCb = _readCb;
    }

    Readable.prototype._read = function(n) {
        this._readCb.call(this, n);
    };
    return function(read, opt) {
        return new Readable(read, opt);
    }
})();

var writable = (function() {
    util.inherits(Writable, stream.Writable);

    function Writable(_writeCb, opt) {
        stream.Writable.call(this, opt);
        this._writeCb = _writeCb;
    }

    Writable.prototype._write = function(chunk, encoding, callback) {
        this._writeCb.call(this, chunk, encoding, callback);
    };
    return function(write, opt) {
        return new Writable(write, opt);
    }
})();

var transform = (function() {
    util.inherits(Transform, stream.Transform);

    function Transform(_transformCb, _flushCb, opt) {
        stream.Transform.call(this, opt);
        if (opt) {
            if (opt.readableState) {
                for (var key in opt.readableState) {
                    this._readableState[key] = opt.readableState[key];
                }
            }
            if (opt.writableState) {
                for (var key in opt.writableState) {
                    this._writableState[key] = opt.writableState[key];
                }
            }
        }
        this._transformCb = _transformCb;
        this._flushCb = _flushCb;
    }

    Transform.prototype._transform = function(chunk, encoding, callback) {
        this._transformCb.call(this, chunk, encoding, callback);
    };
    Transform.prototype._flush = function(callback) {
        this._flushCb.call(this, callback);
    };

    return function(write, end, opt) {
        return new Transform(write, end, opt);
    }
})();

var duplex = (function() {
    util.inherits(Duplex, stream.Duplex);

    function Duplex(_writeCb, _readCb, opt) {
        stream.Duplex.call(this, opt);
        this._writeCb = _writeCb;
        this._readCb = _readCb;
    }

    Duplex.prototype._write = function(chunk, encoding, callback) {
        this._writeCb.call(this, chunk, encoding, callback);
    };
    Duplex.prototype._read = function(n) {
        this._readCb.call(this, n);
    };
    return function(write, read, opt) {
        return new Duplex(write, read, opt);
    }
})();


var fromArray = function(arr0, opt) {
    var arr = [].slice.call(arr0);
    return readable(function() {
        var chunk = arr.shift();
        if (typeof chunk === 'undefined') {
            this.push(null);
        } else {
            if (!this.push(chunk)) {
                arr.unshift(chunk);
            }
        }
    }, opt);
}

var map = function(fn, opt) {
    return transform(function(o, encoding, next) {
        fn.call(this, o, next);
    }, function(cb) {
        cb();
    }, opt || {
        readableState: {
            objectMode: true,
            highWaterMark: 1
        },
        writableState: {
            objectMode: true,
            highWaterMark: 1
        }
    });
}


exports = {
    readable: function(fn) {
            readable(fn, {
            objectMode: true,
            highWaterMark: 1
        })
    },
    fromArray: function(arr) {
        fromArray(arr, {
            objectMode: true
        })
    },
    map: map,
    reduce: function(fn, seed) {
        var state = seed;
        return transform(function(e, encoding, cb) {
            state = fn(state, e);
            cb();
        }, function(cb) {
            this.push(state);
            cb();
        }, {
            objectMode: true
        });
    },
    stringify: function() {
        return transform(function(e, encoding, cb) {
            this.push(JSON.stringify(e) + '\n');
            cb();
        }, function(cb) {
            cb();
        }, {
            readableState: {
                objectMode: false
            },
            writableState: {
                objectMode: true
            }
        })
    },
    paraller: function(transformer) {
        var concurLevel = require('os').cpus().length;
        var currConcur = 0;
        var haveNext;
        var upstreamDone;
        var transformerReady = function() {
            currConcur--;
            if (haveNext) {
                haveNext();
            } else if (currConcur === 0 && upstreamDone) {
                upstreamDone();
            }
        };
        var startTransformer = function(chunk, next) {
            currConcur++;
            transformer.call(this, chunk, transformerReady)
        };
        return transform(function(chunk, encoding, next) {
            if (currConcur < concurLevel) {
                startTransformer.call(this, chunk, transformerReady);
                next();
            } else {
                haveNext = (function(downstream, chunk, next) {
                    return function() {
                        startTransformer.call(downstream, chunk, transformerReady);
                        haveNext = null;
                        next();
                    }
                })(this, chunk, next);
            }
        }, function(next) {
            upstreamDone = next;
        }, {
            objectMode: true,
            highWaterMark: 1
        });
    }
}