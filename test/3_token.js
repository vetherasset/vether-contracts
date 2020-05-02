const BigNumber = require('bignumber.js')
//const assert = require('assert')
var Vether = artifacts.require("./Vether.sol")
var Token1 = artifacts.require("./Token1.sol") 
var Token2 = artifacts.require("./Token2.sol") 
var Token3 = artifacts.require("./Token3.sol") 
var Registry1 = artifacts.require("./Registry1.sol")
var Registry2 = artifacts.require("./Registry2.sol")
var Exchange1 = artifacts.require("./Exchange1.sol")
var Exchange2 = artifacts.require("./Exchange2.sol")

var coin; var coinAddress; 
var acc0; var acc1; var acc2; var accBurn;
var TknContractArray = [Token1, Token2, Token3];
var TknInstArray = []; var TknAddrArray = [];
var RegContractArray = [Registry1, Registry2];
var RegInstArray = []; var RegAddrArray = [];
var ExcContractArray = [Exchange1, Exchange2];
var ExcInstArray = []; var ExcAddrArray = [];
var event = {"era":"", "day":"", "emission":""}

const timeDelay = 1100;
const delay = ms => new Promise(res => setTimeout(res, ms));
function BN2Int(BN) {return ((new BigNumber(BN)).toFixed()) }

//######################################################################################
// This test deploys Vether, three different ERC-20 tokens, 
// two UniSwap registries and two UniSwap exchanges. 
// It then registers the tokens in the exchanges, and the exchanges in the registries. 
// It places ether in the exchanges to provide a pool balance
// It then sends the first token, which has a market and then withdraws
// It then send the second token in the second registry and then withdraws
// It then sends the third token which is not found in the registries and withdraws
// It then repeats, but designating a payment member
//######################################################################################

contract("Vether", async accounts => {
	constructor(accounts)
	deployTokens()
	deployRegistries()
	deployExchanges()
	setRegExc()
	sendToken(0, acc0)
	withdraws(acc0, event, 2048)
	sendToken(1, acc0)
	withdraws(acc0, event, 3072)
	sendToken(2, acc0, )
	withdraws(acc0, event, 3584)
	sendToken(0, acc0, acc1)
	withdraws(acc0, event, 3584, acc1)
	sendToken(1, acc0, acc1)
	withdraws(acc0, event, 3584, acc1)
	sendToken(2, acc0, acc1)
	withdraws(acc0, event, 3584, acc1)
})

function constructor(accounts) {
	acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2]; accBurn = acc2;
	console.log(acc2)
	it("initializes with correct params", async () => {
		coin = await Vether.new()
		coinAddress = coin.address; //console.log("coinAddress:", coinAddress)
	})
}

function deployTokens(){
	it("Deploy and get Token Addresses", async () => {
		for(var i = 0; i < TknContractArray.length; i++) {
			TknInstArray[i] = await TknContractArray[i].new(); TknAddrArray[i] = TknInstArray[i].address; //console.log("tkn%sAddr:%s", i, TknAddrArray[i])
		}
	})
}

function deployRegistries(){
	it("Deploy and get Registry Addresses", async () => {
		for(var i = 0; i < RegContractArray.length; i++) {
			RegInstArray[i] = await RegContractArray[i].new(); RegAddrArray[i] = RegInstArray[i].address; //console.log("Reg%sAddr:%s", i, RegAddrArray[i])
		}
	})
}

function deployExchanges(){
	it("Deploy and get Exchange Addresses", async () => {
		for(var i = 0; i < ExcContractArray.length; i++) {
			ExcInstArray[i] = await ExcContractArray[i].new(); ExcAddrArray[i] = ExcInstArray[i].address; //console.log("Exc%sAddr:%s", i, ExcAddrArray[i])
		}
	})
}

function setRegExc(){
	it("Set Exchange, Token addr", async () => {
		for(var i = 0; i < RegContractArray.length; i++) {
			let r1 = await RegInstArray[i].setExchange(ExcAddrArray[i], TknAddrArray[i],  { from: acc0 })
			let r2 = await RegInstArray[i].getExchange(TknAddrArray[i],  { from: acc0 })
			assert.equal(r2, ExcAddrArray[i], "correct exchange addr set in registry")
			//console.log("excAddr set:", r2)

			let r3 = await coin.addRegistryInternal(RegAddrArray[i], i, { from: acc0 })
			let r4 = await coin.registryAddrArray.call(i)
			assert.equal(r4, RegAddrArray[i], "correct registry addr set in coin contract")
			//console.log("regAddr Set:", r4)

			let r5 = await coin.getExchange(TknAddrArray[i],  { from: acc0 })
			assert.equal(r5, ExcAddrArray[i], "correct exchange2 addr returned from coin")
			//console.log("excAddr Returned by Coin:", r5)

			let r6 = await ExcInstArray[i].setToken(TknAddrArray[i],  { from: acc0 })
			let r7 = await ExcInstArray[i].getToken()
			assert.equal(r7, TknAddrArray[i], "correct token addr set in exchange")
			//console.log("tknAddr Returned by Exc:", r7)

			let r8 = await ExcInstArray[i].send(8000000000000000, { from: acc2 })
			let balance = await web3.eth.getBalance(ExcAddrArray[i])
			assert.equal(balance, 8000000000000000, "exchange balance correct")
		}
	})
}

function sendToken(i, _acc, member){
	it("Acc0 send Burn Tokens", async () => {
		await delay(timeDelay);
		let accBurnBal1 = await web3.eth.getBalance(accBurn);
		let _era = await coin.currentEra.call()
		let _day = await coin.currentDay.call()
		let _emission = await coin.emission.call()
		event = {"era":_era, "day":_day, "emission":_emission} 

		//let balEx1 = BN2Int(await TknInstArray[i].balanceOf(ExcAddrArray[i]))

		let r1 = await TknInstArray[i].approve(coinAddress, "1000000000000000000", { from: _acc })
		var rx; var _member;
		if(!member){
			_member = _acc
			rx = await coin.burnTokens(TknAddrArray[i], "1000000000000000000",  { from: _acc })
		} else {
			_member = member
			rx = await coin.burnTokensForMember(TknAddrArray[i], "1000000000000000000", _member, { from: _acc })
		}

		//console.log("Era:%s - Day:%s - Token%s", _era.toNumber(), _day.toNumber(), i)
		//console.log("logs:%s - first:%s", rx.logs.length, rx.logs[4].event); 
		//console.log(rx.logs[2])

		if (i <= 1){
			let balEx2 = BN2Int(await TknInstArray[i].balanceOf(ExcAddrArray[i]))
			//console.log(balEx2)
			//assert.equal(balEx2-balEx1, "1000000000000000000", "Exchange received Tokens");

			let accBurnBal2 = await web3.eth.getBalance(accBurn);
			//assert.equal(accBurnBal2-accBurnBal1, "1999999999148032", "Burn Address received Ether");
	
			let memberUnits = new BigNumber(await coin.mapEraDay_MemberUnits.call(_era, _day, _member));
			assert.equal(memberUnits.toFixed(), '2000000000000000', "correct member units");
	
			let totalUnits = new BigNumber(await coin.mapEraDay_Units.call(_era, _day));
			assert.equal(totalUnits.toFixed(), "2000000000000000", "correct totalUnits");
		} else {
			let balEx2 = await TknInstArray[i].balanceOf(accBurn);
			//console.log(balEx2)
			//assert.equal(balEx2-balEx1, "1000000000000000000", "BurnAddr received Tokens");
	
			let memberUnits = new BigNumber(await coin.mapEraDay_MemberUnits.call(_era, _day, _member));
			//console.log('memberUnits:', memberUnits.toFixed())
			//assert.equal(memberUnits.toFixed(), '1768760000000000', "correct member units");
	
			let totalUnits = new BigNumber(await coin.mapEraDay_Units.call(_era, _day));
			//console.log('memberUnits:', totalUnits.toFixed())
			//assert.equal(totalUnits.toFixed(), "1768760000000000", "correct totalUnits");
		}

		let emissionLeft = new BigNumber(await coin.mapEraDay_Emission.call(_era, _day));
		assert.equal(emissionLeft.toFixed(), _emission, "correct emissionleft");

		let memberUnits = BN2Int(await coin.mapEraDay_MemberUnits.call(_era, _day, _member))
		//console.log('memberUnits', memberUnits) 
		let totalUnits = BN2Int(await coin.mapEraDay_UnitsRemaining.call(_era, _day))
		//console.log('totalUnits', totalUnits)
		let emissionForDay = BN2Int(await coin.mapEraDay_Emission.call(_era, _day))
		//console.log('emissionForDay', emissionForDay)
		let balance = BN2Int(await coin.balanceOf.call(coinAddress))
		//console.log('balance', balance)
		let emissionRemaining = BN2Int(await coin.mapEraDay_EmissionRemaining.call(_era, _day))
		//console.log('emissionRemaining', emissionRemaining)
		if (emissionForDay > balance) { emissionForDay = balance; }
		//console.log('emissionForDay', emissionForDay)
		let emissionShare = (emissionForDay * memberUnits) / totalUnits;
		//console.log('emissionShare', emissionShare)
		if (emissionShare > emissionRemaining) {
			emissionShare = emissionRemaining;
			}
		//console.log('emissionShare', emissionShare)

		let _emissionShare = BN2Int(await coin.getEmissionShare(_era, _day, _member));
		////console.log(_era, _day, _member, _emissionShare)
		assert.equal(_emissionShare, _emission, "correct emissionShare");

	})
}

function withdraws(_acc, _event, _bal, member){

	it("Acc0 withdraws", async () => {

		let _era = event.era; let _day = event.day
		let _emission = event.emission
		
			var receipt; var _member;
			if (!member){
				_member = _acc
				receipt = await coin.withdrawShare(_era, _day, { from: _acc })
			} else {
				_member = member
				receipt = await coin.withdrawShareForMember(_era, _day, _member, { from: _acc })
			}
			//console.log('Era:%s - Day:%s', _era, _day)
			//console.log("logs:%s - first:%s", receipt.logs.length, receipt.logs[0].event); 
	
			let balBN = BN2Int(await coin.balanceOf(_member))
			//console.log('balBN',balBN)
			//assert.equal(balBN, _bal, "correct acc bal")
	
			let units = await coin.mapEraDay_MemberUnits.call(_era, _day, _member);
			assert.equal(units, "0", "the units is correct");

			let totalUnits = (new BigNumber(await coin.mapEraDay_UnitsRemaining.call(_era, _day))).toFixed();
			assert.equal(totalUnits, 0, "the total units is correct");
	
			let valueShare = await coin.getEmissionShare(_era, _day, _member);
			assert.equal(valueShare, "0", "the value share is correct");
	
			let valueLeft = BN2Int(await coin.mapEraDay_Emission.call(_era, _day))
			assert.equal(valueLeft, _emission, "the value left is correct");
	
			//let coinBal1 = await coin.balanceOf(coinAddress);
			////console.log("coinBal1", coinBal1.toNumber());

		// let balBN2 = new BigNumber(await coin.balanceOf(_acc))
		// assert.equal(balBN2.toFixed(), _emission*_era, "correct acc2 bal")
		// //console.log('Final Balance: ', balBN.toFixed())
   })
}