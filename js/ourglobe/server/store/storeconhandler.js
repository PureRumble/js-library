ourglobe.define(
[
	"ourglobe/dual/moremath",
	"./storedataruntimeerror",
	"./store",
	"./id",
	"./binary"
],
function( mods )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var getF = ourGlobe.getF;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

// An exception is made here to the rule of using mods.delay() to
// request in module classes. This is due to a technical
// limitation concerned with the use of Class.addStatic()

var Id = mods.get( "id" );
var Binary = mods.get( "binary" );

var StoreConHandler =
Class.create(
{

name: "StoreConHandler",
instVars:{ storeName: "final", conHolders: "final" },
constr:
[
function()
{
	return([
		getA(
			StoreConHandler.STORE_NAME_S,
			{
				extraItems:
				{
					req: true,
					extraProps: true,
					props:
						{ host: getV.R_PROPER_STR, port: getV.R_NON_NEG_INT }
				}
			}
		)
	]);
},
function StoreConHandler( storeName, conParams )
{
	this.storeName = storeName;
	this.conHolders = [];
	
	for( var pos in conParams )
	{
		var currConHolder = {};
		currConHolder.params = conParams[ pos ];
		currConHolder.con = undefined;
		
		this.conHolders[ pos ] = currConHolder;
	}
	
	this.randCurrCon();
}]

});

var storeNameS = getV.PROPER_STR_L;

Class.addStatic(
StoreConHandler,
{
// CONSTR_V is made for subclasses of StoreConHandler. Note
// that the FuncVer of the constructor of StoreConHandler
// does allow for more props in the items of conParams, while
// CONSTR_V doesnt
	CONSTR_V:
	getV(
		getA(
			storeNameS,
			{
				extraItems:
				{
					req: true,
					extraProps: false,
					props:
						{ host: getV.R_PROPER_STR, port:getV.R_NON_NEG_INT }
				}
			}
		)
	),
	
// The return vars of the funcs
// * getDateStoreObj()
// * restoreDate()
// * getIdStoreObj()
// * restoreId()
// * getBinaryStoreObj()
// * restoreBinary()
// are verified later and yield an err if invalid. That is why
// their FuncVers allow the funcs to return anything
	
	GET_DATE_STORE_OBJ_V: getV( getA( Date ), getR( "any" ) ),
	RESTORE_DATE_V: getV( getA( "str/obj/inst" ), getR( "any" ) ),
	
	GET_ID_STORE_OBJ_V: getV( getA( Id ), getR( "any" ) ),
	RESTORE_ID_V: getV( getA( "str/obj/inst" ), getR( "any" ) ),
	
	GET_BINARY_STORE_OBJ_V: getV( getA( Binary ), getR( "any" ) ),
	RESTORE_BINARY_V:
		getV( getA( "str/obj/inst" ), getR( "any" ) )
	,
	
	STORE_NAME_S: storeNameS,
	GET_OPEN_CON_V:
	getV(
		getA(
			{
				extraProps: false,
				props:
					{ host: getV.R_PROPER_STR, port: getV.R_NON_NEG_INT }
			},
			"func"
		)
	),
	ID_STR_S: Id.ID_STR_S
});

return StoreConHandler;

},
function( mods, StoreConHandler )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var getF = ourGlobe.getF;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var MoreMath = mods.get( "moremath" ).MoreMath;

var StoreDataRuntimeError =
	mods.get( "storedataruntimeerror" )
;
var Store = mods.get( "store" );
var Id = mods.get( "id");
var Binary = mods.get( "binary" );

Class.add(
StoreConHandler,
{

getCurrCon:
[
"final",
getA( "func" ),
function( cb )
{
	var conHolder = this.conHolders[ this.currCon ];
	
	if( conHolder.con !== undefined )
	{
		cb( undefined, conHolder.con );
		
		return;
	}
	
	this.getOpenCon(
	conHolder.params,
	getCb(
		this,
		getA( Error ),
		getA( "undef", "inst" ),
		function( err, con )
		{
			if( err !== undefined )
			{
				cb( err );
				
				return;
			}
			else
			{
				conHolder.con = con;
				
				cb( undefined, con );
			}
		}
	));
}],

randCurrCon:
[
"final",
function()
{
	var nrConHolders = this.conHolders.length;
	
	this.currCon = MoreMath.getRandInt( nrConHolders );
}],

getBinaryStoreObj:
[
"extendable",
getA.ANY_ARGS,
function()
{
	throw new RuntimeError(
		"All subclasses of StoreConHandler must extend "+
		"getBinaryStoreObj()",
		{ faultyClass: Class.getClassName( this ) }
	);
}],

restoreBinary:
[
"extendable",
getA.ANY_ARGS,
function()
{
	throw new RuntimeError(
		"All subclasses of StoreConHandler must extend "+
		"restoreBinary()",
		{ faultyClass: Class.getClassName( this ) }
	);
}],

getIdStoreObj:
[
"extendable",
StoreConHandler.GET_ID_STORE_OBJ_V,
function( id )
{
	return id.toString();
}],

restoreId:
[
"extendable",
StoreConHandler.RESTORE_ID_V,
function( idStr )
{
	return new Id( idStr );
}],

getDateStoreObj:
[
"extendable",
StoreConHandler.GET_DATE_STORE_OBJ_V,
function( date )
{
	return date.toISOString();
}],

restoreDate:
[
"extendable",
StoreConHandler.RESTORE_DATE_V,
function( date )
{
	var returnVar = undefined;
	
	try
	{
		returnVar = new Date( date );
	}
	catch( e )
	{
		returnVar = undefined;
	}
	
	if(
		hasT( date, "str" ) === false ||
		date.length !== 24 ||
		returnVar === undefined ||
		returnVar.toString() === "Invalid Date"
	)
	{
		throw new StoreDataRuntimeError(
			"A string representing a date in a correct form wasnt "+
			"provided when restoring a Date",
			{ providedVar: date }
		);
	}
	
	return returnVar;
}],

getStoreObj:
[
"final",
getA( "obj/arr" ),
getR( "obj/arr" ),
function( set )
{
	var copy = {};
	
	var stack = [ { set: set }, copy ];
	
	while( stack.length > 0 )
	{
		var dest = stack.pop();
		var source = stack.pop();
		
		if( hasT( source, "obj", "arr" ) === false )
		{
			if( source instanceof Id === true )
			{
				var id = this.getIdStoreObj( source );
				
				if(
					hasT( id, "str", "obj", "inst" ) === false ||
					hasT( id, "arr", "func" ) === true
				)
				{
					throw new StoreDataRuntimeError(
						"Inst func getIdStoreObj() (of class "+
						"StoreConHandler or a sub class) must return "+
						"a str, obj or an inst that isnt an arr or func",
						{ faultyReturnedVar: id }
					);
				}
				
				dest.id = id;
				
				continue;
			}
			else if( source instanceof Binary === true )
			{
				var binary = this.getBinaryStoreObj( source );
				
				if(
					hasT( binary, "str", "obj", "inst" ) === false ||
					hasT( binary, "arr", "func" ) === true
				)
				{
					throw new StoreDataRuntimeError(
						"Inst func getBinaryStoreObj() (of class "+
						"StoreConHandler or a sub class) must return "+
						"a str, obj or an inst that isnt an arr or func",
						{ faultyReturnedVar: binary }
					);
				}
				
				dest.binary = binary;
				
				continue;
			}
			else if( source instanceof Date === true )
			{
				var date = this.getDateStoreObj( source );
				
				if(
					hasT( date, "str", "obj", "inst" ) === false ||
					hasT( date, "arr", "func" ) === true
				)
				{
					throw new StoreDataRuntimeError(
						"Inst func getDateStoreObj() (of class "+
						"StoreConHandler or a sub class) must return "+
						"a str, obj or an inst that isnt an arr or func",
						{ faultyReturnedVar: date }
					);
				}
				
				dest.date = date;
				
				continue;
			}
		}
		
		for( var key in source )
		{
			if( key === "__proto__" || key === Store.STORE_SYS_PROP )
			{
				continue;
			}
			
			var nextSrc = source[ key ];
			
			if(
				hasT( nextSrc, "null", "bool", "number", "str" ) === true
			)
			{
				dest[ key ] = nextSrc;
			}
			else if(
				hasT( nextSrc, "inst" ) === true &&
				hasT( nextSrc, "obj", "arr", "func" ) === false
			)
			{
				dest[ key ] = {};
				
				stack.push( nextSrc );
				stack.push( dest[ key ] );
				
				if( nextSrc instanceof Date === false )
				{
					var srcClass = Class.getClass( nextSrc );
					
					if(
						hasT( srcClass, "func" ) === false ||
						hasT( srcClass.getStoreName, "func" ) === false
					)
					{
						throw new StoreDataRuntimeError(
							"The set that is to be prepared for the store "+
							"contains an instance of a class that isnt "+
							"Storable",
							{ faultyInst: nextSrc },
							undefined
						);
					}
					
					var storeName = srcClass.getStoreName();
					
					if(
						hasT( storeName, "str" ) === false  ||
						false ===
							Store.storableClasses.hasOwnProperty( storeName )
						||
						Store.storableClasses[ storeName ] !== srcClass
					)
					{
						throw new StoreDataRuntimeError(
							"The set that is to be prepared for the store "+
							"contains an instance of a Storable class that "+
							"hasnt been registered with Store.init() for "+
							"having its instances stored",
							{
								faultyInst: nextSrc,
								faultyClass: Class.getName( srcClass ),
								classStoreName: storeName
							},
							undefined
						);
					}
					
					dest[ key ][ Store.STORE_SYS_PROP ] = storeName;
				}
				else
				{
					dest[ key ][ Store.STORE_SYS_PROP ] =
						Store.DATE_STORE_NAME
					;
				}
			}
			else if( hasT( nextSrc, "obj", "arr" ) === true )
			{
				if( hasT( nextSrc, "obj" ) === true )
				{
					dest[ key ] = {};
				}
				else
				{
					dest[ key ] = [];
				}
				
				stack.push( nextSrc );
				stack.push( dest[ key ] );
			}
			else if( hasT( nextSrc, "undef", "func" ) === false )
			{
				throw new StoreDataRuntimeError(
					"The set that is to be prepared for the store "+
					"has a var of a type that isnt allowed",
					undefined,
					undefined
				);
			}
		}
	}
	
	return copy.set;
}],

throwRestoreErr:
[
"static",
getA( Error, "obj/arr", "obj" ),
function( err, restoringSet, systemObj )
{
	if( err instanceof StoreDataRuntimeError === true )
	{
		var ourGlobeVar = err.ourGlobeVar;
		
		if( ourGlobeVar === undefined )
		{
			ourGlobeVar = {};
		}
		
		ourGlobeVar.restoringSet = restoringSet;
		ourGlobeVar.systemObj = systemObj;
		
		err =
			new StoreDataRuntimeError(
				"An error occurred while restoring a system obj in the "+
				"set from the store: "+err.message,
				ourGlobeVar,
				undefined
			)
		;
	}
	
	throw err;
}],

restoreObj:
[
"final",
getA( "obj/arr" ),
getR( "obj/arr" ),
function( set )
{
	var initObj = { init:{ init: set } };
	
	var nextStack = [];
	var stack = [ initObj, "init" ];
	
	for( var currItem = 0; currItem < stack.length; currItem+=2 )
	{
		var outerSet = stack[ currItem ];
		var outerKey = stack[ currItem+1 ];
		
		var currSet = outerSet[ outerKey ];
		
		var currStoreName = currSet[ Store.STORE_SYS_PROP ];
		
		if(
			currStoreName === Store.DATE_STORE_NAME ||
			currStoreName === Store.ID_STORE_NAME ||
			currStoreName === Store.BINARY_STORE_NAME
		)
		{
			continue;
		}
		
		for( var currKey in currSet )
		{
			var currVar = currSet[ currKey ];
			
			if( hasT( currVar, "obj", "arr" ) === true )
			{
				if( Store.STORE_SYS_PROP in currVar === true )
				{
					if( hasT( currVar, "arr" ) === true )
					{
						throw new StoreDataRuntimeError(
							"An arr with a Store name has been found in a "+
							"set that is to be restored, but only objs may "+
							"have Store names"
						);
					}
					
					var currVarStoreName = currVar[ Store.STORE_SYS_PROP ];
					
// This check must be performed by hasOwnProperty() and NOT with
// []-lookup since if for instance currVarStoreName has been set
// to 'toString' then a []-lookup would approve and later when
// the inst is to be restored, the stored obj would be given to
// Object.toString() for restoration. Imagine now if Object is
// extended in the future with an eval() func...
					
					if(
						false ===
							Store.storableClasses.hasOwnProperty(
								currVarStoreName
							)
					)
					{
						throw new StoreDataRuntimeError(
							"A Store name, that hasnt been registered to a "+
							"Storable class with Store.init(), has been "+
							"found in a set that is to be restored"
						);
					}
					
					nextStack.push( currSet );
					nextStack.push( currKey );
				}
				
				stack.push( currSet );
				stack.push( currKey );
			}
			else if(
				
// currVar is allowed to be a func. Recall that currVar comes
// from currSet, which in turn has been give by the api/framework
// of the store in question. Such framework may do strange things
// to the objs such as currSet that it uses to relay the fetched
// query result to the caller
				
				false ===
					hasT(
						currVar,
						"undef",
						"null",
						"bool",
						"number",
						"str",
						"func"
					)
			)
			{
				throw new StoreDataRuntimeError(
					"A set that is to be restored from a store contains "+
					"a var that has an invalid type",
					{ faultyVar: currVar }
				);
			}
		}
	}
	
	while( nextStack.length > 0 )
	{
		var pointingKey = nextStack.pop();
		var holdingSet = nextStack.pop();
		
		var currVar = holdingSet[ pointingKey ];
		
		var typeValue = currVar[ Store.STORE_SYS_PROP ];
		
		if( typeValue === Store.DATE_STORE_NAME )
		{
			var date = undefined;
			try
			{
				date = this.restoreDate( currVar[ "date" ] );
			}
			catch( e )
			{
				StoreConHandler.throwRestoreErr( e, set, currVar );
			}
			
			if( date instanceof Date === false )
			{
				throw new StoreDataRuntimeError(
					"Inst funcs restoreDate() (of Class StoreConHandler "+
					"or a sub class of it) must return an inst of Date",
					{ faultyReturnedVar: date }
				);
			}
			
			holdingSet[ pointingKey ] = date;
		}
		else if( typeValue === Store.BINARY_STORE_NAME )
		{
			var binary = undefined;
			try
			{
				binary = this.restoreBinary( currVar[ "binary" ] );
			}
			catch( e )
			{
				StoreConHandler.throwRestoreErr( e, set, currVar );
			}
			
			if( binary instanceof Binary === false )
			{
				throw new StoreDataRuntimeError(
					"Inst funcs restoreBinary() (of Class "+
					"StoreConHandler or a sub class of it) must return "+
					"an inst of Binary",
					{ faultyReturnedVar: binary }
				);
			}
			
			holdingSet[ pointingKey ] = binary;
		}
		else if( typeValue === Store.ID_STORE_NAME )
		{
			var id = undefined;
			try
			{
				id = this.restoreId( currVar[ "id" ] );
			}
			catch( e )
			{
				StoreConHandler.throwRestoreErr( e, set, currVar );
			}
			
			if( id instanceof Id === false )
			{
				throw new StoreDataRuntimeError(
					"Inst funcs restoreId() (of Class StoreConHandler "+
					"or a sub class of it) must return an inst of Id",
					{ faultyReturnedVar: id }
				);
			}
			
			holdingSet[ pointingKey ] = id;
		}
		else
		{
			var ClassVar = Store.storableClasses[ typeValue ];
			
			var inst = ClassVar.restoreObj( currVar );
			
			if( inst instanceof ClassVar === false )
			{
				throw new StoreDataRuntimeError(
					"The static func restoreObj() of a Storable class "+
					"must return an instance of that class",
					{
						faultyClass: Class.getName( ClassVar ),
						faultyClassStoreName:typeValue
					}
				);
			}
			
			holdingSet[ pointingKey ] = inst;
		}
	}
	
	return initObj.init.init;
}]

});

});
