ourglobe.define(
[
	"./store",
	"./id",
	"./link",
	"./binary",
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

var Link = undefined;

mods.delay(
function()
{
	Link = mods.get( "link" );
});

var Cache =
Class.create(
{

name: "Cache",
constr:
[
function()
{
	return [ getA( Cache.CACHE_VAR_S, Link, [ Date, "undef" ] ) ];
},
function( cacheVar, link, refreshedDate )
{
	this.cache = cacheVar;
	this.link = link;
	this.refreshedDate =
		refreshedDate !== undefined ?
		refreshedDate :
		new Date()
	;
}]

});

Class.addStatic(
Cache,
{
	CACHE_VAR_S: { badTypes: "undef" }
});

return Cache;

},
function( mods, Cache )
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

var Link = mods.get( "./link" );
var Store = mods.get( "./store" );

Class.add(
Cache,
{

getStoreName:
[
"static",
Store.GET_STORE_NAME_V,
function()
{
	return "org.ourGlobe.server.store.Cache";
}],

restoreObj:
[
"static",
Store.RESTORE_OBJ_V,
function( obj )
{
	return new Cache( obj.cache, obj.link, obj.refreshedDate );
}],

getCache:
[
getR( Cache.CACHE_VAR_S ),
function()
{
	return this.cache;
}],

getLink:
[
getR( Link ),
function()
{
	return this.link;
}],

getRefreshedDate:
[
getR( Date ),
function()
{
	return this.refreshedDate;
}]

});

});
