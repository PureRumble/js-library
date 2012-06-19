var MoreObject = {};

MoreObject.getClass = function( obj )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 1 );
	}
	
	if( obj instanceof Object === false )
	{
		return undefined;
	}
	
	return obj.constructor;
}

MoreObject.buildStrRec = function(
	variable, strBuf, stack, indent
)
{
	if( conf.doVer() === true )
	{
		if( arguments.length !== 4 )
		{
			throw new RuntimeError(
				"Exactly four arguments must be provided"
			);
		}
		
		if( strBuf instanceof Array === false )
		{
			throw new RuntimeError(
				"Arg strBuf must be an array"
			);
		}
		
		if( stack instanceof Array === false )
		{
			throw new RuntimeError(
				"Arg stack must be an array"
			);
		}
		
		if( typeof( indent ) !== "string" && indent !== undefined )
		{
			throw new RuntimeError(
				"Arg indent must be undefined or a string"
			);
		}
	}
	
	if( sys.hasType( variable, "obj", "arr" ) === true )
	{
		if( variable instanceof Buffer === true )
		{
			strBuf.push(
				"[ Buffer object: "+variable.toString( "base64" ) + " ]"
			);
			
			return strBuf;
		}
		else if( variable instanceof Date === true )
		{
			strBuf.push(
				"[ Date object: "+variable.toISOString()+" ]"
			);
			
			return strBuf;
		}
		
		var isObj = sys.hasType( variable, "obj" );
		
		for( var pos = 0; pos < stack.length; pos++ )
		{
			var level = stack.length - pos;
			
			if( stack[pos] === variable )
			{
				strBuf.push(
					"[ recursive " +
					( isObj === true ? "object" : "array" ) + " "+
					"from "+level+" level(s) up ]"
				);
				
				return strBuf;
			}
		}
		
		var lineBreak = indent !== undefined ? "\n" : "";
		var space = indent !== undefined ? " " : "";
		var currIndent = indent !== undefined ? indent+" " : "";
		var lastIndent = indent !== undefined ? indent : "";
		var isEmpty = true;
		
		strBuf.push( isObj === true ? "{" : "[" );
		stack.push( variable );
		
		for( var key in variable )
		{
			isEmpty = false;
			
			var currVar = variable[key];
			
			strBuf.push( lineBreak+currIndent+key+":"+space );
			
			MoreObject.buildStrRec(
				currVar,
				strBuf,
				stack,
				indent !== undefined ? currIndent : undefined
			);
			
			strBuf.push( "," );
		}
		
		if( isEmpty === false )
		{
			strBuf.pop(); strBuf.push( lineBreak );
		}
		
		stack.pop();
		
		strBuf.push(
			( isEmpty === false ? lastIndent : "" ) +
			( isObj === true ? "}" : "]" )
		);
	}
	else if( sys.hasType( variable, "func" ) === true )
	{
		strBuf.push( "[ function ]" );
	}
	else if( sys.hasType( variable, "str" ) === true )
	{
		strBuf.push(
			"\""+
			variable.replace( "\\", "\\\\" ).replace( "\"", "\\\"" )+
			"\""
		);
	}
	else
	{
		strBuf.push( ""+variable );
	}
	
	return strBuf;
}

MoreObject.getStr = function( variable, readable )
{
	if( conf.doVer() === true )
	{
		if( arguments.length !== 2 )
		{
			throw new RuntimeError(
				"Between one and two args must be provided"
			);
		}
		
		if( typeof( readable ) !== "boolean" )
		{
			throw new RuntimeError(
				"Arg readable must be a bool or undef"
			);
		}
		
		if( readable !== true )
		{
			throw new RuntimeError(
				"Currently MoreObject.getStr() may only be used to "+
				"produce readable string representations of objects"
			);
		}
	}
	
	var returnVar =
		MoreObject.buildStrRec(
			variable, [], [], readable === true ? "" : undefined
		)
			.join( "" )
	;
	
	return returnVar;
}

MoreObject.getPrettyStr = function( variable )
{
	if( conf.doVer() === true )
	{
		if( arguments.length !== 1 )
		{
			throw new RuntimeError(
				"Exactly one arg must be provided"
			);
		}
	}
	
	return MoreObject.getStr( variable, true );
}

exports.MoreObject = MoreObject;

var RuntimeError = require("ourglobe/sys/errors").RuntimeError;

var conf = require("ourglobe/conf/conf").conf;
var assert = require("ourglobe/verification/assert").assert;
var sys = require("ourglobe/sys/sys").sys;
