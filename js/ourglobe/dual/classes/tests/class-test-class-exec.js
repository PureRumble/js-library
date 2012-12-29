ourglobe.require(
[
	"ourglobe/dual/core",
	"ourglobe/dual/testing",
	"ourglobe/dual/classes",
	"ourglobe/dual/modulehandling"
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
var ModuleUtils = mods.get( "modulehandling" ).ModuleUtils;

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

var expectExtErr =
getF(
getV()
	.addA( "str", "str", "obj", "obj", "obj" )
	.addA(
		"str",
		"str",
		"obj",
		"obj/undef",
		"obj",
		"obj/undef",
		"obj",
		"obj/undef"
	),
function(
	testName,
	errCode,
	superClassCreate,
	superClassAdd,
	faultySubClassCreate,
	faultySubClassAdd,
	healthySubClassCreate,
	healthySubClassAdd
)
{
	if( healthySubClassCreate === undefined )
	{
		healthySubClassCreate = faultySubClassCreate;
		faultySubClassCreate = superClassAdd;
		superClassAdd = undefined;
	}
	
	healthySubClassCreate.constr =
	[
		getE( "any" ),
		function()
		{
			this.expectExtErrDingo = "dingo";
		}
	];
	
	if( healthySubClassCreate.instVars === undefined )
	{
		healthySubClassCreate.instVars = {};
	}
	
	healthySubClassCreate.instVars[ "expectExtErrDingo" ] =
		"extendable"
	;
	
	var subClassCreate =
	{
		name: "ClassName",
		instVars:
		{
			expectExtErrDinga: "extendable",
			expectExtErrDanga: "extendable",
			expectExtErrDonga: "extendable"
		}
	};
	
// test group
// Creating super class and sub class first and then adding
// instance class funcs. The instance funcs of the sub class
// are added first followed by the instance funcs of the 
// super class
	Test.expectErr(
		testName+
		" - testing with immediate sub class of super class",
		ClassRuntimeError,
		errCode,
		function()
		{
			superClassCreate.extends = undefined;
			superClassCreate.delayedExt = undefined;
			subClassCreate.extends = undefined;
			subClassCreate.delayedExt = undefined;
			faultySubClassCreate.extends = undefined;
			faultySubClassCreate.delayedExt = undefined;
			
			var SuperClass = Class.create( superClassCreate );
			
			faultySubClassCreate.extends = SuperClass;
			faultySubClassCreate.delayedExt = undefined;
			
			var FaultySubClass = Class.create( faultySubClassCreate );
			
			if( faultySubClassAdd !== undefined )
			{
				Class.add( FaultySubClass, faultySubClassAdd );
			}
			
			if( superClassAdd !== undefined )
			{
				Class.add( SuperClass, superClassAdd );
			}
		},
		function()
		{
			superClassCreate.extends = undefined;
			superClassCreate.delayedExt = undefined;
			subClassCreate.extends = undefined;
			subClassCreate.delayedExt = undefined;
			healthySubClassCreate.extends = undefined;
			healthySubClassCreate.delayedExt = undefined;
			
			var SuperClass = Class.create( superClassCreate );
			
			healthySubClassCreate.extends = SuperClass;
			healthySubClassCreate.delayedExt = undefined;
			
			var HealthySubClass =
				Class.create( healthySubClassCreate )
			;
			
			if( healthySubClassAdd !== undefined )
			{
				Class.add( HealthySubClass, healthySubClassAdd );
			}
			
			if( superClassAdd !== undefined )
			{
				Class.add( SuperClass, superClassAdd );
			}
			
			var healthy = new HealthySubClass();
			
			assert( healthy.expectExtErrDingo === "dingo" );
		}
	);
	
// test group
// Creating super class and sub class first and then adding
// instance class funcs. The instance funcs of the super class
// are added first followed by the instance funcs of the 
// sub class. Some dummy sub classes are also added under the
// super class
	Test.expectErr(
		testName+
		" - Testing with immediate sub class of super class "+
		"but with other sub classes at the side too",
		ClassRuntimeError,
		errCode,
		function()
		{
			superClassCreate.extends = undefined;
			superClassCreate.delayedExt = undefined;
			subClassCreate.extends = undefined;
			subClassCreate.delayedExt = undefined;
			faultySubClassCreate.extends = undefined;
			faultySubClassCreate.delayedExt = undefined;
			
			var SuperClass = Class.create( superClassCreate );
			
			subClassCreate.extends = SuperClass;
			subClassCreate.delayedExt = undefined;
			
			var firstSubClassOne = Class.create( subClassCreate );
			var firstSubClassTwo = Class.create( subClassCreate );
			var firstSubClassThree =
				Class.create( subClassCreate )
			;
			
			faultySubClassCreate.extends = SuperClass;
			faultySubClassCreate.delayedExt = undefined;
			
			var FaultySubClass = Class.create( faultySubClassCreate );
			
			if( superClassAdd !== undefined )
			{
				Class.add( SuperClass, superClassAdd );
			}
			
			if( faultySubClassAdd !== undefined )
			{
				Class.add( FaultySubClass, faultySubClassAdd );
			}
		},
		function()
		{
			superClassCreate.extends = undefined;
			superClassCreate.delayedExt = undefined;
			subClassCreate.extends = undefined;
			subClassCreate.delayedExt = undefined;
			healthySubClassCreate.extends = undefined;
			healthySubClassCreate.delayedExt = undefined;
			
			var SuperClass = Class.create( superClassCreate );
			
			subClassCreate.extends = SuperClass;
			subClassCreate.delayedExt = undefined;
			
			var firstSubClassOne = Class.create( subClassCreate );
			var firstSubClassTwo = Class.create( subClassCreate );
			var firstSubClassThree =
				Class.create( subClassCreate )
			;
			
			healthySubClassCreate.extends = SuperClass;
			healthySubClassCreate.delayedExt = undefined;
			
			var HealthySubClass =
				Class.create( healthySubClassCreate )
			;
			
			if( superClassAdd !== undefined )
			{
				Class.add( SuperClass, superClassAdd );
			}
			
			if( healthySubClassAdd !== undefined )
			{
				Class.add( HealthySubClass, healthySubClassAdd );
			}
			
			var healthy = new HealthySubClass();
			
			assert( healthy.expectExtErrDingo === "dingo" );
		}
	);
	
// test group
// There are three levels of classes in these tests, with the
// given super and sub class at the top and bottom, respectively.
// The extensions between them are delayed, and instance funcs
// are added before extension commences
	Test.expectErr(
		testName+
		" - Testing with one class between the super and sub "+
		"class. Some extensions are delayed",
		ClassRuntimeError,
		errCode,
		function()
		{
			superClassCreate.extends = undefined;
			superClassCreate.delayedExt = undefined;
			subClassCreate.extends = undefined;
			subClassCreate.delayedExt = undefined;
			faultySubClassCreate.extends = undefined;
			faultySubClassCreate.delayedExt = undefined;
			
			var SuperClass = Class.create( superClassCreate );
			
			if( superClassAdd !== undefined )
			{
				Class.add( SuperClass, superClassAdd );
			}
			
			subClassCreate.extends = SuperClass;
			subClassCreate.delayedExt = undefined;
			
			var SubClassOne = Class.create( subClassCreate );
			var SubClassThree = Class.create( subClassCreate );
			
			subClassCreate.extends = undefined;
			subClassCreate.delayedExt =
			function()
			{
				return SuperClass;
			};
			
			var SubClassTwo = Class.create( subClassCreate );
			
			subClassCreate.extends = SubClassOne;
			subClassCreate.delayedExt = undefined;
			
			var SubClassOneOne = Class.create( subClassCreate );
			var SubClassOneTwo = Class.create( subClassCreate );
			
			subClassCreate.extends = SubClassThree;
			subClassCreate.delayedExt = undefined;
			
			var SubClassThreeOne = Class.create( subClassCreate );
			var SubClassThreeTwo = Class.create( subClassCreate );
			
			subClassCreate.extends = SubClassTwo;
			subClassCreate.delayedExt = undefined;
			
			var SubClassTwoOne = Class.create( subClassCreate );
			var SubClassTwoTwo = Class.create( subClassCreate );
			
			faultySubClassCreate.extends = undefined;
			faultySubClassCreate.delayedExt =
			function()
			{
				return SubClassTwo;
			};
			
			var FaultySubClass = Class.create( faultySubClassCreate );
			
			if( faultySubClassAdd !== undefined )
			{
				Class.add( FaultySubClass, faultySubClassAdd );
			}
			
			ModuleUtils.execDelayedCbs();
		},
		function()
		{
			superClassCreate.extends = undefined;
			superClassCreate.delayedExt = undefined;
			subClassCreate.extends = undefined;
			subClassCreate.delayedExt = undefined;
			healthySubClassCreate.extends = undefined;
			healthySubClassCreate.delayedExt = undefined;
			
			var SuperClass = Class.create( superClassCreate );
			
			if( superClassAdd !== undefined )
			{
				Class.add( SuperClass, superClassAdd );
			}
			
			subClassCreate.extends = SuperClass;
			subClassCreate.delayedExt = undefined;
			
			var SubClassOne = Class.create( subClassCreate );
			var SubClassThree = Class.create( subClassCreate );
			
			subClassCreate.extends = undefined;
			subClassCreate.delayedExt =
			function()
			{
				return SuperClass;
			};
			
			var SubClassTwo = Class.create( subClassCreate );
			
			subClassCreate.extends = SubClassOne;
			subClassCreate.delayedExt = undefined;
			
			var SubClassOneOne = Class.create( subClassCreate );
			var SubClassOneTwo = Class.create( subClassCreate );
			
			subClassCreate.extends = SubClassThree;
			subClassCreate.delayedExt = undefined;
			
			var SubClassThreeOne = Class.create( subClassCreate );
			var SubClassThreeTwo = Class.create( subClassCreate );
			
			subClassCreate.extends = SubClassTwo;
			subClassCreate.delayedExt = undefined;
			
			var SubClassTwoOne = Class.create( subClassCreate );
			var SubClassTwoTwo = Class.create( subClassCreate );
			
			healthySubClassCreate.extends = undefined;
			healthySubClassCreate.delayedExt =
			function()
			{
				return SubClassTwo;
			};
			
			var HealthySubClass =
				Class.create( healthySubClassCreate )
			;
			healthySubClassCreate.delayedExt = undefined;
			
			if( healthySubClassAdd !== undefined )
			{
				Class.add( HealthySubClass, healthySubClassAdd );
			}
			
			ModuleUtils.execDelayedCbs();
			
			var healthy = new HealthySubClass();
			
			assert( healthy.expectExtErrDingo === "dingo" );
		}
	);
	
// test group
// Testing with a long chain of extensions between classes. The
// given super class gets a class above itself, as the given
// sub class gets a class below itself. The instance funcs of
// the super class are added before extension commences but the
// instance funcs of the sub class are added after
	Test.expectErr(
		testName+
		" - Testing with classes above, below and in between the "+
		"super class and sub class. Some of the extensions are "+
		"delayed",
		ClassRuntimeError,
		errCode,
		function()
		{
			superClassCreate.extends = undefined;
			superClassCreate.delayedExt = undefined;
			subClassCreate.extends = undefined;
			subClassCreate.delayedExt = undefined;
			faultySubClassCreate.extends = undefined;
			faultySubClassCreate.delayedExt = undefined;
			
			var ClassOne = Class.create( subClassCreate );
			
			superClassCreate.extends = ClassOne;
			superClassCreate.delayedExt = undefined;
			
			var SuperClass = Class.create( superClassCreate );
			
			if( superClassAdd !== undefined )
			{
				Class.add( SuperClass, superClassAdd );
			}
			
			subClassCreate.extends = undefined;
			subClassCreate.delayedExt =
			function()
			{
				return SuperClass;
			};
			
			var ClassTwo = Class.create( subClassCreate );
			
			subClassCreate.extends = ClassTwo;
			subClassCreate.delayedExt = undefined;
			
			var ClassThreeA = Class.create( subClassCreate );
			
			subClassCreate.extends = undefined;
			subClassCreate.delayedExt =
			function()
			{
				return ClassTwo;
			};
			
			var ClassThreeB = Class.create( subClassCreate );
			
			subClassCreate.extends = ClassThreeB;
			subClassCreate.delayedExt = undefined;
			
			var ClassFourA = Class.create( subClassCreate );
			
			faultySubClassCreate.extends = ClassThreeB;
			faultySubClassCreate.delayedExt = undefined;
			
			var FaultySubClass = Class.create( faultySubClassCreate );
			
			subClassCreate.extends = FaultySubClass;
			subClassCreate.delayedExt = undefined;
			
			var ClassFour = Class.create( subClassCreate );
			
			ModuleUtils.execDelayedCbs();
			
			if( faultySubClassAdd !== undefined )
			{
				Class.add( FaultySubClass, faultySubClassAdd );
			}
		},
		function()
		{
			superClassCreate.extends = undefined;
			superClassCreate.delayedExt = undefined;
			subClassCreate.extends = undefined;
			subClassCreate.delayedExt = undefined;
			healthySubClassCreate.extends = undefined;
			healthySubClassCreate.delayedExt = undefined;
			
			var ClassOne = Class.create( subClassCreate );
			
			superClassCreate.extends = ClassOne;
			superClassCreate.delayedExt = undefined;
			
			var SuperClass = Class.create( superClassCreate );
			
			if( superClassAdd !== undefined )
			{
				Class.add( SuperClass, superClassAdd );
			}
			
			subClassCreate.extends = undefined;
			subClassCreate.delayedExt =
			function()
			{
				return SuperClass;
			};
			
			var ClassTwo = Class.create( subClassCreate );
			
			subClassCreate.extends = ClassTwo;
			subClassCreate.delayedExt = undefined;
			
			var ClassThreeA = Class.create( subClassCreate );
			
			subClassCreate.extends = undefined;
			subClassCreate.delayedExt =
			function()
			{
				return ClassTwo;
			};
			
			var ClassThreeB = Class.create( subClassCreate );
			
			subClassCreate.extends = ClassThreeB;
			subClassCreate.delayedExt = undefined;
			
			var ClassFourA = Class.create( subClassCreate );
			
			healthySubClassCreate.extends = ClassThreeB;
			healthySubClassCreate.delayedExt = undefined;
			
			var HealthySubClass = Class.create( healthySubClassCreate );
			
			subClassCreate.extends = HealthySubClass;
			subClassCreate.delayedExt = undefined;
			
			var ClassFour = Class.create( subClassCreate );
			
			ModuleUtils.execDelayedCbs();
			
			if( healthySubClassAdd !== undefined )
			{
				Class.add( HealthySubClass, healthySubClassAdd );
			}
			
			var healthy = new HealthySubClass();
			
			assert( healthy.expectExtErrDingo === "dingo" );
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
	
	var SupClass = Class.create( supClass );
	
	if( supClassAddArgs !== undefined )
	{
		Class.add( SupClass, supClassAddArgs );
	}
	
	var supInst = new SupClass();
	
	var SubClass = undefined;
	var subInst = undefined;
	
	if( subClass !== undefined )
	{
		subClass.extends = SupClass;
		
		SubClass = Class.create( subClass );
		subInst = new SubClass();
		
		if( subClassAddArgs !== undefined )
		{
			Class.add( SubClass, subClassAddArgs );
		}
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
// testing constructors are handled correctly on simple classes
// without super classes

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
// testing constructors are handled correctly on sub classes
// and their super classes

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
// testing ourGlobeCallSuper() in constrs and inst funcs

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
		assert( sub.dongo === "dongo" && sub.dango === "dango" );
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

runClassTest(
	"Testing sub class with inst func that calls super class' "+
	"inst func with many args via ourGlobeCallSuper()",
	{ name: "SuperClass" },
	{
		dingo:
		[
			getE( "any" ),
			getR( "any" ),
			function( dingoDingo, dangoDango, dongoDongo )
			{
				this.dingoDingo = dingoDingo;
				this.dangoDango = dangoDango;
				this.dongoDongo = dongoDongo;
				
				return 42;
			}
		]
	},
	{ name: "SubClass" },
	{
// making sure that dango() doesnt call dingo() of the sub class
// instead of the super class'
		dingo:
		[
			getE( "any" ),
			function()
			{
				
			}
		],
		dango:
		[
			getR( "any" ),
			function()
			{
				var returnVar =
				this.ourGlobeCallSuper(
					"dingo", "dingoDingo", "dangoDango", "dongoDongo"
				);
				
				return returnVar;
			}
		]
	},
	function( sup, sub )
	{
		var returnVar = sub.dango();
		
		assert(
			sub.dingoDingo === "dingoDingo" &&
			sub.dangoDango === "dangoDango" &&
			sub.dongoDongo === "dongoDongo" &&
			returnVar === 42
		);
	}
);

// test group
// testing ourGlobeApplySuper() in constrs and inst funcs

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

runClassTest(
	"Testing sub class with inst func that calls super class' "+
	"inst func with many args via ourGlobeApplySuper()",
	{ name: "SuperClass" },
	{
		dingo:
		[
			getE( "any" ),
			getR( "any" ),
			function( dingoDingo, dangoDango, dongoDongo )
			{
				this.dingoDingo = dingoDingo;
				this.dangoDango = dangoDango;
				this.dongoDongo = dongoDongo;
				
				return 42;
			}
		]
	},
	{ name: "SubClass" },
	{
// making sure that dango() doesnt call dingo() of the sub class
// instead of the super class'
		dingo:
		[
			getE( "any" ),
			function()
			{
				
			}
		],
		dango:
		[
			getR( "any" ),
			function()
			{
				return(
					this.ourGlobeApplySuper(
						"dingo",
						[ "dingoDingo", "dangoDango", "dongoDongo" ]
					)
				);
			}
		]
	},
	function( sup, sub )
	{
		var returnVar = sub.dango();
		
		assert(
			sub.dingoDingo === "dingoDingo" &&
			sub.dangoDango === "dangoDango" &&
			sub.dongoDongo === "dongoDongo" &&
			returnVar === 42
		);
	}
);

// test group
// testing that verification of args provided to constrs and
// class funcs is done correctly

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
				extends: Dingo,
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

Test.expectErr(
"The args provided to a static func must be correct as "+
"specified by the func's FuncParamVers",
FuncVerError,
{
	errCode: "InvalidArgsAtFuncCall",
	func:
	function()
	{
		var Dingo = Class.create( { name: "ClassName" } );
		
		Class.add(
			Dingo,
			{
				dingo:
				[
					"static",
					getA( "str" ),
					getA( "int" ),
					getA( { types: "bool" }, "int", "str" ),
					getE( { minItems: 0 } ),
					getR( "int" ),
					function()
					{
						return 42;
					}
				]
			}
		);
		
		return(
			{
				errFunc:
				function()
				{
					Dingo.dingo( false, 43, "dengo", {} );
				},
				refFunc:
				function()
				{
					var returnVar = Dingo.dingo( false, 43, "dengo", [] );
					
					assert( returnVar === 42 );
				}
			}
		);
	}
});

Test.expectErr(
"The return var of a static func must be correct as specified "+
"by the func's FuncParamVers",
FuncVerError,
{
	errCode: "InvalidReturnedVarFromFuncCall",
	func:
	function()
	{
		var Dingo = Class.create( { name: "ClassName" } );
		
		Class.add(
			Dingo,
			{
				dingo:
				[
					"static",
					getA( "any" ),
					getR( "int" ),
					function( arg )
					{
						return arg;
					}
				]
			}
		);
		
		return(
			{
				errFunc:
				function()
				{
					Dingo.dingo( "dingo" );
				},
				refFunc:
				function()
				{
					var returnVar = Dingo.dingo( 42 );
					
					assert( returnVar === 42 );
				}
			}
		);
	}
});

Test.expectErr(
"The args provided to an inst func must be correct as "+
"specified by the inst func's FuncParamVers",
FuncVerError,
{
	errCode: "InvalidArgsAtFuncCall",
	func:
	function()
	{
		var Dingo = Class.create( { name: "ClassName" } );
		
		Class.add(
			Dingo,
			{
				dingo:
				[
					getA( "str" ),
					getA( "int" ),
					getA( { types: "bool" }, "int", "str" ),
					getE( { minItems: 0 } ),
					getR( "str" ),
					function()
					{
						return "dingo";
					}
				]
			}
		);
		
		return(
			{
				errFunc:
				function()
				{
					var dingo = new Dingo();
					dingo.dingo( false, 43, "dengo", {} );
				},
				refFunc:
				function()
				{
					var dingo = new Dingo();
					var returnVar = dingo.dingo( false, 43, "dengo", [] );
					
					assert( returnVar === "dingo" );
				}
			}
		);
	}
});

Test.expectErr(
"The return var of an inst func must be correct as specified "+
"by the inst func's FuncParamVers",
FuncVerError,
{
	errCode: "InvalidReturnedVarFromFuncCall",
	func:
	function()
	{
		var Dingo = Class.create( { name: "ClassName" } );
		
		Class.add(
			Dingo,
			{
				dingo:
				[
					getA( "any" ),
					getR( "int" ),
					function( arg )
					{
						return arg;
					}
				]
			}
		);
		
		return(
			{
				errFunc:
				function()
				{
					var dingo = new Dingo();
					dingo.dingo( "dengo" );
				},
				refFunc:
				function()
				{
					var dingo = new Dingo();
					var returnVar = dingo.dingo( 42 );
					
					assert( returnVar === 42 );
				}
			}
		);
	}
});

Test.expectErr(
"The args provided to an inst func of the super class must be "+
"correct as specified by the inst func's FuncParamVers",
FuncVerError,
{
	errCode: "InvalidArgsAtFuncCall",
	func:
	function()
	{
		var Dingo = Class.create( { name: "ClassName" } );
		
		Class.add(
			Dingo,
			{
				dingo:
				[
					getA( "str" ),
					getA( "int" ),
					getA( { types: "bool" }, "int", "str" ),
					getE( { minItems: 0 } ),
					getR( "str" ),
					function()
					{
						return "dingo";
					}
				]
			}
		);
		
		var Dango =
			Class.create( { extends: Dingo, name: "Dango" } )
		;
		
		Class.add(
			Dango,
			{
				dingo:
				[
					getR( "str" ),
					function()
					{
						return this.ourGlobeApplySuper( "dingo", arguments );
					}
				]
			}
		);
		
		return(
			{
				errFunc:
				function()
				{
					var dingo = new Dingo();
					dingo.dingo( false, 43, "dengo", {} );
				},
				refFunc:
				function()
				{
					var dingo = new Dingo();
					var returnVar = dingo.dingo( true, 42, "dingo", [] );
					
					assert( returnVar === "dingo" );
				}
			}
		);
	}
});

// test group
// testing that sub classes instance vars are compared correctly
// to super classes' instance vars and instance funcs

expectExtErr(
"sub class may not extend final instance var of super class",
"SubClassExtendsFinalInstanceVar",
{
	name: "ClassName",
	instVars:
	{
		dingo: "extendable", dango: "final", dongo: "extendable"
	}
},
{
	name: "ClassName",
	instVars:
	{
		dango: "final"
	}
},
{
	name: "ClassName",
	instVars:
	{
		dingo: "extendable", dongo: "extendable", dingi: "extendable"
	}
});

expectExtErr(
"sub class may not have instance func named as super class' "+
"instance var",
"DuplicateSuperClassInstanceMember",
{
	name: "ClassName",
	instVars:{ dingo: "extendable" }
},
undefined,
{ name: "ClassName" },
{
	dingo:
	[
		getFunc()
	]
},
{ name: "ClassName" },
{
	dingo:
	[
		"static",
		getFunc()
	]
});

// test group
// testing that sub classes instance funcs are compared correctly
// to super classes' instance vars and instance funcs

expectExtErr(
"sub class may not declare instance func with the same name as "+
"final super class' instance func",
"SubClassExtendsFinalInstanceFunc",
{ name: "SuperClass" },
{
	dingo:
	[
		"final",
		getFunc()
	],
	dongo:
	[
		"extendable",
		getFunc()
	]
},
{ name: "FaultySubClass" },
{
	dingo:
	[
		getFunc()
	],
	dongo:
	[
		getFunc()
	]
},
{ name: "HealthySubClass" },
{
	dongo:
	[
		getFunc()
	]
});

expectExtErr(
"sub class may not declare instance func with the same name as "+
"super class' instance var",
"DuplicateSuperClassInstanceMember",
{
	name: "SuperClass",
	instVars:
	{
		dingo: "extendable"
	}
},
undefined,
{ name: "FaultySubClass" },
{
	dingo:
	[
		getFunc()
	]
},
{
	name: "HealthySubClass",
	instVars:
	{
		dingo: "extendable"
	}
},
{
	dongo:
	[
		getFunc()
	]
});

// test group
// testing that static members are added to the class and can
// be used

Test.runTest(
"Testing that added static class members can be used",
function()
{
	var Dingo = Class.create( { name: "Dingo" } );
	
	Class.addStatic( Dingo, { dingo: 42 } );
	
	assert( Dingo.dingo === 42 );
});

// test group
// testing that static members are unallowed to be duplicate
// with regard to their names

Test.expectErr(
"A static member added via Class.addStatic() may not have the "+
"same name as an existing static class func",
ClassRuntimeError,
"DuplicateStaticMember",
function()
{
	var Dingo = Class.create( { name: "Dingo" } );
	
	Class.add(
		Dingo,
		{
			dingo:
			[
				"static",
				getFunc()
			]
		}
	);
	
	Class.addStatic(
		Dingo,
		{ dingo: "dingo" }
	);
},
function()
{
	var Dingo = Class.create( { name: "Dingo" } );
	
	Class.add(
		Dingo,
		{
			dingo:
			[
				getFunc()
			]
		}
	);
	
	Class.addStatic(
		Dingo,
		{ dingo: "dingo" }
	);
});

Test.expectErr(
"A static class func may not have the same name as an existing "+
"static member added via Class.addStatic()",
ClassRuntimeError,
"DuplicateStaticMember",
function()
{
	var Dingo = Class.create( { name: "Dingo" } );
	
	Class.addStatic(
		Dingo,
		{ dingo: "dingo" }
	);
	
	Class.add(
		Dingo,
		{
			dingo:
			[
				"static",
				getFunc()
			]
		}
	);
},
function()
{
	var Dingo = Class.create( { name: "Dingo" } );
	
	Class.addStatic(
		Dingo,
		{ dingo: "dingo" }
	);
	
	Class.add(
		Dingo,
		{
			dingo:
			[
				getFunc()
			]
		}
	);
});

});
