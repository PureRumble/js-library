ourglobe.core.define(
[
	"./ourglobeerror",
	"./runtimeerror",
	"./funccreationruntimeerror",
	"./schemaerror",
	"./funcvererror",
	"./conf",
	"./sys",
	"./assert",
	"./funcver",
	"./schema",
	"./funcparamver",
	"./argsver",
	"./extraargsver",
	"./returnvarver"
],
function(
	OurGlobeError,
	RuntimeError,
	FuncCreationRuntimeError,
	SchemaError,
	FuncVerError,
	conf,
	sys,
	assert,
	FuncVer,
	Schema,
	FuncParamVer,
	ArgsVer,
	ExtraArgsVer,
	ReturnVarVer
)
{

var hasT = sys.hasType;
var getF = sys.getFunc;
var getCb = sys.getCb;
var getS = Schema.getSchema;
var getV = FuncVer.getFuncVer;
var getA = ArgsVer.getA;
var getR = ReturnVarVer.getR;
var getE = ExtraArgsVer.getE;

ourglobe.OurGlobeError = OurGlobeError;
ourglobe.RuntimeError = RuntimeError;
ourglobe.SchemaError = SchemaError;
ourglobe.FuncVerError = FuncVerError;
ourglobe.conf = conf;
ourglobe.sys = sys;
ourglobe.hasT = hasT;
ourglobe.getF = getF;
ourglobe.getCb = getCb;
ourglobe.getS = getS;
ourglobe.getV = getV;
ourglobe.assert = assert;
ourglobe.FuncVer = FuncVer;
ourglobe.Schema = Schema;
ourglobe.getA = getA;
ourglobe.getE = getE;
ourglobe.getR = getR;

ourglobe.core.SchemaError = SchemaError;
ourglobe.core.FuncVerError = FuncVerError;
ourglobe.core.FuncCreationRuntimeError =
	FuncCreationRuntimeError
;
ourglobe.core.conf = conf;
ourglobe.core.FuncParamVer = FuncParamVer;
ourglobe.core.ArgsVer = ArgsVer;
ourglobe.core.ExtraArgsVer = ExtraArgsVer;
ourglobe.core.ReturnVarVer = ReturnVarVer;

OurGlobeError.prototype.__proto__ = Error.prototype;
OurGlobeError.ourGlobeSuper = Error;

RuntimeError.prototype.__proto__ = OurGlobeError.prototype;
RuntimeError.ourGlobeSuper = OurGlobeError;

sys.extend( SchemaError, RuntimeError );
sys.extend( FuncVerError, RuntimeError );
sys.extend( FuncCreationRuntimeError, RuntimeError );

sys.extend( ArgsVer, FuncParamVer );
sys.extend( ExtraArgsVer, FuncParamVer );
sys.extend( ReturnVarVer, FuncParamVer );

RuntimeError.MSG_S = OurGlobeError.MSG_S;
RuntimeError.VAR_S = OurGlobeError.VAR_S;
RuntimeError.CODE_S = OurGlobeError.CODE_S;
RuntimeError.PLACE_S = OurGlobeError.PLACE_S;

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

getA.ANY_ARGS = getE( "any" );

OurGlobeError.CONSTR_FV =
new FuncVer()
	.addA(
		OurGlobeError.MSG_S,
		OurGlobeError.VAR_S,
		OurGlobeError.CODE_S,
		OurGlobeError.PLACE_S
	)
	.addA(
		OurGlobeError.MSG_S,
		OurGlobeError.VAR_S,
		OurGlobeError.PLACE_S,
		"undef"
	)
	.addA(
		OurGlobeError.MSG_S, OurGlobeError.PLACE_S, "undef", "undef"
	)
	.addA(
		OurGlobeError.MSG_S,
		OurGlobeError.CODE_S,
		OurGlobeError.PLACE_S,
		"undef"
	)
;
OurGlobeError.CONSTR_V = OurGlobeError.CONSTR_FV;

RuntimeError.CONSTR_FV = OurGlobeError.CONSTR_FV;
RuntimeError.CONSTR_V = RuntimeError.CONSTR_FV;

var returnVar = 
{
	OurGlobeError: OurGlobeError,
	RuntimeError: RuntimeError,
	FuncCreationRuntimeError: FuncCreationRuntimeError,
	SchemaError: SchemaError,
	FuncVerError: FuncVerError,
	conf: conf,
	sys: sys,
	hasT: hasT,
	getF: getF,
	getCb: getCb,
	getS: getS,
	getV: getV,
	assert: assert,
	FuncVer: FuncVer,
	Schema: Schema,
	FuncParamVer: FuncParamVer,
	ArgsVer: ArgsVer,
	ExtraArgsVer: ExtraArgsVer,
	ReturnVarVer: ReturnVarVer,
	getA: getA,
	getE: getE,
	getR: getR
};

return returnVar;

});
