ourglobe.define(
[
	"./suiteholder"
],
function( mods )
{

var sys = ourglobe.sys;
var getV = ourglobe.getV;
var Schema = ourglobe.Schema;
var getF = ourglobe.getF;
var RuntimeError = ourglobe.RuntimeError;

var SuiteHolder = undefined;

mods.delay(
function()
{
	SuiteHolder = mods.get( "suiteholder" );
});

var SuiteRuntimeError =
getF(
function()
{
	return(
		getV()
			.addA(
				{
					types: "obj/undef",
					props:
					{
						suite:
						[
							SuiteRuntimeError.SUITE_NAMES_S,
							SuiteHolder,
							"undef"
						]
					}
				},
				RuntimeError.MSG_S,
				RuntimeError.VAR_S,
				RuntimeError.CODE_S,
				RuntimeError.PLACE_S
			)
			.addA(
				RuntimeError.MSG_S,
				RuntimeError.VAR_S,
				RuntimeError.CODE_S,
				RuntimeError.PLACE_S
			)
	);
},
function( errorObj, msg, errorVar, errorCode, errorPlace )
{
	if( sys.hasType( errorObj, "str" ) === true )
	{
		errorPlace = errorCode;
		errorCode = errorVar;
		errorVar = msg;
		msg = errorObj;
		errorObj = undefined;
	}
	
	if( errorObj === undefined )
	{
		errorObj = {};
	}
	
	if( errorPlace === undefined )
	{
		errorPlace = SuiteRuntimeError;
	}
	
	this.suite = errorObj.suite;
	
	SuiteRuntimeError.ourGlobeSuper.call(
		this, msg, errorVar, errorCode, errorPlace
	);
});

sys.extend( SuiteRuntimeError, RuntimeError );

SuiteRuntimeError.SUITE_NAMES_S =
	{ extraItems: Schema.PROPER_STR, minItems: 1 }
;

SuiteRuntimeError.prototype.className =  "SuiteRuntimeError";

return SuiteRuntimeError;

});
