var jsFilePath = process.argv[ 2 ];

var requirejs = require( "og/l/d/requirejs/r.js" );

requirejs.config({
	baseUrl: "/home/work-purerumble/files/projects/ourglobe"
});

ourglobe = {};
og = ourglobe;

ourglobe.core = {};
ourglobe.core.require = requirejs;
ourglobe.core.define = requirejs.define;

ourglobe.core.require(
[
	"og/d/sys",
	"og/d/verification"
],
function(
	sysM,
	verificationM
)
{
	var getF = sysM.sys.getFunc;
	var RuntimeError = verificationM.RuntimeError;
	var FuncVer = verificationM.FuncVer;
	
	var MODULE_S = { minProps: 1 };
	
	var isValidModule =
	getF(
		new FuncVer( [ "any" ], "bool" ),
		function( module )
		{
			var returnVar =
				typeof( module ) === "object" &&
				Object.keys( module ).length > 0
			;
			
			return returnVar;
		}
	);
	
	var MODULE_PATH_S = { minStrLen: 1 };
	
	var isValidModulePath =
	getF(
		new FuncVer( [ "any" ], "bool" ),
		function( modulePath )
		{
			var returnVar =
				typeof( modulePath ) === "string" &&
				modulePath.length > 0
			;
			
			return returnVar;
		}
	);

	var getLoadModFunc =
	getF(
	new FuncVer()
		.addArgs([
			{ values:[ "require", "define" ] },
			"arr",
			"arr",
			"func",
			"obj"
		])
		.addArgs([
			{ values:[ "require", "define" ] },
			"arr",
			"arr"
		])
		.setReturn( "func" ),
	function( forFunc, reqs, mods, require, exports )
	{
		var loadMod =
		getF(
		new FuncVer( [ "str", "bool/undef" ] ),
		function( pathStr, complete )
		{
			if( complete === undefined )
			{
				complete = false;
			}
			
			pathStr =
				pathStr.replace( /^\s+/, "" ).replace( /\s+$/, "" )
			;
			
			var pathWithSep = undefined;
			
			if( complete === false && pathStr[ 0 ] !== "/" )
			{
				pathWithSep = "/"+pathStr;
			}
			
			var foundMod = undefined
			
			for( var pos in reqs )
			{
				var currReq = reqs[ pos ];
				
				if(
					currReq === pathStr ||
					(
						pathWithSep !== undefined &&
						currReq.indexOf(
							pathWithSep,
							currReq.length - pathWithSep.length
						) !== -1
					)
				)
				{
					if( foundMod !== undefined )
					{
						throw new RuntimeError(
							"Provided module path search str matches "+
							"multiple modules",
							{ providedPathStr: pathStr }
						);
					}
					
					foundMod = pos;
				}
			}
			
			if( foundMod === undefined )
			{
				throw new RuntimeError(
					"Provided module path search str matches no modules",
					{ providedPathStr: pathStr }
				);
			}
			
			return mods[ foundMod ];
		});
		
		if( forFunc === "define" )
		{
			loadMod.require =
			getF(
			new FuncVer( [ "any" ], MODULE_S ),
			function( path )
			{
				if( isValidModulePath( path ) === false )
				{
					throw new RuntimeError(
						"Arg path isnt a valid module path",
						{ argPath: path }
					);
				}
				
				var mod = require( path );
				
				if( isValidModule( mod ) === false )
				{
					throw new RuntimeError(
					"Module path '"+path+"' didnt give a valid module",
					{ modulePath: path, yieldedModule: mod }
				);
				}
				
				return mod;
			});
		}
		else
		{
			loadMod.require =
			getF(
			new FuncVer( undefined, undefined, "any" ),
			function()
			{
				throw new RuntimeError(
					"mods.require() must not be called in "+
					"ourglobe.require()"
				);
			});
		}
		
		if( forFunc === "define" )
		{
			loadMod.nrMods = 0;
			
// Args name and obj may be "any" since they are always to be
// verified by mods.export()
			loadMods.export =
			getF(
			new FuncVer( [ "any", "any" ] ),
			function( name, obj )
			{
				if( typeof( name ) !== "string" )
				{
					throw new RuntimeError(
						"Arg name must be a str", { argName: name }
					);
				}
				
				exports[ name ] = obj;
				loadMod.nrMods++;
				
				if( isValidModule( exports ) === false )
				{
					throw new RuntimeError(
						"The export doesnt yield a valid module",
						{ argName: name, argObj: obj }
					);
				}
			});
			
		}
		else
		{
			loadMods.export =
			getF(
			new FuncVer( undefined, undefined, "any" ),
			function()
			{
				throw new RuntimeError(
					"mods.export() must not be called in "+
					"ourglobe.require()"
				);
			});
		}
	});
	
// cleanReqs() always performs validation of provided req paths,
// which is why the FuncVer only verifies that arg requirements
// is an arr
	var cleanReqs =
	getF(
	new FuncVer()
		.addArgs([ { values:[ "require", "define" ] }, "arr" ])
		.setReturn( { extraItems: MODULE_PATH_S } ),
	function( forFunc, requirements )
	{
		var newReqs = [];
		var reqsDic = [];
		
		for( var pos in requirements )
		{
			var currReq = requirements[ pos ];
			
			currReq =
				currReq.replace( /^\s+/, "" ).replace(/\s+$/, "" )
			;
			
			if( isValidModulePath( currReq ) === false )
			{
					throw new RuntimeError(
						"One of the module requirement paths isnt valid",
						{ providedReqPath: currReq, reqPathPos: pos },
						cleanReqs
					);
			}
			
			if( currReq === "require" || currReq === "exports" )
			{
				if( forFunc === "require" )
				{
					throw new RuntimeError(
						"The special modules 'require' and 'exports' must "+
						"not be used in ourglobe.require()",
						undefined,
						cleanReqs
					);
				}
			}
			else
			{
				if( reqsDic[ currReq ] !== undefined )
				{
					throw new RuntimeError(
						"Module '"+currReq+"' is being required multiple "+
						"times"
					);
				}
				
				reqsDic[ currReq ] = true;
				
				newReqs.push( currReq );
			}
		}
		
		return newReqs;
	});
	
	var verModules =
	getF(
	new FuncVer( [ { extraItems: MODULE_PATH_S }, "arr" ] ),
	function( reqPaths, mods )
	{
		for( var pos = 0; pos < mods.length-2; pos++ )
		{
			if( isValidModule( mods[ pos ] ) === false )
			{
				throw new RuntimeError(
					"Module path '"+reqPaths[ pos ]+"' didnt give a "+
					"valid module",
					{
						modulePath: reqPaths[ pos ],
						yieldedModule: mods[ pos ]
					}
				);
			}
		}
	});
	
	ourglobe.define =
	getF(
	new FuncVer()
		.addArgs( "func" )
		.addArgs( "arr/undef", "func" ),
	function( requirements, cb )
	{
		if( typeof( requirements ) === "function" )
		{
			cb = requirements;
			requirements = undefined;
		}
		
		if( requirements === undefined )
		{
			requirements = [];
		}
		
		var newReqs = cleanReqs( "define", requirements );
		
		newReqs.push( "require" )
		newReqs.push( "exports" )
		
		ourglobe.core.define(
			newReqs,
			getF(
			new FuncVer( undefined, undefined, "any" ),
			function()
			{
				var mods = Array.prototype.slice.call( arguments, 0 );
				
				verModules( newReqs, mods );
				
				var require = mods[ newReqs.length - 2 ];
				var exports = mods[ newReqs.length - 1 ];
				
				newReqs.pop();
				newReqs.pop();
				
				var loadMod =
				getLoadModFunc(
					"define", newReqs, mods, require, exports
				);
				
				var returnVar = cb( loadMod );
				
				if( returnVar !== undefined )
				{
					throw new RuntimeError(
						"The cb func of ourglobe.define() may not return a "+
						"var and must define the module by "+
						"mods.export()",
						{ returnVar: returnVar }
					);
				}
				
				if( loadMod.nrMods === 0 )
				{
					throw new RuntimeError(
						"A module wasnt defined in ourglobe.define()"
					);
				}
			});
		);
	});
	
	ourglobe.require =
	getF(
	new FuncVer( [ "arr", "func/undef" ] ),
	function( requirements, cb )
	{
		var newReqs = cleanReqs( "require", requirements );
		
		if( cb === undefined )
		{
			ourglobe.core.require( newReqs );
		}
		else
		{
			ourglobe.core.require(
				newReqs,
				getF(
				new FuncVer( undefined, undefined, "any" ),
				function()
				{
					var mods = Array.prototype.slice.call( arguments, 0 );
					
					verModules( newReqs, mods );
					
					var loadMod =
						getLoadModFunc( "require", newReqs, mods )
					;
					
					cb( loadMod );
				});
			);
		}
	});

	ourglobe.require(
	[
		"og/d/sys/ourglobeerror",
		"og/d/sys/runtimeerror",
		"og/d/conf/conf",
		"og/d/sys/sys",
		"og/d/verification/assert",
		"og/d/verification/Schema",
		"og/d/verification/funcver"
	],
	function( mods )
	{
		ourglobe.OurGlobeError =
			mods( "ourglobeerror" ).OurGlobeError
		;
		ourglobe.RuntimeError = mods( "runtimeerror" ).RuntimeError;
		ourglobe.conf = mods( "conf" ).conf;
		ourglobe.sys = mods( "sys" ).sys;
		ourglobe.assert = mods( "assert" ).assert;
		ourglobe.Schema = mods( "schema" ).Schema;
		ourglobe.FuncVer = mods( "funcver" ).FuncVer;
		
		ourglobe.require( [ jsFilePath ] );
	});
});
