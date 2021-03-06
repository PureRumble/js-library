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

var BasicSuiteStepObject =
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

return BasicSuiteStepObject;

},
function( mods, BasicSuiteStepObject )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;
var RuntimeError = ourGlobe.RuntimeError;

var SuiteRuntimeError = mods.get( "suiteruntimeerror" );
var SuiteResult = mods.get( "suiteresult" );

BasicSuiteStepObject.prototype.getVarsObjByVar =
getF(
getV()
	.addA( "str" )
	.setR( "obj" ),
function( varName )
{
	var suiteRun = this.suiteStep.suiteRun;
	
	while( true )
	{
		var vars = suiteRun.vars;
		
		if( varName in vars === true )
		{
			return vars;
		}
		
		suiteRun = suiteRun.parentRun;
		
		if( suiteRun === undefined )
		{
			throw new SuiteRuntimeError(
				"This suite has no var named '"+varName+"' in its "+
				"vars prop and neither does any of its parent suites",
				undefined,
				"RequestedVarsVariableNotDeclared"
			);
		}
	}
});

BasicSuiteStepObject.prototype.getV =
getF(
getV()
	.setE( "any" )
	.setR( "any" ),
function( varName )
{
	if( arguments.length !== 1 )
	{
		throw new RuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( sys.hasType( varName, "str" ) === false )
	{
		throw new RuntimeError(
			"Arg varName must be a str",
			{ varName: varName }
		);
	}
	
	var vars = this.getVarsObjByVar( varName );
	
	return vars[ varName ];
});

BasicSuiteStepObject.prototype.hasParent =
getF(
SuiteResult.HAS_PARENT_FV,
function()
{
	return(
		this.suiteRes.hasParent.apply( this.suiteRes, arguments )
	);
});

BasicSuiteStepObject.prototype.getParent =
getF(
SuiteResult.GET_PARENT_FV,
function()
{
	return(
		this.suiteRes.getParent.apply( this.suiteRes, arguments )
	);
});

});
