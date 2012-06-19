function VarVer( schema, variable )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 1, 2 );
		
		assert.argType(
			"schema", schema, "obj", "arr", "str", "func"
		);
	}
	
	this.schema = schema;
	
	if( arguments.length === 2 ){ this.verVar( variable ); }
}

VarVer.prototype.verVar = function( variable )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 1 );
	}
	
	if( Schema.test( this.schema, variable ) === true )
	{
		return this;
	}
	
	throw new VarVerError(
		"This VarVer doesnt approve the provided variable. The "+
		"VarVer and variable are:"+
		MoreObject.getPrettyStr( {
			"VarVer":this, "variable":variable
		} ),
		this,
		variable,
		VarVer.prototype.verVar
	);
}

var VarVerError = require("./errors").VarVerError;

var conf = require("ourglobe/conf/conf").conf;
var assert = require("./assert").assert;
var MoreObject = require("ourglobe/utils/moreobject").MoreObject;
var Schema = require("ourglobe/verification/schema").Schema;

exports.VarVer = VarVer;
