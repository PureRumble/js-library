ourglobe.define(
[
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

Class.add(
Cache,
{

verClusterVars:
[
"static",
getA( "any", "any" ),
getR( "bool" ),
function( cacheVar, refreshedDate )
{
	return(
		cacheVar !== undefined &&
		refreshedDate instanceof Date === true
	);
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
