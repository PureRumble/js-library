ourGlobe.define(
[
	"http",
	"./riverruntimeerror",
	"./dropconnection",
	"./basicdropconnection"
],
function( mods )
{

var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var BasicDropConnection = undefined;

mods.delay(
function()
{
	BasicDropConnection = mods.get( "basicdropconnection" );
});

var Drop =
Class.create(
{
name: "Drop",
constr:
[
getA( "inst", "inst" ),
function( req, res )
{
	this.streamParams = {};
	this.localObj = undefined;
	
	this.dropCon = new BasicDropConnection( req, res );
	
	this.origDropCon = this.dropCon;
	this.replacedDropCon = undefined;
	
	this.isInMasterStream = false;
}]

});

return Drop;

},
function( mods, Drop )
{

var RiverRuntimeError = mods.get( "riverruntimeerror" );
var DropConnection = mods.get( "dropconnection" );

Class.add(
Drop,
{

flowToMasterStream:
[
function()
{
	this.isInMasterStream = true;
	
	this.replacedDropCon = this.dropCon;
	this.dropCon = this.origDropCon;
	
}],

leaveMasterStream:
[
function()
{
	this.isInMasterStream = false;
	
	this.dropCon = this.replacedDropCon;
}],

isSet:
[
getA.ANY_ARGS,
getR( "bool" ),
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
	
	if( this.isInMasterStream === true )
	{
		throw new RiverRuntimeError(
			this,
			"Stream local vars may not be used while the Drop is in "+
			"a master Stream",
			undefined,
			"StreamLocalVarUsedInMasterStream"
		);
	}
	
	return varName in this.localObj;
}],

get:
[
getA.ANY_ARGS,
getR( "any" ),
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
	
	if( this.isInMasterStream === true )
	{
		throw new RiverRuntimeError(
			this,
			"Stream local vars may not be used while the Drop is in "+
			"a master Stream",
			undefined,
			"StreamLocalVarUsedInMasterStream"
		);
	}
	
	if( varName in this.localObj === false )
	{
		throw new RiverRuntimeError(
			this,
			"This Stream has no local var by the name '"+varName+"'",
			{ faultyVarName: varName },
			"UndeclaredStreamVarRequested"
		);
	}
	
	return this.localObj[ varName ];
}],

set:
[
getA.ANY_ARGS,
function( varName, variable )
{
	if( arguments.length < 1 || arguments.length > 2 )
	{
		throw new RuntimeError(
			"Between one and two args must be provided",
			{ providedArgs: arguments }
		);
	}
	
	var localVars = undefined;
	
	if( arguments.length === 1 )
	{
		localVars = varName;
		
		if( sys.hasType( localVars, "obj" ) === false )
		{
			throw new RuntimeError(
				"Arg localVars must be an obj",
				{ localVars: localVars }
			);
		}
	}
	else
	{
		if( sys.hasType( varName, "str" ) === false )
		{
			throw new RuntimeError(
				"Arg varName must be a str",
				{ varName: varName }
			);
		}
		
		localVars = {};
		localVars[ varName ] = variable;
	}
	
	if( this.isInMasterStream === true )
	{
		throw new RiverRuntimeError(
			this,
			"Stream local vars may not be used while the Drop is in "+
			"a master Stream",
			undefined,
			"StreamLocalVarUsedInMasterStream"
		);
	}
	
	for( var varName in localVars )
	{
		this.localObj[ varName ] = localVars[ varName ];
	}
}],

getParam:
[
getA.ANY_ARGS,
getR( "any" ),
function( paramName )
{
	if( arguments.length !== 1 )
	{
		throw new RuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( sys.hasType( paramName, "str" ) === false )
	{
		throw new RuntimeError(
			"Arg paramName must be a str",
			{ paramName: paramName }
		);
	}
	
	if( this.isInMasterStream === true )
	{
		throw new RiverRuntimeError(
			this,
			"Stream params may not be used while the Drop is in a "+
			"master Stream",
			undefined,
			"StreamParamUsedInMasterStream"
		);
	}
	
	if( paramName in this.streamParams === false )
	{
		throw new RiverRuntimeError(
			this,
			"No Stream has yet declared a param "+
			"by the name '"+paramName+"'",
			{ faultyParamName: paramName },
			"UndeclaredStreamParamRequested"
		);
	}
	
	return this.streamParams[ paramName ];
}],

setParam:
[
getA.ANY_ARGS,
function( paramName, param )
{
	if( arguments.length < 1 || arguments.length > 2 )
	{
		throw new RuntimeError(
			"Between one and two args must be provided",
			{ providedArgs: arguments }
		);
	}
	
	var params = undefined;
	
	if( arguments.length === 1 )
	{
		params = paramName;
		
		if( sys.hasType( params, "obj" ) === false )
		{
			throw new RuntimeError(
				"Arg params must be an obj", { params: params }
			);
		}
	}
	else
	{
		if( sys.hasType( paramName, "str" ) === false )
		{
			throw new RuntimeError(
				"Arg paramName must be a str",
				{ paramName: paramName }
			);
		}
		
		params = {};
		params[ paramName ] = param;
	}
	
	if( this.isInMasterStream === true )
	{
		throw new RiverRuntimeError(
			this,
			"Stream params may not be used while the Drop is in a "+
			"master Stream",
			undefined,
			"StreamParamUsedInMasterStream"
		);
	}
	
	for( var paramName in params )
	{
		if( paramName in this.streamParams === false )
		{
			throw new RiverRuntimeError(
				this,
				"No Stream has yet declared a param "+
				"by the name '"+paramName+"'",
				{ faultyParamName: paramName },
				"UndeclaredStreamParamModified"
			);
		}
		
		this.streamParams[ paramName ] = params[ paramName ];
	}
}],

getDropCon:
[
getA.ANY_ARGS,
getR( DropConnection ),
function()
{
	if( arguments.length !== 0 )
	{
		throw new RuntimeError(
			"No args may be provided", { providedArgs: arguments }
		);
	}
	
	return this.dropCon;
}],

setDropCon:
[
getA.ANY_ARGS,
function( dropCon )
{
	if( arguments.length !== 1 )
	{
		throw new RuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( dropCon instanceof DropConnection === false )
	{
		throw new RuntimeError(
			"Arg dropCon must be a DropConnection",
			{ dropCon: dropCon }
		);
	}
	
	if( this.isInMasterStream === true )
	{
		throw new RiverRuntimeError(
			this,
			"DropConnection may not be changed while the Drop is in "+
			"a master Stream",
			undefined,
			"DropConChangedInMasterStream"
		);
	}
	
	this.dropCon = dropCon;
}],

flowToStream:
[
getA( Stream ),
function( stream )
// {
	this.localObj = {};
	
	for( var item in stream.streamParams )
	{
		var streamParamName = stream.streamParams[ item ];
		
		this.streamParams[ streamParamName ] = undefined;
	}
}]

});

});
