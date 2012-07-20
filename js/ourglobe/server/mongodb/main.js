ourglobe.define(
	[
		"./mongodb",
		"./mongoconhandler"
	],
	function( mods )
	{
		return(
			{
				MongoDb: mods.get( "mongodb" ),
				MongoConHandler: mods.get( "mongoconhandler" )
			}
		);
	}
);
