var jsFilePath = process.argv[ 2 ];

var requirejs =
require(
	"/home/work-purerumble/files/projects/ourglobe/js/"+
	"ourglobe/lib/dual/requirejs/r.js"
);

requirejs.config({
	packages:
	[
		"ourglobe/dual/core",
		"ourglobe/dual/testing",
		"ourglobe/dual/moremath",
		"ourglobe/server/initserver",
		"ourglobe/server/morehttp",
		"ourglobe/server/cluster",
		"ourglobe/server/mongodb",
		"ourglobe/server/elasticsearch"
	],
	baseUrl: "/home/work-purerumble/files/projects/ourglobe/js"
});

// requirejs wraps an encountered error into its own and throws
// it instead but this gives no useful information as the origin
// of the original error. The error handling func of requirejs is
// therefore redefined to obtain the original error
requirejs.onError =
function( err )
{
	console.log( err );
	
	if( err.originalError !== undefined )
	{
		err = err.originalError;
	}
	
	throw err;
}

ourglobe = {};

ourglobe.core = {};
ourglobe.core.require = requirejs;
ourglobe.core.define = requirejs.define;

// Since this is the absolutely first call to requirejs, the
// module wont understand relative paths because it doesnt know
// what module package the relative path refers to. Thus
// modulehandler.js must be fetched via a path that is absolute
// compared to requirejs' baseUrl
ourglobe.core.require(
[
	"ourglobe/dual/core/core",
	"ourglobe/server/initserver/modulehandler",
	"ourglobe/server/initserver/definemodulehandler",
	"ourglobe/server/initserver/requiremodulehandler"
],
function(
	core,
	ModuleHandler,
	DefineModuleHandler,
	RequireModuleHandler
)
{
	ourglobe.OurGlobeError = core.OurGlobeError;
	ourglobe.RuntimeError = core.RuntimeError;
	ourglobe.SchemaError = core.SchemaError;
	ourglobe.FuncVerError = core.FuncVerError;
	ourglobe.conf = core.conf;
	ourglobe.sys = core.sys;
	ourglobe.getF = core.getF;
	ourglobe.assert = core.assert;
	ourglobe.OurGlobeObject = core.OurGlobeObject;
	ourglobe.FuncVer = core.FuncVer;
	ourglobe.Schema = core.Schema;
	
	var RuntimeError = ourglobe.RuntimeError;
	var sys = ourglobe.sys;
	var getF = ourglobe.getF;
	var FuncVer = ourglobe.FuncVer;
	
	var verDeps =
	getF(
	new FuncVer( [ "arr" ] ),
	function( dependencies )
	{
		var depsDic = [];
		
		for( var pos in dependencies )
		{
			var currDep = dependencies[ pos ];
			
			if( ModuleHandler.isValidModulePath( currDep ) === false )
			{
				throw new RuntimeError(
					"One of the dependency paths isnt valid",
					{
						providedDependencyPath: currDep,
						dependencyArrPos: pos
					},
					undefined,
					verDeps
				);
			}
			
			if( currDep === "require" || currDep === "exports" )
			{
				throw new RuntimeError(
					"The special dependencies 'require' and 'exports' "+
					"may not be specified",
					undefined,
					undefined,
					verDeps
				);
			}
			else
			{
				if( depsDic[ currDep ] !== undefined )
				{
					throw new RuntimeError(
						"Dependency '"+currDep+"' has been specified "+
						"multiple times",
						undefined,
						undefined,
						verDeps
					);
				}
				
				depsDic[ currDep ] = true;
			}
		}
	});
	
	var verMods =
	getF(
	new FuncVer( [
		"arr",
		{ extraItems: ModuleHandler.MODULE_PATH_S }
	]),
	function( mods, deps )
	{
		for( var item in mods )
		{
			var currMod = mods[ item ];
			
			if(
// ourglobe.define() may obtain an undef module due to
// circular deps that are later resolved by mods.get(),
// while ourglobe.require() may obtain such module because it
// requires a dep that in turn only executes ourglobe.require()
				currMod !== undefined &&
				ModuleHandler.isValidModule( currMod ) === false
			)
			{
				throw new RuntimeError(
					"Dependency '"+deps[ item ]+"' didnt return a valid "+
					"module",
					{ dependency: deps[ item ], returnedModule: currMod }
				);
			}
		}
	});
	
	ourglobe.define =
	getF(
	new FuncVer()
		.addArgs([ "func", "func/undef" ])
		.addArgs([ "arr/undef", "func", "func/undef" ]),
	function( dependencies, cb, delayedCb )
	{
		if( sys.hasType( dependencies, "func" ) === true )
		{
			delayedCb = cb;
			cb = dependencies;
			dependencies = undefined;
		}
		
		if( dependencies === undefined )
		{
			dependencies = [];
		}
		
		verDeps( dependencies );
		
		var newDeps = dependencies.slice();
		
		newDeps.push( "require" );
		
		ourglobe.core.define(
			newDeps,
			getF(
			new FuncVer( undefined, ModuleHandler.MODULE_S )
				.setExtraArgs( "any" ),
			function()
			{
				var mods = Array.prototype.slice.call( arguments );
				
				var require = mods.pop();
				newDeps.pop();
				
				verMods( mods, newDeps );
				
				var modHandler =
					new DefineModuleHandler( newDeps, require )
				;
				
				var returnVar = cb( modHandler );
				
				if( ModuleHandler.isValidModule( returnVar ) === false )
				{
					throw new RuntimeError(
						"The cb of ourglobe.define() didnt return a valid "+
						"module",
						{ returnedModule: returnVar }
					);
				}
				
				if( delayedCb !== undefined )
				{
					modHandler.delay(
					function()
					{
						delayedCb( modHandler, returnVar );
						
						if(
							ModuleHandler.isValidModule( returnVar ) === false
						)
						{
							throw new RuntimeError(
								"The delayed cb of ourglobe.define() modified "+
								"the module to be non-valid",
								{ module: returnVar }
							);
						}
					});
				}
				
				return returnVar;
			})
		);
	});
	
	ourglobe.require =
	getF(
	new FuncVer( [ "arr", "func/undef" ] ),
	function( dependencies, cb )
	{
		verDeps( dependencies );
		
		var newDeps = dependencies.slice();
		
		if( cb === undefined )
		{
			ourglobe.core.require( newDeps );
			
			return;
		}
		
		newDeps.push( "require" );
		
		ourglobe.core.require(
			newDeps,
			getF(
			new FuncVer( undefined, ModuleHandler.SET_RETURN )
				.setExtraArgs( "any" ),
			function()
			{
				var mods = Array.prototype.slice.call( arguments );
				
				var require = mods.pop();
				newDeps.pop();
				
				verMods( mods, newDeps );
				
// These two funcs are executed in this order since a delayed fv
// probably wants to use a variable pointer to a module that is
// part of a circular dependency, but that pointer is set by a
// delayed cb that has been registered with DefineModuleHandler
				DefineModuleHandler.execDelayedCbs();
				sys.prepareDelayedFuncVers();
				
				var modHandler =
					new RequireModuleHandler( newDeps, require )
				;
				
				var returnVar = cb( modHandler );
				
				if( returnVar !== undefined )
				{
					throw new RuntimeError(
						"The cb of ourglobe.require() may not return "+
						"anything",
						{ returnVar: returnVar }
					);
				}
			})
		);
	});

	ourglobe.require( [ jsFilePath ] );
});
