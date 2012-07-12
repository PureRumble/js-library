var jsFilePath = process.argv[ 2 ];

var requirejs = require( "og/l/d/requirejs/r.js" );

requirejs.config({
	baseUrl: "/home/work-purerumble/files/projects/ourglobe/js"
});

ourglobe = {};
og = ourglobe;

ourglobe.core = {};
ourglobe.core.require = requirejs;
ourglobe.core.define = requirejs.define;

ourglobe.core.require(
[ "ourglobe/dual/core/core", "./modulehandler" ],
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
	ourglobe.FuncVer = core.FuncVer;
	ourglobe.Schema = core.Schema;
	
	var sys = og.sys;
	var getF = og.getF;
	var RuntimeError = og.RuntimeError;
	var FuncVer = og.FuncVer;
	
	var MODULE_PATH_S = { minStrLen: 1 };
	
	var isValidModulePath =
	getF(
		new FuncVer( [ "any" ], "bool" ),
		function( modulePath )
		{
			var returnVar =
				sys.hasType( modulePath, "str" ) === true &&
				modulePath.length > 0
			;
			
			return returnVar;
		}
	);
	
// cleanDeps() always performs validation of provided dep paths,
// which is why the FuncVer only verifies that arg dependencies
// is an arr
	var cleanDeps =
	getF(
	new FuncVer( [ "arr" ], { extraItems: MODULE_PATH_S } ),
	function( dependencies )
	{
		var newDeps = [];
		var depsDic = [];
		
		for( var pos in dependencies )
		{
			var currDep = dependencies[ pos ];
			
			currDep =
				currDep.replace( /^\s+/, "" ).replace(/\s+$/, "" )
			;
			
			if( isValidModulePath( currDep ) === false )
			{
				throw new RuntimeError(
					"One of the dependency paths isnt valid",
					{
						providedDependencyPath: currDep,
						dependencyArrPos: pos
					},
					cleanDeps
				);
			}
			
			if( currDep === "require" || currDep === "exports" )
			{
				throw new RuntimeError(
					"The special dependencies 'require' and 'exports' "+
					"may not be specified",
					undefined,
					cleanDeps
				);
			}
			else
			{
				if( depsDic[ currDep ] !== undefined )
				{
					throw new RuntimeError(
						"Dependency '"+currDep+"' has been specified "+
						"multiple times"
					);
				}
				
				depsDic[ currDep ] = true;
				
				newDeps.push( currDep );
			}
		}
		
		return newDeps;
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
		
		var newDeps = cleanDeps( dependencies );
		
		newDeps.push( "require" );
		
		ourglobe.core.define(
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
		var newDeps = cleanDeps( dependencies );
		
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
