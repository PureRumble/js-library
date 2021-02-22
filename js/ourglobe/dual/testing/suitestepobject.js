ourglobe.define(
[
	"./suiteruntimeerror",
	"./suitestep",
	"./suiteresult",
	"./basicsuitestepobject"
],
function( mods )
{

var getF = ourGlobe.getF;
var getV = ourGlobe.getV;
var sys = ourGlobe.sys;

var SuiteStep = undefined;
var SuiteResult = undefined;
var BasicSuiteStepObject = undefined;

mods.delay(
function()
{
	SuiteStep = mods.get( "suitestep" );
	SuiteResult = mods.get( "suiteresult" );
	BasicSuiteStepObject = mods.get( "basicsuitestepobject" );
	
	sys.extend( SuiteStepObject, BasicSuiteStepObject );
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
	SuiteStepObject.ourGlobeSuper.call( this, suiteStep );
});

return SuiteStepObject;

},
function( mods, SuiteStepObject )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;
var RuntimeError = ourGlobe.RuntimeError;

var SuiteRuntimeError = mods.get( "suiteruntimeerror" );
var SuiteResult = mods.get( "suiteresult" );

SuiteStepObject.prototype.setV =
getF(
getV()
	.setE( "any" ),
function( varName, variable )
{
	if( arguments.length !== 2 )
	{
		throw new RuntimeError(
			"Exactly two args must be provided",
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
	
	vars[ varName ] = variable;
});

SuiteStepObject.prototype.getL =
getF(
getV()
	.setE( "any" )
	.setR( "any" ),
function( localVarName )
{
	if( arguments.length !== 1 )
	{
		throw new RuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( sys.hasType( localVarName, "str" ) === false )
	{
		throw new RuntimeError(
			"Arg localVarName must be a str",
			{ localVarName: localVarName }
		);
	}
	
	return this.suiteStep.suiteRun.local[ localVarName ];
});

SuiteStepObject.prototype.getSetL =
getF(
getV()
	.setE( "any" )
	.setR( "any" ),
function( localVarName )
{
	if( arguments.length !== 1 )
	{
		throw new RuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( sys.hasType( localVarName, "str" ) === false )
	{
		throw new RuntimeError(
			"Arg localVarName must be a str",
			{ localVarName: localVarName }
		);
	}
	
	if( localVarName in this.suiteStep.suiteRun.local === false )
	{
		throw new SuiteRuntimeError(
			"No local Suite var by the name '"+localVarName+"' has "+
			"been set",
			{ unsetLocalVar: localVarName },
			"RequestedLocalSuiteVarNotSet"
		);
	}
	
	return this.suiteStep.suiteRun.local[ localVarName ];
});

SuiteStepObject.prototype.setL =
getF(
getV()
	.setE( "any" ),
function( localVarName, variable )
{
	if( arguments.length !== 2 )
	{
		throw new RuntimeError(
			"Exactly two args must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( sys.hasType( localVarName, "str" ) === false )
	{
		throw new RuntimeError(
			"Arg varName must be a str",
			{ localVarName: localVarName }
		);
	}
	
	this.suiteStep.suiteRun.local[ localVarName ] = variable;
});

SuiteStepObject.prototype.isSet =
getF(
getV()
	.setE( "any" )
	.setR( "bool" ),
function( localVarName )
{
	if( arguments.length !== 1 )
	{
		throw new RuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( sys.hasType( localVarName, "str" ) === false )
	{
		throw new RuntimeError(
			"Arg varName must be a str",
			{ localVarName: localVarName }
		);
	}
	
	return localVarName in this.suiteStep.suiteRun.local;
});

});
