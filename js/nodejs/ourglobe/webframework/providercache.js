var RuntimeError = require("ourglobe").RuntimeError;

var conf = require("ourglobe").conf;
var sys = require("ourglobe").sys;
var FuncVer = require("ourglobe").FuncVer;

var ProviderCache =
sys.getFunc(
new FuncVer(),
function()
{
	this.cache = [];
	this.currProvider = undefined;
});

exports.ProviderCache = ProviderCache;

var RequestProvider =
	require("./requestprovider").RequestProvider
;

ProviderCache.prototype.setProvider =
sys.getFunc(
new FuncVer( [ RequestProvider] ),
function( requestProvider )
{
	this.currProvider = requestProvider;
	
	var providerName = requestProvider.getName();
	
	if( this.cache[ providerName ] === undefined )
	{
		this.cache[ providerName ] = {};
	}
});

ProviderCache.GET_CACHE_S =
	new FuncVer( [ [ RequestProvider, "undef" ] ], "obj" )
;

ProviderCache.prototype.getCache =
sys.getFunc(
ProviderCache.GET_CACHE_S,
function( requestProvider )
{
	
	if( this.currProvider === undefined )
	{
		throw new RuntimeError(
			"A current RequestProvider must be designated for this "+
			"ProviderCache before a RequestProvider's cache can be "+
			"fetched",
			ProviderCache.prototype.getCache
		);
	}
	
	requestProvider =
		requestProvider !== undefined ?
		requestProvider :
		this.currProvider
	;
	
	var cacheObj = this.cache[ requestProvider.getName() ];
	
	if( cacheObj === undefined )
	{
		throw new RuntimeError(
			"The given RequestProvider isnt part of this "+
			"ProviderCache",
			ProviderCache.prototype.getCache
		);
	}
	
	return cacheObj;
});

ProviderCache.SET_CACHE_S = new FuncVer( [ "obj" ] );

ProviderCache.prototype.setCache =
sys.getFunc(
ProviderCache.SET_CACHE_S,
function( cacheObj )
{
	
	if( this.currProvider === undefined )
	{
		throw new RuntimeError(
			"A current RequestProvider must be designated for this "+
			"ProviderCache so its cache obj can be set",
			ProviderCache.prototype.setCache
		);
	}
	
	this.cache[ this.currProvider.getName() ] = cacheObj;
});
