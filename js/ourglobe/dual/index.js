var OurGlobeError = require("./sys/errors").OurGlobeError;
var RuntimeError = require("./sys/errors").RuntimeError;
var SchemaError = require("./verification/errors").SchemaError;
var FuncVerError = require("./verification/errors").FuncVerError;
var VarVerError = require("./verification/errors").VarVerError;

var conf = require("./conf/conf").conf;
var assert = require("./verification/assert").assert;
var sys = require("./sys/sys").sys;

var FuncVer = require("./verification/funcver").FuncVer;
var VarVer = require("./verification/varver").VarVer;
var Schema = require("./verification/schema").Schema;

var MoreObject = require("./utils/moreobject").MoreObject;

exports.OurGlobeError = OurGlobeError;
exports.RuntimeError = RuntimeError;
exports.FuncVerError = FuncVerError;
exports.VarVerError = VarVerError;

exports.conf = conf;
exports.assert = assert;
exports.sys = sys;

exports.FuncVer = FuncVer;
exports.VarVer = VarVer;
exports.Schema = Schema;

exports.MoreObject = MoreObject;

sys.inherits( OurGlobeError, Error );
sys.inherits( RuntimeError, OurGlobeError );
sys.inherits( SchemaError, RuntimeError );
sys.inherits( FuncVerError, RuntimeError );
sys.inherits( VarVerError, RuntimeError );
