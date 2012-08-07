ourglobe.define(
[
	"./testruntimeerror"
],
function( mods )
{

var TestRuntimeError = undefined;

var SuiteRuntimeError =
function( msg, errorVar, errorCode, errorPlace )
{
	if( arguments.length < 1 || arguments.length > 4 )
	{
		throw new TestRuntimeError(
			"Between one and four args must be provided"
		);
	}
	
	if( errorPlace === undefined )
	{
		errorPlace = SuiteRuntimeError;
	}
	
	TestRuntimeError.call(
		this, msg, errorVar, errorCode, errorPlace
	);
};

SuiteRuntimeError.prototype.constructor.name =
	"SuiteRuntimeError"
;

mods.delay(
function()
{
	TestRuntimeError = mods.get( "testruntimeerror" );
	
	SuiteRuntimeError.prototype.__proto__ =
		TestRuntimeError.prototype
	;
});

return SuiteRuntimeError;

});
