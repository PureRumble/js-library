var jsFilePath = process.argv[ 2 ];

var requirejs =
require(
	"/home/work-purerumble/files/projects/ourglobe/js/"+
	"ourglobe/lib/dual/requirejs/r.js"
);

requirejs.config({
	packages:
	[
		"ourglobe/dual/core",
		"ourglobe/dual/modulehandling",
		"ourglobe/dual/testing",
		"ourglobe/dual/moremath",
		"ourglobe/dual/classes",
		"ourglobe/server/initserver",
		"ourglobe/server/morehttp",
		"ourglobe/server/cluster",
		"ourglobe/server/mongodb",
		"ourglobe/server/elasticsearch",
		"ourglobe/server/river"
	],
	baseUrl: "/home/work-purerumble/files/projects/ourglobe/js"
});

// requirejs wraps an encountered error into its own and throws
// it instead but this gives no useful information as the origin
// of the original error. The error handling func of requirejs is
// therefore redefined to obtain the original error
requirejs.onError =
function( err )
{
	if( err.originalError !== undefined )
	{
		console.log( err.message );
		err = err.originalError;
	}
	
	throw err;
}

ourglobe = {};

ourglobe.core = {};
ourglobe.core.require = requirejs;
ourglobe.core.define = requirejs.define;

ourGlobe = ourglobe;

ourglobe.core.require(
[
	"ourglobe/dual/core",
	"require"
],
function( core, require )
{
	require( jsFilePath );
});
