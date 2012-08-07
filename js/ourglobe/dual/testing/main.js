ourglobe.define(
[
	"./testerror",
	"./testruntimeerror",
	"./suiteruntimeerror",
	"./test",
	"./suite"
],
function( mods )
{

return(
	{
		TestError: mods.get( "testerror" ),
		TestRuntimeError: mods.get( "testruntimeerror" ),
		SuiteRuntimeError: mods.get( "suiteruntimeerror" ),
		Test: mods.get( "test" ),
		Suite: mods.get( "suite" )
	}
);

});
