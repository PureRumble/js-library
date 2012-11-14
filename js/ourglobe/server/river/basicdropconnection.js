ourGlobe.define(
[
	"http",
	"./riverruntimeerror",
	"./dropconnection"
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

var DropConnection = undefined;

mods.delay(
function()
{
	DropConnection = mods.get( "dropconnection" );
	
	Class.extend( BasicDropConnection, DropConnection );
});

var BasicDropConnection =
Class.create(
{
name: "BasicDropConnection",
constr:
[
getA( "inst", "inst" ),
function( req, res )
{
	this.req = req;
	this.res = res;
}]

});

return BasicDropConnection;

},
function( mods, BasicDropConnection )
{

var DropConnection = mods.get( "dropconnection" );

var RiverRuntimeError = mods.get( "riverruntimeerror" );

Class.add(
{

endCon:
[
DropConnection.END_CON_FV,
function()
{
	this.req.end(
		getCb(
		this,
		getA.ANY_ARGS,
		function()
		{
			try
			{
			this.res.end( cb );
			}
			catch( e )
			{
				cb( e );
			}
		})
	);
}]

});

});
