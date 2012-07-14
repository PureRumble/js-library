og.define(
[
	"./testerror",
	"./test"
],
function( mods )
{

var returnVar =
{
	TestError: mods.get( "testerror" ),
	Test: mods.get( "test" )
};

return returnVar;

});
