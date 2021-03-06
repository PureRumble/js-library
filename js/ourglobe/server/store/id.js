ourglobe.define(
[
	"crypto",
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

var crypto = mods.get( "crypto" );

var idStrRegExp =
	"^[0-9a-f]{8}[0-9a-f]{4}4[0-9a-f]{3}"
	"[89ab][0-9a-f]{3}[0-9a-f]{12}$"
;
var idStrS = { strPattern: idStrRegExp };

var Id =
Class.create(
{

name: "Id",
constr:
[
getA( [ idStrS, "undef" ] ),
function( idStr )
{
	if( idStr === undefined )
	{
		var rb = crypto.randomBytes( 16 );
		
		rb[ 6 ] = ( rb[ 6 ] & 0x0f ) | 0x40;
		rb[ 8 ] = ( rb[ 8 ] & 0x3f ) | 0x80;
		
		idStr = new Buffer( rb ).toString( "hex" );
	}
	
	this.id = idStr;
}]

});

Class.addStatic(
Id,
{
	ID_STR_REG_EXP: idStrRegExp,
	ID_STR_S: idStrS,
	R_ID_STR_S: { req: true, strPattern: idStrRegExp }
});

return Id;

},
function( mods, Id )
{

var FuncVer = ourGlobe.FuncVer;

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
Id,
{

verIdStr:
[
"static",
getA( "any" ),
getR( "bool" ),
function( idStr )
{
	return(
		hasT( idStr, "str" ) === true &&
		idStr.search( Id.ID_STR_REG_EXP ) === 0
	);
}],

getStoreName:
[
"static",
Store.GET_STORE_NAME_V,
function()
{
	return Store.ID_STORE_NAME;
}],

verStoreVars:
[
"static",
getA( "any" ),
getR( "bool" ),
function( idStr )
{
	return Id.verIdStr( idStr );
}],

toString:
[
getR( Id.ID_STR_S ),
function()
{
	return this.id;
}]

});

});
