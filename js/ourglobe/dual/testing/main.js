ourglobe.define(
[
	"./testingerror",
	"./testruntimeerror",
	"./suiteruntimeerror",
	"./test",
	"./suite"
],
function( mods )
{

return(
	{
		TestingError: mods.get( "testingerror" ),
		TestRuntimeError: mods.get( "testruntimeerror" ),
		SuiteRuntimeError: mods.get( "suiteruntimeerror" ),
		Test: mods.get( "test" ),
		Suite: mods.get( "suite" )
	}
);

});
