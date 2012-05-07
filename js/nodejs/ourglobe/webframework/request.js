var http = require("http");

var sys = require("ourglobe").sys;
var FuncVer = require("ourglobe").FuncVer;

var Request =
sys.getFunc(
new FuncVer( [
	"obj", http.ServerResponse
] ),
function( serverRequest, serverResponse )
{
	this.providerCache = new ProviderCache();
	
	this.serverRequest = serverRequest;
	this.serverResponse = serverResponse;
	
	this.resetRequestObject();
});

exports.Request = Request;

var ProviderCache = require("./providercache").ProviderCache;

Request.prototype.resetRequestObject =
sys.getFunc(
new FuncVer(),
function()
{
	this.requestObject =
	{
		serverReq: this.serverRequest, serverRes: this.serverResponse
	};
});

Request.prototype.getReqObj =
sys.getFunc(
new FuncVer( undefined, "obj" ),
function()
{
	return this.requestObject;
});

Request.prototype.setReqObj =
sys.getFunc(
new FuncVer( [ "obj" ] ),
function( requestObject )
{
	this.requestObject = requestObject;
});


Request.prototype.getProviderCache =
sys.getFunc(
new FuncVer( undefined, ProviderCache ),
function()
{
	return this.providerCache;
}
);

Request.prototype.getCache =
sys.getFunc(
ProviderCache.GET_CACHE_S,
function( requestProvider )
{
	return this.providerCache.getCache( requestProvider );
});

Request.prototype.setCache =
sys.getFunc(
ProviderCache.SET_CACHE_S,
function( cacheObj )
{
	return this.providerCache.setCache( cacheObj );
});
