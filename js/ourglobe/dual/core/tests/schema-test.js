og.require(
[
	"ourglobe/lib/server/vows",
	"ourglobe/dual/testing"
],
function( mods )
{

var vows = mods.get( "vows" );

var Test = mods.get( "testing" ).Test;

var assert = og.assert;
var sys = og.sys;

var Schema = og.Schema;
var SchemaError = og.SchemaError;

var suite = vows.describe( "schema" );

function testSchema( schema, variable, varExists, holds )
{
	var returnVar = {
		topic: new Schema( schema ).test( variable, varExists ),
		"is OK": function( topic )
		{
			assert(
				topic === holds,
				"The schema should "+
				( holds === true ? "approve" : "disapprove" ) +
				" variable",
				{
					schema: schema,
					variable: variable,
					varExists: varExists
				}
			);
		}
	};
	
	return returnVar;
}

function schemaHolds( schema, variable, varExists )
{
	return testSchema( schema, variable, varExists, true );
}

function schemaFails( schema, variable, varExists )
{
	return testSchema( schema, variable, varExists, false );
}

function doubleTest(
	schema, varHolds, varFails, varHoldsExists, varFailsExists
)
{
	return Test.getTests(
		
		"- holding test",
		schemaHolds( schema, varHolds, varHoldsExists ),
		
		"- failing test",
		schemaFails( schema, varFails, varFailsExists )
		
	);
}

function faultySchema( schema, variable, varExists )
{
	varExists = varExists === undefined ? true : varExists;
	
	var returnVar = {
		topic: function()
		{
			var error = false;
			
			try {
				new Schema( schema ).test( variable, varExists );
			}
			catch( err )
			{
				error = err;
			}
			
			return error;
		},
		"is OK": function( topic )
		{
			
			assert(
				topic !== false,
				"The schema isnt faulty",
				{ schema: schema }
			);
			
			if( topic instanceof SchemaError !== true )
			{
				throw topic;
			}
		}
	};
	
	return returnVar;
}

// empty schemas
suite.addBatch( Test.getTests(
	
	"empty schema with undef", schemaHolds( {}, undefined ),
	"empty schema with null", schemaHolds( {}, null ),
	"empty schema with bool", schemaHolds( {}, true ),
	"empty schema with int", schemaHolds( {}, 0 ),
	"empty schema with number", schemaHolds( {}, 0.4 ),
	"empty schema with str", schemaHolds( {}, "dingo" ),
	
	"schema with many undefs and obj",
	schemaHolds(
		{
			types: undefined,
			goodTypes: undefined,
			items: undefined,
			keys: undefined,
			badTypes: undefined,
			minProps: undefined,
			minKeys: undefined,
			minStrLen: undefined,
			minStrLength: undefined
		},
		{
			dingo: "dingo",
			dango: "dango",
			dengo: "dengo"
		}
	)
	
));

// general schema-tests
suite.addBatch( Test.getTests(
	
	"non-req schema (default value) with non-existing var",
	schemaHolds( {}, undefined, false ),
	
	"non-req schema with non-existing var",
	schemaHolds( { req: false }, undefined, false ),
	
	"req schema with non-existing var",
	schemaFails( { required: true }, undefined, false ),
	
	"props:[], properties:undefined and keys:undefined",
	schemaHolds(
		{ props:[], properties:undefined, keys:undefined },
		{}
	),
	
	"items:[], and keys:undefined",
	schemaHolds(
		{ items:[], keys:undefined },
		[]
	)
));

// no type schemas
suite.addBatch( Test.getTests(
	
	"props:{}, extraProps:'+' with {dingo:42} and []",
	doubleTest( { props:{} }, { dingo:42 }, [] ),
	
	"extraItems:'+' with [42] and {}",
	doubleTest( { extraItems:"+" }, [ 42 ], { dango:43 } ),
	
	"denseItems:false with [42] and { dango:43 } ",
	doubleTest( { denseItems:false }, [ 42 ], { dango:43 } ),
	
	"nrProps:1 with obj and arr",
	doubleTest( { nrProps:1 }, { dingo:42 }, [ 43 ] ),
	
	"nrItems:1 with obj and arr",
	doubleTest( { nrItems:1 }, [ 42 ], { dinge:43 } ),
	
	"nrKeys:1 with obj and int",
	doubleTest( { nrKeys:1 }, { dingo:42 }, 43 ),
	
	"inherits:Object with {} and []",
	doubleTest( { inherits:Object }, {}, [] ),
	
	"chars:'letters' with '' and 43",
	doubleTest( { chars:"letters" }, "", 43 ),
	
	"gte:42 with 42 and 43.3",
	doubleTest( { gte:42 }, 42, 43.3 ),
	
	"types:int, chars:'letters' with 42 and 43.3",
	doubleTest( { types:"int" }, 42, 43.3 )
	
));

// str schemas
suite.addBatch( Test.getTests(
	
	"'' with 'dingo'",
	schemaHolds( "", "dingo" ),
	
	"'undef' schema with undef and null",
	doubleTest( "undef", undefined, null ),
	
	"'int /undefined' schema with undef and 11.1",
	doubleTest( "int/ undefined", undefined, 11.1 ),
	
	"'integer/ undef /string' schema with undef and {}",
	doubleTest( "integer/ undef /string", undefined, {} ),
	
	"'int/str/undef' schema with 'dingo'",
	schemaHolds( "int/str/undef", "dingo" ),
	
	"'int/str/undef' schema with 55",
	schemaHolds( "int/str/undef", 55 ),
	
	"'int/str/undef/boolean /func /null' schema with false",
	schemaHolds( "int/str/undef/boolean /func /null", false ),
	
	"'str/number/boolean/undef/func/int/null' schema with "+
	"non-exist var",
	schemaHolds(
		"str/number/boolean/undef/func/int/null", undefined, false
	),
	
	"'undef' schema with 'dingo'",
	schemaFails( "undef", "dingo" ),
	
	"'str/integer/undef' schema with 55.5",
	schemaFails( "str/integer/undef", 55.5 ),
	
	"'str/number/undef' schema with true",
	schemaFails( "str/number/undef", true ),
	
	"'str/number/boolean/undef/func/int' schema with null",
	schemaFails( "str/number/boolean/undef/func/int", null ),
		
	"' +  ' schema with non-exist var",
	schemaFails( " +  ", undefined, false ),
	
	"' +  int ' schema with non-exist var",
	schemaFails( " +  int ", undefined, false ),
	
	"' +  int /  undef ' schema with non-exist var",
	schemaFails( " +  int /  undef ", undefined, false ),
	
	"' + int / undef / null  ' schema with 'dingo'",
	schemaFails( " + int / undef / null  ", "dingo" ),
	
	"' +  ' schema with undef",
	schemaHolds( " +  ", undefined ),
	
	"' +  int ' schema with 44",
	schemaHolds( " +  int ", 44 ),
	
	"' +  int /  string ' schema with 'dingo'",
	schemaHolds( " +  int /  string ", "dingo" )
	
));

// goodValues schemas
suite.addBatch( Test.getTests(
	
	"goodValues:'dingo' with 'dingo' and 'dango'",
	doubleTest( { goodValues:[ "dingo" ] }, "dingo", "dango" ),
	
	"goodValues:['dingo', 'dango'] with 'dingo' and 'dango'",
	doubleTest(
		{ goodValues:[ "dingo", "dango" ] },
		"dango",
		"dengo"
	),
	
	"goodValues:['dingo','dango','dengo'] with 'dango' and "+
	"'dongo'",
	doubleTest(
		{ goodValues:[ "dingo", "dango", "dengo" ] },
		"dango",
		"dongo"
	)
	
));

// faulty schemas
suite.addBatch( Test.getTests(
	"faulty schema ' +  !¤% '",
	faultySchema( " +  !¤% " ),
	
	"faulty schema ' +  /   int '",
	faultySchema( " +  /   int " ),
	
	"faulty schema ' +  int / '",
	faultySchema( " +  int / " ),
	
	"faulty schema with reqe attr",
	faultySchema( { reqe: true } ),
	
	"faulty schema with req and required attrs",
	faultySchema(
		{ req: true, required: true }, undefined, false
	),
	
	"faulty schema with types and goodTypes attrs",
	faultySchema( { goodTypes: [], types: [] } ),
	
	"faulty schema with types:'+dingo'",
	faultySchema( { types:"+dingo" } ),
	
	"faulty schema with props and keys",
	faultySchema(
		{ props: { dingo: "int" }, keys: { dingo: "int" } },
		{}
	),
	
	"faulty schema with goodTypes:[]",
	faultySchema( { goodTypes:[] }, undefined ),
	
	"faulty schema with inherits:[]",
	faultySchema( { inherits:[] }, {} ),
	
	"faulty schema with extraKeys:[]",
	faultySchema( { extraKeys:[] }, {} ),
	
	"faulty schema with nrItems and minKeys",
	faultySchema( { nrItems:3, minKeys:3 }, [] ),
	
	"faulty schema with nrProps and maxKeys",
	faultySchema( { nrProps:3, maxKeys:3 }, {} )
	
));

var arrOne = [];
var arrTwo = [];

arrOne["dingo"] = 33;
arrOne["dinga"] = 33.3;
arrOne["dinge"] = undefined;

arrTwo["dingo"] = -123;
arrTwo["dinga"] = 22;
arrTwo["dingi"] = undefined;

var arrFour = [ "dingo", "dinga", "dinge", "dingi" ];

var arrFive = [ "dingo", "dinga", "dinge" ];

var arrSix = [ "dingo", "dinga", "dinge" ];

arrSix[4] = "dingi";

delete arrFive[0];

function Dingo() { }

function Dango() { }

function Dengo() { }

function Dongo() { }

sys.extend( Dango, Dingo );

var dingo = new Dingo();

var dango = new Dango();

var dengo = new Dengo();

var dongo = new Dongo();

// class schemas
suite.addBatch( Test.getTests(
	
	"Dingo with dingo and dengo",
	doubleTest( Dingo, dingo, dengo ),
	
	"[Dingo,Dongo] non-existing var and dengo",
	doubleTest( [ Dingo, Dongo ], undefined, dengo, false, true )
	
));

// obj schemas
suite.addBatch( Test.getTests(
	
	"empty schema with obj",
	schemaHolds( {}, { dingo:"dinga", dinge:undefined } ),
	
	"empty schema with arr",
	schemaHolds( {}, [ "dingo", "dinga", "dinge" ] ),
	
	"types:'obj' with obj and arr",
	doubleTest( { types:"obj" }, {}, [] ),
	
	"prop dingo:'int' with and without correct prop type",
	doubleTest(
		{ props:{ dingo:"int" } }, { dingo:55 }, { dingo:"dingo" }
	),
	
	"dingo:'int' without prop and with incorrect type",
	doubleTest(
		{ props:{ dingo:"int" } }, { dinge:55 }, { dingo:"dango" }
	),
	
	"nrProps >=3 with enough and too few props",
	doubleTest(
		{ minProps: 3 },
		{ dinge:55, dango:11, dengo:undefined },
		{ dingo:"dango" }
	),

	"3 <= nrKeys <= 4 with enough and too many keys",
	doubleTest(
		{ minKeys: 3, maxKeys: 4 },
		{ dinge:55, dango:11, dengo:undefined },
		[ "dango", "dango", "dengo", "dinga", "dingi" ]
	),
	
	"nrProps:3 with with equally large obj and too small obj",
	doubleTest(
		{ nrProps:3 },
		{ dingo:42, dango:42, dongo:42 },
		{ dinge:43, dange:43 }
	),
	
	"nrKeys:3 with with equally large obj and too large obj",
	doubleTest(
		{ nrKeys:3 },
		{ dingo:42, dango:42, dongo:42 },
		{ dinge:43, dange:43, donge:43, denge:43 }
	),
	
	"extraProps:false with matching prop and extra prop",
	doubleTest(
		{ extraProps:false, props:{ dingo:[ "undef" ] } },
		{ dingo:undefined },
		{ dinge:undefined }
	),
	
	"items dingo, dinga, dinge and no extra keys with matching \
	and faulty arr",
	doubleTest(
		{
			items:{ dingo:[ "int" ], dinga:"number", dinge:[ "any" ] },
			extraKeys: false
		},
		arrOne,
		arrTwo
	),
	
	"nrItems:3 with with equally large arr and too small arr",
	doubleTest(
		{ nrItems:3 }, [ 42, 42, 42 ], [ 43, 43 ]
	),
	
	"nrKeys:3 with with equally large arr and too large arr",
	doubleTest(
		{ nrKeys:3 }, [ 42, 42, 42 ], [ 43, 43, 43, 43 ]
	),
	
	"maxProps:5, extraKeys:'int' and maxItems:3 wiht enough \
	props and too many items",
	doubleTest(
		{ maxProps:5, extraKeys:"int", maxItems:3 },
		{ dingo:33 },
		[ 1, 2, 3, 4 ]
	),
	
	"extraProps:int and extraItems:str with int props and str \
	items with one extra undefined",
	doubleTest(
		{
			extraProps:{ goodTypes:"int" },
			extraItems:{ goodTypes:"str" }
		},
		{ dingo:0, dinga:1, dinge:2 },
		[ "0", "1", "2", undefined ]
	),
	
	"no int in extraProps and no str in extraItems with good and \
	bad vars",
	doubleTest(
		{
			extraProps:{ badTypes:"int" },
			extraItems:{ badTypes:"str" }
		},
		{ dingo:0.1, dinga:0.2, dinge:null },
		[ 31, 44, 66, "dinga" ]
	),
	
	"req extraKeys with prop and empty arr",
	doubleTest(
		{ extraKeys:{ req: true } }, { dingo:"dingo" }, []
	),
	
	"goodTypes:arr and denseItems:true with dense and non-dense "+
	"arrs",
	doubleTest(
		{ goodTypes:"arr", denseItems:true },
		arrFour,
		arrFive
	),
	
	"goodTypes:arr, extraKeys:str and denseItems:true with "+
	"dense arr and non-dense arr with extra item",
	doubleTest(
		{ goodTypes:"arr", extraKeys:[ "str" ], denseItems:true },
		arrFour,
		arrSix
	),
	
	"inherits:[Dingo] with dingo and dengo",
	doubleTest( { inherits:[Dingo] }, dingo, dengo ),
	
	"inherits:Dingo with dango and dengo",
	doubleTest( { inherits:Dingo }, dango, dengo ),
	
	"inherits:[Dango,Dingo,Dengo] with dingo and dongo",
	doubleTest(
		{ inherits:[ Dango, Dingo, Dengo ] }, dingo, dongo
	)
	
));

// schemas for strings
suite.addBatch( Test.getTests(
	
	"str with str and int",
	doubleTest( [ "str" ], "dingo", 33 ),
	
	"str and minStrLen:4 with long and too short str",
	doubleTest(
		{ goodTypes:[ "+str" ], minStrLen:4 }, "dingo", "dig"
	),
	
	"str, maxStrLength:4 with short and too long str",
	doubleTest(
		{ goodTypes:"+ str  ", maxStrLength:4 }, "din", "dingo"
	),
	
	"str, minStrLen:0 and maxStrLen:1 with short and too long str",
	doubleTest(
		{
			goodTypes:"+ str / int / undef ",
			minStrLen:0,
			maxStrLen:1
		},
		"",
		"bip"
	),
	
	"faulty schema with minStrLen > maxStrLen",
	faultySchema( { minStrLen:1, maxStrLen:0 }, "dingo" ),
	
	"faulty schema with minStrLen<0",
	faultySchema( { minStrLen:-1 }, "dingo" ),
	
	"faulty schema with maxStrLen<0",
	faultySchema( { maxStrLen:-1 }, "dingo" ),
	
	"strPattern:'dingo' with matching and non-matching str",
	doubleTest( { strPattern:"dingo" }, "wwwdingowww", "dango" ),
	
	"faulty schema with strPattern:{}",
	faultySchema( { strPattern:{} }, "dingo" ),
	
	"goodChars:'   ' with empty and non-empty str",
	doubleTest( { goodChars:"   " }, "", " " ),
	
	"goodChars:'  letters ' with letters and digits",
	doubleTest( { goodChars:"  letters " }, "dingo", "din123go" ),
	
	"goodChars:'letters/ digits  ' with 'ab1c2' and 'a12#c'",
	doubleTest(
		{ goodChars:"letters/ digits  " }, "ab1c2", "a12#c"
	),
	
	"goodChars:'digits/specials' with '!2#4%6' and '!2#4%6 '",
	doubleTest(
		{ goodChars:"digits/specials" }, "!2#4%6", "!2#4%6 "
	),
	
	"goodChars:'specialChars' with '!#¤%&/' and '!#¤%&/ '",
	doubleTest(
		{ goodChars:"specials" }, "!#¤%&/", "!#¤%&/ "
	),
	
	"goodChars:'digits/special/spaces/small' with no-large \
	and large letters",
	doubleTest(
		{ goodChars:"digits/specials/spaces/small" },
		"1! a",
		"1! aA"
	),
	
	"goodChars:'letters/digits/under/spaces with no specials \
	and specials",
	doubleTest(
		{ goodChars:"small/large/digits/under/spaces" },
		"_ 1a  _  A",
		"_ 1a  _  A-"
	),
	
	"faulty schema with goodChars:'digit'",
	faultySchema( { goodChars:"digit" }, "dingo" ),
	
	"faulty schema with goodChars:'/'",
	faultySchema( { goodChars:"/" }, "dingo" ),
	
	"faulty schema with goodChars:'digits/'",
	faultySchema( { goodChars:"digits/" }, "dingo" ),
	
	"badChars:'' with empty str",
	schemaHolds( { badChars:"" }, "" ),
	
	"badChars:'' with non-empty str",
	schemaHolds( { badChars:"" }, "aA1! _" ),
	
	"badChars:' under  ' with no underscore and one underscore",
	doubleTest( { badChars:" under  " }, "aA1! ¤", "_" ),
	
	"badChars:'underscore' with no underscore and underscore",
	doubleTest( { badChars:"underscore" }, "aAaA", "aA_aA" ),
	
	"badChars:'large/digits/specials/spaces' with 'abcd' and \
	'ab cd'",
	doubleTest(
		{ badChars:"large/digits/specials/spaces" },
		"abcd",
		"ab cd"
	),
	
	"badChars:'large/digits/specials/spaces' with 'abcd' and \
	'ab!cd'",
	doubleTest(
		{ badChars:"large/digits/specials/spaces" },
		"abcd",
		"ab!cd"
	),
	
	"badChars:'large/digits/specials/spaces' with 'abcd' and \
	'ab1cd'",
	doubleTest(
		{ badChars:"large/digits/specials/spaces" },
		"abcd",
		"ab1cd"
	),
	
	"badChars:'large/digits/specials/spaces' with 'abcd' and \
	'abAcd'",
	doubleTest(
		{ badChars:"large/digits/specials/spaces" },
		"abcd",
		"abAcd"
	),
	
	"badChars:'large/digits/under/spaces' with 'abcd!#¤#&%&/%|' \
	'and abcd_'",
	doubleTest(
		{ badChars:"large/digits/under/spaces" },
		"abcd!#¤#&%&/%|",
		"abcd_"
	),
	
	"badChars:'large/digits/under/spaces' with 'abcd!#¤#&%&/%|' \
	and 'abcd '",
	doubleTest(
		{ badChars:"large/digits/under/spaces" },
		"abcd!#¤#&%&/%|",
		"abcd "
	),
	
	"faulty schema with badChars:'digit'",
	faultySchema( { badChars:"digit" }, "dingo" )
	
));

suite.addBatch( Test.getTests(
	
	"gte:0.1 with large and too small number",
	doubleTest( { types:"number", gte:0.1 }, 0.11, 0.09 ),
	
	"gte:-1 with large and too small int",
	doubleTest( { gte:-1 }, -1, -2 ),
	
	"gt:3.1 with large and equal number",
	doubleTest( { types:"number", gt:3.1 }, 3.11, 3.1 ),
	
	"faulty schema with gt and gte",
	faultySchema( { gt:0, gte:0 }, 0 ),
	
	"ste:-11.3 with small and too large number",
	doubleTest( { types:"number", ste:-11.3 }, -11.4, -11.2 ),
	
	"faulty schema with gte:0 and ste:-0.001",
	faultySchema( { gte:0, ste:-0.001 }, 0 ),
	
	"faulty schema with gt:0 and ste:0",
	faultySchema( { gt:0, ste:0 }, 0 ),
	
	"faulty schema with gt:0 and ste:-1",
	faultySchema( { gt:0, ste:-1 }, 55 )
	
));

suite.run();

});
