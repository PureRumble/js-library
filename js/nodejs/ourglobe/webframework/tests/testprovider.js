var RuntimeError = require("ourglobe").RuntimeError;

var conf = require("ourglobe").conf;
var sys = require("ourglobe").sys;
var FuncVer = require("ourglobe").FuncVer;

var RequestProvider =
	require("ourglobe/webframework").RequestProvider
;

var ProviderCache =
	require("ourglobe/webframework").ProviderCache
;

var TestProvider =
sys.getFunc(
function()
{
	return new FuncVer( [
		RequestProvider.PROVIDER_NAME_S,
		[ RequestProvider, "undef" ],
		[ RequestProvider, "undef" ]
	]);
},
function( providerName, failureProvider, errorProvider )
{
	TestProvider.super_.call(
		this, providerName, failureProvider, errorProvider
	);
});

sys.inherits( TestProvider, RequestProvider );

exports.TestProvider = TestProvider;
