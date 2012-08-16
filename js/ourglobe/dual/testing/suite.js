ourglobe.define(
[
	"./testruntimeerror",
	"./suiteruntimeerror"
],
function( mods )
{

var TestRuntimeError = undefined;

mods.delay(
	function()
	{
		TestRuntimeError = mods.get( "testruntimeerror" );
	}
);

var Suite =
function()
{
};

return Suite;

},
function( mods, Suite )
{

var TestRuntimeError = mods.get( "testruntimeerror" );
var SuiteRuntimeError = mods.get( "suiteruntimeerror" );

});
