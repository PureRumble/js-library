ourglobe.require(
[
	"ourglobe/lib/server/vows",
	"ourglobe/dual/testing",
	"ourglobe/server/cluster"
],
function( mods )
{

var assert = ourglobe.assert;

var conf = ourglobe.conf;
var sys = ourglobe.sys;
var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

var vows = mods.get( "vows" );

var Test = mods.get( "testing" ).Test;
var Id = mods.get( "cluster" ).Id;

var suite = vows.describe( "id" );

var NR_IDS = 500000;

var checkId = function( topic )
{
	Test.errorCheckArgs( arguments );
	
	assert(
		topic instanceof Id === true,
		"An Id was not yielded"
	);
}

// creating ids
suite.addBatch( Test.getTests(
	
	"creating an id",
	{
		topic: new Id(),
		"yields an id": checkId,
	},
	"creating an id from a str",
	{
		topic:
		function()
		{
			var idOne = new Id();
			var idTwo = new Id( idOne.toString() );
			
			return { idOne:idOne, idTwo:idTwo };
		},
		"gives and id":
		function( ids )
		{
			Test.errorCheckArgs( arguments );
			
			checkId( ids.idTwo );
		},
		"gives and id equal to the string":
		function( ids )
		{
			Test.errorCheckArgs( arguments );
			
			assert(
				ids.idOne.toString() === ids.idTwo.toString(),
				"The Id doesnt equal the string"
			);
		}
	}
));

// id collision test
suite.addBatch( Test.getTests(
	
	"creating many ids",
	Test.getTests(
		
		"topic",
		function()
		{
			var ids = [];
			var nrCollisions = 0;
			
			conf.turnOffVer();
			
			for( var i = 0; i < NR_IDS; i++ )
			{
				var id = new Id().toString();
				
				nrCollisions += ids[ id ] !== undefined ? 1 : 0;
				
				ids[ id ] = true;
			}
			
			conf.turnOnVer();
			
			return nrCollisions
		},
		
		"doesnt give any collisions",
		function( topic )
		{
			Test.errorCheckArgs( arguments );
			
			assert( topic === 0, topic+" collisions occurred" );
		}
	)
	
) );

suite.run();

});
