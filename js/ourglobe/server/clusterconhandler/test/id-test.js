var vows = require("vows");

var Testing = require("ourglobe/testing").Testing;

var assert = require("ourglobe").assert;

var conf = require("ourglobe").conf;
var sys = require("ourglobe").sys;

var MoreObject = require("ourglobe").MoreObject;
var FuncVer = require("ourglobe").FuncVer;

var Id = require("ourglobe/clusterconhandler").Id;

var suite = vows.describe( "id" );

var NR_IDS = 500000;

var checkId = function( topic )
{
	Testing.errorCheckArgs( arguments );
	
	assert(
		topic instanceof Id === true,
		"An Id was not yielded"
	);
}

// creating ids
suite.addBatch( Testing.getTests(
	
	"creating an id",
	{
		topic: new Id(),
		"yields an id": checkId,
	},
	"creating an id from a str",
	{
		topic: function()
		{
			var idOne = new Id();
			var idTwo = new Id( idOne.toString() );
			
			return { idOne:idOne, idTwo:idTwo };
		},
		"gives and id": function( ids )
		{
			Testing.errorCheckArgs( arguments );
			
			checkId( ids.idTwo );
		},
		"gives and id equal to the string": function( ids )
		{
			Testing.errorCheckArgs( arguments );
			
			assert(
				ids.idOne.toString() === ids.idTwo.toString(),
				"The Id doesnt equal the string"
			);
		}
	},
	"creating and id from a buf",
	{
		topic: function()
		{
			var idOne = new Id();
			var idTwo = new Id( idOne.getBuffer() );
			
			return { idOne:idOne, idTwo:idTwo };
		},
		"gives and id": function( ids )
		{
			Testing.errorCheckArgs( arguments );
			
			checkId( ids.idTwo );
		},
		"gives and id equal to the buf": function( ids )
		{
			Testing.errorCheckArgs( arguments );
			
			assert(
				ids.idOne.toString() === ids.idTwo.toString(),
				"The Id doesnt equal the buf"
			);
		}
	}
	
) );

// id collision test
suite.addBatch( Testing.getTests(
	
	"creating many ids",
	Testing.getTests(
		
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
			Testing.errorCheckArgs( arguments );
			
			assert(
				topic === 0,
				topic+" collisions occurred"
			);
		}
	)
	
) );

suite.export( module );
