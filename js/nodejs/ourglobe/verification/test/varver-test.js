var vows = require("vows");

var Testing = require("ourglobe/testing").Testing;

var assert = require("ourglobe").assert;
var sys = require("ourglobe").sys;

var MoreObject = require("ourglobe").MoreObject;
var VarVer = require("ourglobe").VarVer;
var VarVerError = require("ourglobe").VarVerError;

var suite = vows.describe( "varver" );

function _varVerTest( varVer, variable )
{
	var verOk = true;
	
	try
	{
		if( sys.hasType( varVer, "func" ) === true )
		{
			varVer();
		}
		else
		{
			varVer.verVar( variable );
		}
	}
	catch( err )
	{
		if( err instanceof VarVerError === false )
		{
			throw err;
		}
		
		verOk = false;
	}
	
	return verOk;
}

function _testVar( varVer, variable, varHolds )
{
	var returnVar = Testing.getTests(
		
		"topic",
		function()
		{
			return _varVerTest( varVer, variable )
		},
		
		"yields "+varHolds,
		function( topic )
		{
			assert(
				topic === varHolds,
				"The following arg set was supposed to yield "+
				varHolds+": "+
				MoreObject.getPrettyStr( {
					varVer:varVer, variable:variable
				} )
			);
		}
	);
	
	return returnVar;
}

function _varHolds( varVer, variable )
{
	return _testVar( varVer, variable, true );
}

function _varFails( varVer, variable )
{
	return _testVar( varVer, variable, false );
}

function doubleTest( varVer, okVar, notOkVar )
{
	var returnVar = Testing.getTests(
		
		"- holding var", _varHolds( varVer, okVar ),
		
		"- failing var", _varFails( varVer, notOkVar )
	);
	
	return returnVar;
}

// VarVer tests
suite.addBatch( Testing.getTests(
	
	"VarVer test holding at construction",
	_varHolds(
		function(){ new VarVer( { types:"int" }, 42 ) }
	),
	
	"VarVer test failing at construction",
	_varFails(
		function(){ new VarVer( { values:[ "dingo" ] }, "dengo" ) }
	),
	
	"VarVer test holding in chain calls",
	_varHolds(
		function()
		{
			new VarVer( { types:"int" } )
				.verVar( 42 )
				.verVar( 142 )
				.verVar( 242 )
				.verVar( 342 )
			;
		}
	),
	
	"VarVer test failing in chain calls",
	_varFails(
		function()
		{
			new VarVer( { minStrLen:5 } )
				.verVar( "dingo" )
				.verVar( "dango" )
				.verVar( "dongo" )
				.verVar( "dengo" )
				.verVar( 434343 )
			;
		}
	)
	
) );

suite.export( module );
