ourglobe.core.define(
[
	"./moduleutils"
],
function(
	ModuleUtils
)
{

ourglobe.core.ModuleUtils = ModuleUtils ;
ourglobe.require = ModuleUtils.require;
ourglobe.define = ModuleUtils.define;

return(
	{
		ModuleUtils: ModuleUtils
	}
);

});
