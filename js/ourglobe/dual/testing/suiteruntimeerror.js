ourglobe.define(
[
	"./suite",
	"./suiteholder"
],
function( mods )
{

var sys = ourGlobe.sys;
var getS = ourGlobe.getS;
var hasT = ourGlobe.hasT;
var getV = ourGlobe.getV;
var Schema = ourGlobe.Schema;
var getF = ourGlobe.getF;
var RuntimeError = ourGlobe.RuntimeError;

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
				[ Suite.SUITE_NAMES_S, SuiteHolder, "undef" ],
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
function( suite, msg, errorVar, errorCode, errorPlace )
{
	if( hasT( suite, "str" ) === true )
	{
		errorPlace = errorCode;
		errorCode = errorVar;
		errorVar = msg;
		msg = suite;
		suite = undefined;
	}
	
	if( errorPlace === undefined )
	{
		errorPlace = SuiteRuntimeError;
	}
	
	this.suite = suite;
	
	if( suite !== undefined )
	{
		var suiteName = undefined;
		
		if( suite instanceof SuiteHolder === true )
		{
			suiteName = suite.toString();
		}
		else
		{
			suiteName = Suite.getSuiteName( suite );
		}
		
		msg =
			"The suite run cant be started since there is an err "+
			"with the following suite (the err is presented after "+
			"the suite name below):\n\n"+
			suiteName+"\n"+
			msg
		;
	}
	
	SuiteRuntimeError.ourGlobeSuper.call(
		this, msg, errorVar, errorCode, errorPlace
	);
});

sys.extend( SuiteRuntimeError, RuntimeError );

SuiteRuntimeError.prototype.className =  "SuiteRuntimeError";

return SuiteRuntimeError;

});
