ourglobe.define(
[
	"./testingerror",
	"./testruntimeerror",
	"./suiteruntimeerror",
	"./test",
	"./testqueue",
	"./suite"
],
function( mods )
{

return(
	{
		TestingError: mods.get( "testingerror" ),
		TestRuntimeError: mods.get( "testruntimeerror" ),
		SuiteRuntimeError: mods.get( "suiteruntimeerror" ),
		TestQueue: mods.get( "testqueue" ),
		Test: mods.get( "test" ),
		Suite: mods.get( "suite" )
	}
);

});
