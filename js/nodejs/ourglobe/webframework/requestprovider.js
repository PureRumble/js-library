var http = require("http");

var RuntimeError = require("ourglobe").RuntimeError;

var conf = require("ourglobe").conf;
var sys = require("ourglobe").sys;
var FuncVer = require("ourglobe").FuncVer;

var RequestProvider =
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
	this.providerName = providerName;
	this.failureProvider = failureProvider;
	this.errorProvider = errorProvider;
});

RequestProvider.PROVIDER_NAME_S =
	{ minStrLen:1, chars:"letters" }
;

RequestProvider.FAILURE_CODE_S =
	{ minStrLen:1, chars:"letters" }
;

exports.RequestProvider = RequestProvider;

var Request = require("./request").Request;

RequestProvider.VALIDATE_FV =
	new FuncVer( [ Request, "func" ] )
;

RequestProvider.PREPARE_FV =
	new FuncVer( [ Request, "func" ] )
;

RequestProvider.HAND_OVER_FV = new FuncVer( [ Request ] );

RequestProvider.PROVIDE_FV =
	new FuncVer( [ Request, "func" ] )
;

RequestProvider.prototype.validate =
sys.getFunc(
RequestProvider.VALIDATE_FV,
function()
{
	throw new RuntimeError(
		"This function must not be called, "+
		"since all subclasses of RequestProvider are to implement "+
		"validate()"
	);
});

RequestProvider.prototype.prepare =
sys.getFunc(
RequestProvider.PREPARE_FV,
function( request, cb )
{
	cb();
});

RequestProvider.prototype.handOver =
sys.getFunc(
RequestProvider.HAND_OVER_FV,
function( request )
{
	return undefined;
});

RequestProvider.prototype.provide =
sys.getFunc(
RequestProvider.PROVIDE_FV,
function()
{
	throw new RuntimeError(
		"This function must not be called, "+
		"since all subclasses of RequestProvider are to implement "+
		"provide()"
	);
});

RequestProvider.prototype.getName =
sys.getFunc(
new FuncVer( undefined, RequestProvider.PROVIDER_NAME_S ),
function()
{
	return this.providerName;
});

RequestProvider.prototype.getErrorProvider =
sys.getFunc(
new FuncVer().setReturn( [ RequestProvider, "undef" ] ),
function()
{
	return this.errorProvider;
});

RequestProvider.prototype.getValidationFailureProvider =
sys.getFunc(
new FuncVer().setReturn( [ RequestProvider, "undef" ] ),
function()
{
	return this.failureProvider;
});
