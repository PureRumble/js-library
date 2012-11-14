ourGlobe.define(
[
	"http",
	"./riverruntimeerror",
	"./dropconnection",
	"./basicdropconnection"
],
function( mods )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

mods.delay(
function()
{

});

var DropConnection =
Class.create(
	{
		instVars:
		{
			hasEnded: "final"
		},
		name: "DropConnection"
	}
)
;

Class.addStatic(
DropConnection,
{
	END_CON_FV: getV()
});

return DropConnection;

},
function( mods, DropConnection )
{

var RuntimeError = ourGlobe.RuntimeError;
var RiverRuntimeError = mods.get( "riverruntimeerror" );

Class.add(
{

endCon:
[
getA.ANY_ARGS,
function()
{
	throw new RuntimeError(
		"All sub classes of DropConnection must implement "+
		"endCon()",
		{ invalidSubClass: Class.getClassName( this ) }
	);
}],

forcefullyEnd:
[
"final",
getA.ANY_ARGS,
function()
{
	if( arguments.length !== 0 )
	{
		throw new RuntimeError(
			"No args may be provided", { providedArgs: arguments }
		);
	}
	
	if( this.hasEnded === false )
	{
		try
		{
		
		this.endCon();
		
		}
		catch( e )
		{
			
		}
	}
}],

end:
[
"final",
getA.ANY_ARGS,
function( cb )
{
	if( arguments.length !== 1 )
	{
		throw new RuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( sys.hasType( cb, "func" ) === false )
	{
		throw new RuntimeError(
			"Arg cb must be a func", { cb: cb }
		);
	}
	
	if( this.hasEnded === true )
	{
		throw new RiverRuntimeError(
			this,
			"A DropConnection may be ended by calling end() "+
			"only once but calling it twice isnt allowed",
			undefined,
			"DropConnectionEndedTwice"
		);
	}
	
	this.hasEnded = true;
	
	this.endCon( cb );
}],

hasEnded:
[
"final",
getA.ANY_ARGS,
getR( "bool" )
function()
{
	if( arguments.length !== 0 )
	{
		throw new RuntimeError(
			"No args may be provided", { providedArgs: arguments }
		);
	}
	
	return this.hasEnded;
}]

});

});
