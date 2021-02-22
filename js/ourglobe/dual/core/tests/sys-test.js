ourglobe.require(
[
	"ourglobe/lib/server/vows",
	"ourglobe/dual/testing"
],
function( mods )
{

var vows = mods.get( "vows" );

var Test = mods.get( "testing" ).Test;

var assert = ourglobe.assert;
var sys = ourglobe.sys;

var suite = vows.describe( "sys" );

var getHasTypeTest =
function( hasType, hasTypeArgs )
{
	var returnVar =
	Test.getTests(
		
		"topic",
		function()
		{
			return sys.hasType.apply( sys.hasType, hasTypeArgs );
		},
		
		"yields correct result",
		function( topic )
		{
			Test.errorCheckArgs( arguments );
			
			assert(
				topic === hasType,
				"Didnt receive expected result",
				{
					expectedRes: hasType,
					receivedRes: topic,
					hasTypeArgs: hasTypeArgs
				}
			);
		}
	);
	
	return returnVar;
};

var hasType =
function()
{
	return getHasTypeTest( true, arguments );
};

var lacksType =
function()
{
	return getHasTypeTest( false, arguments );
};

var func = function() {};

// testing type null
suite.addBatch( Test.getTests(
	
	"null is null", hasType( null, "null" ),
	
	"undefined isnt null", lacksType( undefined, "null" ),
	
	"3 isnt null", lacksType( 3, "null" ),
	
	"'dingo' isnt null", lacksType( "dingo", "null" ),
	
	"empty str isnt null", lacksType( "", "null" ),
	
	"0 isnt null", lacksType( 0, "null" ),
	
	"false isnt null", lacksType( false, "null" ),
	
	"empty obj isnt null", lacksType( {}, "null" ),
	
	"non-empty obj isnt null", lacksType( { dingo: 3 }, "null" ),
	
	"obj instance isnt null", lacksType( new Object(), "null" ),
	
	"func isnt null", lacksType( func, "null" ),
	
	"instance isnt null", lacksType( new func(), "null" ),
	
	"empty arr isnt null", lacksType( [], "null" )
	
));

// testing type undefined
suite.addBatch( Test.getTests(
	
	"undefined is undefined", hasType( undefined, "undefined" ),
	
	"undefined is undef", hasType( undefined, "undef" ),
	
	"null isnt undefined", lacksType( null, "undef" ),
	
	"3 isnt undefined", lacksType( 3, "undef" ),
	
	"'dingo' isnt undefined", lacksType( "dingo", "undef" ),
	
	"empty str isnt undefined", lacksType( "", "undef" ),
	
	"0 isnt undefined", lacksType( 0, "undef" ),
	
	"false isnt undefined", lacksType( false, "undef" ),
	
	"empty obj isnt undefined", lacksType( {}, "undef" ),
	
	"non-empty obj isnt undef", lacksType( { dingo: 3 }, "undef" ),
	
	"obj instance isnt undef", lacksType( new Object(), "undef" ),
	
	"func isnt undefined", lacksType( func, "undef" ),
	
	"instance isnt undefined", lacksType( new func(), "undef" ),
	
	"empty arr isnt undefined", lacksType( [], "undef" )
	
));

// testing type object
suite.addBatch( Test.getTests(
	
	"empty obj is obj", hasType( {}, "object" ),
	
	"non-empty obj is obj", hasType( { dingo: true }, "obj" ),
	
	"obj instance is obj", hasType( new Object(), "obj" ),
	
	"empty arr isnt obj", lacksType( [], "obj" ),
	
	"non-empty arr isnt obj", lacksType( [ 55 ], "obj" ),
	
	"func isnt obj", lacksType( func, "obj" ),
	
	"non-obj instance isnt obj", lacksType( new func(), "obj" ),
	
	"null isnt obj", lacksType( null, "obj" ),
	
	"undefined isnt obj", lacksType( undefined, "obj" ),
	
	"43 isnt obj", lacksType( 43, "obj" ),
	
	"true isnt obj", lacksType( true, "obj" ),
	
	"'dengo' isnt obj", lacksType( "dengo", "obj" )
	
));

// testing type instance
suite.addBatch( Test.getTests(
	
	"empty obj is inst", hasType( {}, "instance" ),
	
	"non-empty obj is inst", hasType( { dingo: true }, "inst" ),
	
	"obj instance is inst", hasType( new Object(), "inst" ),
	
	"empty arr is inst", hasType( [], "inst" ),
	
	"non-empty arr is inst", hasType( [ 55 ], "inst" ),
	
	"func is inst", hasType( func, "inst" ),
	
	"non-obj instance is inst", hasType( new func(), "inst" ),
	
	"date obj is inst", hasType( new Date(), "inst" ),
	
	"null isnt inst", lacksType( null, "inst" ),
	
	"undefined isnt inst", lacksType( undefined, "inst" ),
	
	"43 isnt inst", lacksType( 43, "inst" ),
	
	"true isnt inst", lacksType( true, "inst" ),
	
	"'dengo' isnt inst", lacksType( "dengo", "inst" )
	
));

suite.run();

});
