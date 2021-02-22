ourglobe.require(
[
	"ourglobe/dual/testing",
	"ourglobe/dual/testing/suite"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;
var FuncVer = ourglobe.FuncVer;

var Suite = mods.get( "suite" );
var TestingError = mods.get( "testing" ).TestingError;

var emptyFunc =
function()
{
	
};

var faultyFunc =
function()
{
	throw new TestingError();
};

var suite = new Suite( "suite for testing" );

suite.add(
	"a child suite where all steps are ok",
	{
		before: emptyFunc,
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:
		[
			"an ok vow", emptyFunc,
			"another ok vow", emptyFunc,
			"a third ok vow", emptyFunc
		],
		after: emptyFunc
	}
);

suite.add(
	"a child suite that fails at before",
	{
		before: faultyFunc,
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:
		[
			"an ok vow", emptyFunc,
			"another ok vow", emptyFunc,
			"a third ok vow", emptyFunc
		],
		after: emptyFunc
	}
);

suite.add(
	"a child suite that fails at one vow",
	{
		before: emptyFunc,
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "a faulty vow", faultyFunc ],
		after: emptyFunc
	}
);

suite.add(
	"a child suite that fails at some vows",
	{
		before: emptyFunc,
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:
		[
			"a faulty vow", faultyFunc,
			"another faulty vow", faultyFunc,
			"a third faulty vow", faultyFunc
		],
		after: emptyFunc
	}
);

suite.add(
	"a child suite that fails at after",
	{
		before: emptyFunc,
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "an ok vow", emptyFunc ],
		after: faultyFunc
	}
);

suite.add(
	"a child suite that fails at a vow and after",
	{
		before: emptyFunc,
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "a faulty vow", faultyFunc ],
		after: faultyFunc
	}
);

suite.run();

});
