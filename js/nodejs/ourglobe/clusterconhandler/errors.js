var RuntimeError = require("ourglobe").RuntimeError;

var conf = require("ourglobe").conf;
var sys = require("ourglobe").sys;
var FuncVer = require("ourglobe").FuncVer;

function ClusterDataRuntimeError(
	msg, invalidData, caller
)
{
	if( conf.doVer() === true )
	{
		new FuncVer( [
				FuncVer.PROPER_STR, "any", "func/undef"
		] )
			.verArgs( arguments )
		;
	}
	
	this.invalidData = invalidData;
	
	if( caller === undefined ){ caller = ClusterDataRuntimeError; }
	
	ClusterDataRuntimeError.super_.call( this, msg, caller );
}
sys.inherits( ClusterDataRuntimeError, RuntimeError );

exports.ClusterDataRuntimeError = ClusterDataRuntimeError;
