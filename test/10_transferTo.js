//######################################################################################
// This test initialises Vether
// Then tests to make sure fails an unauthorised tx
// Then tests Vether params
//######################################################################################

// Test Params
// upgradeHeight = 1

const BigNumber = require('bignumber.js')
var TruffleAssert = require('truffle-assertions')

function BN2Str(BN) { return (new BigNumber(BN)).toFixed() }

var vether; var vetherOld; 
var acc0; var acc1; var acc2;
const sendEth = 1000;
const deposit = sendEth.toString()

contract("Vether", function(accounts) {
    constructor(accounts)
    sendEtherNewPass()
	withdrawsNew()
	depositPoolsFail()
	excludeVether()
    depositPools()
  })

  function constructor(accounts){
    acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2];
  
    it("constructor events", async () => {
      let VetherOld = artifacts.require("./VetherOld.sol");
      vetherOld = await VetherOld.new()
      let Vether = artifacts.require("./Vether.sol");
      vether = await Vether.new(vetherOld.address)
      let Pools = artifacts.require("./Pools.sol");
      pools = await Pools.new(vether.address)
    });
  }

  function sendEtherNewPass() {

    it("Acc0 sends Ether to New Vether after upgrade height", async () => {
      	// await delay(1100);
      
		let _acc = acc0;
		var _era; var _day;

		_era = await vether.currentEra(); _day = await vether.currentDay();
		let _emission = BN2Str(await vether.emission())
		console.log('Era: %s - Day: %s - Emission: %s', _era, _day, _emission)

		await vether.send(sendEth, { from: _acc})
		let tx = await vether.send(sendEth, { from: _acc})
		let tx2 = await vether.send(sendEth, { from: _acc})
		console.log('units', BN2Str(tx2.receipt.logs[0].args.units))
		console.log('dailyTotal', BN2Str(tx2.receipt.logs[0].args.dailyTotal))

		_era2 = await vether.currentEra(); _day2 = await vether.currentDay();
		console.log('Era2: %s - Day2: %s', _era2, _day2)

		let units = await vether.mapEraDay_MemberUnits.call(_era, _day, _acc);
		assert.equal(units, deposit, "the units is correct");

		let totalUnits = await vether.mapEraDay_Units.call(_era, _day);
		assert.equal(totalUnits, deposit, "the total units is correct");

		let valueShare = await vether.getEmissionShare(_era, _day, _acc);
		assert.equal(BN2Str(valueShare), _emission, "the value share is correct");

		let valueLeft = await vether.mapEraDay_Emission.call(_era, _day);
		assert.equal(valueLeft, _emission, "the value left is correct");

		let vetherBal1 = new BigNumber(await vether.balanceOf(vether.address)).toFixed();

    })
}

function withdrawsNew() {

	it("Acc0 withdraws from New Vether", async () => {

		let _acc = acc0;
		let _era = 1; let _day = 1;
		let _bal = '2048'

		//console.log("balance", BN2Str(await vether.balanceOf(_acc)))

	   let tx = await vether.withdrawShare(_era, _day, { from: _acc })
	//    console.log(tx.receipt.logs)
	   console.log('value', BN2Str(tx.receipt.logs[1].args.value))
		console.log('valueRemaining', BN2Str(tx.receipt.logs[1].args.valueRemaining))

	   let balBN = new BigNumber(await vether.balanceOf(_acc))
	   assert.equal(balBN.toFixed(), _bal, "correct acc bal")

	   let units = BN2Str(await vether.mapEraDay_MemberUnits.call(_era, _day, _acc))
	   assert.equal(units, "0", "the units is correct");

	   let totalUnits = await vether.mapEraDay_UnitsRemaining.call(_era, _day);
	   assert.equal(totalUnits, "0", "the total units is correct");

	   let valueShare = await vether.getEmissionShare(_era, _day, _acc);
	   assert.equal(valueShare, "0", "the value share is correct");

	   let valueLeft = await vether.mapEraDay_EmissionRemaining.call(_era, _day);
	   assert.equal(valueLeft, "0", "the value left is correct");

	   let vetherBal1 = await vether.balanceOf(vether.address);
	   //console.log("vetherOld Balance", vetherBal1.toNumber());
   
	 let balBNFinal = new BigNumber(await vether.balanceOf(_acc))
	 //console.log('Final User Balance: ', balBNFinal.toFixed())
})
}

function depositPoolsFail(){
  
    it("it should fail deposit", async () => {
		TruffleAssert.reverts(pools.deposit(1), "must be excluded address")
    });
  }

function excludeVether() {

	it("Excludes address", async () => {

		await vether.addExcluded(pools.address, {from: acc0})
		assert.equal(await vether.mapAddress_Excluded(pools.address), true)

	})
}

  function depositPools(){
  
    it("it should deposit", async () => {
      await pools.deposit(1)
      console.log('balance claimed', BN2Str(await pools.balance()))
      console.log('balance actual', BN2Str(await vether.balanceOf(pools.address)))
    });
    it("it should withdraw", async () => {
        await pools.withdraw()
        console.log('balance', BN2Str(await pools.balance()))
        console.log('balance actual', BN2Str(await vether.balanceOf(pools.address)))
      });
  }