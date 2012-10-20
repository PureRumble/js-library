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

var createdClass = Class.create( { name: "ClassName" } );

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
	.addA( "str", "func", "str", "obj", "obj" ),
function( testName, errClass, errCode, faultyArgs, healthyArgs )
{
	if( sys.hasType( errClass, "str" ) === true )
	{
		healthyArgs = faultyArgs;
		faultyArgs = errCode;
		errCode = errClass;
		errClass = ClassRuntimeError;
	}
	
	Test.expectErr(
		testName,
		errClass,
		errCode,
		function()
		{
			Class.create( faultyArgs );
		},
		function()
		{
			Class.create( healthyArgs );
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
			createdClass
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

});
