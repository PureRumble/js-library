ourglobe.define(
[
"./clusterdataruntimeerror",
"./clusterconhandler",
"./clustermapper",
"./binary",
"./id",
"./link",
"./cache"
],
function( mods )
{

return(
	{
		ClusterDataRuntimeError:
			mods.get( "clusterdataruntimeerror" ),
		ClusterConHandler: mods.get( "clusterconhandler" ),
		ClusterMapper: mods.get( "clustermapper" ),
		Binary: mods.get( "binary" ),
		Id: mods.get( "id" ),
		Link: mods.get( "link" ),
		Cache: mods.get( "cache" )
	}
);

});
