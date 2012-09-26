ourglobe.define(
[
	"./cbstep"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var CbStepQueue =
getF(
getV()
	.addA( { gt: 0 } ),
function( nrSlots )
{
	this.queue = [];
	this.tempQueue = [];
	this.nrSlots = nrSlots;
	this.nrOccupiedSlots = 0;
});

CbStepQueue.DEFAULT_NR_SLOTS = 10;

return CbStepQueue;

},
function( mods, CbStepQueue )
{

var sys = ourglobe.sys;
var getF = ourglobe.getF;
var getV = ourglobe.getV;
var RuntimeError = ourglobe.RuntimeError;

var CbStep = mods.get( "cbstep" );

CbStepQueue.prototype.add =
getF(
getV()
	.addA( CbStep ),
function( cbStep )
{
	this.tempQueue.push( cbStep );
});

CbStepQueue.prototype.freeSlot =
getF(
getV(),
function()
{
	if( this.nrOccupiedSlots === 0 )
	{
		throw new RuntimeError(
			"There are no occupied slots to free"
		);
	}
	
	this.nrOccupiedSlots--;
});

CbStepQueue.prototype.fillSlots =
getF(
getV(),
function()
{
	if( this.nrOccupiedSlots > this.nrSlots )
	{
		throw new RuntimeError(
			"The nr of occupied slots exceeds the total nr of slots",
			{
				nrOccupiedSlots: this.nrOccupiedSlots,
				nrSlots: this.nrSlots
			}
		);
	}
	
	this.queue = this.tempQueue.concat( this.queue );
	this.tempQueue = [];
	
	if(
		this.queue.length === 0 ||
		this.nrOccupiedSlots === this.nrSlots
	)
	{
		return;
	}
	
	var nrToFill = this.nrSlots - this.nrOccupiedSlots;
	
	if( nrToFill > this.queue.length )
	{
		nrToFill = this.queue.length;
	}
	
	var cbStepsToRun = this.queue.slice( 0, nrToFill );
	this.queue = this.queue.slice( nrToFill );
	
	this.nrOccupiedSlots += nrToFill;
	
	for( var item = 0; item < cbStepsToRun.length; item++ )
	{
		cbStepsToRun[ item ].takeStepFromQueue();
	}
});

});
