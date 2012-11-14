ourGlobe.define(
[
	"./riverruntimeerror",
	"./river",
	"./stream",
	"./drop",
	"./dropconnection"
],
function( mods )
{
	return(
		{
			RiverRuntimeError: mods.get( "riverruntimeerror" ),
			River: mods.get( "river" ),
			Stream: mods.get( "stream" ),
			Drop: mods.get( "drop" ),
			DropConnection: mods.get( "dropconnection" )
		}
	);
});
