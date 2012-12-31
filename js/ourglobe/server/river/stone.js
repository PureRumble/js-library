ourGlobe.define(
[
	"./streamerror",
	"./drop",
	"./stream",
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

var StreamError = undefined;
var Drop = undefined;
var Stream = undefined;

mods.delay(
function()
{
	StreamError = mods.get( "streamerror" );
	Drop = mods.get( "drop" );
	Stream = mods.get( "stream" );
	
	Class.addStatic(
		Stone,
		{
			CONSTR_V: getV( getA( Drop ) ),
			
			BEGIN_RIVER_FLOW_V: getV( getA( "inst", "inst", "func" ) ),
			BEGIN_V: getV( getA( "func" ) ),
			VALIDATE_V: getV( getA( "func" ) ),
			PREPARE_V: getV( getA( "func" ) ),
			BRANCH_V: getV( getA( "func" ) ),
			SERVE_V: getV( getA( "func" ) ),
			SERVE_FAILURE_V: getV( getA( "func" ) ),
			SERVE_ERR_V: getV( getA( StreamError, "func" ) ),
			FINISH_V: getV( getA( "func" ) ),
			HANDLE_CB_ARGS_V:
				getV(
					getA( "undefined" ),
					getE( "any" ),
					getR(
						{
							types:[ "undef", StreamError, "arr" ],
							items:{ 0:[ StreamError, "undef" ] },
							extraItems: "any"
						}
					)
				)
			,
			GET_ERR_THROWN_CODE_V: getV( getR( RuntimeError.CODE_S ) ),
			GET_CB_ERR_CODE_V: getV( getR( RuntimeError.CODE_S ) ),
			GET_INVALID_CB_ARGS_CODE_V:
				getV( getR( RuntimeError.CODE_S ) )
		}
	);
});

var Stone =
Class.create(
{

name: "Stone",
instVars:
{
	drop: "final",
	flowedToStone: "final",
	err: "final"
},
constr:
[
function()
{
	return Stone.CONSTR_V;
},
function( drop )
{
	this.drop = drop;
	this.flowedToStone = false;
	this.err = undefined;
}]

});

return Stone;

},
function( mods, Stone )
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

var StreamError = mods.get( "streamerror" );
var Stream = mods.get( "stream" );

Class.add(
Stone,
{

isValidStoneName:
[
"static",
getA.ANY_ARGS,
getR( "bool" ),
function( stoneName )
{
	return(
		stoneName === "beginRiverFlow" ||
		stoneName === "begin" ||
		stoneName === "validate" ||
		stoneName === "prepare" ||
		stoneName === "branch" ||
		stoneName === "serve" ||
		stoneName === "serveErr" ||
		stoneName === "serveFailure" ||
		stoneName === "finish"
	);
}],

flowDrop:
[
"final",
getA( "any", "any", "func" ),
getA( "any", "func" ),
getA( "func" ),
function( stoneArgZero, stoneArgOne, cb )
{
	this.flowedToStone = true;
	
	var cbPos = undefined;
	
	if( hasT( stoneArgZero, "func" ) === true )
	{
		cbPos = 0;
		
		cb = stoneArgZero;
		stoneArgZero = undefined;
	}
	else if( hasT( stoneArgOne, "func" ) === true )
	{
		cbPos = 1;
		
		cb = stoneArgOne;
		stoneArgOne = undefined;
	}
	else
	{
		cbPos = 2;
	}
	
	var newCb =
	getCb(
		this,
		getA.ANY_ARGS,
		function()
		{
			var args = Array.prototype.slice.call( arguments );
			var newArgs = undefined;
			
			if( args[ 0 ] !== undefined )
			{
				if( args[ 0 ] instanceof Error === false )
				{
					newArgs =
						new StreamError(
							this.drop,
							"The first arg given to the cb of a Stream "+
							"Stone must be an err or undef",
							{ providedArgs: args },
							this.getInvalidCbArgsCode()
						)
					;
				}
				else
				{
					var err = args.shift();
					
					var invalidArgs = false;
					
					for( var item in args )
					{
						if( args[ item ] !== undefined )
						{
							invalidArgs = true;
							break;
						}
					}
					
					if( invalidArgs === true )
					{
						newArgs =
							new StreamError(
								this.drop,
								"If an err is given to the cb of a Stream "+
								"Stone then all remaining args must be undef",
								{ providedArgs: args },
								this.getInvalidCbArgsCode()
							)
						;
					}
					else
					{
						newArgs =
							new StreamError(
								this.drop,
								err,
								"An err was given to the cb of the Stream Stone",
								this.getCbErrCode()
							)
						;
					}
				}
			}
			else
			{
// The first arg is also sent to Stone.handleCbArgs() even if it
// always is undefined. This is to make the handling of all the
// args less error prone for handleCbArgs(). For instance making
// sure the correct nr of args has been provided and producing
// an err msg if that isnt the case could become difficult
				
				newArgs = this.handleCbArgs.apply( this, args );
			}
			
			if( newArgs === undefined )
			{
				newArgs = [];
			}
			else if( newArgs instanceof StreamError === true )
			{
				newArgs = [ newArgs ];
			}
			
			if( newArgs[ 0 ] instanceof StreamError === true )
			{
				this.err = newArgs[ 0 ];
			}
			
			cb.apply( {}, newArgs );
		}
	);
	
	try
	{
	
	if( cbPos === 0 )
	{
		this.flowStream( newCb );
		
		return;
	}
	else if( cbPos === 1 )
	{
		this.flowStream( stoneArgZero, newCb );
		
		return;
	}
	else
	{
		this.flowStream( stoneArgZero, stoneArgOne, newCb );
		
		return;
	}
	
	}
	catch( e )
	{
		cb(
			new StreamError(
				this.drop,
				e,
				"An err was thrown by the Stream Stone",
				this.getErrThrownCode()
			)
		);
	}
}],

flowStream:
[
"extendable",
getA.ANY_ARGS,
function()
{
	throw new RuntimeError(
		"All sub classes of Stone must implement flowStream()",
		{ invalidClass: Class.getClassName( this ) }
	);
}],

handleCbArgs:
[
"extendable",
getA.ANY_ARGS,
function()
{
	throw new RuntimeError(
		"All sub classes of Stone must implement handleCbArgs()",
		{ invalidClass: Class.getClassName( this ) }
	);
}],

getErrThrownCode:
[
"extendable",
getA.ANY_ARGS,
function()
{
	throw new RuntimeError(
		"All sub classes of Stone must implement getThrownErrCode()",
		{ invalidClass: Class.getClassName( this ) }
	);
}],

getCbErrCode:
[
"extendable",
getA.ANY_ARGS,
function()
{
	throw new RuntimeError(
		"All sub classes of Stone must implement getCbErrCode()",
		{ invalidClass: Class.getClassName( this ) }
	);
}],

getInvalidCbArgsCode:
[
"extendable",
getA.ANY_ARGS,
function()
{
	throw new RuntimeError(
		"All sub classes of Stone must implement "+
		"getInvalidCbArgsCode()",
		{ invalidClass: Class.getClassName( this ) }
	);
}]

});

});
