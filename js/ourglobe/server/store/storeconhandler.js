ourglobe.define(
[
	"ourglobe/dual/moremath",
	"./storedataruntimeerror",
	"./id",
	"./binary",
	"./link",
	"./cache"
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
var Link = mods.get( "link" );
var Cache = mods.get( "cache" );

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
	COLLECTION_NAME_S: getV.PROPER_STR_L,
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
	OUR_GLOBE_SYS_KEY: "ourGlobeSysSet",
	OUR_GLOBE_SYS_VALUE:
		"={F|6yOA&,3J)d,{b+$~7q__=W&>{Z7]"+
		"*5;J^1'730O3#3l1814_D13{S7hL",
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
var Id = mods.get( "id");
var Binary = mods.get( "binary" );
var Link = mods.get( "link" );
var Cache = mods.get( "cache" );

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
			dest[ StoreConHandler.OUR_GLOBE_SYS_KEY ] =
				StoreConHandler.OUR_GLOBE_SYS_VALUE
			;
			
			if( source instanceof Id === true )
			{
				dest.type = "Id";
				dest.id = this.getIdStoreObj( source );
				
				continue;
			}
			else if( source instanceof Binary === true )
			{
				dest.type = "Binary";
				dest.binary = this.getBinaryStoreObj( source );
				
				continue;
			}
			else if( source instanceof Date === true )
			{
				dest.type = "Date";
				dest.date = this.getDateStoreObj( source );
				
				continue;
			}
			else if( source instanceof Link === true )
			{
				dest.type = "Link";
				dest.collection = source.getCollection();
				
				stack.push( { id: source.getId() } );
				stack.push( dest );
				
				continue;
			}
			else if( source instanceof Cache === true )
			{
				dest.type = "Cache";
			}
		}
		
		for( var key in source )
		{
			if( key === "__proto__" )
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
				if(
					nextSrc instanceof Id === true ||
					nextSrc instanceof Binary === true ||
					nextSrc instanceof Date === true ||
					nextSrc instanceof Link === true ||
					nextSrc instanceof Cache === true
				)
				{
					dest[ key ] = {};
					
					stack.push( nextSrc );
					stack.push( dest[ key ] );
				}
				else
				{
					throw new StoreDataRuntimeError(
						"The set that is to be prepared for the store "+
						"contains an instance of a class that isnt "+
						"allowed",
						{ invalidClass: Class.getClassName( nextSrc ) },
						undefined,
						StoreConHandler.getStoreObj
					);
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
			else if( hasT( nextSrc, "func" ) === true )
			{
				throw new StoreDataRuntimeError(
					"The set that is to be prepared for the store "+
					"has a var of a type that isnt allowed",
					undefined,
					undefined,
					StoreConHandler.getStoreObj
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
				undefined,
				StoreConHandler.restoreObj
			)
		;
	}
	
	throw err;
}],

restoreObj:
[
"extendable",
getA( "obj/arr" ),
function( set )
{
	var stack = [ { init: set }, "init" ];
	
	while( stack.length > 0 )
	{
		var pointingKey = stack.pop();
		var holdingSet = stack.pop();
		
		var currVar = holdingSet[ pointingKey ];
		
		if(
			hasT( currVar, "null", "bool", "number", "str" ) === true
		)
		{
			continue;
		}
		else if(
			hasT( currVar, "obj", "arr" ) === true &&
			currVar[ StoreConHandler.OUR_GLOBE_SYS_KEY ] !==
				StoreConHandler.OUR_GLOBE_SYS_VALUE
		)
		{
			for( var key in currVar )
			{
				stack.push( currVar );
				stack.push( key );
			}
		}
		else if( hasT( currVar, "obj" ) === true )
		{
			var typeValue = currVar[ "type" ];
			
			if( typeValue === "Date" )
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
				
				holdingSet[ pointingKey ] = date;
			}
			else if( typeValue === "Id" )
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
				
				holdingSet[ pointingKey ] = id;
			}
			else if( typeValue === "Link" )
			{
				var id = undefined;
				try
				{
					id = this.restoreId( currVar[ "id" ][ "id" ] );
				}
				catch( e )
				{
					StoreConHandler.throwRestoreErr( e, set, currVar );
				}
				
				var collection = currVar[ "collection" ];
				
				if( Link.verStoreVars( collection ) === false )
				{
					throw new StoreDataRuntimeError(
						"A system obj (in the set that is to be restored) "+
						"represents a Link but its props have invalid "+
						"values",
						{ restoringSet: set, systemObj: currVar },
						undefined,
						StoreConHandler.restoreObj
					);
				}
				
				holdingSet[ pointingKey ] = new Link( collection, id );
			}
			else if( typeValue === "Cache" )
			{
				var id = undefined;
				try
				{
					id =
						this.restoreId( currVar[ "link" ][ "id" ][ "id" ] )
					;
				}
				catch( e )
				{
					StoreConHandler.throwRestoreErr( e, set, currVar );
				}
				
				var refreshedDate = undefined;
				try
				{
					refreshedDate =
						this.restoreDate(
							currVar[ "refreshedDate" ][ "date" ]
						)
					;
				}
				catch( e )
				{
					StoreConHandler.throwRestoreErr( e, set, currVar );
				}
				
				var cacheVar = currVar[ "cache" ];
				var collection = currVar[ "link" ][ "collection" ];
				
				if(
					Link.verStoreVars( collection ) === false ||
					Cache.verStoreVars( cacheVar, refreshedDate ) ===
						false
				)
				{
					throw new StoreDataRuntimeError(
						"A system obj (in the set that is to be restored) "+
						"represents a Cache but its props have invalid "+
						"values",
						{ restoringSet: set, systemObj: currVar },
						undefined,
						StoreConHandler.restoreObj
					);
				}
				
				holdingSet[ pointingKey ] =
					new Cache(
						cacheVar, new Link( collection, id ), refreshedDate
					)
				;
				
				stack.push( holdingSet[ pointingKey ] );
				stack.push( "cache" );
			}
			else if( typeValue === "Binary" )
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
				
				holdingSet[ pointingKey ] = binary;
			}
			else
			{
				throw new StoreDataRuntimeError(
					"A system obj (in the set that is to be restored) "+
					"has the prop 'type' set to an invalid value",
					{
						restoringSet: set,
						systemObj: currVar,
						invalidValue: typeValue
					},
					undefined,
					StoreConHandler.restoreObj
				);
			}
		}
		else
		{
			throw new StoreDataRuntimeError(
				"A set (in the bigger set that is to be restored) "+
				"contains an invalid value",
				{
					restoringSet: set,
					invalidSet: holdingSet,
					invalidValue: currVar,
					keyToValue: pointingKey,
				},
				undefined,
				StoreConHandler.restoreObj
			);
		}
	}
}]

});

});
