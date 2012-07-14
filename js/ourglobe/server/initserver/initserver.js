var jsFilePath = process.argv[ 2 ];

var requirejs =
require(
	"/home/work-purerumble/files/projects/ourglobe/js/"+
	"og/l/d/requirejs/r.js"
);

requirejs.config({
	packages:
	[
		"ourglobe/server/initserver",
		"ourglobe/dual/core",
		"ourglobe/dual/testing",
		"ourglobe/server/morehttp",
		"ourglobe/dual/moremath"
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
	if( err.originalError !== undefined )
	{
		throw err.originalError;
	}
	
	throw err;
}

ourglobe = {};
og = ourglobe;

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
	"ourglobe/server/initserver/modulehandler"
],
function( core, ModuleHandler )
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
	
	var RuntimeError = og.RuntimeError;
	var sys = og.sys;
	var getF = og.getF;
	var FuncVer = og.FuncVer;
	
// cleanDeps() always performs validation of provided dep paths,
// which is why the FuncVer only verifies that arg dependencies
// is an arr
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
	
	ourglobe.define =
	getF(
	new FuncVer()
		.addArgs([ "func" ])
		.addArgs([ "arr/undef", "func" ]),
	function( dependencies, cb )
	{
		if( sys.hasType( dependencies, "func" ) === true )
		{
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
				var require = arguments[ newDeps.length - 1 ];
				
				newDeps.pop();
				
				var mods = new ModuleHandler( newDeps, require );
				
				var returnVar = cb( mods );
				
				if( ModuleHandler.isValidModule( returnVar ) === false )
				{
					throw new RuntimeError(
						"The cb of ourglobe.define() didnt return a valid "+
						"module",
						{ returnedModule: returnVar }
					);
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
				var require = arguments[ newDeps.length - 1 ];
				
				newDeps.pop();
				
				var mods = new ModuleHandler( newDeps, require );
				
				var returnVar = cb( mods );
				
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
