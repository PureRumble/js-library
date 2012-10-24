ourglobe.core.define(
[
	"./classruntimeerror",
	"ourglobe/dual/core/core"
],
function(
	ClassRuntimeError,
	core
)
{

var RuntimeError = ourglobe.RuntimeError;

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var FuncParamVer = core.FuncParamVer;
var ArgsVer = core.ArgsVer;
var ExtraArgsVer = core.ExtraArgsVer;
var ReturnVarVer = core.ReturnVarVer;

var Class = {};

Class.create =
getF(
getV()
	.setE( "any" )
	.setR( "func" ),
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
	var SuperClass = args.extends;
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
		if( SuperClass === undefined )
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
				SuperClass.apply( this, arguments );
			};
		}
	}
	
	if( sys.hasType( constrArr, "func" ) === true )
	{
		constrArr = [ constrArr ];
	}
	
	var ClassVar = getF.apply( {}, constrArr );
	
	if( ClassVar.ourGlobe === undefined )
	{
		ClassVar.ourGlobe = {};
	}
	
	ClassVar.ourGlobe.class = {};
	ClassVar.ourGlobe.class.className = className;
	ClassVar.ourGlobe.class.subClasses = [];
	ClassVar.ourGlobe.class.instVars = {};
	ClassVar.ourGlobe.class.instFuncs = {};
	ClassVar.ourGlobe.class.staticFuncs = {};
	
	if( SuperClass !== undefined )
	{
		ClassVar.prototype.__proto__ = SuperClass.prototype;
		ClassVar.ourGlobeSuper = SuperClass;
		ClassVar.ourGlobeSuperProto = SuperClass.prototype;
	}
	
	if(
		SuperClass === undefined ||
		Class.isNative( SuperClass ) === true
	)
	{
		ClassVar.prototype.ourGlobeCallSuper = Class.callSuper;
		ClassVar.prototype.ourGlobeApplySuper = Class.applySuper;
	}
	else
	{
		SuperClass.ourGlobe.class.subClasses.push( ClassVar );
	}
	
	for( var instVar in instVars )
	{
		ClassVar.ourGlobe.class.instVars[ instVar ] =
			instVars[ instVar ]
		;
	}
	
	Class.verifyExtensions( ClassVar );
	
	return ClassVar;
});

Class.add =
getF(
getV()
	.setE( "any" ),
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
		
		while(
			currItem < funcArr.length &&
			funcArr[ currItem ] instanceof FuncParamVer === true
		)
		{
			currItem++;
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
				"(3) Any number of FuncParamVers ( constr by "+
				"getA(), getE() or getR())\n"+
				"(4) The function itself",
				{
					className: className,
					faultyClassFunc: funcName,
					faultyClassFuncDef: funcArr
				},
				"InvalidClassFuncDefinition"
			);
		}
		
		if(
			isStatic === true &&
			(
				ClassVar.hasOwnProperty( funcName ) === true ||
				classStaticFuncs[ funcName ] !== undefined
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
				classInstFuncs[ funcName ] !== undefined
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
			
			if( classInstVars[ funcName ] !== undefined )
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
		
		ClassVar[ funcName ] = preparedStaticFunc.func;
		
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
getV()
	.addA( "func" ),
function( ClassVar )
{
	if( Class.isNative( ClassVar ) === true )
	{
		throw new RuntimeError(
			"Arg ClassVar may not be a native class"
		);
	}
	
	for(
		var SuperClass = ClassVar.ourGlobeSuper;
		SuperClass !== undefined &&
		Class.isNative( SuperClass ) === false;
		SuperClass = SuperClass.ourGlobeSuper
	)
	{
		Class.verifyClassExtension( SuperClass, ClassVar );
	}
	
	var subClasses = ClassVar.ourGlobe.class.subClasses.slice();
	
	while( subClasses.length > 0 )
	{
		var SubClass = subClasses.pop();
		
		Class.verifyClassExtension( ClassVar, SubClass );
		
		subClasses =
			subClasses.concat( SubClass.ourGlobe.class.subClasses )
		;
	}
});

Class.verifyClassExtension =
getF(
getV()
	.addA( "func", "func" ),
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
	
	return Class.callSuper.apply( this, newArgs );
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
function( ClassVar )
{
	return ClassVar.ourGlobe === undefined;
});

Class.getName =
getF(
getV()
	.addA( "func" )
	.setR( "str/undef" ),
function( ClassVar )
{
	if( Class.isNative( ClassVar ) === false )
	{
		return ClassVar.ourGlobe.class.className;
	}
	else
	{
		return ClassVar.name;
	}
});

return Class;

});
