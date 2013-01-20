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

Object.defineProperty(
	RuntimeError, "MSG_S", { value: OurGlobeError.MSG_S }
);
Object.defineProperty(
	RuntimeError, "VAR_S", { value: OurGlobeError.VAR_S }
);
Object.defineProperty(
	RuntimeError, "CODE_S", { value: OurGlobeError.CODE_S }
);
Object.defineProperty(
	RuntimeError, "PLACE_S", { value: OurGlobeError.PLACE_S }
);

Object.defineProperty(
	FuncVer, "PROPER_STR", { value: Schema.PROPER_STR }
);
Object.defineProperty(
	FuncVer, "R_PROPER_STR", { value: Schema.R_PROPER_STR }
);
Object.defineProperty(
	FuncVer, "PROPER_STR_L", { value: Schema.PROPER_STR_L }
);
Object.defineProperty(
	FuncVer, "R_PROPER_STR_L", { value: Schema.R_PROPER_STR_L }
);
Object.defineProperty(
	FuncVer, "PROPER_OBJ", { value: Schema.PROPER_OBJ }
);
Object.defineProperty(
	FuncVer, "R_PROPER_OBJ", { value: Schema.R_PROPER_OBJ }
);
Object.defineProperty(
	FuncVer, "NON_NEG_INT", { value: Schema.NON_NEG_INT }
);
Object.defineProperty(
	FuncVer, "R_NON_NEG_INT", { value: Schema.R_NON_NEG_INT }
);
Object.defineProperty(
	FuncVer, "POS_INT", { value: Schema.POS_INT }
);
Object.defineProperty(
	FuncVer, "R_POS_INT", { value: Schema.R_POS_INT }
);

Object.defineProperty(
	getV, "PROPER_STR", { value: Schema.PROPER_STR }
);
Object.defineProperty(
	getV, "R_PROPER_STR", { value: Schema.R_PROPER_STR }
);
Object.defineProperty(
	getV, "PROPER_STR_L", { value: Schema.PROPER_STR_L }
);
Object.defineProperty(
	getV, "R_PROPER_STR_L", { value: Schema.R_PROPER_STR_L }
);
Object.defineProperty(
	getV, "PROPER_OBJ", { value: Schema.PROPER_OBJ }
);
Object.defineProperty(
	getV, "R_PROPER_OBJ", { value: Schema.R_PROPER_OBJ }
);
Object.defineProperty(
	getV, "NON_NEG_INT", { value: Schema.NON_NEG_INT }
);
Object.defineProperty(
	getV, "R_NON_NEG_INT", { value: Schema.R_NON_NEG_INT }
);
Object.defineProperty(
	getV, "POS_INT", { value: Schema.POS_INT }
);
Object.defineProperty(
	getV, "R_POS_INT", { value: Schema.R_POS_INT }
);

getA.ANY_ARGS = getE( "any" );

Object.defineProperty(
	OurGlobeError,
	"CONSTR_FV",
	{
		value:
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
	}
);
Object.defineProperty(
	OurGlobeError, "CONSTR_V", { value: OurGlobeError.CONSTR_FV }
);

Object.defineProperty(
	RuntimeError, "CONSTR_FV", { value: OurGlobeError.CONSTR_FV }
);
Object.defineProperty(
	RuntimeError, "CONSTR_V", { value: OurGlobeError.CONSTR_V }
);

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
