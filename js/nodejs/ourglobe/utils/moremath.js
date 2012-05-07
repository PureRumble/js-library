var conf = require("ourglobe").conf;
var assert = require("ourglobe").assert;
var FuncVer = require("ourglobe").FuncVer;

var MoreMath = {};

MoreMath.randInt = function( integer )
{
	if( conf.doVer() === true )
	{
		var fv = new FuncVer( [ { gte:0 } ], { gte:0 } )
			.verArgs( arguments)
		;
	}
	
	var returnVar = Math.floor( Math.random() * integer );
	
	if( conf.doVer() === true )
	{
		fv.verReturn( returnVar );
	}
	
	return returnVar;
}

exports.MoreMath = MoreMath;
