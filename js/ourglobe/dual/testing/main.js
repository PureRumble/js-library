ourglobe.define(
[
	"./testerror",
	"./test"
],
function( mods )
{

return(
	{
		TestError: mods.get( "testerror" ),
		Test: mods.get( "test" )
	}
);

});
