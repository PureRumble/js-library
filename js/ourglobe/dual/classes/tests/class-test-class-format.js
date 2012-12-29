ourglobe.require(
[
	"ourglobe/dual/testing",
	"ourglobe/dual/classes",
	"ourglobe/dual/core"
],
function( mods )
{

var sys = ourGlobe.sys;
var Class = ourGlobe.Class;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var getF = ourGlobe.getF;
var getV = ourGlobe.getV;

var Test = mods.get( "testing" ).Test;
var ClassRuntimeError = mods.get( "classes" ).ClassRuntimeError;
var FuncCreationRuntimeError =
	mods.get( "core" ).FuncCreationRuntimeError
;

var createClassObj = { name: "ClassName" };
var ClassVar = Class.create( createClassObj );

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

var expectErr =
getF(
getV()
	.addA( "str", "str", "obj", "obj" )
	.addA( "str", "func", "str", "obj", "obj" )
	.addA( "str", "str", "obj", "obj/undef", "obj", "obj/undef" )
	.addA(
		"str", "func", "str", "obj", "obj/undef", "obj", "obj/undef"
	),
function(
	testName,
	errClass,
	errCode,
	faultyArgs,
	faultyAddArgs,
	healthyArgs,
	healthyAddArgs
)
{
	if( sys.hasType( errClass, "str" ) === true )
	{
		healthyAddArgs = healthyArgs;
		healthyArgs = faultyAddArgs;
		faultyAddArgs = faultyArgs;
		faultyArgs = errCode;
		errCode = errClass;
		errClass = ClassRuntimeError;
	}
	
	if( healthyArgs === undefined )
	{
		healthyArgs = faultyAddArgs;
		faultyAddArgs = undefined;
	}
	
	Test.expectErr(
		testName,
		errClass,
		errCode,
		function()
		{
			var FaultyClass = Class.create( faultyArgs );
			
			if( faultyAddArgs !== undefined )
			{
				Class.add( FaultyClass, faultyAddArgs );
			}
		},
		function()
		{
			var HealthyClass = Class.create( healthyArgs );
			
			if( healthyAddArgs !== undefined )
			{
				Class.add( HealthyClass, healthyAddArgs );
			}
		}
	);
});

expectErr(
	"Giving invalid props for class creation is not allowed",
	"InvalidPropForClassCreation",
	{
		name: "ClassName",
		super: getFunc()
	},
	{
		name: "ClassName"
	}
);

expectErr(
	"A class name must be valid",
	"InvalidPropClassNameForClassCreation",
	{
		name: ""
	},
	{
		name: "ClassName"
	}
);

expectErr(
	"Prop extends for class creation must be a func",
	"InvalidPropExtendsForClassCreation",
	{
		name: "ClassName",
		extends:[ function() {} ]
	},
	{
		name: "ClassName",
		extends: function() {}
	}
);

expectErr(
	"Prop delayedExt for class creation must be a func",
	"InvalidPropDelayedExtForClassCreation",
	{
		name: "ClassName",
		delayedExt:[ function() {} ]
	},
	{
		name: "ClassName",
		delayedExt: function() { return function() {}; }
	}
);

expectErr(
	"Class extension may not be specified using both props "+
	"extends and delayedExt at class creation",
	"InvalidExtensionPropsForClassCreation",
	{
		name: "ClassName",
		delayedExt: function() { return function() {}; },
		extends: function() {}
	},
	{
		name: "ClassName"
	}
);

expectErr(
	"ArgsVers must be placed before ReturnVarVer",
	FuncCreationRuntimeError,
	"InvalidArgsForFuncCreation",
	{
		name: "ClassName",
		constr:
		[
			getA( "str" ),
			getA( "int" ),
			getR( "bool" ),
			getA( "obj" ),
			getFunc()
		]
	},
	{
		name: "ClassName",
		constr:
		[
			getA( "str" ),
			getA( "int" ),
			getA( "obj" ),
			getR( "bool" ),
			getFunc()
		]
	}
);

expectErr(
	"ExtraArgsVers must be placed before ReturnVarVer",
	FuncCreationRuntimeError,
	"InvalidArgsForFuncCreation",
	{
		name: "ClassName",
		constr:
		[
			getA( "str" ),
			getA( "int" ),
			getR( "bool" ),
			getE( "obj" ),
			getFunc()
		]
	},
	{
		name: "ClassName",
		constr:
		[
			getA( "str" ),
			getA( "int" ),
			getE( "obj" ),
			getR( "bool" ),
			getFunc()
		]
	}
);

expectErr(
	"The constructor must be in prop constr",
	FuncCreationRuntimeError,
	"InvalidArgsForFuncCreation",
	{
		name: "ClassName",
		constr:
		[
			getA( "str" )
		]
	},
	{
		name: "ClassName",
		constr:
		[
			getA( "str" ),
			getFunc()
		]
	}
);

expectErr(
	"A constr of another class can not be used for a new class",
	FuncCreationRuntimeError,
	"InvalidArgsForFuncCreation",
	{
		name: "ClassName",
		constr:
		[
			getA( "str" ),
			ClassVar
		]
	},
	{
		name: "ClassName",
		constr:
		[
			getA( "str" ),
			getFunc()
		]
	}
);

expectErr(
	"Prop instVars must be an obj or undef",
	"InvalidPropInstVarsForClassCreation",
	{
		name: "ClassName",
		instVars:[ "final", "final" ]
	},
	{
		name: "ClassName",
		instVars:{ dingo: "final", dango: "extendable" }
	}
);

expectErr(
	"The declared instance vars in prop instVars must have "+
	"correct values",
	"InvalidPropInstVarsForClassCreation",
	{
		name: "ClassName",
		instVars:
		{
			dingo: "final", dango:"extendable", dengo:"finale"
		}
	},
	{
		name: "ClassName",
		instVars:
		{
			dingo: "final", dango:"extendable", dongo:"final"
		}
	}
);

expectErr(
	"A class func def must be an arr",
	"InvalidClassFuncDefinition",
	createClassObj,
	{
		funcName: getFunc()
	},
	createClassObj,
	{
		funcName:[ getFunc() ]
	}
);

expectErr(
	"Unknown string tokens in class func defs are unallowed",
	"InvalidClassFuncDefinition",
	createClassObj,
	{
		funcName:[ "final", "instanca", getFunc() ]
	},
	createClassObj,
	{
		funcName:[ "final", "instance", getFunc() ]
	}
);

expectErr(
	"Static may be declared only once in a class func def",
	"InvalidClassFuncDefinition",
	createClassObj,
	{
		funcName:[ "static", "static", getFunc() ]
	},
	createClassObj,
	{
		funcName:[ "static", getFunc() ]
	}
);

expectErr(
	"Final may be declared only once in a class func def",
	"InvalidClassFuncDefinition",
	createClassObj,
	{
		funcName:[ "final", "final", getFunc() ]
	},
	createClassObj,
	{
		funcName:[ "final", getFunc() ]
	}
);

expectErr(
	"Static class func may not be declared as final",
	"InvalidClassFuncDefinition",
	createClassObj,
	{
		funcName:[ "static", "final", getFunc() ]
	},
	createClassObj,
	{
		funcName:[ "final", getFunc() ]
	}
);

expectErr(
	"The tokens in a class func def must be in correct order",
	"InvalidClassFuncDefinition",
	createClassObj,
	{
		funcName:
		[
			getA(), getE( "any" ), getR( "any" ), "final", getFunc()
		]
	},
	createClassObj,
	{
		funcName:
		[
			"final", getA(), getE( "any" ), getR( "any" ), getFunc()
		]
	}
);

expectErr(
	"The FuncParamVers must be in correct order",
	FuncCreationRuntimeError,
	"InvalidArgsForFuncCreation",
	createClassObj,
	{
		funcName:
		[
			"final", getR( "any" ), getE( "any" ), getFunc()
		]
	},
	createClassObj,
	{
		funcName:
		[
			"final", getE( "any" ), getR( "any" ), getFunc()
		]
	}
);

expectErr(
	"The class func def must include the func itself",
	"InvalidClassFuncDefinition",
	createClassObj,
	{
		funcName:
		[
			"instance",
			"final",
			getA(),
			getA(),
			getA(),
			getE( "any" ),
			getR( "any" )
		]
	},
	createClassObj,
	{
		funcName:
		[
			"instance",
			"final",
			getA(),
			getA(),
			getA(),
			getE( "any" ),
			getR( "any" ),
			getFunc()
		]
	}
);

Test.expectErr(
"Static members added via Cladd.addStatic() may not be funcs",
ClassRuntimeError,
"FunctionGivenToAddStatic",
function()
{
	var Dingo = Class.create( { name: "Dingo" } );
	
	Class.addStatic(
		Dingo,
		{ dango: "dango", dingo: getFunc() }
	);
},
function()
{
	var Dingo = Class.create( { name: "Dingo" } );
	
	Class.addStatic( Dingo, { dingo: "dingo" } );
});

});
