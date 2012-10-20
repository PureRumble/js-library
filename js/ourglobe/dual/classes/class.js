ourglobe.core.define(
[
	"./classruntimeerror"
],
function(
	ClassRuntimeError
)
{

var RuntimeError = ourglobe.RuntimeError;

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var ArgsVer = ourglobe.core.ArgsVer;
var ExtraArgsVer = ourglobe.core.ExtraArgsVer;
var ReturnVarVer = ourglobe.core.ReturnVarVer;

var Class = {};

Class.create =
getF(
getV()
	.setE( "any" )
	.setR( "func" ),
function( args )
{
	if( sys.hasType( args, "obj" ) === false )
	{
		throw new RuntimeError(
			"Arg args must be an obj",
			{ args: args }
		);
	}
	
	for( var prop in args )
	{
		if(
			prop !== undefined &&
			prop !== "name" &&
			prop !== "extends" &&
			prop !== "constr" &&
			prop !== "instVars"
		)
		{
			throw new ClassRuntimeError(
				"Prop '"+prop+"' isnt valid for class creation",
				undefined,
				"InvalidPropForClassCreation"
			);
		}
	}
	
	var className = args.name;
	var superClass = args.extends;
	var constrArr = args.constr;
	var instVars = args.instVars;
	
	if(
		sys.hasType( className, "str" ) === false ||
		className.length === 0
	)
	{
		throw new ClassRuntimeError(
			"A class name must be a proper str",
			{ className: className },
			"InvalidPropClassNameForClassCreation"
		);
	}
	
	if(
		superClass !== undefined &&
		sys.hasType( superClass, "func" ) === false
	)
	{
		throw new ClassRuntimeError(
			"Prop extends must be undef or the desired super class",
			{ extends: superClass },
			"InvalidPropExtendsForClassCreation"
		);
	}
	
	if(
		sys.hasType( constrArr, "undef", "func" ) === false &&
		(
			sys.hasType( constrArr, "arr" ) === false ||
			constrArr.length === 0
		)
	)
	{
		throw new ClassRuntimeError(
			"Prop constr must be undef, a func or a proper arr",
			{ constr: constrArr },
			"InvalidPropConstrForClassCreation"
		);
	}
	
	if( sys.hasType( instVars, "undef", "obj" ) === false )
	{
		throw new ClassRuntimeError(
			"Prop instVars must be undef or an obj",
			{ instVars: instVars },
			"InvalidPropInstVarsForClassCreation"
		);
	}
	
	if( instVars === undefined )
	{
		instVars = {};
	}
	
	for( var prop in instVars )
	{
		var instVar = instVars[ prop ];
		
		if( instVar !== "final" && instVar !== "extendable" )
		{
			throw new ClassRuntimeError(
				"Instance var '"+prop+"' doesnt have its prop in "+
				"instVars set to a correct value",
				{
					faultyInstVarsProp: prop,
					faultyInstVarsPropValue: instVar
				},
				"InvalidPropInstVarsForClassCreation"
			);
		}
	}
	
	if( constrArr === undefined )
	{
		if( superClass === undefined )
		{
			constrArr =
			function()
			{
				
			};
		}
		else
		{
			constrArr =
			function()
			{
				superClass.apply( this, arguments );
			};
		}
	}
	
	if( sys.hasType( constrArr, "func" ) === true )
	{
		constrArr = [ constrArr ];
	}
	
	var constr = getF.apply( {}, constrArr );
	
	if( constr.ourGlobe === undefined )
	{
		constr.ourGlobe = {};
	}
	
	constr.ourGlobe.class = {};
	constr.ourGlobe.class.subClasses = [];
	constr.ourGlobe.class.className = className;
	
	if( superClass !== undefined )
	{
		constr.prototype.__proto__ = superClass.prototype;
		constr.ourGlobeSuper = superClass;
		constr.ourGlobeSuperProto = superClass.prototype;
	}
	
	if(
		superClass === undefined ||
		Class.isNative( superClass ) === true
	)
	{
		constr.prototype.ourGlobeCallSuper = Class.callSuper;
		constr.prototype.ourGlobeApplySuper = Class.applySuper;
	}
	else
	{
		superClass.ourGlobe.class.subClasses.push( constr );
	}
	
	constr.ourGlobe.class.instVars = {};
	
	for( var instVar in instVars )
	{
		constr.ourGlobe.class.instVars[ instVar ] =
			instVars[ instVar ]
		;
	}
	
	Class.verifyExtensions( constr );
	
	return constr;
});

Class.verifyExtensions =
getF(
getV()
	.addA( "func" ),
function( classVar )
{
	if( Class.isNative( classVar ) === true )
	{
		throw new RuntimeError(
			"Arg classVar may not be a native class"
		);
	}
	
	for(
		var superClass = classVar.ourGlobeSuper;
		superClass !== undefined &&
		Class.isNative( superClass ) === false;
		superClass = superClass.ourGlobeSuper
	)
	{
		Class.verifyClassExtension( superClass, classVar );
	}
	
	var subClasses = classVar.ourGlobe.class.subClasses.slice();
	
	if( subClasses.length === 0 )
	{
		return;
	}
	
	for(
		var subClass = subClasses.pop();
		subClasses.length !== 0;
		subClass = subClasses.pop()
	)
	{
		Class.verifyClassExtension( classVar, subClass );
		
		subClasses.concat( subClass.ourGlobe.class.subClasses );
	}
});

Class.verifyClassExtension =
getF(
getV()
	.addA( "func", "func" ),
function( superClass, subClass )
{
	if( subClass.prototype instanceof superClass === false )
	{
		throw new RuntimeError(
			"Arg superClass must be a super class of arg subClass"
		);
	}
	
	if( Class.isNative( superClass ) === true )
	{
		throw new RuntimeError(
			"Arg superClass may not be a native class"
		);
	}
	
	if( Class.isNative( subClass ) === true )
	{
		throw new RuntimeError(
			"Arg subClass may not be a native class"
		);
	}
	
	var superInstVars = superClass.ourGlobe.class.instVars;
	var superClassName = superClass.ourGlobe.class.className;
	var subInstVars = subClass.ourGlobe.class.instVars;
	var subClassName = subClass.ourGlobe.class.className;
	
	for( var instVar in superInstVars )
	{
		if(
			superInstVars[ instVar ] === "final" &&
			subInstVars[ instVar ] !== undefined
		)
		{
			throw new ClassRuntimeError(
				"Class '"+subClassName+"' may not have an instance var "+
				"named '"+instVar+"' since its (direct or indirect) "+
				"super class '"+superClassName+"' declares the same "+
				"instance var as final",
				{
					superClass: superClassName,
					subClass: subClassName,
					conflictingInstVar: instVar
				},
				"SubClassExtendsFinalInstanceVar"
			);
		}
		
		if(
			superInstVars[ instVar ] === "extendable" &&
			subInstVars[ instVar ] === "final"
		)
		{
			throw new ClassRuntimeError(
				"Class '"+subClassName+"' may not declare instance var "+
				"'"+instVar+"' as final since its (direct or indirect) "+
				"super class '"+superClassName+"' declares the same "+
				"instance var as extendable",
				{
					superClass: superClassName,
					subClass: subClassName,
					conflictingInstVar: instVar
				},
				"SubClassReDeclaresExtendableInstVarAsFinal"
			);
		}
	}
});

Class.applySuper =
getF(
getV()
	.setE( "any" )
	.setR( "any" ),
function( funcName, args )
{
	if( arguments.length !== 2 )
	{
		throw new RuntimeError(
			"Exactly two args must be provided",
			{ providedArgs: arguments }
		);
	}
	
	var newArgs = undefined;
	
	try
	{
		newArgs =
			[ funcName ].concat( Array.prototype.slice.call( args ) )
		;
	}
	catch( e )
	{
		throw new RuntimeError(
			"Arg args must be an arr or an arguments obj",
			{ args: args }
		);
	}
	
	Class.callSuper.apply( this, newArgs );
});

Class.callSuper =
getF(
getV()
	.setE( "any" )
	.setR( "any" ),
function( funcName )
{
	if( sys.hasType( funcName, "str", "undef" ) === false )
	{
		throw new RuntimeError(
			"Arg funcName must be a str",
			{ funcName: funcName }
		);
	}
	
	var args = Array.prototype.slice.call( arguments, 1 );
	
	if( funcName === undefined )
	{
		return(
			this.__proto__.__proto__.constructor.apply( this, args )
		);
	}
	else if(
		sys.hasType(
			this.__proto__.__proto__[ funcName ], "func"
		)
		=== false
	)
	{
		throw new ClassRuntimeError(
			"The instance's super class has no func named '"+
			funcName+"'",
			{ invalidFuncName: funcName },
			"SuperClassInstanceFuncDoesntExist"
		);
	}
	else
	{
		return(
			this.__proto__.__proto__[ funcName ].apply( this, args )
		);
	}
});

Class.isNative =
getF(
getV()
	.addA( "func" )
	.setR( "bool" ),
function( classVar )
{
	return classVar.ourGlobe === undefined;
});

Class.getClassName =
getF(
getV()
	.addA( "func" )
	.setR( "str/undef" ),
function( classVar )
{
	if( Class.isNative( classVar ) === false )
	{
		return classVar.ourGlobe.class.className;
	}
	else
	{
		return classVar.name;
	}
});

return Class;

});
