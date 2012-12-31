ourGlobe.define(
[
	"./streamerror",
	"./riverruntimeerror",
	"./river",
	"./stream",
	"./drop"
],
function( mods )
{
	return(
		{
			StreamError: mods.get( "streamerror" ),
			RiverRuntimeError: mods.get( "riverruntimeerror" ),
			River: mods.get( "river" ),
			Stream: mods.get( "stream" ),
			Drop: mods.get( "drop" )
		}
	);
});
