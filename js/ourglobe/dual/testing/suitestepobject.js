ourglobe.define(
[
	"./suiteruntimeerror",
	"./suitestep",
	"./suiteresult"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var SuiteStep = undefined;
var SuiteResult = undefined;

mods.delay(
function()
{
	SuiteStep = mods.get( "suitestep" );
	SuiteResult = mods.get( "suiteresult" );
});

var SuiteStepObject =
getF(
function()
{
	return(
		getV()
			.addA( SuiteStep )
	);
},
function( suiteStep )
{
	this.suiteStep = suiteStep;
	this.suiteRes = new SuiteResult( this.suiteStep.suiteRun );
});

return SuiteStepObject;

},
function( mods, SuiteStepObject )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var SuiteRuntimeError = mods.get( "suiteruntimeerror" );
var SuiteResult = mods.get( "suiteresult" );

SuiteStepObject.prototype.getLocalByVar =
getF(
getV()
	.addA( "str" )
	.setR( "obj" ),
function( varName )
{
	var suiteRun = this.suiteStep.suiteRun;
	
	while( true )
	{
		var local = suiteRun.local;
		
		if( varName in local === true )
		{
			return local;
		}
		
		suiteRun = suiteRun.parentRun;
		
		if( suiteRun === undefined )
		{
			throw new SuiteRuntimeError(
				{ suite: this.suiteStep.suiteRun.suiteHolder },
				"This suite has no local var named '"+varName+"' and "+
				"neither does any of its parent suites",
				undefined,
				"LocalVarNotDeclared"
			);
		}
	}
});

SuiteStepObject.prototype.get =
getF(
getV()
	.setE( "any" )
	.setR( "any" ),
function( varName )
{
	if( arguments.length !== 1 )
	{
		throw new SuiteRuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments },
			"InvalidGetFuncArgs"
		);
	}
	
	if( sys.hasType( varName, "str" ) === false )
	{
		throw new SuiteRuntimeError(
			"Arg varName must be a str",
			{ varName: varName },
			"InvalidGetFuncArgs"
		);
	}
	
	var local = this.getLocalByVar( varName );
	
	return local[ varName ];
});

SuiteStepObject.prototype.set =
getF(
getV()
	.setE( "any" ),
function( varName, variable )
{
	if( arguments.length !== 2 )
	{
		throw new SuiteRuntimeError(
			"Exactly two args must be provided",
			{ providedArgs: arguments },
			"InvalidSetFuncArgs"
		);
	}
	
	if( sys.hasType( varName, "str" ) === false )
	{
		throw new SuiteRuntimeError(
			"Arg varName must be a str",
			{ varName: varName },
			"InvalidSetFuncArgs"
		);
	}
	
	var local = this.getLocalByVar( varName );
	
	local[ varName ] = variable;
});

SuiteStepObject.prototype.hasParent =
getF(
SuiteResult.HAS_PARENT_FV,
function()
{
	return(
		this.suiteRes.hasParent.apply( this.suiteRes, arguments )
	);
});

SuiteStepObject.prototype.getParent =
getF(
SuiteResult.GET_PARENT_FV,
function()
{
	return(
		this.suiteRes.getParent.apply( this.suiteRes, arguments )
	);
});

});
