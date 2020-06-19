var Vether = artifacts.require("./Vether.sol")
var VetherOld = artifacts.require("./VetherOld.sol")
const BigNumber = require('bignumber.js')
var TruffleAssert = require('truffle-assertions')

var vether; var vetherOld; 
var acc0; var acc1; var acc2; var accBurn;

const upgradeHeight = 5
const sendEth = 1000;
const deposit = sendEth.toString()
const Emission = '2048'; 
const burnAddress = '0x0111011001100001011011000111010101100101'

function BN2Str(BN) { return (new BigNumber(BN)).toFixed() }
function getBN(BN) {return ((new BigNumber(BN))) }
const delay = ms => new Promise(res => setTimeout(res, ms));

//######################################################################################
	// getVether (eth in, withdraw)
	// pays fees (transfer)
	// redeems ok
	// tries to start emission, fail
	// rolls past upgradeHeight
	// starts emission
	// redeems the rest
//######################################################################################



contract("Upgrade Vether", async accounts => {
	constructor(accounts)

	sendEther() // 1-1
	sendEther() // 1-2
	withdraws()
	transfer()
	excludeVether()
	upgrade(acc0, 1)
	sendEtherNewFail()
	sendEther() // 1-4
	sendEther() // 1-5
	sendEtherNewPass()
	withdrawsNew()
	upgradeAcc0()
	upgradeAcc1()
})


function constructor(accounts) {
	acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2]; accBurn = acc2;
	it("initializes oldVether and newVether with correct params", async () => {

		vetherOld = await VetherOld.new()
		vether = await Vether.new(vetherOld.address)
		
		const genesisOld = BN2Str(await vetherOld.genesis())
		const genesis = BN2Str(await vether.genesis())
		assert.equal(genesis, genesisOld)

		const currentDay = await vether.currentDay()
		assert.equal(currentDay, upgradeHeight)

		const totalFees = BN2Str(await vetherOld.totalFees())
		const remaining = BN2Str(await vether.getRemainingAmount())
		assert.equal(remaining, (upgradeHeight-1)*2048)
		//console.log(remaining)

	})
}

function sendEther() {

    it("Acc0 sends Ether to old Vether", async () => {
      await delay(1100);
      
      let _acc = acc0;
      var _era; var _day;

        _era = await vetherOld.currentEra(); _day = await vetherOld.currentDay();
        let _emission = BN2Str(await vetherOld.emission())
        let receipt = await vetherOld.send(sendEth, { from: _acc})
        //console.log('Era: %s - Day: %s - Emission: %s', _era, _day, _emission)

        let units = await vetherOld.mapEraDay_MemberUnits.call(_era, _day, _acc);
        assert.equal(units, deposit, "the units is correct");

        let totalUnits = await vetherOld.mapEraDay_Units.call(_era, _day);
        assert.equal(totalUnits, deposit, "the total units is correct");

        let valueShare = await vetherOld.getEmissionShare(_era, _day, _acc);
        assert.equal(BN2Str(valueShare), _emission, "the value share is correct");

        let valueLeft = await vetherOld.mapEraDay_Emission.call(_era, _day);
        assert.equal(valueLeft, _emission, "the value left is correct");

        let vetherOldBal1 = new BigNumber(await vetherOld.balanceOf(vetherOld.address)).toFixed();

    })
}

function withdraws() {

     it("Acc0 withdraws from old Vether", async () => {

      let _acc = acc0;
      let _era = 1; let _day = 1;
      let _bal = Emission

        let receipt = await vetherOld.withdrawShare(_era, _day, { from: _acc })

        let balBN = new BigNumber(await vetherOld.balanceOf(_acc))
        assert.equal(balBN.toFixed(), _bal, "correct acc bal")

        let units = BN2Str(await vetherOld.mapEraDay_MemberUnits.call(_era, _day, _acc))
        assert.equal(units, "0", "the units is correct");

        let totalUnits = await vetherOld.mapEraDay_UnitsRemaining.call(_era, _day);
        assert.equal(totalUnits, "0", "the total units is correct");

        let valueShare = await vetherOld.getEmissionShare(_era, _day, _acc);
        assert.equal(valueShare, "0", "the value share is correct");

        let valueLeft = await vetherOld.mapEraDay_EmissionRemaining.call(_era, _day);
        assert.equal(valueLeft, "0", "the value left is correct");

        let vetherOldBal1 = await vetherOld.balanceOf(vetherOld.address);
        //console.log("vetherOld Balance", vetherOldBal1.toNumber());
	
      let balBNFinal = new BigNumber(await vetherOld.balanceOf(_acc))
      //console.log('Final User Balance: ', balBNFinal.toFixed())
 })
}

function transfer() {
  it("allows a transfer between accounts for fees", async () => {

    let vetherOldBal1 = await vetherOld.balanceOf(vetherOld.address);
    //console.log("vetherOld Balance Start:", vetherOldBal1.toNumber());
    let acc0Bal1 = await vetherOld.balanceOf(acc0);
    let acc1Bal1 = await vetherOld.balanceOf(acc1);
    //console.log("Account0 Balance: ", acc0Bal1.toNumber()); //console.log("Account1 Balance: ", acc1Bal1.toNumber());
   
    let r = await vetherOld.transfer(acc1, deposit, { from: acc0 })
    let r2 = await vetherOld.transfer(acc1, deposit, { from: acc0 })
    let r3 = await vetherOld.transfer(acc0, deposit, { from: acc1 })

    let acc0Bal2 = await vetherOld.balanceOf(acc0);
    let acc1Bal2 = await vetherOld.balanceOf(acc1);
    //console.log("Account0 New Balance: ", acc0Bal2.toNumber()); //console.log("Account1 New Balance: ", acc1Bal2.toNumber());
    assert.equal(acc0Bal2.toNumber(), "1047", "correct acc0 balance")
    assert.equal(acc1Bal2.toNumber(), "998", "correct acc1 balance")

    let vetherOldBal2 = await vetherOld.balanceOf(vetherOld.address);
    //console.log("vetherOld Balance End:", vetherOldBal2.toNumber());
	assert.equal(vetherOldBal2.toNumber(), "6145", "correct vetherOld balance")
	
	let vetherFees = await vetherOld.totalFees();
    //console.log("Fees:", vetherFees.toNumber());
    assert.equal(vetherFees.toNumber(), "3", "correct vetherFees")

  })
}

function excludeVether() {

	it("Excludes swap address", async () => {
		// let balanceLeft = await vetherOld.balanceOf(acc0)
		// //console.log('balanceLeft', BN2Str(balanceLeft))

		// let remaining = getBN(await vether.getRemainingAmount())
		// //console.log('remainig', BN2Str(remaining))

		// await vetherOld.approve(vether.address, 128, {from: acc0})
		await vetherOld.addExcluded(vether.address, {from: acc0})
		assert.equal(await vetherOld.mapAddress_Excluded(vether.address), true)

		// let balanceBurn = await vetherOld.balanceOf(burnAddress)
		// //console.log('balanceBurn', BN2Str(balanceBurn))
		// // assert.equal(balanceBurn, balanceLeft.toString())
		// let remainingEnd = getBN(await vether.getRemainingAmount())
		// assert.equal(BN2Str(remaining.minus(remainingEnd)), balanceLeft.toString())
		// //console.log('remainingEnd', BN2Str(remainingEnd))

	})
}

function upgrade(_acc, _amount) {

	it("fails an upgrade for too much", async () => {

		await vetherOld.approve(vether.address, '10000000', {from:_acc})
		TruffleAssert.reverts(vether.upgrade('10000000'))

	})

	it("allows a Vether upgrade before New Vether starts", async () => {
		let remaining = getBN(await vether.getRemainingAmount())
		//console.log(BN2Str(remaining))
		await vetherOld.approve(vether.address, _amount, {from: _acc})
		await vether.upgrade(_amount, {from: _acc})
		let balanceBurn = await vetherOld.balanceOf(burnAddress)
		// //console.log(BN2Str(balanceBurn))
		assert.equal(balanceBurn, _amount.toString())
		let remainingEnd = getBN(await vether.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingEnd)), _amount.toString())
		//console.log(BN2Str(remainingEnd))

	})
}

function sendEtherNewFail() {
	it("fails if sending too early", async () => {
		TruffleAssert.reverts(vether.send(sendEth, { from: acc0}))
	})
}

function sendEtherNewPass() {

    it("Acc0 sends Ether to New Vether after upgrade height", async () => {
      await delay(1100);
      
      let _acc = acc0;
      var _era; var _day;

        _era = await vether.currentEra(); _day = await vether.currentDay();
        let _emission = BN2Str(await vether.emission())
        let receipt = await vether.send(sendEth, { from: _acc})
        //console.log('Era: %s - Day: %s - Emission: %s', _era, _day, _emission)

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
		let _era = 1; let _day = upgradeHeight;
		let _bal = '2049'

		//console.log("balance", BN2Str(await vether.balanceOf(_acc)))

	   let receipt = await vether.withdrawShare(_era, _day, { from: _acc })

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

function upgradeAcc0() {

	it("allows Acc0 to upgrade all from VetherOld to new Vether", async () => {
		let balanceLeft = await vetherOld.balanceOf(acc0)
		//console.log('balanceLeft', BN2Str(balanceLeft))

		let remaining = getBN(await vether.getRemainingAmount())
		//console.log('remainig', BN2Str(remaining))

		await vetherOld.approve(vether.address, balanceLeft, {from: acc0})
		await vether.upgrade(balanceLeft, {from: acc0})

		let balanceBurn = await vetherOld.balanceOf(burnAddress)
		//console.log('balanceBurn', BN2Str(balanceBurn))
		// assert.equal(balanceBurn, balanceLeft.toString())
		let remainingEnd = getBN(await vether.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingEnd)), balanceLeft.toString())
		//console.log('remainingEnd', BN2Str(remainingEnd))

	})
}

function upgradeAcc1() {

	it("allows Acc1 to upgrade from VetherOld to Vether", async () => {
		let balanceLeft = await vetherOld.balanceOf(acc1)
		//console.log('balanceLeft', BN2Str(balanceLeft))

		let remaining = getBN(await vether.getRemainingAmount())
		//console.log('remainig', BN2Str(remaining))

		await vetherOld.approve(vether.address, balanceLeft, {from: acc1})
		await vether.upgrade(balanceLeft, {from: acc1})

		let balanceBurn = await vetherOld.balanceOf(burnAddress)
		//console.log('balanceBurn', BN2Str(balanceBurn))
		// assert.equal(balanceBurn, balanceLeft.toString())
		let remainingEnd = getBN(await vether.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingEnd)), balanceLeft.toString())
		//console.log('remainingEnd', BN2Str(remainingEnd))

	})
}


