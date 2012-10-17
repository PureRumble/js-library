ourglobe.require(
[
	"ourglobe/dual/core",
	"ourglobe/dual/testing",
	"ourglobe/dual/classes"
],
function( mods )
{

var Class = ourglobe.Class;
var getA = ourglobe.getA;
var getE = ourglobe.getE;
var getR = ourglobe.getR;
var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var Test = mods.get( "testing" ).Test;
var ClassRuntimeError = mods.get( "classes" ).ClassRuntimeError;
var FuncVerError = mods.get( "core" ).FuncVerError;

var assert = Test.assert;

var getFunc =
getF(
getV()
	.setR( "func" ),
function()
{
	return(
		function()
		{
			
		}
	);
});

var runClassTest =
getF(
getV()
	.addA( "str", "obj", "func" )
	.addA( "str", "obj", "obj/undef", "func" )
	.addA( "str", "obj", "obj/undef", "obj", "func" )
	.addA( "str", "obj", "obj/undef", "obj", "obj/undef", "func" ),
function(
	testName,
	supClass,
	supClassAddArgs,
	subClass,
	subClassAddArgs,
	verFunc
)
{
	if( sys.hasType( supClassAddArgs, "func" ) === true )
	{
		verFunc = supClassAddArgs;
		supClassAddArgs = undefined;
	}
	else if( sys.hasType( subClass, "func" ) === true )
	{
		verFunc = subClass;
		subClass = undefined;
	}
	else if( sys.hasType( subClassAddArgs, "func" ) === true )
	{
		verFunc = subClassAddArgs;
		subClassAddArgs = undefined;
	}
	
	console.log( testName );
	
	var SupClass = Class.create.call( {}, supClass );
	var supInst = new SupClass();
	
	var SubClass = undefined;
	var subInst = undefined;
	
	if( subClass !== undefined )
	{
		subClass.super = SupClass;
		
		SubClass = Class.create.call( {}, subClass );
		subInst = new SubClass();
	}
	
	assert(
		supInst instanceof SupClass === true,
		"Could not create an inst of the super class"
	);
	
	if( subInst !== undefined )
	{
		assert(
			subInst instanceof SubClass === true,
			"Could not create an inst of the sub class"
		);
		
		assert(
			subInst instanceof SupClass === true,
			"The inst of the sub class isnt an inst of the super class"
		);
	}
	
	verFunc( supInst, subInst );
});

// test group
// testing simple classes without super classes. Some of the
// classes have constrs

runClassTest(
	"Testing simple class with default empty constr",
	{ name: "ClassName" },
	function( sup )
	{
		
	}
);

runClassTest(
	"Testing simple class with simple constr",
	{
		name: "ClassName",
		constr:
		[
			function()
			{
				this.dingo = "dingo";
			}
		]
	},
	function( sup )
	{
		assert( sup.dingo === "dingo" );
	}
);

// test group
// testing classes with super classes. Some classes have constrs
// and none have inst funcs

runClassTest(
	"Testing super class with constr and sub class without constr",
	{
		name: "ClassName",
		constr:
		[
			function()
			{
				this.dango = "dango";
			}
		]
	},
	undefined,
	{
		name: "ClassName"
	},
	function( sup )
	{
		assert( sup.dango === "dango" );
	}
);

runClassTest(
	"Testing super class and sub class with constructors",
	{
		name: "ClassName",
		constr:
		[
			function()
			{
				this.dango = "dango";
			}
		]
	},
	undefined,
	{
		name: "ClassName",
		constr:
		[
			function()
			{
				this.dongo = "dongo";
			}
		]
	},
	function( sup, sub )
	{
		assert(
			sup.dango === "dango" &&
			sub.dongo === "dongo" &&
			sub.dango === undefined
		);
	}
);

// test group
// testing ourGlobeCallSuper()

runClassTest(
	"Testing sub class with constr that calls super class' "+
	"constr with ourGlobeCallSuper()",
	{
		name: "ClassName",
		constr:
		[
			function()
			{
				this.dango = "dango";
			}
		]
	},
	undefined,
	{
		name: "ClassName",
		constr:
		[
			function()
			{
				this.ourGlobeCallSuper();
				this.dongo = "dongo";
			}
		]
	},
	function( sup, sub )
	{
		assert(
			sub.dongo === "dongo" &&
			sub.dango === "dango"
		);
	}
);

runClassTest(
	"Testing sub class with constr that calls super class' "+
	"constr with one arg via ourGlobeCallSuper()",
	{
		name: "ClassName",
		constr:
		[
			getE( "any" ),
			function( dango )
			{
				this.dango = dango;
			}
		]
	},
	undefined,
	{
		name: "ClassName",
		constr:
		[
			getE( "any" ),
			function()
			{
				this.ourGlobeCallSuper( undefined, "dangoDango" );
				this.dongo = "dongo";
			}
		]
	},
	function( sup, sub )
	{
		assert(
			sub.dongo === "dongo" &&
			sub.dango === "dangoDango"
		);
	}
);

runClassTest(
	"Testing sub class with constr that calls super class' "+
	"constr with many args via ourGlobeCallSuper()",
	{
		name: "ClassName",
		constr:
		[
			getE( "any" ),
			function( dingo, dango, dongo )
			{
				this.dingo = dingo;
				this.dango = dango;
				this.dongo = dongo;
			}
		]
	},
	undefined,
	{
		name: "ClassName",
		constr:
		[
			getE( "any" ),
			function()
			{
				this.ourGlobeCallSuper(
					undefined, "dingoDingo", "dangoDango", "dongoDongo"
				);
				this.dingi = "dingi";
			}
		]
	},
	function( sup, sub )
	{
		assert(
			sub.dingi === "dingi" &&
			sub.dingo === "dingoDingo" &&
			sub.dango === "dangoDango" &&
			sub.dongo === "dongoDongo"
		);
	}
);

// test group
// testing ourGlobeApplySuper()

runClassTest(
	"Testing sub class with constr that calls super class' "+
	"constr with ourGlobeApplySuper()",
	{
		name: "ClassName",
		constr:
		[
			function()
			{
				this.dango = "dango";
			}
		]
	},
	undefined,
	{
		name: "ClassName",
		constr:
		[
			function()
			{
				this.ourGlobeApplySuper( undefined, [] );
				this.dongo = "dongo";
			}
		]
	},
	function( sup, sub )
	{
		assert(
			sub.dongo === "dongo" &&
			sub.dango === "dango"
		);
	}
);

runClassTest(
	"Testing sub class with constr that calls super class' "+
	"constr with one arg via ourGlobeApplySuper()",
	{
		name: "ClassName",
		constr:
		[
			getE( "any" ),
			function( dango )
			{
				this.dango = dango;
			}
		]
	},
	undefined,
	{
		name: "ClassName",
		constr:
		[
			getE( "any" ),
			function()
			{
				this.ourGlobeApplySuper( undefined, [ "dangoDango" ] );
				this.dongo = "dongo";
			}
		]
	},
	function( sup, sub )
	{
		assert(
			sub.dongo === "dongo" &&
			sub.dango === "dangoDango"
		);
	}
);

runClassTest(
	"Testing sub class with constr that calls super class' "+
	"constr with many args via ourGlobeApplySuper()",
	{
		name: "ClassName",
		constr:
		[
			getE( "any" ),
			function( dingo, dango, dongo )
			{
				this.dingo = dingo;
				this.dango = dango;
				this.dongo = dongo;
			}
		]
	},
	undefined,
	{
		name: "ClassName",
		constr:
		[
			getE( "any" ),
			function()
			{
				this.ourGlobeApplySuper(
					undefined,
					[ "dingoDingo", "dangoDango", "dongoDongo" ]
				);
				this.dingi = "dingi";
			}
		]
	},
	function( sup, sub )
	{
		assert(
			sub.dingi === "dingi" &&
			sub.dingo === "dingoDingo" &&
			sub.dango === "dangoDango" &&
			sub.dongo === "dongoDongo"
		);
	}
);

// test group
// testing that verification of args provided to constr is done
// correctly

Test.expectErr(
"The args provided to the constr must be correct as specified "+
"by the constr's FuncParamVers",
FuncVerError,
{
	errCode: "InvalidArgsAtFuncCall",
	func:
	function()
	{
		var Dingo =
		Class.create(
			{
				name: "ClassName",
				constr:
				[
					getA( "str" ),
					getA( "int" ),
					getA( { types: "bool" }, "int", "str" ),
					getE( { minItems: 0 } ),
					function()
					{
						this.dingo = "dingo";
					}
				]
			}
		);
		
		return(
			{
				errFunc:
				function()
				{
					new Dingo( false, 43, "dengo", {} );
				},
				refFunc:
				function()
				{
					var dingo = new Dingo( false, 43, "dengo", [] );
					
					assert( dingo.dingo === "dingo" );
				}
			}
		);
	}
});

Test.expectErr(
"The args provided to the super constr must be correct as "+
"specified by the super constr's FuncParamVers",
FuncVerError,
{
	errCode: "InvalidArgsAtFuncCall",
	func:
	function()
	{
		var Dingo =
		Class.create(
			{
				name: "ClassName",
				constr:
				[
					getA( "str" ),
					function()
					{
						this.dingo = "dingo";
					}
				]
			}
		);
		
		var Dango =
		Class.create(
			{
				name: "ClassName",
				super: Dingo,
				constr:
				[
					getE( "any" ),
					function( arg )
					{
						this.ourGlobeCallSuper( undefined, arg );
					}
				]
			}
		);
		
		return(
			{
				errFunc:
				function()
				{
					new Dango( 43 );
				},
				refFunc:
				function()
				{
					var dingo = new Dango( "dingo" );
					
					assert( dingo.dingo === "dingo" );
				}
			}
		);
	}
});

});
