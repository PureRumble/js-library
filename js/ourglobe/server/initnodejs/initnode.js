var jsFilePath = process.argv[ 2 ];

dojoConfig =
{
	baseUrl:
		"/home/work-purerumble/files/projects/ourglobe/js/ourglobe",
	packages:
	[
		{ name: "dojo", location: "../og/l/c/dtk/dojo" },
		{ name: "og/d/conf", location: "../og/d/conf" },
		{ name: "og/d/sys", location: "../og/d/sys" },
		{
			name: "og/d/verification",
			location: "../og/d/verification"
		},
		{ name: "og/d/utils", location: "../og/d/utils" },
		{ name: "og/d/testing", location: "../og/d/testing" },
	]
};

require( "og/l/c/dtk/dojo/dojo" );

ourglobe = {};
og = ourglobe;

var isValidModule = function( module )
{
	var returnVar =
		typeof( module ) === "object" &&
		Object.keys( module ).length > 0
	;
	
	return returnVar;
}

var oldReq = global.require;
var oldDef = global.define;

global.require = require;
delete global.define;

ourglobe.require =
function( requirements, cb )
{
	if( arguments.length < 1 || arguments.length > 2 )
	{
		throw new Error(
			"Between one and two args must be provided, but the "+
			"following args were provided:\n"+
			arguments
		);
	}
	
	if(
		typeof( requirements ) !== "string" &&
		(
			requirements instanceof Array === false ||
			requirements.length === 0
		)
	)
	{
		throw new Error(
			"Arg requirements must be a str or an arr with atleast "+
			"one item but is:\n"+
			requirements
		);
	}
	
	if(
		!(
			(
				typeof( requirements ) === "string" && cb === undefined
			) ||
			(
				cb === undefined ||
				typeof( cb ) === "function"
			)
		)
	)
	{
		throw new Error(
			"Arg cb must be a func or undef if arg requirements "+
			"is an arr, otherwise it must be undef. But "+
			"requirements and cb are:\n"+
			{ requirements: requirements, cb: cb }
		);
	}
	
	if( typeof( requirements ) === "string" )
	{
		var returnVar = oldReq( requirements );
		
		if( isValidModule( returnVar ) === false )
		{
			throw new Error(
				"'"+requirements+"' didnt return a valid module. It "+
				"gave the following:\n" + returnVar
			);
		}
		
		return returnVar;
	}
	else
	{
		oldReq(
			requirements,
			function()
			{
				for( var pos in arguments )
				{
					if( isValidModule( arguments[ pos ] ) === false )
					{
						throw new Error(
							"'"+requirements[ pos ]+"'' didnt give a valid "+
							"module. It gave the following:\n"+
							arguments[ pos ]
						);
					}
				}
				
				if( cb !== undefined )
				{
					cb.apply( cb, arguments );
				}
			}
		);
	}
};

ourglobe.define =
function( requirements, cb )
{
	if( arguments.length !== 2 )
	{
		throw new Error(
			"Exactly two args must be provided, but the "+
			"following args were provided:\n"+
			arguments
		);
	}
	
	if(
		requirements instanceof Array === false ||
		requirements.length === 0
	)
	{
		throw new Error(
			"Arg requirements must be an arr with atleast one item "+
			"but it is:\n"+
			requirements
		);
	}
	
	if( typeof( cb ) !== "function" )
	{
		throw new Error( "Arg cb must be a func but is:\n" + cb );
	}
	
	var exportsPos = -1;
	
	for( var pos in requirements )
	{
		if( requirements[ pos ] === "exports" )
		{
			if( exportsPos !== -1 )
			{
				throw new Error(
					"'exports' must be used only once when "+
					"defining a module"
				);
			}
			
			exportsPos = pos;
		}
	}
	
	if( exportsPos === -1 )
	{
		throw new Error(
			"When defining a module with ourglobe.define(), "+
			"the module must be defined via 'exports'"
		);
	}
	
	oldDef(
		requirements,
		function()
		{
			for( var pos in arguments )
			{
				if(
					exportsPos !== pos &&
					isValidModule( arguments[ pos ] ) === false
				)
				{
					throw new Error(
						"'"+requirements[ pos ]+"' didnt give a valid "+
						"module. It gave the following:\n"+
						arguments[ pos ]
					);
				}
			}
			
			var returnVar = cb.apply( cb, arguments );
			
			if( returnVar !== undefined )
			{
				throw new Error(
					"The cb that is passed to ourglobe.define() may "+
					"not return the module. The module must be defined"+
					"via 'exports'. But the following was returned:\n"+
					returnVar
				);
			}
			
			if( isValidModule( arguments[ exportsPos ] ) === false )
			{
				throw new Error(
					"A valid module wasnt defined. Instead the "+
					"following module was defined:\n"+
					arguments[ exportsPos ]
				);
			}
		}
	);
};

ourglobe.loadMods = function()
{
	var returnVar =
	{
		conf: og.require( "og/d/conf/conf" ).conf,
		OurGlobeError:
			og.require( "og/d/sys/ourglobeerror" ).OurGlobeError,
		RuntimeError:
			og.require( "og/d/sys/runtimeerror" ).RuntimeError,
		sys: og.require( "og/d/sys/sys" ).sys,
		assert: og.require( "og/d/verification/assert" ).assert,
		Schema: og.require( "og/d/verification/Schema" ).Schema,
		FuncVer: og.require( "og/d/verification/funcver").FuncVer
	};
	
	return returnVar;
}

var mods = ourglobe.loadMods();

ourglobe.conf = mods.conf;
ourglobe.sys = mods.sys;
ourglobe.OurGlobeError = mods.OurGlobeError;
ourglobe.RuntimeError = mods.RuntimeError;
ourglobe.assert = mods.assert;
ourglobe.Schema = mods.Schema;
ourglobe.FuncVer = mods.FuncVer;
