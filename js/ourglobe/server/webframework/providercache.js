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

ProviderCache.GET_CACHE_FV =
	new FuncVer( [ [ RequestProvider, "undef" ] ], "obj" )
;

ProviderCache.SET_CACHE_FV = new FuncVer( [ "obj" ] );

ProviderCache.prototype.setProvider =
sys.getFunc(
new FuncVer( [ RequestProvider] ),
function( requestProvider )
{
	this.currProvider = requestProvider;
	
// The ProviderCache is initialized to an empty obj for the
// RequestProvider once its cache is requested, so it doesnt
// need to be done here
});

ProviderCache.prototype.getCache =
sys.getFunc(
ProviderCache.GET_CACHE_FV,
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
	
	var requestProviderName = requestProvider.getName();
	
	var cacheObj = this.cache[ requestProviderName ];
	
	if( cacheObj === undefined )
	{
		cacheObj = {};
		this.cache[ requestProviderName ] = cacheObj;
	}
	
	return cacheObj;
});

ProviderCache.prototype.setCache =
sys.getFunc(
ProviderCache.SET_CACHE_FV,
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
