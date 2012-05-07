var vows = require("vows");

var crypto = require("crypto");

var assert = require("ourglobe").assert;
var FuncVer = require("ourglobe").FuncVer;
var sys = require("ourglobe").sys;
var MoreObject = require("ourglobe").MoreObject;

var Testing = require("ourglobe/testing").Testing;

var suite = vows.describe( "Testing" );

function _areEqualTest( objOne, objTwo, areEqual )
{
	new FuncVer( [ "any", "any", "bool" ], "obj" )
		.verArgs( arguments )
	;
	
	var returnVar = Testing.getTests(
		
		"topic",
		function()
		{
			return Testing.areEqual( objOne, objTwo );
		},
		
		"yields correctly",
		function( topic )
		{
			Testing.errorCheckArgs( arguments );
			
			assert(
				topic === areEqual,
				"The following arg set was supposed to yield "+areEqual+
				": "+
				MoreObject.getPrettyStr( {
					objOne:objOne,
					objTwo:objTwo,
					areEqual:areEqual
				} )
			);
		}
	);
	
	return returnVar;
}

function _cloneTest( source )
{
	new FuncVer( [ "any" ] ).verArgs( arguments );
	
	var returnVar = Testing.getTests(
		
		"topic",
		function()
		{
			return Testing.clone( source );
		},
		
		"is precisely equal to source only if obj/arr",
		function( topic )
		{
			Testing.errorCheckArgs( arguments );
			
			if( sys.hasType( source, "obj", "arr" ) === true )
			{
				assert(
					source !== topic,
					"clone is precisely equal to source despite being "+
					"obj/arr"
				);
			}
			else
			{
				assert(
					source === topic,
					"clone isnt precisely equal to source despite not "+
					"obj/arr"
				);
			}
		},
		
		"is equal to source",
		function( topic )
		{
			Testing.errorCheckArgs( arguments );
			
			assert(
				Testing.areEqual( source, topic ) === true,
				"clone doesnt equal source "
			);
		}
	);
	
	return returnVar;
}

var arrOne = [ 1, 2, 3, 4, 5, 6 ];
var arrTwo = [ 1, 2, 3, 4, 5, 6 ];
var arrThree = [ 1, 2, 3, 4, 5, 6 ];

arrOne[ 10 ] = 23;
arrThree[ 10 ] = 23;
arrTwo[ 11 ] = 23;

var dango = { dingo:function( a ) { this.a = a; this.b = 1; } }
var dongo = { dingo:function( a ) { this.a = a; this.b = 1; } }

suite.addBatch( Testing.getTests(
	
	"two 'dingo'", _areEqualTest( "dingo", "dingo", true ),
	
	"'dingo' and 'dango'",
	_areEqualTest( "dingo", "dango", false ),
	
	"'dingo' and 43",
	_areEqualTest( "dingo", 43, false ),
	
	"43 and 43.0",
	_areEqualTest( 43, 43.0, true ),
	
	"two empty objs", _areEqualTest( {}, {}, true ),
	
	"two empty arrs", _areEqualTest( [], [], true ),
	
	"empty obj and arr ", _areEqualTest( {}, [], false ),
	
	"empty and proper obj",
	_areEqualTest( {}, { "dingo":42 }, false ),
	
	"empty and proper arr",
	_areEqualTest( [], [ 42 ], false ),
	
	"two equal arrs",
	_areEqualTest(
		[ 1, 2, 3, { "four":[ 4.0, 4.1, 4.2 ] }, 5, 6 ],
		[ 1, 2, 3, { "four":[ 4.0, 4.1, 4.2 ] }, 5, 6 ],
		true
	),
	
	"two nearly equal objs",
	_areEqualTest(
		{ "dingo":"dingo", "dango":"dango", "dongo":arrOne },
		{ "dingo":"dingo", "dango":"dango", "dongo":arrTwo },
		false
	),
	
	"two deep nearly equal objs",
	_areEqualTest(
		{ 43: { "dingo":"dingo", "dango":"dango", "dongo":arrOne } },
		{ 43: { "dingo":"dingo", "dango":"dango", "dengo":arrOne } },
		false
	),
	
	"two deep equal objs",
	_areEqualTest(
		{ 43: { "dingo":"dingo", "dango":"dango", "dongo":arrOne } },
		{
			43: { "dingo":"dingo", "dango":"dango", "dongo":arrThree }
		},
		true
	),
	
	"two similar class objs",
	_areEqualTest( new dango.dingo(), new dongo.dingo(), false ),
	
	"two similar class objs with values",
	_areEqualTest(
		new dango.dingo( 5 ),
		new dongo.dingo( 5 ),
		false
	),
	
	"two similar objs of same class with values",
	_areEqualTest(
		new dango.dingo( 5 ),
		new dango.dingo( 6 ),
		false
	),
	
	"two equal class objs",
	_areEqualTest( new dango.dingo(), new dango.dingo(), true ),
	
	"two equal deep arrs with nested class objs",
	_areEqualTest(
		[
			0,
			1,
			2,
			{
				"three0":[
					new dango.dingo( 1 ),
					new dango.dingo( 256 ),
				],
				"three1":new dongo.dingo( 7 )
			},
			4,
			5
		],
		[
			0,
			1,
			2,
			{
				"three0":[
					new dango.dingo( 1 ),
					new dango.dingo( 256 ),
				],
				"three1":new dongo.dingo( 7 )
			},
			4,
			5
		],
		true
	),
	
	"two nearly equal deep arrs with nested class objs",
	_areEqualTest(
		[
			0,
			1,
			2,
			{
				"three0":[
					new dango.dingo( 1 ),
					new dango.dingo( 257 ),
				],
				"three1":new dongo.dingo( 7 )
			},
			4,
			5
		],
		[
			0,
			1,
			2,
			{
				"three0":[
					new dango.dingo( 1 ),
					new dango.dingo( 256 ),
				],
				"three1":new dongo.dingo( 7 )
			},
			4,
			5
		],
		false
	)

) );

suite.addBatch( Testing.getTests(
	
	"same date obj",
	Testing.getVar( function()
	{
		var date = new Date();
		
		return _areEqualTest( date, date, true );
		
	} ),
	
	"two equal date objs",
	Testing.getVar( function()
	{
		var oneInt = 3847574382343;
		
		var dateOne = new Date( oneInt );
		var dateTwo = new Date( oneInt );
		
		return _areEqualTest( dateOne, dateTwo, true );
		
	} ),
	
	"two equal date objs created of eachother",
	Testing.getVar( function()
	{
		var oneInt = 3847574382343;
		
		var dateOne = new Date( oneInt );
		var dateTwo = new Date( dateOne );
		
		return _areEqualTest( dateOne, dateTwo, true );
		
	} ),
	
	"two not equal date objs",
	Testing.getVar( function()
	{
		var oneInt = 3847574382343;
		
		var dateOne = new Date( oneInt );
		var dateTwo = new Date( oneInt+1 );
		
		return _areEqualTest( dateOne, dateTwo, false );
	} ),
	
	"arrs and objs of equal dates",
	Testing.getVar( function()
	{
		var dateOne = new Date( 0 );
		var dateTwo = new Date( 100 );
		var dateThree = new Date( 10000 );
		var dateFour = new Date( 1000000 );
		var dateFive = new Date( 100000000 );
		var dateSix = new Date( 200 );
		var dateSeven = new Date( 20000 );
		var dateEight = new Date( 2000000 );
		var dateNine = new Date( 200000000 );
		
		return _areEqualTest(
			{
				dateOne: dateOne,
				dateTwo: dateTwo,
				dateThree: dateThree,
				dateObj:
				{
					dateOne:dateFour,
					dateTwo:dateFive,
					dateThree:dateSix,
					dateArray:[ dateTwo, dateFour ]
				},
				someDates:[ dateSeven, dateEight, dateNine ]
			},
			{
				dateOne: dateOne,
				dateTwo: dateTwo,
				dateThree: dateThree,
				dateObj:
				{
					dateOne:dateFour,
					dateTwo:dateFive,
					dateThree:dateSix,
					dateArray:[ dateTwo, dateFour ]
				},
				someDates:[ dateSeven, dateEight, dateNine ]
			},
			true
		);
		
	} ),
	
	"arrs and objs of equal dates except small difference",
	Testing.getVar( function()
	{
		var dateOne = new Date( 0 );
		var dateTwo = new Date( 100 );
		var dateThree = new Date( 10000 );
		var dateFour = new Date( 1000000 );
		var dateFive = new Date( 100000000 );
		var dateSix = new Date( 200 );
		var dateSeven = new Date( 20000 );
		var dateEight = new Date( 2000000 );
		var dateNine = new Date( 200000000 );
		var dateTen = new Date( dateNine.getTime()+1 );
		
		return _areEqualTest(
			{
				dateOne: dateOne,
				dateTwo: dateTwo,
				dateThree: dateThree,
				dateObj:
				{
					dateOne:dateFour,
					dateTwo:dateFive,
					dateThree:dateSix,
					dateArray:[ dateTwo, dateFour, dateNine ]
				},
				someDates:[ dateSeven, dateEight, dateNine ]
			},
			{
				dateOne: dateOne,
				dateTwo: dateTwo,
				dateThree: dateThree,
				dateObj:
				{
					dateOne:dateFour,
					dateTwo:dateFive,
					dateThree:dateSix,
					dateArray:[ dateTwo, dateFour, dateTen ]
				},
				someDates:[ dateSeven, dateEight, dateNine ]
			},
			false
		);
		
	} )
	
) );

suite.addBatch( Testing.getTests(
	
	"Two equal buffers plain and in objs",
	Testing.getVar( function()
	{
		var bufOne = new Buffer( crypto.randomBytes( 1024 ) );
		var bufTwo = new Buffer( bufOne.length );
		
		bufOne.copy( bufTwo );
		
		var returnVar = Testing.getTests(
			
			"plain", _areEqualTest( bufOne, bufTwo, true ),
			
			"in objs", _areEqualTest( bufOne, bufTwo, true )
			
		);
		
		return returnVar;
		
	} ),
	
	"Two nearly equal buffers plain and in objs",
	Testing.getVar( function()
	{
		var arrOne = crypto.randomBytes( 1024 );
		
		var bufOne = new Buffer( arrOne );
		
		var arrTwo = arrOne.slice();
		
		arrTwo[ 1023 ] =
			arrTwo[ 1023 ] !== 0 ? arrTwo[ 1023 ] - 1 : 1
		;
		
		var bufTwo = new Buffer( arrTwo );
		
		bufOne.copy( bufTwo );
		
		var returnVar = Testing.getTests(
			
			"plain", _areEqualTest( bufOne, bufTwo, false ),
			
			"in objs", _areEqualTest( bufOne, bufTwo, false )
			
		);
		
		return returnVar;
	} )
	
) );

function Dingo( dongo )
{
	this.dongo = dongo;
}
Dingo.prototype.dengo = "dengo";

function Dango( dongo )
{
	Dango.super_.call( this, dongo );
}
sys.inherits( Dango, Dingo );

suite.addBatch( Testing.getTests(
	
	"two equal class objs",
	_areEqualTest( new Dingo(), new Dingo(), true ),
	
	"one class obj inheriting the other objs' class",
	_areEqualTest( new Dingo(), new Dango(), false ),
	
	"two equal class objs with same instance values",
	_areEqualTest(
		new Dingo( "dingo" ), new Dingo( "dingo" ), true
	),
	
	"two nearly equal class objs with different instance values",
	_areEqualTest(
		new Dingo( "dingo" ), new Dingo( "dongo" ), false
	),
	
	"two equal class objs with instance values",
	_areEqualTest(
		new Dingo( "dango" ),
		Testing.getVar(
			function() { return new Dingo( "dango" ); }
		),
		true
	),
	
	"two nearly equal class objs, one with its own instance value",
	_areEqualTest(
		new Dingo(),
		Testing.getVar(
			function()
			{
				var dingo = new Dingo();
				dingo.dengo = "dengo";
				
				return dingo;
			}
		),
		false
	)
	
) );

suite.addBatch( Testing.getTests(
	"cloning 42", _cloneTest( 42 ),
	"cloning 'dingo'", _cloneTest( "dingo" ),
	"cloning true", _cloneTest( true ),
	"cloning empty obj", _cloneTest( {} ),
	"cloning empty arr", _cloneTest( [] ),
	"cloning { dingo:42 }", _cloneTest( { dingo:42 } ),
	"cloning [ 42 ]", _cloneTest( [ 42 ] ),
	"cloning [ 'dingo':42 ]",
	_cloneTest(
		Testing.getVar( function()
		{
			var arr = [];
			arr[ "dingo" ] = 42;
			
			return arr;
		} )
	),
	
	"cloning { dingo:42, dango:43 }",
	_cloneTest( { dingo:42, dango:43 } ),
	
	"cloning [ 42, 43 ]", _cloneTest( [ 42, 43 ] ),
	
	"cloning [ 'dingo':42, 'dango':43 ]",
	_cloneTest(
		Testing.getVar( function()
		{
			var arr = [];
			arr[ "dingo" ] = 42;
			arr[ "dango" ] = 43;
			
			return arr;
		} )
	),
	
	"cloning objs and arrs nested in one another",
	_cloneTest(
		Testing.getVar( function()
		{
			var arr = [ true ];
			arr[ "dongo" ] = "dongo";
			
			var returnVar =
			[
				42,
				43,
				44,
				{
					dingo:"dingo",
					dango:arr
				},
				46,
				47
			];
			
			return returnVar;
		} )
	),
	
	"cloning class obj",
	_cloneTest(
		Testing.getVar( function()
		{
			function Dingo()
			{
				this.dingo = "dingo";
				this.dango = "dango";
				this.dongo = "dongo";
				this.dengo = { 42:"dingo", 43:[ 0, 1, "dingo" ] };
			}
			
			return new Dingo()
		} )
	),
	
	"cloning inheriting class obj",
	_cloneTest(
		Testing.getVar( function()
		{
			function Dingo()
			{
				this.dingo = "dingo";
				this.dango = true;
				this.dongo = {};
				this.dongo.dengo =
					{ dingi:54, dangi:65, dongi:[ 1, 2 ] }
				;
			}
			
			function Dango()
			{
				this.dengo = {};
				this.dengo.dongo = [ 0, 1, 2, 3 ];
				
				Dango.super_.call( this );
			}
			sys.inherits( Dango, Dingo );
			
			return new Dango();
			
		} )
	)
	
) );

suite.addBatch( Testing.getTests(
	
	"cloning buffer", _cloneTest( new Buffer( 256 ) ),
	
	"cloning buffer in arr",
	_cloneTest( [ new Buffer( 256 ), "dingo", 42 ] )
	
) );

suite.addBatch( Testing.getTests(
	
	"cloning date", _cloneTest( new Date( 342345 ) ),
	
	"cloning date in obj",
	_cloneTest( { dingo:new Date( 342345 ) } )
	
) );

suite.export( module );
