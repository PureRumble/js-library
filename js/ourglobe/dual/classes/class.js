ourglobe.core.define(
[
	"./classruntimeerror",
	"ourglobe/dual/core/core",
	"ourglobe/dual/modulehandling"
],
function(
	ClassRuntimeError,
	core,
	modulehandling
)
{

var RuntimeError = ourglobe.RuntimeError;

var getF = ourglobe.getF;
var sys = ourglobe.sys;
var getA = ourglobe.getA;
var getE = ourglobe.getE;
var getR = ourglobe.getR;

var FuncVer = core.FuncVer;
var FuncParamVer = core.FuncParamVer;
var ArgsVer = core.ArgsVer;
var ExtraArgsVer = core.ExtraArgsVer;
var ReturnVarVer = core.ReturnVarVer;
var ModuleUtils = modulehandling.ModuleUtils;

var Class = {};

Class.create =
getF(
getA.ANY_ARGS,
getR( "func" ),
function( args )
{
	if( arguments.length !== 1 )
	{
		throw new RuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
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
			prop !== "delayedExt" &&
			prop !== "constr" &&
			prop !== "instVars"
		)
		{
			throw new ClassRuntimeError(
				"Prop '"+prop+"' isnt valid for class creation",
				"InvalidPropForClassCreation"
			);
		}
	}
	
	var className = args.name;
	var SuperClass = args.extends;
	var constrArr = args.constr;
	var instVars = args.instVars;
	var delayedExt = args.delayedExt;
	
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
		SuperClass !== undefined &&
		sys.hasType( SuperClass, "func" ) === false
	)
	{
		throw new ClassRuntimeError(
			"Prop extends must be undef or the desired super class",
			{ extends: SuperClass },
			"InvalidPropExtendsForClassCreation"
		);
	}
	
	if(
		delayedExt !== undefined &&
		sys.hasType( delayedExt, "func" ) === false
	)
	{
		throw new ClassRuntimeError(
			"Prop delayedExt must be undef or a func that returns "+
			"the desired super class",
			"InvalidPropDelayedExtForClassCreation"
		);
	}
	
	if( SuperClass !== undefined && delayedExt !== undefined )
	{
		throw new ClassRuntimeError(
			"Both props extends and delayedExt may not be set",
			{ instVars: instVars },
			"InvalidExtensionPropsForClassCreation"
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
	
	var extendsClass =
		SuperClass !== undefined || delayedExt !== undefined
	;
	
	var ClassVar = undefined;
	
	if( constrArr === undefined )
	{
		if( extendsClass === false )
		{
			constrArr =
			[
				function()
				{
					
				}
			];
		}
		else
		{
			constrArr =
			[
				getA.ANY_ARGS,
				function()
				{
					ClassVar.ourGlobeSuper.apply( this, arguments );
				}
			];
		}
	}
	
	if( delayedExt !== undefined )
	{
		ModuleUtils.delayClassExt(
			function()
			{
				var ReturnedClass = delayedExt();
				
				if( sys.hasType( ReturnedClass, "func" ) === false )
				{
					throw new ClassRuntimeError(
						"Func delayedExt given to Class.create() must "+
						"return a class that is the desired super class",
						"InvalidReturnVarForDelayedExt"
					);
				}
				
				Class.extendClass( ClassVar, ReturnedClass );
			}
		);
	}
	
	if( sys.hasType( constrArr, "func" ) === true )
	{
		constrArr = [ constrArr ];
	}
	
	ClassVar = getF.apply( {}, constrArr );
	
	Object.defineProperty(
		ClassVar.ourGlobe,
		"class",
		{ 
			enumerable: false,
			configurable: false,
			writable: false,
			value: {}
		}
	);
	
	Object.defineProperty(
		ClassVar.ourGlobe.class,
		"className",
		{ 
			enumerable: true,
			configurable: false,
			writable: false,
			value: className
		}
	);
	
	ClassVar.ourGlobe.class.subClasses = [];
	ClassVar.ourGlobe.class.instVars = {};
	ClassVar.ourGlobe.class.instFuncs = {};
	ClassVar.ourGlobe.class.staticFuncs = {};
	ClassVar.ourGlobe.class.extendsClass = extendsClass;
	
	for( var instVar in instVars )
	{
		ClassVar.ourGlobe.class.instVars[ instVar ] =
			instVars[ instVar ]
		;
	}
	
	Class.extendClass( ClassVar, SuperClass );
	
	return ClassVar;
});

Class.extendClass =
getF(
getA( "func", "func/undef" ),
function( SubClass, SuperClass )
{
	if( Class.isNative( SubClass ) === true )
	{
		throw new RuntimeError(
			"Arg SubClass may not be a native class"
		);
	}
	
	if( SuperClass !== undefined )
	{
		SubClass.prototype.__proto__ = SuperClass.prototype;
		SubClass.ourGlobeSuper = SuperClass;
		Object.defineProperty(
			SubClass,
			"ourGlobeSuperProto",
			{ value: SuperClass.prototype }
		);
	}
	
	if(
		(
			SuperClass === undefined &&
			SubClass.ourGlobe.class.extendsClass === false
		)
		||
		(
			SuperClass !== undefined &&
			Class.isNative( SuperClass ) === true
		)
	)
	{
		SubClass.prototype.ourGlobeCallSuper = Class.callSuper;
		SubClass.prototype.ourGlobeApplySuper = Class.applySuper;
	}
	
	if(
		SuperClass !== undefined &&
		Class.isNative( SuperClass ) === false
	)
	{
		SuperClass.ourGlobe.class.subClasses.push( SubClass );
	}
	
// This following is currently not required if SuperClass is
// undef or a native class, but the call is nevertheless made as
// a reservation for future changes where verifyExtensions() may
// need to concern itself with delayed extensions
// (SuperClass === undefined) or SuperClass is a native class
	
	Class.verifyExtensions( SubClass );
});

Class.addStatic =
getF(
getA.ANY_ARGS,
function( ClassVar, staticMembers )
{
	if( arguments.length !== 2 )
	{
		throw new RuntimeError(
			"Exactly two args must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if(
		sys.hasType( ClassVar, "func" ) === false ||
		Class.isNative( ClassVar ) === true
	)
	{
		throw new RuntimeError(
			"Arg ClassVar must be a class created by Class.create()",
			{ ClassVar: ClassVar }
		);
	}
	
	if(
		sys.hasType( staticMembers, "obj" ) === false ||
		Object.keys( staticMembers ).length === 0
	)
	{
		throw new RuntimeError(
			"Arg staticMembers must be a proper obj",
			{ staticMembers: staticMembers }
		);
	}
	
	var className = Class.getName( ClassVar );
	
	for( var staticMember in staticMembers )
	{
		if(
			true ===
				sys.hasType( staticMembers[ staticMember ], "func" )
		)
		{
			throw new ClassRuntimeError(
				"Functions may not be added via Class.addStatic()",
				{ faultyStaticMemberName: staticMember },
				"FunctionGivenToAddStatic"
			);
		}
		
// It is not ok if ClassVar inherits a prop from native class
// Function by the name staticMember. This would mean the prop
// would be extended by the prop that is now to be added via
// Class.addStatic(). But the static member is not being added
// for the purpose of extending the prop of native class
// Function. The purpose is instead to make the static member
// available for those that use the class that is now being
// modified by Class.addStatic(). The user should therefore be
// warned that an extending is taking place
		if( ClassVar[ staticMember ] !== undefined )
		{
			throw new ClassRuntimeError(
				"Class '"+className+"' already has a static member "+
				"named '"+staticMember+"'",
				{ duplicateStaticMemberName: staticMember },
				"DuplicateStaticMember"
			);
		}
	}
	
	for( var staticMember in staticMembers )
	{
		Object.defineProperty(
			ClassVar,
			staticMember,
			{
				enumerable: false,
				value: staticMembers[ staticMember ]
			}
		);
	}
});

Class.add =
getF(
getA.ANY_ARGS,
function( ClassVar, funcs )
{
	if( arguments.length !== 2 )
	{
		throw new RuntimeError(
			"Exactly two args must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if(
		sys.hasType( ClassVar, "func" ) === false ||
		Class.isNative( ClassVar ) === true
	)
	{
		throw new RuntimeError(
			"Arg ClassVar must be a class created by Class.create()",
			{ ClassVar: ClassVar }
		);
	}
	
	if(
		sys.hasType( funcs, "obj" ) === false ||
		Object.keys( funcs ).length === 0
	)
	{
		throw new RuntimeError(
			"Arg funcs must be a proper obj",
			{ funcs: funcs }
		);
	}
	
	var className = Class.getName( ClassVar );
	var classStaticFuncs = ClassVar.ourGlobe.class.staticFuncs;
	var classInstFuncs = ClassVar.ourGlobe.class.instFuncs;
	var classInstVars = ClassVar.ourGlobe.class.instVars;
	
	var preparedStaticFuncs = {};
	var preparedInstFuncs = {};
	
	for( var funcName in funcs )
	{
		var funcArr = funcs[ funcName ];
		
		if(
			sys.hasType( funcArr, "arr" ) === false ||
			funcArr.length === 0
		)
		{
			throw new ClassRuntimeError(
				"Every func that is to be added must be defined "+
				"by a proper arr",
				{
					className: className,
					faultyFunc: funcName,
					faultyFuncDef: funcArr
				},
				"InvalidClassFuncDefinition"
			);
		}
		
		var isStatic = undefined;
		var isFinal = undefined;
		
		var currItem = 0;
		
		for(
			;
			currItem < 2 &&
			currItem < funcArr.length &&
			(
				funcArr[ currItem ] === "static" ||
				funcArr[ currItem ] === "instance" ||
				funcArr[ currItem ] === "final" ||
				funcArr[ currItem ] === "extendable"
			);
			currItem++
		)
		{
			var funcArrItem = funcArr[ currItem ];
			
			if(
				funcArrItem === "static" || funcArrItem === "instance"
			)
			{
				if( isStatic !== undefined )
				{
					throw new ClassRuntimeError(
						"static/instance is specified multiple times for "+
						"class func '"+funcName+"'",
						{ className: className, faultyClassFunc: funcName },
						"InvalidClassFuncDefinition"
					);
				}
				
				isStatic = funcArrItem === "static";
			}
			else if(
				funcArrItem === "final" || funcArrItem === "extendable"
			)
			{
				if( isFinal !== undefined )
				{
					throw new ClassRuntimeError(
						"final/extendable is specified multiple times for "+
						"class func '"+funcName+"'",
						{ className: className, faultyClassFunc: funcName },
						"InvalidClassFuncDefinition"
					);
				}
				
				isFinal = funcArrItem === "final";
			}
		}
		
		if( isStatic === undefined )
		{
			isStatic = false;
		}
		
		if( isStatic === false && isFinal === undefined )
		{
			isFinal = false;
		}
		
		if( isStatic === true && isFinal !== undefined )
		{
			throw new ClassRuntimeError(
				"final/extendable may not be defined for a static "+
				"class func",
				{ className: className, faultyClassFunc: funcName },
				"InvalidClassFuncDefinition"
			);
		}
		
		var funcDefStart = currItem;
		
// Verifying the args before providing them to getF() is a
// healthy approach since it's made sure that no faulty args
// that Class doesnt approve of for func creation are sent to
// getF() and that getF() may approve of
		
		if(
			currItem < funcArr.length &&
			funcArr[ currItem ] instanceof FuncVer === true
		)
		{
			currItem++;
		}
		else
		{
			while(
				currItem < funcArr.length &&
				funcArr[ currItem ] instanceof FuncParamVer === true
			)
			{
				currItem++;
			}
		}
		
		if(
			currItem !== funcArr.length - 1 ||
			sys.hasType( funcArr[ currItem ], "func" ) === false
		)
		{
			throw new ClassRuntimeError(
				"The definition of the class func '"+funcName+"' isnt "+
				"valid. A class func definition must be an arr with "+
				"the following items in the stated order:\n"+
				"(1) Optional specification of if the func is static "+
				"(one of the strings 'static' or 'instance')\n"+
				"(2) Optional specification of the funcs extendability "+
				"(one of the strings 'final' or 'extendable', "+
				"items (1) and (2) can be interchanged in order)\n"+
				"(3) One of the following options:\n"+
				"  (i) One FuncVer (constr by getV())\n"+
				"  (ii) Any number of FuncParamVers "+
				"(constr by getA(), getE() or getR())\n"+
				"(4) The function itself",
				{
					className: className,
					faultyClassFunc: funcName,
					faultyClassFuncDef: funcArr
				},
				"InvalidClassFuncDefinition"
			);
		}
		
// It is not ok if ClassVar inherits a prop from native class
// Function by the name funcName. This would mean the prop
// would be extended by the static func that is now to be
// added via Class.add(). But the static func is not being added
// for the purpose of extending the prop of native class
// Function. The purpose is instead to make the static func
// available for those that use the class that is now being
// modified by Class.add(). The user should therefore be
// warned that an extending is taking place
		if(
			isStatic === true &&
			(
				ClassVar[ funcName ] !== undefined ||
				classStaticFuncs.hasOwnProperty( funcName ) === true
			)
		)
		{
			throw new ClassRuntimeError(
				"The class '"+className+"' already has a static "+
				"member named '"+funcName+"'",
				{ 
					className: className,
					duplicateStaticMemberName: funcName,
					existingStaticMember: ClassVar[ funcName ]
				},
				"DuplicateStaticMember"
			);
		}
		else if( isStatic === false )
		{
			if(
				ClassVar.prototype.hasOwnProperty( funcName ) === true ||
				classInstFuncs.hasOwnProperty( funcName ) === true
			)
			{
				throw new ClassRuntimeError(
					"The class '"+className+"' already has a "+
					"prototype instance member named '"+funcName+"'",
					{
						className: className,
						duplicateInstanceMemberName: funcName,
						existingInstanceMember:
							ClassVar.prototype[ funcName ]
					},
					"DuplicateInstanceMember"
				);
			}
			
			if( classInstVars.hasOwnProperty( funcName ) === true )
			{
				throw new ClassRuntimeError(
					"The class '"+className+"' already has an instance "+
					"variable named as the instance func '"+funcName+"' "+
					"that is to be added",
					{
						className: className,
						duplicateInstanceMemberName: funcName
					},
					"DuplicateInstanceMember"
				);
			}
		}
		
		var func = getF.apply( {}, funcArr.slice( funcDefStart ) );
		
		if( isStatic === true )
		{
			preparedStaticFuncs[ funcName ] = {};
			preparedStaticFuncs[ funcName ].func = func;
		}
		else
		{
			preparedInstFuncs[ funcName ] = {};
			preparedInstFuncs[ funcName ].func = func;
		}
		
		if( isFinal === true )
		{
			preparedInstFuncs[ funcName ].extDec = "final";
		}
// Only instance funcs have extendability declared, therefore
// isFinal can be undef
		else if( isFinal === false )
		{
			preparedInstFuncs[ funcName ].extDec = "extendable";
		}
	}
	
	for( var funcName in preparedStaticFuncs )
	{
		var preparedStaticFunc = preparedStaticFuncs[ funcName ];
		
		Object.defineProperty(
			ClassVar,
			funcName,
			{
				enumerable: false,
				configurable: false,
				writable: false,
				value: preparedStaticFunc.func
			}
		);
		
		ClassVar.ourGlobe.class.staticFuncs[ funcName ] =
			preparedStaticFunc
		;
	}
	
	for( var funcName in preparedInstFuncs )
	{
		var preparedInstFunc = preparedInstFuncs[ funcName ];
		
		ClassVar.prototype[ funcName ] = preparedInstFunc.func;
		
		ClassVar.ourGlobe.class.instFuncs[ funcName ] =
			preparedInstFunc
		;
	}
	
	Class.verifyExtensions( ClassVar );
});

Class.verifyExtensions =
getF(
getA( "func" ),
function( ClassVar )
{
	if( Class.isNative( ClassVar ) === true )
	{
		throw new RuntimeError(
			"Arg ClassVar may not be a native class"
		);
	}
	
	var upperClasses = [];
	
	for(
		var UpperClass = ClassVar.ourGlobeSuper;
		UpperClass !== undefined &&
		Class.isNative( UpperClass ) === false;
		UpperClass = UpperClass.ourGlobeSuper
	)
	{
		upperClasses.push( UpperClass );
	}
	
	for( var item in upperClasses )
	{
		var UpperClass = upperClasses[ item ];
		
		Class.verifyClassExtension( UpperClass, ClassVar );
	}
	
	upperClasses.push( ClassVar );
	
	var lowerClasses = ClassVar.ourGlobe.class.subClasses.slice();
	
	while( lowerClasses.length > 0 )
	{
		var LowerClass = lowerClasses.pop();
		
		for( var item in upperClasses )
		{
			var UpperClass = upperClasses[ item ];
			
			Class.verifyClassExtension( UpperClass, LowerClass );
		}
		
		lowerClasses =
			lowerClasses.concat( LowerClass.ourGlobe.class.subClasses )
		;
	}
});

Class.verifyClassExtension =
getF(
getA( "func", "func" ),
function( SuperClass, SubClass )
{
	if( SubClass.prototype instanceof SuperClass === false )
	{
		throw new RuntimeError(
			"Arg SuperClass must be a super class of arg SubClass"
		);
	}
	
	if( Class.isNative( SuperClass ) === true )
	{
		throw new RuntimeError(
			"Arg SuperClass may not be a native class"
		);
	}
	
	if( Class.isNative( SubClass ) === true )
	{
		throw new RuntimeError(
			"Arg SubClass may not be a native class"
		);
	}
	
	var superInstVars = SuperClass.ourGlobe.class.instVars;
	var superInstFuncs = SuperClass.ourGlobe.class.instFuncs;
	var superClassName = Class.getName( SuperClass );
	var subInstVars = SubClass.ourGlobe.class.instVars;
	var subInstFuncs = SubClass.ourGlobe.class.instFuncs;
	var subClassName = Class.getName( SubClass );
	
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
		
		if( subInstFuncs[ instVar ] !== undefined )
		{
			throw new ClassRuntimeError(
				"Class '"+subClassName+"' may not declare an instance "+
				"func named '"+instVar+"' since its (direct or "+
				"indirect) super class '"+superClassName+"' has an "+
				"instance var by the same name",
				{
					superClass: superClassName,
					subClass: subClassName,
					duplicateSuperClassInstanceMemberName: instVar
				},
				"DuplicateSuperClassInstanceMember"
			);
		}
	}
	
	for( var instFunc in superInstFuncs )
	{
		if(
			superInstFuncs[ instFunc ].extDec === "final" &&
			subInstFuncs[ instFunc ] !== undefined
		)
		{
			throw new ClassRuntimeError(
				"Class '"+subClassName+"' may not have an instance "+
				"func named '"+instFunc+"' since its (direct or "+
				"indirect) super class '"+superClassName+"' declares "+
				"the same instance var func final",
				{
					superClass: superClassName,
					subClass: subClassName,
					conflictingInstFunc: instFunc
				},
				"SubClassExtendsFinalInstanceFunc"
			);
		}
		
		if( subInstVars[ instFunc ] !== undefined )
		{
			throw new ClassRuntimeError(
				"Class '"+subClassName+"' may not declare an instance "+
				"var named '"+instFunc+"' since its (direct or "+
				"indirect) super class '"+superClassName+"' has an "+
				"instance func by the same name",
				{
					superClass: superClassName,
					subClass: subClassName,
					duplicateSuperClassInstanceMemberName: instFunc
				},
				"DuplicateSuperClassInstanceMember"
			);
		}
	}
});

Class.applySuper =
getF(
getA.ANY_ARGS,
getR( "any" ),
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
	
	return Class.callSuper.apply( this, newArgs );
});

Class.callSuper =
getF(
getA.ANY_ARGS,
getR( "any" ),
function( funcName )
{
	if( sys.hasType( funcName, "str", "undef" ) === false )
	{
		throw new RuntimeError(
			"Arg funcName must be a str or undef",
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
getA( "func" ),
getR( "bool" ),
function( ClassVar )
{
	return(
		ClassVar.ourGlobe === undefined ||
		ClassVar.ourGlobe.class === undefined
	);
});

Class.getName =
getF(
getA.ANY_ARGS,
getR( "str/undef" ),
function( ClassVar )
{
	if( arguments.length !== 1 )
	{
		throw new RuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( sys.hasType( ClassVar, "func" ) === false )
	{
		throw new RuntimeError(
			"Arg ClassVar must be a func",
			{ ClassVar: ClassVar }
		);
	}
	
	if( Class.isNative( ClassVar ) === false )
	{
		return ClassVar.ourGlobe.class.className;
	}
	else
	{
		return ClassVar.name;
	}
});

Class.getClass =
getF(
getA.ANY_ARGS,
getR( "func" ),
function( inst )
{
	if( arguments.length !== 1 )
	{
		throw new RuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if(
		sys.hasType( inst, "inst" ) === false ||
		sys.hasType( inst.__proto__.constructor, "func" ) ===
			false
		||
		inst.__proto__.constructor.prototype !== inst.__proto__
	)
	{
		throw new RuntimeError(
			"Arg inst must be a class inst", { inst: inst }
		);
	}
	
	return inst.__proto__.constructor;
});

Class.getClassName =
getF(
getA.ANY_ARGS,
getR( "str/undef" ),
function( inst )
{
	if( arguments.length !== 1 )
	{
		throw new RuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
// Class.getClass() will further verify the type of arg inst,
// which is why the same verification isnt done here
	
	return Class.getName( Class.getClass( inst ) );
});

return Class;

});
