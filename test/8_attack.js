var Vether = artifacts.require("./Vether.sol")
var AttackToken = artifacts.require("./AttackToken.sol") 
var AttackContract = artifacts.require("./AttackContract.sol") 
var Token1 = artifacts.require("./Token1.sol") 
var Token2 = artifacts.require("./Token2.sol") 
var Registry1 = artifacts.require("./Registry1.sol")
var Exchange1 = artifacts.require("./Exchange1.sol")

const BigNumber = require('bignumber.js')

var coin; var coinAddress; 
var acc0; var acc1; var acc2; var accBurn;

var TknContractArray = [Token1, Token2];
var TknInstArray = []; var TknAddrArray = [];
var RegContract = Registry1; var RegInst; var RegAddr;
var ExcContract = Exchange1; var ExcInst; var ExcAddr;

var TknInst; var TknAddr;
var ConInst; var ConAddr;

function BN2Int(BN) {return ((new BigNumber(BN)).toFixed()) }
function getBN(BN) {return ((new BigNumber(BN))) }

contract("Vether", async accounts => {
    constructor(accounts)
    deployTokens()
	deployRegistries()
	deployExchanges()
	setRegExc()
    attack()
})


function constructor(accounts) {
	acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2]; accBurn = acc2;
	//console.log(acc2)
	it("initializes with correct params", async () => {
		coin = await Vether.new()
        coinAddress = coin.address; //console.log("coinAddress:", coinAddress)
        
        TknInst = await AttackToken.new();
        TknAddr = TknInst.address;

        ConInst = await AttackContract.new(TknAddr, coinAddress);
        ConAddr = ConInst.address;

        console.log(coinAddress, TknAddr, ConAddr)
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
		RegInst = await RegContract.new(); 
		RegAddr = RegInst.address; //console.log("Reg%sAddr:%s", i, RegAddr)
	})
}

function deployExchanges(){
	it("Deploy and get Exchange Addresses", async () => {
		ExcInst = await ExcContract.new(); ExcAddr = ExcInst.address; //console.log("Exc%sAddr:%s", i, ExcAddr)
	})
}

function setRegExc(){
	it("Set Exchange, Token addr", async () => {
			let r1 = await RegInst.setExchange(ExcAddr, TknAddrArray[0],  { from: acc0 })
			let r2 = await RegInst.getExchange(TknAddrArray[0],  { from: acc0 })
			assert.equal(r2, ExcAddr, "correct exchange addr set in registry")
			//console.log("excAddr set:", r2)

			let r3 = await coin.addRegistryInternal(RegAddr, { from: acc0 })
			let r4 = await coin.registryAddress.call()
			assert.equal(r4, RegAddr, "correct registry addr set in coin contract")
			//console.log("regAddr Set:", r4)

			let r5 = await coin.getExchange(TknAddrArray[0],  { from: acc0 })
			assert.equal(r5, ExcAddr, "correct exchange2 addr returned from coin")
			//console.log("excAddr Returned by Coin:", r5)

			let r6 = await ExcInst.setToken(TknAddrArray[0],  { from: acc0 })
			let r7 = await ExcInst.getToken()
			assert.equal(r7, TknAddrArray[0], "correct token addr set in exchange")
			//console.log("tknAddr Returned by Exc:", r7)

			let r8 = await ExcInst.send(8000000000000000, { from: acc2 })
			let balance = await web3.eth.getBalance(ExcAddr)
			assert.equal(balance, 8000000000000000, "exchange balance correct")
	})
}

function attack() {

	it("attacks", async () => {
        // let r1 = await TknInst.approve(coinAddress, "1000000000000000000", { from: acc0 })
        // console.log(r1.logs[0])
        // let rx = await coin.burnTokens(TknAddr, "100000000000000000",  { from: acc0 })
        // console.log(rx.logs[0])
        let era = await coin.currentEra();
        let day = await coin.currentDay();
        console.log(era, day)

        let r2 = await TknInst.approve(ConAddr, "1000000000000000000", { from: acc0 })
        // console.log(r2.logs[0])
        let balStart = getBN(await web3.eth.getBalance(acc0))
        let tx = await ConInst.attack("100000000000000000", { from: acc0 })
        let balEnd = getBN(await web3.eth.getBalance(acc0))
        // console.log(tx.receipt.rawLogs)
        // console.log("logs:%s - first:%s", tx.logs.length, tx.logs[0].event); 


        let units = BN2Int(await coin.mapEraDay_MemberUnits.call(era, day, ConAddr))
        console.log(units)

        console.log(BN2Int(balStart.minus(balEnd)))

	})
}

