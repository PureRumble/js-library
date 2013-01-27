ourglobe.define(
[
"./storedataruntimeerror",
"./storeconhandler",
"./storemapper",
"./binary",
"./id",
"./link",
"./cache"
],
function( mods )
{

return(
	{
		StoreDataRuntimeError:
			mods.get( "storedataruntimeerror" ),
		StoreConHandler: mods.get( "storeconhandler" ),
		StoreMapper: mods.get( "storemapper" ),
		Binary: mods.get( "binary" ),
		Id: mods.get( "id" ),
		Link: mods.get( "link" ),
		Cache: mods.get( "cache" )
	}
);

});
