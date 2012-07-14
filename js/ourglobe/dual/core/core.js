og.core.define(
[
	"./ourglobeerror",
	"./runtimeerror",
	"./schemaerror",
	"./funcvererror",
	"./conf",
	"./sys",
	"./assert",
	"./ourglobeobject",
	"./funcver",
	"./schema"
],
function(
	OurGlobeError,
	RuntimeError,
	SchemaError,
	FuncVerError,
	conf,
	sys,
	assert,
	OurGlobeObject,
	FuncVer,
	Schema
)
{

var getF = sys.getFunc;

og.OurGlobeError = OurGlobeError;
og.RuntimeError = RuntimeError;
og.SchemaError = SchemaError;
og.FuncVerError = FuncVerError;
og.conf = conf;
og.sys = sys;
og.getF = getF;
og.assert = assert;
og.OurGlobeObject = OurGlobeObject;
og.FuncVer = FuncVer;
og.Schema = Schema;

OurGlobeError.CONSTR_FV =
new FuncVer(
	[
		OurGlobeError.MSG_S,
		OurGlobeError.VAR_S,
		OurGlobeError.CODE_S,
		OurGlobeError.PLACE_S
	]
);

RuntimeError.MSG_S = OurGlobeError.MSG_S;
RuntimeError.VAR_S = OurGlobeError.VAR_S;
RuntimeError.CODE_S = OurGlobeError.CODE_S;
RuntimeError.PLACE_S = OurGlobeError.PLACE_S;
RuntimeError.CONSTR_FV = OurGlobeError.CONSTR_FV;

sys.extend( OurGlobeError, Error );
sys.extend( RuntimeError, OurGlobeError );
sys.extend( SchemaError, RuntimeError );
sys.extend( FuncVerError, RuntimeError );

FuncVer.PROPER_STR = Schema.PROPER_STR;
FuncVer.R_PROPER_STR = Schema.R_PROPER_STR;
FuncVer.PROPER_STR_L = Schema.PROPER_STR_L;
FuncVer.R_PROPER_STR_L = Schema.R_PROPER_STR_L;
FuncVer.PROPER_OBJ = Schema.PROPER_OBJ;
FuncVer.R_PROPER_OBJ = Schema.R_PROPER_OBJ;
FuncVer.NON_NEG_INT = Schema.NON_NEG_INT;
FuncVer.R_NON_NEG_INT = Schema.R_NON_NEG_INT;
FuncVer.POS_INT = Schema.POS_INT;
FuncVer.R_POS_INT = Schema.R_POS_INT;

var returnVar = 
{
	OurGlobeError: OurGlobeError,
	RuntimeError: RuntimeError,
	SchemaError: SchemaError,
	FuncVerError: FuncVerError,
	conf: conf,
	sys: sys,
	getF: getF,
	assert: assert,
	OurGlobeObject: OurGlobeObject,
	FuncVer: FuncVer,
	Schema: Schema
};

return returnVar;

});
