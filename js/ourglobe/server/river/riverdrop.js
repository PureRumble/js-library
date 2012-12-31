ourGlobe.define(
[
	"http",
	"./streamerror",
	"./river",
	"./drop",
	"./stream"
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

var RiverDrop =
Class.create(
{

name: "RiverDrop",
constr:
[
getA( "inst", "inst" ),
function( req, res )
{
	this.request = req;
	this.response = res;
	
	this.drops = [];
}]

});

return RiverDrop;

},
function( mods, RiverDrop )
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

var Drop = mods.get( "drop" );
var River = mods.get( "river" );
var Stream = mods.get( "stream" );

Class.add(
RiverDrop,
{

getCurrDrop:
[
getR( [ Drop, "undef" ] ),
function()
{
	if( this.drops.length > 0 )
	{
		return this.drops[ this.drops.length - 1 ];
	}
}],

flowToStream:
[
getA( Stream ),
function( stream )
{
	var lastDrop = this.getCurrDrop();
	
	this.drops.push( new Drop( this, stream, lastDrop ) );
}],

leaveStream:
[
function()
{
	this.drops.pop();
}],

beginRiverFlow:
[
getA( "func" ),
function( cb )
{
	this.getCurrDrop().beginRiverFlow(
		getCb(
		this,
		getA( [ StreamError, "undef" ] ),
		function( err )
		{
			cb( err );
		})
	);
}],

begin:
[
getA( "func" ),
function( cb )
{
	this.getCurrDrop().begin(
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
	this.getCurrDrop().validate(
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
	this.getCurrDrop().prepare(
		getCb(
		this,
		getA( [ StreamError, "undef" ] ),
		function( err )
		{
			cb( err );
		})
	);
}],

branch:
[
getA( "func" ),
function( cb )
{
	this.getCurrDrop().branch(
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
	this.getCurrDrop().serve(
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
	this.getCurrDrop().serveErr(
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
	this.getCurrDrop().serveFailure(
		failureCode,
		getCb(
		this,
		getA( [ StreamError, "undef" ] ),
		function( err )
		{
			cb( err );
		})
	);
}],

finish:
[
getA( "func" ),
function( cb )
{
	this.getCurrDrop().finish(
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
