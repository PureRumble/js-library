og.core.define(
[ "ourglobe/dual/core/core" ],
function( core )
{

var RuntimeError = core.RuntimeError;
var sys = core.sys;
var getF = core.getF;
var FuncVer = core.FuncVer;

var constrFv = new FuncVer( [ { extraItems: "str" }, "func" ] );

var ModuleHandler =
getF(
constrFv,
function( dependencies, require )
{
	this.deps = dependencies;
	this.require = require;
});

ModuleHandler.CONSTR_FV = constrFv;
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

ModuleHandler.MODULE_PATH_S = { minStrLen: 1 };

ModuleHandler.isValidModulePath =
getF(
	new FuncVer( [ "any" ], "bool" ),
	function( modulePath )
	{
		var returnVar =
			sys.hasType( modulePath, "str" ) === true &&
			modulePath.length > 0 &&
			modulePath.search( /\s/ ) === -1
		;
		
		return returnVar;
	}
);

// Arg pathStr is always verified by ModuleHandler.get(), which
// is why the FuncVer allows it to be anything
ModuleHandler.prototype.get =
getF(
new FuncVer( [ "any", "bool/undef" ], ModuleHandler.MODULE_S ),
function( pathStr, complete )
{
	if( complete === undefined )
	{
		complete = false;
	}
	
	if( ModuleHandler.isValidModulePath( pathStr ) === false )
	{
		throw new RuntimeError(
			"Provided dependency search str isnt valid",
			{ providedSearchStr: pathStr }
		);
	}
	
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
					{ providedSearchStr: pathStr }
				);
			}
			
			foundMod = pos;
		}
	}
	
	if( foundMod === undefined )
	{
		throw new RuntimeError(
			"Provided dependency search str matches no dependencies",
			{ providedSearchStr: pathStr }
		);
	}
	
	var mod = this.require( deps[ foundMod ] );
	
	if( ModuleHandler.isValidModule( mod ) === false )
	{
		throw new RuntimeError(
			"Obtained dependency path doesnt return a valid module",
			{
				dependency: deps[ foundMod ],
				returnedModule: mod
			}
		);
	}
	
	return mod;
});

return ModuleHandler;

});
