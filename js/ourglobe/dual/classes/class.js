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
			prop !== "super" &&
			prop !== "constr"
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
	var superClass = args.super;
	var constrArr = args.constr;
	
	if(
		sys.hasType( className, "str" ) === false ||
		className.length === 0
	)
	{
		throw new ClassRuntimeError(
			"A class name must be a proper str",
			{ className: className },
			"InvalidClassName"
		);
	}
	
	if(
		superClass !== undefined &&
		sys.hasType( superClass, "func" ) === false
	)
	{
		throw new ClassRuntimeError(
			"Prop super must be undef or the desired super class",
			{ super: superClass },
			"InvalidSuperClass"
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
			{ constr: constrArr }
		);
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
	
	if( constr.ourGlobe === undefined )
	{
		constr.ourGlobe = {};
	}
	
	constr.ourGlobe.class = {};
	
	constr.ourGlobe.class.className = className;
	
	return constr;
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
