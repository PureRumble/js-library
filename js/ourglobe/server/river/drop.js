ourGlobe.define(
[
	"./riverruntimeerror",
	"./streamerror",
	"./river",
	"./riverdrop",
	"./stream",
	"./stonebeginriverflow",
	"./stonebegin",
	"./stonevalidate",
	"./stoneprepare",
	"./stonebranch",
	"./stoneserve",
	"./stonefinish",
	"./stoneservefailure",
	"./stoneserveerr"
],
function( mods )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var RiverDrop = undefined;
var Stream = undefined;

var StoneBeginRiverFlow = undefined;
var StoneBegin = undefined;
var StoneValidate = undefined;
var StonePrepare = undefined;
var StoneBranch = undefined;
var StoneServe = undefined;
var StoneFinish = undefined;
var StoneServeFailure = undefined;
var StoneServeErr = undefined;

mods.delay(
function()
{
	RiverDrop = mods.get( "riverdrop" );
	Stream = mods.get( "stream" );
	
	StoneBeginRiverFlow = mods.get( "stonebeginriverflow" );
	StoneBegin = mods.get( "stonebegin" );
	StoneValidate = mods.get( "stonevalidate" );
	StonePrepare = mods.get( "stoneprepare" );
	StoneBranch = mods.get( "stonebranch" );
	StoneServe = mods.get( "stoneserve" );
	StoneFinish = mods.get( "stonefinish" );
	StoneServeFailure = mods.get( "stoneservefailure" );
	StoneServeErr = mods.get( "stoneserveerr" );
});

var Drop =
Class.create(
{
name: "Drop",
constr:
[
function()
{
	return [ getA( RiverDrop, Stream, [ Drop, "undef" ] ) ];
},
function( riverDrop, stream, lastDrop )
{
	this.riverDrop = riverDrop;
	this.stream = stream;
	
	this.localStreamVars = {};
	
	var streamParams = {};
	
	if( lastDrop !== undefined )
	{
		for( var prop in lastDrop.streamParams )
		{
			streamParams[ prop ] = lastDrop.streamParams[ prop ];
		}
	}
	
	for( var streamParamName in stream.streamParams )
	{
		streamParams[ streamParamName ] = undefined;
	}
	
	this.streamParams = streamParams;
	
	this.stoneBeginRiverFlow = new StoneBeginRiverFlow( this );
	this.stoneBegin = new StoneBegin( this );
	this.stoneValidate = new StoneValidate( this );
	this.stonePrepare = new StonePrepare( this );
	this.stoneBranch = new StoneBranch( this );
	this.stoneServe = new StoneServe( this );
	this.stoneFinish = new StoneFinish( this );
	this.stoneServeFailure = new StoneServeFailure( this );
	this.stoneServeErr = new StoneServeErr( this );
}]

});

return Drop;

},
function( mods, Drop )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var RiverRuntimeError = mods.get( "riverruntimeerror" );
var StreamError = mods.get( "streamerror" );

var River = mods.get( "river" );
var Stream = mods.get( "stream" );

Class.add(
Drop,
{

setStreamParams:
[
getA( "obj" ),
function( streamParams )
{
	for( var paramName in streamParams )
	{
		this.streamParams[ paramName ] = streamParams[ paramName ];
	}
}],

prepareForFailure:
[
getA( Stream.FAILURE_CODE_S ),
function( failureCode )
{
	this.failureCode = failureCode;
}],

restoreFromFailure:
[
function()
{
	this.failureCode = undefined;
}],

failedOf:
[
getA.ANY_ARGS,
function( failureCode )
{
	if( arguments.length !== 1 )
	{
		throw new RuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( Stream.failureCodeIsValid( failureCode ) === false )
	{
		throw new RuntimeError(
			"Arg failureCode must be a valid failure code",
			{ failureCode: failureCode }
		);
	}
	
	if( this.failureCode === undefined )
	{
		throw new RiverRuntimeError(
			"failedOf() may not be called since a Drop validation "+
			"failure is not being served by the current Stream",
			"ValidationFailureNotBeingServed"
		);
	}
	
	return this.failureCode === failureCode;
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
	
	if( hasT( varName, "str" ) === false )
	{
		throw new RuntimeError(
			"Arg varName must be a str",
			{ varName: varName }
		);
	}
	
	return varName in this.localStreamVars;
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
	
	if( hasT( varName, "str" ) === false )
	{
		throw new RuntimeError(
			"Arg varName must be a str",
			{ varName: varName }
		);
	}
	
	return this.localStreamVars[ varName ];
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
		
		if( hasT( localVars, "obj" ) === false )
		{
			throw new RuntimeError(
				"Arg localVars must be an obj",
				{ localVars: localVars }
			);
		}
	}
	else
	{
		if( hasT( varName, "str" ) === false )
		{
			throw new RuntimeError(
				"Arg varName must be a str",
				{ varName: varName }
			);
		}
		
		localVars = {};
		localVars[ varName ] = variable;
	}
	
	for( var varName in localVars )
	{
		this.localStreamVars[ varName ] = localVars[ varName ];
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
	
	if( hasT( paramName, "str" ) === false )
	{
		throw new RuntimeError(
			"Arg paramName must be a str",
			{ paramName: paramName }
		);
	}
	
	if( paramName in this.streamParams === false )
	{
		throw new RiverRuntimeError(
			"No Stream has yet declared a param "+
			"by the name '"+paramName+"'",
			{ undeclaredParam: paramName },
			"UndeclaredStreamParamRequested"
		);
	}
	
	return this.streamParams[ paramName ];
}],

beginRiverFlow:
[
getA( "func" ),
function( cb )
{
	this.stoneBeginRiverFlow.flowDrop(
		this.riverDrop.req,
		this.riverDrop.res,
		getCb(
		this,
		getA( StreamError, "undef" ),
		getA( "undef", "obj/undef" ),
		function( err, streamParams )
		{
			if( err !== undefined )
			{
				cb( err );
				
				return;
			}
			
			if( streamParams !== undefined )
			{
				this.setStreamParams( streamParams );
			}
			
			cb();
		})
	);
}],

begin:
[
getA( "func" ),
function( cb )
{
	this.stoneBegin.flowDrop(
		getCb(
		this,
		getA( [ StreamError, "undef" ] ),
		function( err )
		{
			cb( err );
		})
	);
}],

validate:
[
getA( "func" ),
function( cb )
{
	this.stoneValidate.flowDrop(
		getCb(
		this,
		getA( StreamError, "undef" ),
		getA( "undef", [ Stream.FAILURE_CODE_S, "undef" ] ),
		function( err, failureCode )
		{
			cb( err, failureCode );
		})
	);
}],

prepare:
[
getA( "func" ),
function( cb )
{
	this.stonePrepare.flowDrop(
		getCb(
		this,
		getA( StreamError, "undef" ),
		getA( "undef", "obj/undef" ),
		function( err, streamParams )
		{
			if( err !== undefined )
			{
				cb( err );
				
				return;
			}
			
			if( streamParams !== undefined )
			{
				this.setStreamParams( streamParams );
			}
			
			cb();
		})
	);
}],

branch:
[
getA( "func" ),
function( cb )
{
	this.stoneBranch.flowDrop(
		getCb(
		this,
		getA( StreamError, "undef" ),
		getA( "undef", [ Stream, "undef" ] ),
		function( err, nextStream )
		{
			cb( err, nextStream );
		})
	);
}],

serve:
[
getA( "func" ),
function( cb )
{
	this.stoneServe.flowDrop(
		getCb(
		this,
		getA( [ StreamError, "undef" ] ),
		function( err )
		{
			cb( err );
		})
	);
}],

serveErr:
[
getA( StreamError, "func" ),
function( firstErr, cb )
{
	this.stoneServeErr.flowDrop(
		firstErr,
		getCb(
		this,
		getA( [ StreamError, "undef" ] ),
		function( secondErr )
		{
			cb( secondErr );
		})
	);
}],

serveFailure:
[
getA( Stream.FAILURE_CODE_S, "func" ),
function( failureCode, cb )
{
	this.prepareForFailure( failureCode );
	
	this.stoneServeFailure.flowDrop(
		getCb(
		this,
		getA( [ StreamError, "undef" ] ),
		function( err )
		{
			this.restoreFromFailure();
			
			cb( err );
		})
	);
}],

finish:
[
getA( "func" ),
function( cb )
{
	this.stoneFinish.flowDrop(
		getCb(
		this,
		getA( [ StreamError, "undef" ] ),
		function( err )
		{
			cb( err );
		})
	);
}]

});

});
