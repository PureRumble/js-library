var jsFilePath = process.argv[ 2 ];

dojoConfig =
{
	baseUrl:
		"/home/work-purerumble/files/projects/ourglobe/js/ourglobe",
	packages:
	[
		{ name: "dojo", location: "../og/l/c/dtk/dojo" },
		{ name: "og/d/conf", location: "../og/d/conf" }
	]
};

require( "og/l/c/dtk/dojo/dojo" );

ourglobe = {};
og = ourglobe;

global.require(
[ "dojo/_base/declare" ],
function( declare )
{
	var oldReq = global.require;
	var oldDef = global.define;
	var oldDec = declare;
	
	global.require = require;
	delete global.define;
	
	var resolveDep =
	function( returnCbVar, cb )
	{
		var returnVar =
			function()
			{
				for( var i = 0; i < arguments.length; i++ )
				{
					if(
						typeof( arguments[ i ] ) !== "object" &&
						typeof( arguments[ i ] ) !== "function"
					)
					{
						throw new Error(
							requirements[ i ] + " isnt a valid module"
						);
					}
				}
				
				var returnVar = cb.apply( cb, arguments );
				
				if( returnCbVar === true )
				{
					if(
						typeof( returnVar ) !== "object" &&
						typeof( returnVar ) !== "function"
					)
					{
						throw new Error(
							"The cb passed to ourglobe.define() didnt return "+
							"a valid module"
						);
					}
					
					return returnVar;
				}
			}
		;
		
		return returnVar;
	};
	
	ourglobe.require =
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
		
		if( requirements instanceof Array === false )
		{
			throw new Error(
				"Arg requirements must be an arr but is:\n"+
				requirements
			);
		}
		
		if( typeof( cb ) !== "function" )
		{
			throw new Error(
				"Arg cb must be a func but is:\n" + cb
			);
		}
		
		oldReq( requirements, resolveDep( false, cb ) );
	};
	
	ourglobe.define =
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
		
		if( requirements instanceof Array === false )
		{
			throw new Error(
				"Arg requirements must be an arr but is:\n"+
				requirements
			);
		}
		
		if( typeof( cb ) !== "function" )
		{
			throw new Error(
				"Arg cb must be a func but is:\n" + cb
			);
		}
		
		oldDef( requirements, resolveDep( true, cb ) );
	};
	
	ourglobe.declare =
	function( superclass, declaration )
	{
		if( typeof( superclass ) === "object" )
		{
			declaration = superclass;
		}
		
		if( superclass === undefined )
		{
			superclass = null;
		}
		
		if( declaration === undefined )
		{
			declaration = {};
		}
		
		if(
			typeof( superclass ) !== "function" &&
			superclass !== null
		)
		{
			throw new Error(
				"Arg superclass must be null or a func but is:\n"+
				superclass
			);
		}
		
		if( typeof( declaration ) !== "object" )
		{
			throw new Error(
				"Arg declaration must be an obj but is:\n"+
				declaration
			);
		}
		
		return oldDec( superclass, declaration );
	}
	
	require( jsFilePath );
});
