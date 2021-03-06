ourglobe.define(
[
	"./store"
],
function( mods )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var getF = ourGlobe.getF;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var Binary =
Class.create(
{

name: "Binary",
instVars:
{
	buf: "final"
},
constr:
[
getA( Buffer ),
function ( buf )
{
	this.buf = buf;
}]

});

return Binary;

},
function( mods, Binary )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var getF = ourGlobe.getF;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var Store = mods.get( "store" );

Class.add(
Binary,
{

getStoreName:
[
"static",
Store.GET_STORE_NAME_V,
function()
{
	return Store.BINARY_STORE_NAME;
}],

verStoreVars:
[
"static",
getA( "any", "any" ),
getR( "bool" ),
function( buf, contentType )
{
// verStoreVars() can be used to verify contentType alone,
// in which case contentType is the first arg
	return(
		(
			arguments.length === 1 &&
			buf === "jpg"
		) ||
		(
			buf instanceof Buffer === true &&
			contentType === "jpg"
		)
	);
}],

getBuffer:
[
getR( Buffer ),
function()
{
	return this.buf;
}],

});

});
