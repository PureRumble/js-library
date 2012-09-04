// Since this is the absolutely first call to requirejs, the
// module wont understand relative paths because it doesnt know
// what module package the relative path refers to. Thus
// modulehandler.js must be fetched via a path that is absolute
// compared to requirejs' baseUrl
ourglobe.core.define(
[
// ModuleHandler must be required first because it prepares
// definitions used by the RequireModuleHandler and
// DefineModuleHandler
	"./modulehandler",
	"./requiremodulehandler",
	"./definemodulehandler"
],
function(
	ModuleHandler,
	RequireModuleHandler,
	DefineModuleHandler
)
{

var RuntimeError = ourglobe.RuntimeError;
var sys = ourglobe.sys;
var getF = ourglobe.getF;
var getV = ourglobe.getV;
var FuncVer = ourglobe.FuncVer;

var ModuleUtils = {};
ModuleUtils.delayedCbs = [ [], [], [], [] ];

ModuleUtils.execDelayedCbs =
getF(
getV(),
function()
{
	for( var item = 0; item < ModuleUtils.delayedCbs.length; item++ )
	{
		var cbQueue = ModuleUtils.delayedCbs[ item ];
		
		while( cbQueue.length > 0 )
		{
			var delayedCb = cbQueue.pop();
			
			delayedCb();
		}
	}
});

ModuleUtils.delayCb =
getF(
getV()
	.addA( { gte: 0 }, "func" ),
function( delayOrder, cb )
{
	ModuleUtils.delayedCbs[ delayOrder ].push( cb );
});

ModuleUtils.delayHeaderCb =
getF(
getV()
	.addA( "func" ),
function( cb )
{
	ModuleUtils.delayCb( 0, cb );
});

ModuleUtils.delayFvConstr =
getF(
getV()
	.addA( "func" ),
function( cb )
{
	ModuleUtils.delayCb( 1, cb );
});

ModuleUtils.delayBodyDef =
getF(
getV()
	.addA( "func" ),
function( cb )
{
	ModuleUtils.delayCb( 2, cb );
});

ModuleUtils.delayBodyCb =
getF(
getV()
	.addA( "func" ),
function( cb )
{
	ModuleUtils.delayCb( 3, cb );
});

ModuleUtils.verDeps =
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
				ModuleUtils.verDeps
			);
		}
		
		if( currDep === "require" || currDep === "exports" )
		{
			throw new RuntimeError(
				"The special dependencies 'require' and 'exports' "+
				"may not be specified",
				undefined,
				undefined,
				ModuleUtils.verDeps
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
					ModuleUtils.verDeps
				);
			}
			
			depsDic[ currDep ] = true;
		}
	}
});

ModuleUtils.define =
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
	
	ModuleUtils.verDeps( dependencies );
	
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
			
			var modHandler =
				new DefineModuleHandler( newDeps, require )
			;
			
			var returnVar = cb( modHandler );
			
			modHandler.markHeaderDone();
			
			if( ModuleHandler.isValidModule( returnVar ) === false )
			{
				throw new RuntimeError(
					"The cb of ourglobe.define() didnt return "+
					"a valid module",
					{ returnedModule: returnVar }
				);
			}
			
			if( delayedCb !== undefined )
			{
				ModuleUtils.delayBodyDef(
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

ModuleUtils.require =
getF(
new FuncVer( [ "arr", "func/undef" ] ),
function( dependencies, cb )
{
	ModuleUtils.verDeps( dependencies );
	
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
			
// These two funcs are executed in this order since a delayed fv
// probably wants to use a variable pointer to a module that is
// part of a circular dependency, but that pointer is set by a
// delayed cb that has been registered with DefineModuleHandler
			ModuleUtils.execDelayedCbs();
			
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

return ModuleUtils;

});
