ourGlobe.define(
[
	"./drop",
	"./stream"
]
function( mods )
{

var RuntimeError = ourGlobe.RuntimeError;

var assert = ourGlobe.assert;
var sys = ourGlobe.sys;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var Drop = undefined;
var Stream = undefined;

mods.delay(
function()
{
	Drop = mods.get( "drop" );
	Stream = mods.get( "stream" );
});

var RiverRuntimeError =
Class.create(
{
name: "RiverRuntimeError",
super: RuntimeError,
constr:
[
function()
{
	return([
		getA(
			Drop,
			Stream,
			"any",
			"any",
			"any",
			"any"
		),
		getA(
			Drop,
			Stream,
			[ Error, "undef" ],
			"any",
			"any",
			"any",
			"any"
		),
		getA( "any", "any", "any", "any" )
	]);
},
function(
	drop, stream, thrownErr, msg, errorVar, errorCode, errorPlace
)
{
	if(
		sys.hasType( drop, "str" ) === true &&
// making sure no faulty args are missed by being overwritten
		errorPlace === undefined &&
		errorCode === undefined &&
		errorVar === undefined;
	)
	{
		errorPlace = msg;
		errorCode = thrownErr;
		errorVar = stream;
		msg = drop;
		
		drop = undefined;
		stream = undefined;
		thrownErr = undefined;
	}
	else if(
		sys.hasType( thrownErr, "str" ) === true &&
// making sure no faulty args are missed by being overwritten
		errorPlace === undefined
	)
	{
		errorPlace = errorCode;
		errorCode = errorVar;
		errorVar = msg;
		msg = thrownErr;
		
		thrownErr = undefined;
	}
	
	this.drop = drop;
	this.stream = stream;
	this.thrownErr = thrownErr;
	
	this.ourGlobeSuperCall(
		undefined, msg, errorVar, errorCode, errorPlace
	);
}]

});

return RiverRuntimeError;

},
function( mods, RiverRuntimeError )
{

var RuntimeError = ourGlobe.RuntimeError;

var assert = ourGlobe.assert;
var sys = ourGlobe.sys;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var Drop = mods.get( "drop" );
var Stream = mods.get( "stream" );

Class.add(
RiverRuntimeError,
{

getDrop:
[
getA.ANY_ARGS,
getR( [ Drop, "undef" ] ),
function()
{
	if( arguments.length !== 0 )
	{
		throw new RuntimeError(
			"No args may be provided", { providedArgs: arguments }
		)
	}
	
	return this.drop;
}],

getStream:
[
getA.ANY_ARGS,
getR( [ Stream, "undef" ] ),
function()
{
	if( arguments.length !== 0 )
	{
		throw new RuntimeError(
			"No args may be provided", { providedArgs: arguments }
		)
	}
	
	return this.stream;
}],

getThrownErr:
[
getA.ANY_ARGS,
getR( [ Error, "undef" ] ),
function()
{
	if( arguments.length !== 0 )
	{
		throw new RuntimeError(
			"No args may be provided", { providedArgs: arguments }
		)
	}
	
	return this.thrownErr;
}]]

});

});
