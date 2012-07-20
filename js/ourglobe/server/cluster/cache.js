ourglobe.define(
[
	"./id",
	"./link",
	"./binary",
	
],
function( mods )
{

var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

var Cache =
getF(
function()
{
	return(
		new FuncVer( [
			Cache.CACHE_OBJ_S,
			mods.get( "link" ),
			[ Date, "undef" ]
		])
	);
},
function( cacheObj, link, refreshedDate )
{
	this.cacheObj = cacheObj;
	this.link = link;
	this.refreshedDate =
		refreshedDate !== undefined ?
		refreshedDate :
		new Date()
	;
});

Cache.CACHE_OBJ_S = "any";

return Cache;

},
function( mods, Cache )
{

var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

var Link = mods.get( "./link" );

Cache.prototype.getCache =
getF(
new FuncVer( undefined, Cache.CACHE_OBJ_S ),
function()
{
	return this.cacheObj;
});

Cache.prototype.getLink =
getF(
new FuncVer( undefined, Link ),
function()
{
	return this.link;
});

Cache.prototype.getRefreshedDate =
getF(
new FuncVer( undefined, Date ),
function()
{
	return this.refreshedDate;
});

});
