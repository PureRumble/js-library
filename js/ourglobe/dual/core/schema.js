ourglobe.core.define(
[],
function()
{

function Schema( schema )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 1 );
		
		ourglobe.assert.argType(
			"schema", schema, "obj", "str", "func", "arr"
		);
	}
	
	this.schema = schema;
}

Object.defineProperty(
Schema,
"getSchema",
{
value:
function()
{
	if( arguments.length === 0 )
	{
		throw new ourglobe.RuntimeError(
			"Atleast one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( arguments.length === 1 )
	{
		return new Schema( arguments[ 0 ] );
	}
	else
	{
		return new Schema( Array.prototype.slice.call( arguments ) );
	}
}
});

Schema.prototype.test = function( variable, varExists )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 1, 2 );
		
		ourglobe.assert.argType(
			"varExists", varExists, "bool", "undef"
		);
	}
	
	return Schema.test( this.schema, variable, varExists );
}

Object.defineProperty(
Schema,
"isSchema",
{
value:
function( variable )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 1 );
	}
	
	return Schema.test( Schema.META_SCHEMA, variable );
}
});

Object.defineProperty(
Schema,
"getSchemaProp",
{
value:
function( schema, props, types, allowEmptyArr )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 3, 4 );
		
		ourglobe.assert.argType( "schema", schema, "obj" );
		
		ourglobe.assert.argType( "props", props, "arr" );
		
		ourglobe.assert.argType( "types", types, "str", "arr" );
		
		ourglobe.assert.argType(
			"allowEmptyArr", allowEmptyArr, "bool", "undef"
		);
	}
	
	if( allowEmptyArr === undefined ) { allowEmptyArr = false; }
	
	if( ourglobe.sys.hasType( types, "arr" ) === false )
	{
		types = [types];
	}
	
	var propFound = undefined;
	var foundMany = false;
	
	for( var pos in props )
	{
		var prop = props[pos];
		
		if( schema[prop] !== undefined )
		{
			if( propFound !== undefined )
			{
				foundMany = true;
				break;
			}
			else
			{
				propFound = prop;
			}
		}
	}
	
	if( foundMany === true )
	{
		throw new ourglobe.SchemaError(
			"There are certain groups of props that are restricted "+
			"in such way that only one of them may occur in a schema",
			{ propGroup: props, schema: schema }
		);
	}
	
	if( propFound !== undefined )
	{
		var propVar = schema[ propFound ];
		
		var hasTypeArgs = [ propVar ].concat( types );
		
		var hasType =
			ourglobe.sys.hasType.apply(
				ourglobe.sys.hasType, hasTypeArgs
			)
		;
		
		if( hasType === false )
		{
			throw new ourglobe.SchemaError(
				"Prop '"+propFound+"' may have only one of certain "+
				"types",
				{
					propValue: propVar,
					allowedTypes: types,
					schema: schema
				}
			);
		}
		
		if(
			ourglobe.sys.hasType( propVar, "arr" ) === true &&
			allowEmptyArr === false &&
			propVar.length === 0
		)
		{
			throw new ourglobe.SchemaError(
				"Prop '"+propFound+"' of a schema may not be an "+
				"empty arr",
				{ propValue: propVar, schema: schema }
			);
		}
	}
	
	return propFound;
}
});

Object.defineProperty(
Schema,
"assertSingleSchemaProp",
{
value:
function( schema )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 3, undefined );
		
		ourglobe.assert.argType( "schema", schema, "obj" );
	}
	
	var foundProp = undefined;
	
	for( var pos = 1; pos < arguments.length; pos++ )
	{
		var currProp = arguments[ pos ];
		
		if( currProp !== undefined )
		{
			if( foundProp !== undefined )
			{
				throw new ourglobe.SchemaError(
					"A schema may have only one of the props '"+
					foundProp+"'' and '"+currProp+"'",
					{ schema: schema }
				);
			}
			
			foundProp = currProp;
		}
	}
}
});

Object.defineProperty(
Schema,
"fineResolve",
{
value:
function( schemas )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 1 );
		
		ourglobe.assert.argType(
			"schemas", schemas, "str", "obj", "func", "arr"
		);
	}
	
	if( ourglobe.sys.hasType( schemas, "arr", "obj" ) === true )
	{
		return schemas;
	}
	
	var schemaStr = schemas;
	schemaStr = schemaStr.replace( /\s/g, "" );
	
	if( schemaStr === "" || schemaStr === "+" )
	{
		return { required: schemaStr === "+" };
	}
	
	var req = false;
	
	var origSchemaStr = schemaStr;
	
	if( schemaStr.search( /^\+/ ) !== -1 )
	{
		req = true;
		schemaStr = schemaStr.replace( /^\+/, "" );
	}
	
	var strParts = schemaStr.split( "/" );
	
	for( var pos in strParts )
	{
		if( ourglobe.sys.isOurType( strParts[pos] ) === false )
		{
			throw new ourglobe.SchemaError(
				"'"+origSchemaStr+"' isnt a valid schema str "+
				"because '"+strParts[pos]+"' isnt a valid type"
			);
		}
		
	}
	
	var returnVar =
		req === false ?
		strParts :
		{ required:true, types:strParts }
	;
	
	return returnVar;
}
});

Object.defineProperty(
Schema,
"testChars",
{
value:
function( chars, areGood, str, charsProp )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 4 );
		
		ourglobe.assert.argType( "chars", chars, "str" );
		
		ourglobe.assert.argType( "areGood", areGood, "bool" );
		
		ourglobe.assert.argType( "str", str, "str" );
		
		ourglobe.assert.argType( "charsProp", charsProp, "str" );
	}
	
	chars = chars.replace( /\s/g, "" );
	
	if( chars.length === 0 )
	{
		return areGood === false || str.length === 0;
	}
	
	var testChars = chars.split( "/" );
	
	var charsRegEx = areGood === true ? "(?!" : "(";
	
	for( var pos in testChars )
	{
		var testChar = testChars[pos];
		
		var addToRegex = undefined;
		
		if( testChar === "letters" )
		{
			addToRegex = "[a-zA-Z]";
		}
		else if(
			testChar === "small" || testChar === "smallLetters"
		)
		{
			addToRegex = "[a-z]";
		}
		else if(
			testChar === "large" || testChar === "largeLetters"
		)
		{
			addToRegex = "[A-Z]";
		}
		else if( testChar === "digits" )
		{
			addToRegex = "[0-9]";
		}
		else if( testChar === "spaces" )
		{
			addToRegex = "\\s"
		}
		else if(
			testChar === "special" ||
			testChar === "specials" ||
			testChar === "specialChars" ||
			testChar === "specialCharacters"
		)
		{
			addToRegex = "[^a-zA-Z0-9\\s]";
		}
		else if(
			testChar === "under" ||
			testChar === "underscore" ||
			testChar === "underscores"
		)
		{
			addToRegex = "_";
		}
		else
		{
			throw new ourglobe.SchemaError(
				"'"+testChar+"' isnt a valid value to list "+
				"for prop '"+charsProp+"' in a schema"
			);
		}
		
		charsRegEx += addToRegex + "|";
	}
	
	charsRegEx = charsRegEx.replace( /\|$/, "" );
	
	charsRegEx += ")";
	
	charsRegEx = new RegExp( charsRegEx );
	
	var regExpSearch = str.search( charsRegEx );
	
	return regExpSearch === -1 || regExpSearch === str.length;
}
});

Object.defineProperty(
Schema,
"testMany",
{
value:
function( schemas, variable, varExists )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 3 );
		
		ourglobe.assert.argType( "varExists", varExists, "bool" );
		
		ourglobe.assert.argType(
			"schemas", schemas, "str", "obj", "func", "arr"
		);
	}
	
	if( ourglobe.sys.hasType( schemas, "arr" ) === false )
	{
		schemas = [schemas];
	}
	
	for( var pos in schemas )
	{
		var schema = schemas[pos];
		
		if(
			ourglobe.sys.hasType( schema, "str" ) === true ?
				Schema.schemaStrTest( schema, variable, varExists ) :
				
			ourglobe.sys.hasType( schema, "obj" ) === true ?
				Schema.test( schema, variable, varExists ) === true :
			
			ourglobe.sys.hasType( schema, "func" ) === true ?
				Schema.schemaClassTest( schema, variable, varExists ) :
			
			Schema.testMany( schema, variable, varExists ) === true
		)
		{
			return true;
		}
	}
	
	return false;
}
});

Object.defineProperty(
Schema,
"schemaClassTest",
{
value:
function( classFunc, variable, varExists )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 3 );
		
		ourglobe.assert.argType( "classFunc", classFunc, "func" );
		
		ourglobe.assert.argType( "varExists", varExists, "bool" );
	}
	
	return (
			varExists === false ||
			variable instanceof classFunc === true
	);
}
});

Object.defineProperty(
Schema,
"schemaStrTest",
{
value:
function( schemaStr, variable, varExists )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 3 );
		
		ourglobe.assert.argType( "schemaStr", schemaStr, "str" );
		
		ourglobe.assert.argType( "varExists", varExists, "bool" );
	}
	
	return (
		ourglobe.sys.isOurType( schemaStr ) === true ?
			varExists === false ||
			ourglobe.sys.hasType( variable, schemaStr ) === true :
			
		Schema.testMany(
			Schema.fineResolve( schemaStr ), variable, varExists
		) === true
	);
}
});

Object.defineProperty(
Schema,
"test",
{
value:
function( schema, variable, varExists )
{
	varExists = varExists === undefined ? true : varExists;
	
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 2, 3 );
		
		ourglobe.assert.argType(
			"schema", schema, "obj", "str", "func", "arr"
		);
		
		ourglobe.assert.argType( "varExists", varExists, "bool" );
		
		if( varExists === false && variable !== undefined )
		{
			throw new ourglobe.RuntimeError(
				"Arg variable must be undef if arg varExists is set to "+
				"true",
				{ providedArg: variable }
			);
		}
		
		if( ourglobe.sys.hasType( schema, "obj" ) === true )
		{
			for( var prop in schema )
			{
				if( !(
					prop === "req" ||
					prop === "required" ||
					prop === "types" ||
					prop === "goodTypes" ||
					prop === "badTypes" ||
					prop === "values" ||
					prop === "goodValues" ||
					prop === "props" ||
					prop === "properties" ||
					prop === "extraProps" ||
					prop === "extraProperties" ||
					prop === "minProps" ||
					prop === "minProperties" ||
					prop === "maxProps" ||
					prop === "maxProperties" ||
					prop === "nrProps" ||
					prop === "nrProperties" ||
					prop === "items" ||
					prop === "extraItems" ||
					prop === "minItems" ||
					prop === "maxItems" ||
					prop === "nrItems" ||
					prop === "denseItems" ||
					prop === "inherits" ||
					prop === "extends" ||
					prop === "keys" ||
					prop === "extraKeys" ||
					prop === "minKeys" ||
					prop === "maxKeys" ||
					prop === "nrKeys" ||
					prop === "minStrLen" ||
					prop === "minStrLength" ||
					prop === "minStringLength" ||
					prop === "maxStrLen" ||
					prop === "maxStrLength" ||
					prop === "maxStringLength" ||
					prop === "strPattern" ||
					prop === "stringPattern" ||
					prop === "chars" ||
					prop === "goodChars" ||
					prop === "badChars" ||
					prop === "gte" ||
					prop === "gt" ||
					prop === "ste" ||
					prop === "st"
				) )
				{
					throw new ourglobe.SchemaError(
						"'"+prop+"' isnt a schema prop", { schema: schema }
					);
				}
			}
		}
		
	}
	
	if( ourglobe.sys.hasType( schema, "obj" ) === false )
	{
		return Schema.testMany( schema, variable, varExists );
	}
	
	if( varExists === false )
	{
		var reqProp = Schema.getSchemaProp(
			schema, [ "req", "required" ], "bool"
		);
		
		var req = reqProp !== undefined ? schema[reqProp] : false;
		
		return req === false;
	}
	
	
	var goodProp =
		Schema.getSchemaProp(
			schema,
			[ "goodTypes", "types" ],
			[ "str", "obj", "func", "arr" ]
		)
	;
	
	if( goodProp !== undefined )
	{
		if(
			Schema.testMany(
				schema[goodProp], variable, varExists
			) === false
		)
		{ return false; }
	}
	
	var badProp =
		Schema.getSchemaProp(
			schema, [ "badTypes" ], [ "str", "obj", "func", "arr" ]
		)
	;
	
	if( badProp !== undefined )
	{
		if(
			Schema.testMany(
				schema[badProp], variable, varExists
			) === true
		)
		{ return false; }
	}
	
	var valuesProp =
		Schema.getSchemaProp(
			schema, [ "values", "goodValues" ], "arr"
		)
	;
	
	var values = undefined;
	
	if( valuesProp !== undefined )
	{
		values = schema[valuesProp];
		
		var matchesValue = false;
		
		for( var pos in values )
		{
			var value = values[pos];
			
			if(
				ourglobe.sys.hasType(
					value, "func", "obj", "arr"
				) === true
			)
			{
				throw new ourglobe.SchemaError(
					"Prop '"+valuesProp+"' of a schema may not contain "+
					"funcs, objs or arrs",
					{ propValue: values, schema: schema }
				);
			}
			
			if( variable === value )
			{
				matchesValue = true;
			}
		}
		
		if( matchesValue === false ) { return false; }
	}
	
	if( ourglobe.sys.hasType( variable, "inst" ) === true )
	{
		if( ourglobe.sys.hasType( variable, "obj", "arr" ) === true )
		{
			var obj = variable;
			var isArr = ourglobe.sys.hasType( variable, "arr" );
			
			var keysProp = isArr === true ?
				Schema.getSchemaProp(
					schema, [ "items", "keys" ], [ "obj", "arr" ],
					true
				) :
				
				Schema.getSchemaProp(
					schema,
					[ "props", "properties", "keys" ],
					[ "obj", "arr" ],
					true
				)
			;
			
			var extraKeysProp = isArr === true ?
				Schema.getSchemaProp(
					schema,
					[ "extraItems", "extraKeys" ],
					[ "bool", "str", "func", "obj", "arr" ]
				) :
				
				Schema.getSchemaProp(
					schema,
					[ "extraProps", "extraProperties", "extraKeys" ],
					[ "bool", "str", "func", "obj", "arr" ]
				)
			;
			
			var minKeysProp = isArr === true ?
				Schema.getSchemaProp(
					schema, [ "minItems", "minKeys", ], "int"
				) :
				
				Schema.getSchemaProp(
					schema,
					[ "minProps", "minProperties", "minKeys", ],
					"int"
				)
			;
			
			var maxKeysProp = isArr === true ?
				Schema.getSchemaProp(
					schema, [ "maxItems", "maxKeys", ], "int"
				) :
				
				Schema.getSchemaProp(
					schema,
					[ "maxProps", "maxProperties", "maxKeys", ],
					"int"
				)
			;
			
			var nrKeysProp = isArr === true ?
				Schema.getSchemaProp(
					schema, [ "nrItems", "nrKeys", ], "int"
				) :
				
				Schema.getSchemaProp(
					schema, [ "nrProps", "nrProperties", "nrKeys", ], "int"
				)
			;
			
			Schema.assertSingleSchemaProp(
				schema, minKeysProp, nrKeysProp
			);
			
			Schema.assertSingleSchemaProp(
				schema, maxKeysProp, nrKeysProp
			);
			
			var keys = undefined;
			
			if( keysProp !== undefined )
			{
				keys = schema[keysProp];
				
				for( var key in keys )
				{
					if(
						Schema.testMany(
							keys[key], obj[key], key in obj
						) === false
					)
					{
						return false;
					}
				}
			}
			
			var extraKeys = extraKeysProp !== undefined ?
				schema[extraKeysProp] :
				true
			;
			
			if( extraKeys !== true )
			{
				var currKeys = keys !== undefined ? keys : {};
				
				var hasExtraKey = false;
				
				for( var key in obj )
				{
					if( key in currKeys === false )
					{
						hasExtraKey = true;
						
						if(
							extraKeys === false ||
							Schema.testMany(
								extraKeys, obj[key], true
							) === false
						)
						{
							return false;
						}
					}
				}
				
				if(
					hasExtraKey === false &&
					ourglobe.sys.hasType( extraKeys, "bool" ) === false &&
					Schema.test(
						extraKeys, undefined, false
					) === false
				)
				{
					return false;
				}
			}
			
			var nrActualKeys =
				minKeysProp !== undefined ||
				maxKeysProp !== undefined ||
				nrKeysProp !== undefined ?
				Object.keys( obj ).length :
				undefined
			;
			
			var minKeys = undefined;
			
			if( minKeysProp !== undefined )
			{
				minKeys = schema[minKeysProp];
				
				if( minKeys < 0 )
				{
					throw new ourglobe.SchemaError(
						"Prop '"+minKeysProp+"' of a schema must be a "+
						"non-neg",
						{ propValue: minKeys, schema: schema }
					);
				}
				
				if( nrActualKeys < minKeys ){ return false; }
			}
			
			var maxKeys = undefined;
			
			if( maxKeysProp !== undefined )
			{
				maxKeys = schema[maxKeysProp];
				
				if(
					maxKeys < 0 ||
					( minKeys !== undefined && maxKeys < minKeys )
				)
				{
					throw new ourglobe.SchemaError(
						"Prop '"+maxKeysProp+"' of a schema must be a "+
						"non-neg int greater than prop '"+minKeysProp+
						"' (if the latter is set)",
						{
							maxKeysPropValue: maxKeys,
							minKeysPropValue: minKeys,
							schema: schema
						}
					);
				}
				
				if( nrActualKeys > maxKeys ){ return false; }
			}
			
			var nrKeys = undefined;
			
			if( nrKeysProp !== undefined )
			{
				nrKeys = schema[nrKeysProp];
				
				if( nrKeys < 0 )
				{
					throw new ourglobe.SchemaError(
						"Prop '"+nrKeysProp+"' of a schema must be a "+
						"non-neg int",
						{ propValue: nrKeys, schema: schema }
					);
				}
				
				if( nrActualKeys !== nrKeys ){ return false; }
			}
			
			if( isArr === true )
			{
				var arr = obj;
				
				var denseItemsProp = Schema.getSchemaProp(
					schema, [ "denseItems" ], "bool"
				);
				
				var denseItems = undefined;
				
				if(
					denseItemsProp !== undefined &&
					schema[denseItemsProp] !== false
				)
				{
					denseItems = schema[denseItemsProp];
					
					for(
						var nrDenseItems = 0;
						nrDenseItems in arr === true;
						nrDenseItems++
					)
					{ }
					
					if( nrDenseItems !== arr.length ){ return false; }
				}
			}
		}
		
		var inheritsProp = Schema.getSchemaProp(
			schema, [ "inherits", "extends" ], [ "func", "arr" ]
		);
		
		var inherits = undefined;
		
		if( inheritsProp !== undefined )
		{
			inherits = schema[inheritsProp];
			
			if( ourglobe.sys.hasType( inherits, "func" ) === true )
			{
				inherits = [ inherits ];
			}
			
			var doesInherit = false;
			
			for( var pos in inherits )
			{
				var inheritsFunc = inherits[pos];
				
				if(
					ourglobe.sys.hasType( inheritsFunc, "func" ) === false
				)
				{
					throw new ourglobe.SchemaError(
						"Prop '"+inheritsProp+"' of a schema must "+
						"specify funcs",
						{ propValue: inherits, schema: schema }
					);
				}
				
				if( variable instanceof inheritsFunc === true )
				{
					doesInherit = true;
				}
			}
			
			if( doesInherit === false ){ return false; }
		}
	}
	else if( ourglobe.sys.hasType( variable, "str" ) === true )
	{
		var str = variable;
		
		var minStrLenProp =
			Schema.getSchemaProp(
				schema,
				[ "minStrLen", "minStrLength", "minStringLength" ],
				"int"
			)
		;
		
		var maxStrLenProp =
			Schema.getSchemaProp(
				schema,
				[ "maxStrLen", "maxStrLength", "maxStringLength" ],
				"int"
			)
		;
		
		var strPatternProp =
			Schema.getSchemaProp(
				schema, [ "strPattern", "stringPattern" ], "str"
			)
		;
		
		var goodCharsProp =
			Schema.getSchemaProp(
				schema, [ "chars", "goodChars" ], "str"
			)
		;
		
		var badCharsProp =
			Schema.getSchemaProp(
				schema, [ "badChars" ], "str"
			)
		;
		
		Schema.assertSingleSchemaProp(
			schema, goodCharsProp, badCharsProp
		);
		
		var minStrLen = undefined;
		
		if( minStrLenProp !== undefined )
		{
			minStrLen = schema[minStrLenProp];
			
			if( minStrLen < 0 )
			{
				throw new ourglobe.SchemaError(
					"Prop '"+minStrLenProp+"' of a schema must be a "+
					"non-neg int",
					{ minStrLenPropValue: minStrLen, schema: schema }
				);
			}
			
			if( str.length < minStrLen ) { return false; }
		}
		
		var maxStrLen = undefined;
		
		if( maxStrLenProp !== undefined )
		{
			maxStrLen = schema[maxStrLenProp];
			
			if(
				maxStrLen < 0 ||
				( minStrLen !== undefined && maxStrLen < minStrLen )
			)
			{
				throw new ourglobe.SchemaError(
					"Prop '"+maxStrLenProp+"' of a schema "+
					"must be non-neg int and greater than prop '"+
					minStrLenProp+"' (if the latter is set)",
					{
						minStrLenPropValue: minStrLen,
						maxStrLenPropValue: maxStrLen,
						schema: schema
					}
					
				);
			}
			
			if( str.length > maxStrLen ) { return false; }
		}
		
		if( strPatternProp !== undefined )
		{
			var strPattern = schema[ strPatternProp ];
			var regExp = undefined;
			
			try
			{
				regExp = new RegExp( strPattern );
			}
			catch( e )
			{
				throw new ourglobe.SchemaError(
					"Prop '"+strPatternProp+"' isnt a valid regular "+
					"expression string",
					{ propValue: strPattern, schema: schema }
				);
			}
			
			var searchRes = str.search( regExp );
			
			if( searchRes === -1 || searchRes === str.length )
			{
				return false;
			}
		}
		
		if(
			goodCharsProp !== undefined &&
			Schema.testChars(
				schema[goodCharsProp], true, str, goodCharsProp
			) === false
		)
		{
			return false;
		}
		
		if(
			badCharsProp !== undefined &&
			Schema.testChars(
				schema[badCharsProp], false, str, badCharsProp
			) === false
		)
		{
			return false;
		}
	}
	else if( ourglobe.sys.hasType( variable, "number" ) === true )
	{
		var number = variable;
		
		var gteProp =
			Schema.getSchemaProp( schema, [ "gte" ], "number" )
		;
		
		var gtProp =
			Schema.getSchemaProp( schema, [ "gt" ], "number" )
		;
		
		Schema.assertSingleSchemaProp( schema, gteProp, gtProp );
		
		var steProp =
			Schema.getSchemaProp( schema, [ "ste" ], "number" )
		;
		
		var stProp =
			Schema.getSchemaProp( schema, [ "st" ], "number" )
		;
		
		Schema.assertSingleSchemaProp( schema, steProp, stProp );
		
		var gte =
			gteProp !== undefined ? schema[gteProp] : undefined
		;
		var gt =
			gtProp !== undefined ? schema[gtProp] : undefined
		;
		var ste =
			steProp !== undefined ? schema[steProp] : undefined
		;
		var st =
			stProp !== undefined ? schema[stProp] : undefined
		;
		
		if( gte > ste || gte >= st || gt >= ste || gt >= st )
		{
			throw new ourglobe.SchemaError(
				"The props gte, gt, ste and st of a schema may not be "+
				"set to values that are impossible to uphold",
				{
					propGtValue: gt,
					propGteValue: gte,
					propStValue: st,
					propSteValue: ste,
					schema: schema
				}
			);
		}
		
		if(
			number < gte ||
			number <= gt ||
			number > ste ||
			number >= st
		)
		{
			return false;
		}
	}
	
	if( goodProp === undefined )
	{
		var hasArrProp =
			schema["items"] !== undefined ||
			schema["keys"] !== undefined ||
			schema["extraItems"] !== undefined ||
			schema["extraKeys"] !== undefined ||
			schema["minItems"] !== undefined ||
			schema["minKeys"] !== undefined ||
			schema["maxItems"] !== undefined ||
			schema["maxKeys"] !== undefined ||
			schema["nrItems"] !== undefined ||
			schema["nrKeys"] !== undefined ||
			schema["denseItems"] !== undefined
		;
		var hasObjProp =
			schema["props"] !== undefined ||
			schema["properties"] ||
			schema["keys"] !== undefined ||
			schema["extraProps"] !== undefined ||
			schema["extraProperties"] !== undefined ||
			schema["extraKeys"] !== undefined ||
			schema["minProps"] !== undefined ||
			schema["minProperties"] !== undefined ||
			schema["minKeys"] !== undefined ||
			schema["maxProps"] !== undefined ||
			schema["maxProperties"] !== undefined ||
			schema["maxKeys"] !== undefined ||
			schema["nrProps"] !== undefined ||
			schema["nrProperties"] !== undefined ||
			schema["nrKeys"] !== undefined
		;
		var hasInstProp =
			schema["inherits"] !== undefined ||
			schema["extends"] !== undefined
		;
		var hasStrProp =
			schema["minStrLen"] !== undefined ||
			schema["minStrLength"] !== undefined ||
			schema["minStringLength"] !== undefined ||
			schema["maxStrLen"] !== undefined ||
			schema["maxStrLength"] !== undefined ||
			schema["maxStringLength"] !== undefined ||
			schema["strPattern"] !== undefined ||
			schema["stringPattern"] !== undefined ||
			schema["chars"] !== undefined ||
			schema["goodChars"] !== undefined ||
			schema["badChars"] !== undefined
		;
		var hasIntProp =
			schema["gte"] !== undefined ||
			schema["gt"] !== undefined ||
			schema["ste"] !== undefined ||
			schema["st"] !== undefined
		;
		
		if(
			(
				hasArrProp === true ||
				hasObjProp === true ||
				hasInstProp === true ||
				hasStrProp === true ||
				hasIntProp === true
			)
			&&
			!(
				(
					ourglobe.sys.hasType( variable, "arr" ) === true &&
					hasArrProp === true
				)
				||
				(
					ourglobe.sys.hasType( variable, "obj" ) === true &&
					hasObjProp === true
				) ||
				(
					ourglobe.sys.hasType( variable, "inst" ) === true &&
					hasInstProp === true
				) ||
				(
					ourglobe.sys.hasType( variable, "str" ) === true &&
					hasStrProp === true
				) ||
				(
					ourglobe.sys.hasType( variable, "int" ) === true &&
					hasIntProp === true
				)
			)
		)
		{
			return false;
		}
	}
	
	return true;
}
});

Object.defineProperty(
	Schema,
	"NON_EMPTY_STR",
	{ value:{ minStrLen:1 } }
);
Object.defineProperty(
	Schema,
	"R_NON_EMPTY_STR",
	{ value:{ req:true, minStrLen:1 } }
);
Object.defineProperty(
	Schema,
	"NON_EMPTY_STR_L",
	{ value:{ minStrLen:1, chars:"letters" } }
);
Object.defineProperty(
	Schema,
	"R_NON_EMPTY_STR_L",
	{ value:{ req:true, minStrLen:1, chars:"letters" } }
);

Object.defineProperty(
	Schema,
	"PROPER_STR",
	{ value: Schema.NON_EMPTY_STR }
);
Object.defineProperty(
	Schema,
	"R_PROPER_STR",
	{ value: Schema.R_NON_EMPTY_STR }
);
Object.defineProperty(
	Schema,
	"PROPER_STR_L",
	{ value: Schema.NON_EMPTY_STR_L }
);
Object.defineProperty(
	Schema,
	"R_PROPER_STR_L",
	{ value: Schema.R_NON_EMPTY_STR_L }
);

Object.defineProperty(
	Schema,
	"NON_EMPTY_OBJ",
	{ value: { minProps:1 } }
);
Object.defineProperty(
	Schema,
	"R_NON_EMPTY_OBJ",
	{ value: { req:true, minProps:1 } }
);

Object.defineProperty(
	Schema,
	"PROPER_OBJ",
	{ value: Schema.NON_EMPTY_OBJ }
);
Object.defineProperty(
	Schema,
	"R_PROPER_OBJ",
	{ value: Schema.R_NON_EMPTY_OBJ }
);

Object.defineProperty(
	Schema,
	"NON_NEG_INT",
	{ value:{ gte:0 } }
);
Object.defineProperty(
	Schema,
	"R_NON_NEG_INT",
	{ value:{ req:true, gte:0 } }
);
Object.defineProperty(
	Schema,
	"POS_INT",
	{ value:{ gt:0 } }
);
Object.defineProperty(
	Schema,
	"R_POS_INT",
	{ value:{ req:true, gt:0 } }
);

Object.defineProperty(
	Schema,
	"META_SCHEMA_STR",
	{ value: "str/arr/obj/undef" }
);

Object.defineProperty(
Schema,
"META_SCHEMA",
{
value:
{
	goodTypes: [ "arr", "str", "obj" ],
	
	extraItems: { required: true },
	
	properties:
	{
		req: "bool/undef",
		required: "bool/undef",
		
		types: Schema.META_SCHEMA_STR,
		goodTypes: Schema.META_SCHEMA_STR,
		badTypes: Schema.META_SCHEMA_STR,
		
		values: "arr/undef",
		goodValues: "arr/undef",
		
		props: "obj/arr/undef",
		properties: "obj/arr/undef",
		items: "obj/arr/undef",
		keys: "obj/arr/undef",
		
		extraProps: Schema.META_SCHEMA_STR+"/bool",
		extraProperties: Schema.META_SCHEMA_STR+"/bool",
		extraItems: Schema.META_SCHEMA_STR+"/bool",
		extraKeys: Schema.META_SCHEMA_STR+"/bool",
		
		minProps: "int/undef",
		minProperties: "int/undef",
		minItems: "int/undef",
		minKeys: "int/undef",
		
		maxProps: "int/undef",
		maxProperties: "int/undef",
		maxItems: "int/undef",
		maxKeys: "int/undef",
		
		nrProps: "int/undef",
		nrProperties: "int/undef",
		nrItems: "int/undef",
		nrKeys: "int/undef",
		
		denseItems: "bool/undef",
		
		inherits: "func/arr/undef",
		extends: "func/arr/undef",
		
		minStrLen: "int/undef",
		minStrLength: "int/undef",
		minStringLength: "int/undef",
		
		maxStrLen: "int/undef",
		maxStrLength: "int/undef",
		maxStringLength: "int/undef",
		
		strPattern: "str/undef",
		stringPattern: "str/undef",
		
		chars: "str/undef",
		goodChars: "str/undef",
		badChars: "str/undef",
		
		gte: "number/undef",
		gt: "number/undef",
		ste: "number/undef",
		st: "number/undef"
	},
	
	extraProperties: false
}
});

Schema.META_SCHEMA.extraItems.goodTypes = Schema.META_SCHEMA;

return Schema;

});
