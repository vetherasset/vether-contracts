const Vether1 = artifacts.require("./Vether1.sol")
const Vether2 = artifacts.require("./Vether2.sol")
const Vether3 = artifacts.require("./Vether3.sol")
const Vether4 = artifacts.require("./Vether4.sol")
const BigNumber = require('bignumber.js')
const TruffleAssert = require('truffle-assertions')

var vether1; var vether2; var vether3; var vether4;
var acc0; var acc1; var acc2; var acc3; var accBurn;

const upgradeHeight1 = 3
const upgradeHeight2 = 5
const upgradeHeight3 = 7
const sendEth = 1000;
const deposit = sendEth.toString()
const Emission = '2048';
const burnAddress = '0x0111011001100001011011000111010101100101'

function BN2Str(BN) { return (new BigNumber(BN)).toFixed() }
function getBN(BN) { return ((new BigNumber(BN))) }
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

// Test Params
// totalSupply = 64000
// daysPerEra = 20, secondsPerDay = 2
// upgradeHeight1 = 3
// upgradeHeight2 = 5


contract("Upgrade Vether", async accounts => {
	constructor(accounts)
	deploy4(accounts)
	sendEtherFail('v2') // Fail in 2
	sendEtherFail('v3') // Fail in 3
	sendEtherFail('v4') // Fail in 4
	sendEther('v1', acc0) // 1-1
	sendEther('v1', acc1) // 1-2
	withdraws('v1', acc0, 1, 1)
	withdraws('v1', acc1, 1, 2)
	transfer('v1', acc2)	// send some to acc2
	excludeVether('v1') // burnAddress in Vether1
	snapshot('v1') //snapshot Vether1 in 2
	upgradeTo2(acc0) // upgrade acc0 to Vether2
	upgradeTo2(acc1) // upgrade acc1 to Vether2
	sendEther('v2', acc0) // 1-3 mine Vether2
	sendEther('v2', acc1) // 1-4 mine Vether2
	withdraws('v2', acc0, 1,3) // withdraw Vether2
	withdraws('v2', acc1, 1,4) // withdraw Vether2
	transfer('v2', acc2) // send some to acc2
	deploy4(accounts)
	excludeVether('v2') //burnAddress in Vether2
	snapshot('v2') //snapshot Vether2 in 3
	sendEther('v3', acc0) // 1-5 mine vether3
	withdraws('v3', acc0, 1,5) // withdraw vether3
	transfer('v3', acc3) // send some to acc2
	excludeVether('v3')
	snapshot('v3') //snapshot Vether3 in 4
	failUpgradeTo4from1Address(acc2) // can't claim too much
	upgradeTo4from1(acc2) // acc2 has 1
	upgradeTo4from2(acc1) // acc1 has 2
	upgradeTo4from2(acc2) // acc2 has 2
	upgradeTo4from3(acc0) // acc0 has 3
	upgradeTo4from3(acc3) // acc3 has 3
	sendEther('v1', acc0) // 1-2
	withdraws('v1', acc0, 1, 4)
	sendEther('v2', acc0) // 1-4 mine Vether2
	withdraws('v2', acc0, 1,6) // withdraw Vether2
	sendEther('v3', acc0) // 1-4 mine Vether2
	withdraws('v3', acc0, 1,6) // withdraw Vether2
	failUpgradeTo4from1(acc0) // can't claim too much
	failUpgradeTo4from2(acc0) // can't claim too much
	failUpgradeTo4from3(acc0) // can't claim too much
	sendEther('v4', acc2) // 1-4 mine Vether2
	withdraws('v4', acc2, 1,7) // withdraw Vether2
	purge()
})


function constructor(accounts) {
	acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2]; acc3 = accounts[3];
	accBurn = acc2;
	it("initializes oldVether and newVether with correct params", async () => {

		vether1 = await Vether1.new()
		vether2 = await Vether2.new(vether1.address)
		vether3 = await Vether3.new(vether1.address, vether2.address)
		console.log('vether1', vether1.address)
		console.log('vether2', vether2.address)
		console.log('vether3', vether3.address)

		// const genesisOld = BN2Str(await vether1.genesis())
		// const genesis = BN2Str(await vether2.genesis())
		// assert.equal(genesis, genesisOld)

		// const currentDay = await vether2.currentDay()
		// assert.equal(currentDay, upgradeHeight1)

		// const totalFees = BN2Str(await vether1.totalFees())
		// assert.equal(totalFees, BN2Str(await vether2.totalFees()))

		// const totalBurnt = BN2Str(await vether1.totalBurnt())
		// assert.equal(totalBurnt, BN2Str(await vether2.totalBurnt()))

		// const totalSupply = BN2Str(await vether1.totalSupply())
		// assert.equal(totalSupply, BN2Str(await vether2.totalSupply()))

		// const totalEmitted = BN2Str(await vether2.totalEmitted())
		// assert.equal(totalEmitted, (upgradeHeight1 - 1) * 2048)

		// const remaining = BN2Str(await vether2.getRemainingAmount())
		// assert.equal(remaining, (upgradeHeight1 - 1) * 2048)
		// console.log('remaining', remaining)

	})
}

function deploy4(accounts) {
	acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2]; acc3 = accounts[3];
	accBurn = acc2;
	it("initializes Vether4 with correct params", async () => {

		vether4 = await Vether4.new(vether1.address, vether2.address, vether3.address)
		console.log('vether4', vether4.address)

		const genesisOld = BN2Str(await vether1.genesis())
		const genesis = BN2Str(await vether4.genesis())
		assert.equal(genesis, genesisOld)

		// const ndt3 = getBN(await vether3.nextDayTime())
		// const sPD = getBN(await vether3.secondsPerDay())
		// const currentDay3 = getBN(await vether3.currentDay())
		// const nndt3 = ndt3.plus((getBN(upgradeHeight3).minus(currentDay3)).times(getBN(sPD)))
		const ndt4 = getBN(await vether4.nextDayTime())
		console.log(BN2Str(ndt4))
		// assert.equal(BN2Str(nndt3), BN2Str(ndt4))


		const currentDay = await vether4.currentDay()
		assert.equal(currentDay, upgradeHeight3)

		const totalFees = BN2Str(await vether3.totalFees())
		assert.equal(totalFees, BN2Str(await vether4.totalFees()))

		const totalBurnt = BN2Str(await vether3.totalBurnt())
		assert.equal(totalBurnt, BN2Str(await vether4.totalBurnt()))

		const totalSupply = BN2Str(await vether3.totalSupply())
		assert.equal(totalSupply, BN2Str(await vether4.totalSupply()))

		const totalEmitted = BN2Str(await vether4.totalEmitted())
		assert.equal(totalEmitted, (upgradeHeight3 - 1) * 2048)

		const remaining = BN2Str(await vether4.getRemainingAmount())
		assert.equal(remaining, (upgradeHeight3 - 1) * 2048)
		console.log('remaining', remaining)

		for(let i =1; i<upgradeHeight3; i++){
			const units = BN2Str(await vether3.mapEraDay_Units(1,i))
			assert.equal(units, BN2Str(await vether4.mapEraDay_Units(1,i)))
			console.log(i, units)
		}

	})
}

function sendEther(_vether, _acc) {

	it(`Acc0 sends Ether to ${_vether} Vether`, async () => {
		await delay(2100);

		let vether
		if (_vether == 'v1') { vether = vether1; }
		else if (_vether == 'v2') { vether = vether2; }
		else if (_vether == 'v3') { vether = vether3; }
		else { vether = vether4; }

		var _era; var _day;

		_era = await vether.currentEra(); _day = await vether.currentDay();
		let _emission = BN2Str(await vether.emission())
		console.log('Era: %s - Day: %s - Emission: %s', _era, _day, _emission)

		let tx = await vether.send(sendEth, { from: _acc })
		// let logs = tx.receipt.logs
		// for (var i=0; i<logs.length; i++){
		// 	console.log('event - %s, day - %s', logs[i].event, BN2Str(logs[i].args.day))
		// }

		let units = await vether.mapEraDay_MemberUnits.call(_era, _day, _acc);
		assert.equal(units, deposit, "the units is correct");

		let totalUnits = await vether.mapEraDay_Units.call(_era, _day);
		assert.equal(totalUnits, deposit, "the total units is correct");

		let vetherBal = new BigNumber(await vether.balanceOf(vether.address)).toFixed();
		console.log(BN2Str(vetherBal))

		let valueShare = await vether.getEmissionShare(_era, _day, _acc);
		assert.equal(BN2Str(valueShare), _emission, "the value share is correct");

		let valueLeft = await vether.mapEraDay_EmissionRemaining.call(_era, _day);
		assert.equal(valueLeft, _emission, "the value left is correct");

		let vetherOldBal1 = new BigNumber(await vether.balanceOf(vether.address)).toFixed();

		console.log(BN2Str(units), BN2Str(totalUnits), BN2Str(valueShare), BN2Str(valueLeft), BN2Str(vetherOldBal1))

	})
}

function withdraws(_vether, _acc, _era, _day) {

	it(`Acc0 withdraws from ${_vether} Vether`, async () => {

		let vether
		if (_vether == 'v1') { vether = vether1; }
		else if (_vether == 'v2') { vether = vether2; }
		else if (_vether == 'v3') { vether = vether3; }
		else { vether = vether4; }

		let _bal = Emission

		let valueStart = getBN(await vether.getEmissionShare(_era, _day, _acc));
		let balBNStart = getBN(await vether.balanceOf(_acc))

		let tx = await vether.withdrawShare(_era, _day, { from: _acc })
		// console.log(tx.receipt.logs)
		// let logs = tx.receipt.logs
		// for (var i=0; i<logs.length; i++){
		// 	console.log('event - %s, day - %s', logs[i].event, BN2Str(logs[i].args.day))
		// }

		let balBN = new BigNumber(await vether.balanceOf(_acc))
		assert.equal(balBN.toFixed(), valueStart.plus(balBNStart), "correct acc bal")

		let units = BN2Str(await vether.mapEraDay_MemberUnits.call(_era, _day, _acc))
		assert.equal(units, "0", "the units is correct");

		let totalUnits = await vether.mapEraDay_UnitsRemaining.call(_era, _day);
		assert.equal(totalUnits, "0", "the total units is correct");

		let valueShare = await vether.getEmissionShare(_era, _day, _acc);
		assert.equal(valueShare, "0", "the value share is correct");

		let valueLeft = await vether.mapEraDay_EmissionRemaining.call(_era, _day);
		assert.equal(valueLeft, "0", "the value left is correct");

		let vetherOldBal1 = await vether.balanceOf(vether.address);
		//console.log("vether Balance", vetherOldBal1.toNumber());

		let balBNFinal = new BigNumber(await vether.balanceOf(_acc))
		console.log('Final User Balance: ', balBNFinal.toFixed())
	})
}

function transfer(_vether, _acc) {
	it("allows a transfer between accounts for fees", async () => {

		let vether; let vetherNew;
		if (_vether == 'v1') { vether = vether1; vetherNew=vether2}
		else if (_vether == 'v2') { vether = vether2; vetherNew=vether3}
		else if (_vether == 'v3') { vether = vether3; vetherNew=vether4}
		else { vether = vether4; vetherNew=vether4}

		let vetherOldBal1 = getBN(await vether.balanceOf(vether.address));
		//console.log("vether Balance Start:", vetherOldBal1.toNumber());
		let acc0Bal1 = getBN(await vether.balanceOf(acc0));
		let acc1Bal1 = getBN(await vether.balanceOf(_acc));
		//console.log("Account0 Balance: ", acc0Bal1.toNumber()); //console.log("Account1 Balance: ", acc1Bal1.toNumber());
		let remaining1 = getBN(await vetherNew.getRemainingAmount())

		let r = await vether.transfer(_acc, deposit, { from: acc0 })
		let r2 = await vether.transfer(_acc, deposit, { from: acc0 })
		let r3 = await vether.transfer(acc0, deposit, { from: _acc })

		let acc0Bal2 = getBN(await vether.balanceOf(acc0));
		let acc1Bal2 = getBN(await vether.balanceOf(_acc));
		//console.log("Account0 New Balance: ", acc0Bal2.toNumber()); //console.log("Account1 New Balance: ", acc1Bal2.toNumber());
		assert.equal(BN2Str(acc0Bal1.minus(acc0Bal2)), "1001", "correct acc0 balance")
		assert.equal(BN2Str(acc1Bal2.minus(acc1Bal1)), "998", "correct acc1 balance")

		let vetherOldBal2 = getBN(await vether.balanceOf(vether.address));
		//console.log("vether Balance End:", vetherOldBal2.toNumber());
		assert.equal(BN2Str(vetherOldBal2.minus(vetherOldBal1)), "3", "correct vether balance")

		let vetherFees = await vether.totalFees();
		//console.log("Fees:", vetherFees.toNumber());
		assert.equal(vetherFees.toNumber(), "3", "correct vetherFees")

		let remaining2 = getBN(await vetherNew.getRemainingAmount())
		assert.equal(BN2Str(remaining1.minus(remaining2)), '3')
	})
}

function excludeVether(_vether) {

	it("Excludes swap address", async () => {

		let vether
		if (_vether == 'v1') { vether = vether1; 
			await vether.addExcluded(burnAddress, { from: acc0 })
			assert.equal(await vether.mapAddress_Excluded(burnAddress), true)
		}
		else if (_vether == 'v2') { vether = vether2; 
			await vether.changeExcluded(burnAddress, { from: acc0 })
			assert.equal(await vether.mapAddress_Excluded(burnAddress), true)
		}
		else if (_vether == 'v3'){ vether = vether3; 
			await vether.changeExcluded(acc0, { from: acc0 })
			assert.equal(await vether.mapAddress_Excluded(acc0), true)
			console.log(BN2Str(await vether3.excludedCount()))
			console.log((await vether3.excludedArray(0)))
			console.log((await vether3.excludedArray(1)))
			console.log((await vether3.excludedArray(2)))
			console.log('blockheight', BN2Str(await vether3.mapAddress_BlockChange(acc0)))
		} else {
			vether = vether4; 
			await vether.addExcluded(burnAddress, { from: acc0 })
			assert.equal(await vether.mapAddress_Excluded(burnAddress), true)
		}
	})
}

function snapshot(_vether) {
	// it('fails from non-deployer', async () => {
	// 	let vether; let vetherNew;
	// 	if (_vether == 'v1') { vether = vether1; vetherNew=vether2}
	// 	else if (_vether == 'v2') { vether = vether2; vetherNew=vether4}
	// 	else { vether = vether4; }

	// 	let owners = [acc0, acc1, acc2]
	// 	let ownership = [Emission, Emission / 2, Emission / 4]
	// 	TruffleAssert.reverts(vetherNew.snapshot(owners, ownership, { from: acc1 }))

	// 	console.log('ownership acc0', BN2Str(await vetherNew.mapPreviousOwnership(acc0)))
	// 	console.log('ownership acc1', BN2Str(await vetherNew.mapPreviousOwnership(acc1)))
	// 	console.log('ownership acc2', BN2Str(await vetherNew.mapPreviousOwnership(acc2)))
	// })
	it('adds previous owners', async () => {
		let vether; let vetherNew;
		if (_vether == 'v1') { vether = vether1; vetherNew=vether2
			let owners = [acc0, acc1, acc2]
			let acc0Own = await vether.balanceOf(acc0)
			let acc1Own = await vether.balanceOf(acc1)
			let acc2Own = await vether.balanceOf(acc2)
			let ownership = [acc0Own, acc1Own, acc2Own]
			await vetherNew.snapshot(owners, ownership)
		}
		else if (_vether == 'v2') { vether = vether2; vetherNew=vether3
			let owners = [acc0, acc1, acc2]
			let acc0Own1 = await vether1.balanceOf(acc0)
			let acc1Own1 = await vether1.balanceOf(acc1)
			let acc2Own1 = await vether1.balanceOf(acc2)
			let ownership1 = [acc0Own1, acc1Own1, acc2Own1]
			await vetherNew.snapshot(owners, ownership1)
			let acc0Own2 = await vether2.balanceOf(acc0)
			let acc1Own2 = await vether2.balanceOf(acc1)
			let acc2Own2 = await vether2.balanceOf(acc2)
			let ownership2 = [acc0Own2, acc1Own2, acc2Own2]
			await vetherNew.snapshot(owners, ownership2)
		} if (_vether == 'v3') { vether = vether3; vetherNew=vether4
			let owners = [acc0, acc1, acc2, acc3]
			let acc0Own1 = await vether1.balanceOf(acc0)
			let acc1Own1 = await vether1.balanceOf(acc1)
			let acc2Own1 = await vether1.balanceOf(acc2)
			let acc3Own1 = await vether1.balanceOf(acc3)
			let ownership1 = [acc0Own1, acc1Own1, acc2Own1, acc3Own1]
			await vetherNew.snapshot(owners, ownership1)
			let acc0Own2 = await vether2.balanceOf(acc0)
			let acc1Own2 = await vether2.balanceOf(acc1)
			let acc2Own2 = await vether2.balanceOf(acc2)
			let acc3Own2 = await vether2.balanceOf(acc3)
			let ownership2 = [acc0Own2, acc1Own2, acc2Own2, acc3Own2]
			await vetherNew.snapshot(owners, ownership2)
			let acc0Own3 = await vether3.balanceOf(acc0)
			let acc1Own3 = await vether3.balanceOf(acc1)
			let acc2Own3 = await vether3.balanceOf(acc2)
			let acc3Own3 = await vether3.balanceOf(acc3)
			let ownership3 = [acc0Own3, acc1Own3, acc2Own3, acc3Own3]
			await vetherNew.snapshot(owners, ownership3)
		}
		else { vether = vether4; }
		console.log('ownership acc0', BN2Str(await vetherNew.mapPreviousOwnership(acc0)))
		console.log('ownership acc1', BN2Str(await vetherNew.mapPreviousOwnership(acc1)))
		console.log('ownership acc2', BN2Str(await vetherNew.mapPreviousOwnership(acc2)))
	})
}

function sendEtherFail(_vether) {

	it("fails if sending too early", async () => {
		let vether
		if (_vether == 'v1') {vether = vether1;} 
		else if (_vether == 'v2') {vether = vether2;} 
		else {vether = vether4;}
		// console.log(_vether)
		// console.log(vether.address)
		TruffleAssert.reverts(vether.send(sendEth, { from: acc0 }))
	})
}

function upgradeTo2(_acc) {

	// it("fails an upgrade for too much", async () => {
	// 	console.log('ownership acc', BN2Str(await vether4.mapPreviousOwnership(_acc)))
	// 	await vether.approve(vether4.address, '10000000', {from:_acc})
	// 	TruffleAssert.reverts(vether4.upgrade('10000000'))
	// })

	it(`allows ${_acc} to upgrade all from Vether1 to Vether2`, async () => {
		let balanceLeft = await vether1.balanceOf(_acc)
		let upgradedAmount = getBN(await vether2.upgradedAmount())
		console.log('balanceLeft', BN2Str(balanceLeft))
		console.log('ownership acc', BN2Str(await vether2.mapPreviousOwnership(_acc)))
		let remaining = getBN(await vether2.getRemainingAmount())
		console.log('remainig', BN2Str(remaining))
		console.log('balanceBurnStart', BN2Str(await vether1.balanceOf(burnAddress)))

		await vether1.approve(vether2.address, balanceLeft, { from: _acc })
		let tx = await vether2.upgrade(balanceLeft, { from: _acc })
		// console.log(tx.receipt.logs)

		let balanceBurn = await vether1.balanceOf(burnAddress)
		console.log('balanceBurn', BN2Str(balanceBurn))
		// assert.equal(balanceBurn, balanceLeft.toString())
		let remainingEnd = getBN(await vether2.getRemainingAmount())
		console.log('remainingEnd', BN2Str(remainingEnd))
		assert.equal(BN2Str(remaining.minus(remainingEnd)), BN2Str(balanceLeft))


		let newUpgradedAmount = BN2Str(await vether2.upgradedAmount())
		assert.equal(newUpgradedAmount, BN2Str(upgradedAmount.plus(balanceLeft)))
		console.log('holders', BN2Str(await vether2.holders()))
		console.log('holder0', await vether2.holderArray(0))
	})
}

function failUpgradeTo4from1Address(_acc) {

	it("Failes with wrong VETH", async () => {
		TruffleAssert.reverts(vether4.upgrade(acc3, { from: _acc }))
	})
}

function upgradeTo4from1(_acc) {

	it("allows a Vether1 upgrade to vether4 starts", async () => {
		let balanceLeft = await vether1.balanceOf(_acc)
		let remaining = getBN(await vether4.getRemainingAmount())
		let upgradedAmount = getBN(await vether4.upgradedAmount())
		console.log('balanceLeft', BN2Str(balanceLeft))
		console.log('ownership acc', BN2Str(await vether4.mapPreviousOwnership(_acc)))
		await vether1.approve(vether4.address, balanceLeft, { from: _acc })
		console.log('allowance', BN2Str(await vether1.allowance(_acc, vether4.address)))

		let balanceBurn1 = getBN(await vether1.balanceOf(burnAddress))
		await vether4.upgrade(vether1.address, { from: _acc })
		let balanceBurn2 = getBN(await vether1.balanceOf(burnAddress))
		
		assert.equal(BN2Str(balanceBurn2.minus(balanceBurn1)), BN2Str(balanceLeft))
		let remainingEnd = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingEnd)), balanceLeft.toString())
		//console.log(BN2Str(remainingEnd))

		let newUpgradedAmount = BN2Str(await vether4.upgradedAmount())
		assert.equal(newUpgradedAmount, BN2Str(upgradedAmount.plus(balanceLeft)))

		const remainingNew = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingNew)), BN2Str(balanceLeft))
		console.log('remainingNew', BN2Str(remainingNew))
		console.log('balance', BN2Str(await vether4.balanceOf(_acc)))
		console.log('holders', BN2Str(await vether4.holders()))
		console.log('holder0', await vether4.holderArray(0))

	})
}
function upgradeTo4from2(_acc) {

	it("allows a Vether2 upgrade to vether4", async () => {
		let balanceLeft = await vether2.balanceOf(_acc)
		let remaining = getBN(await vether4.getRemainingAmount())
		let upgradedAmount = getBN(await vether4.upgradedAmount())
		console.log('balanceLeft', BN2Str(balanceLeft))
		console.log('ownership acc', BN2Str(await vether4.mapPreviousOwnership(_acc)))
		await vether2.approve(vether4.address, balanceLeft, { from: _acc })
		console.log('allowance', BN2Str(await vether2.allowance(_acc, vether4.address)))

		let balanceBurn1 = getBN(await vether2.balanceOf(burnAddress))
		await vether4.upgrade(vether2.address, { from: _acc })
		let balanceBurn2 = getBN(await vether2.balanceOf(burnAddress))
		
		assert.equal(BN2Str(balanceBurn2.minus(balanceBurn1)), BN2Str(balanceLeft))
		let remainingEnd = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingEnd)), balanceLeft.toString())
		//console.log(BN2Str(remainingEnd))

		let newUpgradedAmount = BN2Str(await vether4.upgradedAmount())
		assert.equal(newUpgradedAmount, BN2Str(upgradedAmount.plus(balanceLeft)))

		const remainingNew = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingNew)), BN2Str(balanceLeft))
		console.log('remainingNew', BN2Str(remainingNew))
		console.log('balance', BN2Str(await vether4.balanceOf(_acc)))
		console.log('holders', BN2Str(await vether4.holders()))
		console.log('holder0', await vether4.holderArray(0))

	})
}

function upgradeTo4from3(_acc) {

	it("allows a Vether2 upgrade to vether4", async () => {
		let balanceLeft = await vether3.balanceOf(_acc)
		let remaining = getBN(await vether4.getRemainingAmount())
		let upgradedAmount = getBN(await vether4.upgradedAmount())
		console.log('balanceLeft', BN2Str(balanceLeft))
		console.log('ownership acc', BN2Str(await vether4.mapPreviousOwnership(_acc)))
		await vether3.approve(vether4.address, balanceLeft, { from: _acc })
		console.log('allowance', BN2Str(await vether3.allowance(_acc, vether4.address)))

		let balanceBurn1 = getBN(await vether3.balanceOf(burnAddress))
		await vether4.upgrade(vether3.address, { from: _acc })
		let balanceBurn2 = getBN(await vether3.balanceOf(burnAddress))
		
		assert.equal(BN2Str(balanceBurn2.minus(balanceBurn1)), BN2Str(balanceLeft))
		let remainingEnd = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingEnd)), balanceLeft.toString())
		//console.log(BN2Str(remainingEnd))

		let newUpgradedAmount = BN2Str(await vether4.upgradedAmount())
		assert.equal(newUpgradedAmount, BN2Str(upgradedAmount.plus(balanceLeft)))

		const remainingNew = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingNew)), BN2Str(balanceLeft))
		console.log('remainingNew', BN2Str(remainingNew))
		console.log('balance', BN2Str(await vether4.balanceOf(_acc)))
		console.log('holders', BN2Str(await vether4.holders()))
		console.log('holder0', await vether4.holderArray(0))

	})
}

function transfer4(_acc) {
	it("allows a transfer between accounts for fees", async () => {
		let vether = vether4
		let vetherOldBal1 = getBN(await vether.balanceOf(vether.address));
		//console.log("vether Balance Start:", vetherOldBal1.toNumber());
		let acc0Bal1 = getBN(await vether.balanceOf(acc0));
		let acc1Bal1 = getBN(await vether.balanceOf(_acc));
		//console.log("Account0 Balance: ", acc0Bal1.toNumber()); //console.log("Account1 Balance: ", acc1Bal1.toNumber());

		let r = await vether.transfer(_acc, deposit, { from: acc0 })
		let r2 = await vether.transfer(_acc, deposit, { from: acc0 })
		let r3 = await vether.transfer(acc0, deposit, { from: _acc })

		let acc0Bal2 = getBN(await vether.balanceOf(acc0));
		let acc1Bal2 = getBN(await vether.balanceOf(_acc));
		//console.log("Account0 New Balance: ", acc0Bal2.toNumber()); //console.log("Account1 New Balance: ", acc1Bal2.toNumber());
		assert.equal(BN2Str(acc0Bal1.minus(acc0Bal2)), "1001", "correct acc0 balance")
		assert.equal(BN2Str(acc1Bal2.minus(acc1Bal1)), "998", "correct acc1 balance")

		let vetherOldBal2 = getBN(await vether.balanceOf(vether.address));
		//console.log("vether Balance End:", vetherOldBal2.toNumber());
		assert.equal(BN2Str(vetherOldBal2.minus(vetherOldBal1)), "3", "correct vether balance")

		let vetherFees = await vether.totalFees();
		//console.log("Fees:", vetherFees.toNumber());
		assert.equal(vetherFees.toNumber(), "3", "correct vetherFees")

	})
}

function failUpgradeTo3from1(_acc) {

	it("fails a Vether1 upgrade to vether4", async () => {
		let balanceLeft = await vether1.balanceOf(_acc)
		let remaining = getBN(await vether4.getRemainingAmount())
		let upgradedAmount = getBN(await vether4.upgradedAmount())
		console.log('balanceLeft', BN2Str(balanceLeft))
		console.log('ownership acc', BN2Str(await vether4.mapPreviousOwnership(_acc)))
		await vether1.approve(vether4.address, balanceLeft, { from: _acc })
		console.log('allowance', BN2Str(await vether1.allowance(_acc, vether4.address)))

		let balanceBurn1 = getBN(await vether1.balanceOf(burnAddress))
		await vether4.upgrade(vether1.address, { from: _acc })
		let balanceBurn2 = getBN(await vether1.balanceOf(burnAddress))
		
		assert.equal(BN2Str(balanceBurn2.minus(balanceBurn1)), BN2Str(0))
		let remainingEnd = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingEnd)), BN2Str(0))
		//console.log(BN2Str(remainingEnd))

		let newUpgradedAmount = BN2Str(await vether4.upgradedAmount())
		assert.equal(newUpgradedAmount, BN2Str(upgradedAmount.plus(0)))

		const remainingNew = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingNew)), BN2Str(0))
		console.log('remainingNew', BN2Str(remainingNew))
		console.log('balance', BN2Str(await vether4.balanceOf(_acc)))
		console.log('holders', BN2Str(await vether4.holders()))
		console.log('holder0', await vether4.holderArray(0))
		console.log('holder1', await vether4.holderArray(1))
		console.log('holder2', await vether4.holderArray(2))
		console.log('holder3', await vether4.holderArray(3))
		console.log('holder4', await vether4.holderArray(4))

	})
}
function failUpgradeTo3from2(_acc) {

	it("fails a Vether2 upgrade to vether4", async () => {
		let balanceLeft = await vether2.balanceOf(_acc)
		let remaining = getBN(await vether4.getRemainingAmount())
		let upgradedAmount = getBN(await vether4.upgradedAmount())
		console.log('balanceLeft', BN2Str(balanceLeft))
		console.log('ownership acc', BN2Str(await vether4.mapPreviousOwnership(_acc)))
		await vether2.approve(vether4.address, balanceLeft, { from: _acc })
		console.log('allowance', BN2Str(await vether2.allowance(_acc, vether4.address)))

		let balanceBurn1 = getBN(await vether2.balanceOf(burnAddress))
		await vether4.upgrade(vether2.address, { from: _acc })
		let balanceBurn2 = getBN(await vether2.balanceOf(burnAddress))
		
		assert.equal(BN2Str(balanceBurn2.minus(balanceBurn1)), BN2Str(0))
		let remainingEnd = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingEnd)), BN2Str(0))
		//console.log(BN2Str(remainingEnd))

		let newUpgradedAmount = BN2Str(await vether4.upgradedAmount())
		assert.equal(newUpgradedAmount, BN2Str(upgradedAmount.plus(0)))

		const remainingNew = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingNew)), BN2Str(0))
		console.log('remainingNew', BN2Str(remainingNew))
		console.log('balance', BN2Str(await vether4.balanceOf(_acc)))
		console.log('holders', BN2Str(await vether4.holders()))
		console.log('holder0', await vether4.holderArray(0))

	})
}
function failUpgradeTo3from3(_acc) {

	it("fails a Vether2 upgrade to vether4", async () => {
		let balanceLeft = await vether3.balanceOf(_acc)
		let remaining = getBN(await vether4.getRemainingAmount())
		let upgradedAmount = getBN(await vether4.upgradedAmount())
		console.log('balanceLeft', BN2Str(balanceLeft))
		console.log('ownership acc', BN2Str(await vether4.mapPreviousOwnership(_acc)))
		await vether3.approve(vether4.address, balanceLeft, { from: _acc })
		console.log('allowance', BN2Str(await vether3.allowance(_acc, vether4.address)))

		let balanceBurn1 = getBN(await vether3.balanceOf(burnAddress))
		await vether4.upgrade(vether3.address, { from: _acc })
		let balanceBurn2 = getBN(await vether3.balanceOf(burnAddress))
		
		assert.equal(BN2Str(balanceBurn2.minus(balanceBurn1)), BN2Str(0))
		let remainingEnd = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingEnd)), BN2Str(0))
		//console.log(BN2Str(remainingEnd))

		let newUpgradedAmount = BN2Str(await vether4.upgradedAmount())
		assert.equal(newUpgradedAmount, BN2Str(upgradedAmount.plus(0)))

		const remainingNew = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingNew)), BN2Str(0))
		console.log('remainingNew', BN2Str(remainingNew))
		console.log('balance', BN2Str(await vether4.balanceOf(_acc)))
		console.log('holders', BN2Str(await vether4.holders()))
		console.log('holder0', await vether4.holderArray(0))

	})
}

function purge() {
	it('purge', async () => {
		let owners = [acc0, acc1, acc2]
		let acc0Own = await vether4.balanceOf(acc0)
		let acc1Own = await vether4.balanceOf(acc1)
		let acc2Own = await vether4.balanceOf(acc2)
		let ownership = [acc0Own, acc1Own, acc2Own]
		await vether4.purgeDeployer()
		TruffleAssert.reverts(vether4.snapshot(owners, ownership, { from: acc0 }))

	})
}
