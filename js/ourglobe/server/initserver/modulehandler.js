og.core.require(
[ "og/d/core/core" ],
function( core )
{

var getF = core.getF;
var FuncVer = core.FuncVer;

var ModuleHandler =
getF(
new FuncVer( [ { extraItems: "str" }, "func" ] ),
function( dependencies, require )
{
	this.deps = dependencies;
	this.require = require;
	
	exports.ourglobe = {};
});

ModuleHandler.MODULE_S = { types: "obj/func", minProps: 1 };

ModuleHandler.isValidModule =
getF(
new FuncVer( [ "any" ], "bool" ),
function( module )
{
	var returnVar =
		(
			sys.hasType( module, "obj" ) === true &&
			Object.keys( module ).length > 0
		) ||
		sys.hasType( module, "func" ) === true
	
	return returnVar;
});

ModuleHandler.prototype.get =
getF(
new FuncVer( [ "str", "bool/undef" ], ModuleHandler.MODULE_S ),
function( pathStr, complete )
{
	if( complete === undefined )
	{
		complete = false;
	}
	
	pathStr = pathStr.replace( /^\s+/, "" ).replace( /\s+$/, "" );
	
	var pathWithSep = undefined;
	
	if( complete === false && pathStr[ 0 ] !== "/" )
	{
		pathWithSep = "/"+pathStr;
	}
	
	var foundMod = undefined
	
	var deps = this.deps;
	
	for( var pos in deps )
	{
		var currDep = deps[ pos ];
		
		if(
			currDep === pathStr ||
			(
				pathWithSep !== undefined &&
				currDep.indexOf(
					pathWithSep,
					currDep.length - pathWithSep.length
				) !== -1
			)
		)
		{
			if( foundMod !== undefined )
			{
				throw new RuntimeError(
					"Provided dependency search str matches multiple "+
					"dependencies",
					{ providedPathStr: pathStr }
				);
			}
			
			foundMod = pos;
		}
	}
	
	if( foundMod === undefined )
	{
		throw new RuntimeError(
			"Provided dependency search str matches no dependencies",
			{ providedPathStr: pathStr }
		);
	}
	
	var mod = this.require( deps[ foundMod ] );
	
	if( ModuleHandler.isValidModule( mod ) === false )
	{
		throw new RuntimeError(
			"Obtained dependency path doesnt yield a valid module",
			{ obtainedDepPath: deps[ foundMod ], yieldedModule: mod }
		);
	}
	
	return mod;
});

return ModuleHandler;

});
