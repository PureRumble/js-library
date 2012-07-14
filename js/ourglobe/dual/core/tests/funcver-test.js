og.require(
[
	"ourglobe/lib/server/vows",
	"ourglobe/dual/testing"
],
function( mods )
{

var vows = mods.get( "vows" );

var Test = mods.get( "testing" ).Test;

var assert = og.assert;
var sys = og.sys;

var FuncVer = og.FuncVer;
var FuncVerError = og.FuncVerError;

var suite = vows.describe( "funcver" );

function testFuncVer( funcVer, args, returnVar )
{
	var verArgs = args !== undefined ? true : false;
	var verReturn = arguments.length > 2 ? true : false;
	
	function callFunc()
	{
		if( verArgs === true )
		{
			funcVer.verArgs( arguments );
		}
		
		if( verReturn === true )
		{
			funcVer.verReturn( returnVar );
		}
	}
	
	var verOk = true;
	
	try{
		callFunc.apply( callFunc, args );
	}
	catch( err )
	{
		if( err instanceof FuncVerError === false )
		{
			throw err;
		}
		
		verOk = false;
	}
	
	return verOk;
}

function testArgs( funcVer, args, argsHold )
{
	var returnVar = {
		topic: testFuncVer( funcVer, args ),
		"is OK": function( topic )
		{
			assert(
				topic === argsHold,
				"The FuncVer should "+
				( argsHold === true ? "approve" : "disapprove" )+
				" the args",
				{ funcVer:funcVer, args:args }
			);
		}
	};
	
	return returnVar;
}

function argsHold( funcVer, args )
{
	return testArgs( funcVer, args, true );
}

function argsFail( funcVer, args )
{
	return testArgs( funcVer, args, false );
}

function doubleTestArgs( funcVer, okArgs, notOkArgs )
{
	var returnVar =
		Test.getTests(
			
			"- holding args", argsHold( funcVer, okArgs ),
			
			"- failing args", argsFail( funcVer, notOkArgs )
			
		)
	;
	
	return returnVar;
}

function testReturn( funcVer, returnVar, returnHolds )
{
	var toReturn = {
		topic: testFuncVer( funcVer, undefined, returnVar ),
		"is OK": function( topic )
		{
			assert(
				topic === returnHolds,
				"The FuncVer should "+
				( returnHolds === true ? "approve" : "disapprove" )+
				" the return var",
				{ funcVer: funcVer, returnVar: returnVar }
			);
		}
	};
	
	return toReturn;
}

function doubleTestReturn( funcVer, okReturn, notOkReturn )
{
	var returnVar =
		Test.getTests(
			
			"- holding return",
			testReturn( funcVer, okReturn, true ),
			
			"- failing return",
			testReturn( funcVer, notOkReturn, false )
			
		)
	;
	
	return returnVar;
}

// no args
suite.addBatch( Test.getTests(
	
	"FuncVer given nothing with no args and one arg",
	doubleTestArgs(
		new FuncVer(), [], [ undefined ]
	),
	
	"No args FuncVer with no args and one arg",
	doubleTestArgs(
		new FuncVer( [], "str", undefined ), [], [ "dingo" ]
	),
	
	"No args FuncVer set by addArgs with no args and one arg",
	doubleTestArgs(
		new FuncVer().addArgs( [] ), [], [ 11.1 ]
	),
	
	"No args FuncVer with no args and arg undef",
	doubleTestArgs(
		new FuncVer(), [], [ undefined ]
	)
	
));

// simple args
suite.addBatch( Test.getTests(
	
	"Arg int FuncVer with arg int and no args",
	doubleTestArgs(
		new FuncVer().addArgs( [ "int" ] ), [ 11 ], []
	),
	
	"Arg int,str FuncVer with args int,str and arg int",
	doubleTestArgs(
		new FuncVer().addArgs(
			[ "int", "str" ]
		),
		[ 11, "dingo" ],
		[ 11 ]
	),
	
	"Arg int,str FuncVer with args int,str and args str,int",
	doubleTestArgs(
		new FuncVer().addArgs(
			[ "int", "str" ]
		),
		[ 11, "dingo" ],
		[ "dingo", 11 ]
	),
	
	"Arg int,str FuncVer with args int,str and args int,str,undef",
	doubleTestArgs(
		new FuncVer().addArgs(
			[ "int", "str" ]
		),
		[ 11, "dingo" ],
		[ 11, "dingo", undefined ]
	),
	
	"Arg int,str,func/str FuncVer with args int,str,func and "+
	"args int,str,undef",
	doubleTestArgs(
		new FuncVer().addArgs(
			[ "int", "str", [ "func", "str" ] ]
		),
		[ 11, "dingo", function() {} ],
		[ 11, "dingo", undefined ]
	)
	
));

// undef args
suite.addBatch( Test.getTests(
	
	"Arg undef FuncVer with no args and arg null",
	doubleTestArgs(
		new FuncVer().addArgs(
			[ "undef" ]
		),
		[],
		[ null ]
	),
	
	"Arg str/undef FuncVer with no args and args str,undef",
	doubleTestArgs(
		new FuncVer().addArgs(
			[ { goodTypes:"str/undef" } ]
		),
		[],
		[ "dingo", undefined ]
	),
	
	"Arg undef,undef/str FuncVer with no args and arg null",
	doubleTestArgs(
		new FuncVer().addArgs(
			[ "undef", "undef/str" ]
		),
		[],
		[ null ]
	),
	
	"Arg undef,undef,undef FuncVer with no args and arg null",
	doubleTestArgs(
		new FuncVer().addArgs(
			[ "undef", "undef", "undef" ]
		),
		[],
		[ null ]
	),
	
	"Arg str,int,null/undef,undef FuncVer with args str,int and "+
	"args str,int,bool",
	doubleTestArgs(
		new FuncVer().addArgs(
			[ "str", "int", "null/undef", "undef" ]
		),
		[ "dingo", 42 ],
		[ "dango", 43, true ]
	),
	
	"Arg str,int,undef,null/obj FuncVer with args "+
	"str,int,undef,obj and args str,int",
	doubleTestArgs(
		new FuncVer().addArgs(
			[ "str", "int", "undef", "null/obj" ]
		),
		[ "dingo", 42, undefined, {} ],
		[ "dango", 43 ]
	)
	
));

// extra args
suite.addBatch( Test.getTests(
	
	"str,int,bool with str,int,bool and str,int,bool,bool",
	doubleTestArgs(
		new FuncVer( [ "str", "int", "bool" ] ),
		[ "dingo", -42, true ],
		[ "dango", 43, true, false ]
	),
	
	"extrArgs:int with no args and number",
	doubleTestArgs(
		new FuncVer( undefined, undefined, "int" ),
		[],
		[ 42.1 ]
	),
	
	"extraArgs:int with int and int,undef",
	doubleTestArgs(
		new FuncVer().setExtraArgs( "int" ),
		[ 42 ],
		[ 43, undefined ]
	),
	
	"extraArgs:int/str/undef with int,str,int,int,undef and "+
	"undef,undef,undef,undef,null",
	doubleTestArgs(
		new FuncVer()
			.setExtraArgs( "null" )
			.setExtraArgs( [ "int", "str", "undef" ] )
		,
		[ 42, "dingo", 43, 45, undefined ],
		[ undefined, undefined, undefined, undefined, null ]
	),
	
	"extraArgs:+int/str with str and no args",
	doubleTestArgs(
		new FuncVer().setExtraArgs( "+int/str" ),
		[ "dingo" ],
		[]
	),
	
	"str,int,undef extraArgs:undef wit str,int and "+
	"str,int,undef,undef,undef,null",
	doubleTestArgs(
		new FuncVer( [ "str", "int", "undef" ] )
			.setExtraArgs( "undef" )
		,
		[ "dingo", 42 ],
		[ "dango", 43, undefined, undefined, undefined, null ]
	),
	
	"str,int,undef,undef extraArgs:+undef with "+
	"str,int,undef,undef,undef and str,int,undef,undef",
	doubleTestArgs(
		new FuncVer( [ "str", "int", "undef", { types:"undef" } ] )
			.setExtraArgs( "+undef" )
		,
		[ "dingo", 42, undefined, undefined, undefined ],
		[ "dango", 43, undefined, undefined ]
	)
	
));

// many args
suite.addBatch( Test.getTests(
	
	"str|int args with str and number",
	doubleTestArgs(
		new FuncVer( [ "str" ] )
			.addArgs( [ "int" ] )
		,
		[ "dingo" ],
		[ 43.3 ]
	),
	
	"str,int,bool|str,int,func,undef args with str,int,func "+
	"and str,int,func,null",
	doubleTestArgs(
		new FuncVer()
			.addArgs( [ "str", "int", "bool" ] )
			.addArgs( [ "str", "int", "func", "undef" ] )
		,
		[ "dingo", 42, function() { } ],
		[ "dango", 43, function() { }, null ]
	),
	
	"str,int|str,int,func|str,int,bool,undef/int,undef/str,"+
	"undef/null|str,int,bool,undef,undef,int with str,int,bool,"+
	"int and str,int,bool,undef,undef,number",
	doubleTestArgs(
		new FuncVer()
			.addArgs( [ "str", "int" ] )
			.addArgs( [ "str", "int", "func" ] )
			.addArgs( [
				"str",
				"int",
				"bool",
				"undef/int",
				"undef/str",
				"undef/null"
			] )
			.addArgs(
				[ "str", "int", "bool", "undef", "undef", "int" ]
			)
		,
		[ "dingo", 42, true, 42 ],
		[ "dango", 43, false, undefined, undefined, 43.3 ]
	),
	
	"str,int,func|str,int,bool|str,int,number extraArgs:+bool "+
	"with str,int,bool,bool,bool and str,int,bool,bool,bool,null",
	
	doubleTestArgs(
		new FuncVer( undefined, undefined, "+bool" )
			.addArgs( [ "str", "int", "func" ] )
			.addArgs( [ "str", "int", "bool" ] )
			.addArgs( [ "str", "int", "number" ] )
		,
		[ "dingo", 42, true, true, true ],
		[ "dango", 43, false, false, false, null ]
	)
	
));

// return var
suite.addBatch( Test.getTests(
	
	"undef return with undef and int",
	doubleTestReturn(
		new FuncVer( undefined, "undef" ), undefined, 43
	),
	
	"undef/int/str/func return with str and number",
	doubleTestReturn(
		new FuncVer().setReturn( [ "undef", "int", "str", "func" ] ),
		"dingo",
		43.3
	),
	
	"bool/null/undef return with null and int",
	doubleTestReturn(
		new FuncVer( undefined, { goodTypes:"bool/null/undef" } ),
		null,
		43
	)
	
));

suite.run();

});
