ourglobe.define(
[
	"./suite",
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
var Suite = undefined;

mods.delay(
function()
{
	Suite = mods.get( "suite" );
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
						suite:[ Suite.SUITE_NAMES_S, SuiteHolder, "undef" ]
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

SuiteRuntimeError.prototype.className =  "SuiteRuntimeError";

return SuiteRuntimeError;

},
function( mods, SuiteRuntimeError )
{

var sys = ourglobe.sys;
var getV = ourglobe.getV;
var Schema = ourglobe.Schema;
var getF = ourglobe.getF;
var RuntimeError = ourglobe.RuntimeError;
var SuiteHolder = mods.get( "suiteholder" );
var Suite = mods.get( "suite" );

SuiteRuntimeError.prototype.toString =
getF(
getV()
	.setR( "str" ),
function()
{
	var origErrMsg = RuntimeError.prototype.toString.call( this );
	
	if( this.suite === undefined )
	{
		return origErrMsg;
	}
	
	var suiteName = undefined;
	var suite = this.suite;
	
	if( suite instanceof SuiteHolder === true )
	{
		suiteName = suite.toString();
	}
	else
	{
		suiteName = Suite.getSuiteName( suite );
	}
	
	var errMsg =
		"The suite run cant be started since there is an err "+
		"with the following suite (the err is presented after "+
		"the suite name below):\n\n"+
		suiteName+"\n"+
		origErrMsg
	;
	
	return errMsg;
});

});
