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
			Cache.CACHE_VAR_S,
			mods.get( "link" ),
			[ Date, "undef" ]
		])
	);
},
function( cacheVar, link, refreshedDate )
{
	this.cacheVar = cacheVar;
	this.link = link;
	this.refreshedDate =
		refreshedDate !== undefined ?
		refreshedDate :
		new Date()
	;
});

Cache.CACHE_VAR_S = { badTypes: "undef" };

return Cache;

},
function( mods, Cache )
{

var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

var Link = mods.get( "./link" );

Cache.verClusterVars =
getF(
new FuncVer( [ "any", "any" ] ).setReturn( "bool" ),
function( cacheVar, refreshedDate )
{
	return(
		cacheVar !== undefined &&
		refreshedDate instanceof Date === true
	);
});

Cache.prototype.getCache =
getF(
new FuncVer( undefined, Cache.CACHE_VAR_S ),
function()
{
	return this.cacheVar;
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
