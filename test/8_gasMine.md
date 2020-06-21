var Vether = artifacts.require("./Vether.sol")
var GasToken = artifacts.require("./GasToken.sol") 
// var GasMineContract = artifacts.require("./GasMineContract.sol") 
var Token1 = artifacts.require("./Token1.sol") 
var Token2 = artifacts.require("./Token2.sol") 
var Registry1 = artifacts.require("./Registry1.sol")
var Exchange1 = artifacts.require("./Exchange1.sol")

const BigNumber = require('bignumber.js')

var vether; var vetherAddress; 
var acc0; var acc1; var acc2; var accBurn;

var TknContractArray = [Token1, Token2];
var gasTokenArray = []; var TknAddrArray = [];
var RegContract = Registry1; var RegInst; var RegAddr;
var ExcContract = Exchange1; var ExcInst; var ExcAddr;

var gasToken; var TknAddr;
var gasMineContract; var ConAddr;

function BN2Int(BN) {return ((new BigNumber(BN)).toFixed()) }
function getBN(BN) {return ((new BigNumber(BN))) }

contract("Vether", async accounts => {
    constructor(accounts)
    deployTokens()
	deployRegistries()
	deployExchanges()
	setRegExc()
    gasMine()
})


function constructor(accounts) {
	acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2]; accBurn = acc2;
	//console.log(acc2)
	it("initializes with correct params", async () => {
		vether = await Vether.new()
        vetherAddress = vether.address; //console.log("vetherAddress:", vetherAddress)
        
        gasToken = await GasToken.new(vetherAddress);
		TknAddr = gasToken.address;

        // gasMineContract = await GasMineContract.new(TknAddr, vetherAddress);
		// ConAddr = gasMineContract.address;
		
		const supply = await gasToken.totalSupply()
		// await gasToken.transfer(ConAddr, supply)
		

		console.log(vetherAddress, TknAddr)
		const balance = await gasToken.balanceOf(TknAddr)
		console.log('balance', BN2Int(balance))
		console.log('vether', await gasToken.vether())
	})
}

function deployTokens(){
	it("Deploy and get Token Addresses", async () => {
		for(var i = 0; i < TknContractArray.length; i++) {
			gasTokenArray[i] = await TknContractArray[i].new(); TknAddrArray[i] = gasTokenArray[i].address; //console.log("tkn%sAddr:%s", i, TknAddrArray[i])
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

			let r3 = await vether.addRegistryInternal(RegAddr, { from: acc0 })
			let r4 = await vether.registryAddress.call()
			assert.equal(r4, RegAddr, "correct registry addr set in vether contract")
			//console.log("regAddr Set:", r4)

			let r5 = await vether.getExchange(TknAddrArray[0],  { from: acc0 })
			assert.equal(r5, ExcAddr, "correct exchange2 addr returned from vether")
			//console.log("excAddr Returned by vether:", r5)

			let r6 = await ExcInst.setToken(TknAddrArray[0],  { from: acc0 })
			let r7 = await ExcInst.getToken()
			assert.equal(r7, TknAddrArray[0], "correct token addr set in exchange")
			//console.log("tknAddr Returned by Exc:", r7)

			let r8 = await ExcInst.send(8000000000000000, { from: acc2 })
			let balance = await web3.eth.getBalance(ExcAddr)
			assert.equal(balance, 8000000000000000, "exchange balance correct")
	})
}

function gasMine() {

	it("Gas Mines", async () => {
        let era = await vether.currentEra();
        let day = await vether.currentDay();
		console.log(BN2Int(era), BN2Int(day))
		let balStart = getBN(await web3.eth.getBalance(acc0))
		
		await gasToken.mine()
		
        let balEnd = getBN(await web3.eth.getBalance(acc0))
        let units = BN2Int(await vether.mapEraDay_MemberUnits.call(era, day, acc0))
        console.log('%s - units awarded', units)
        console.log("%s - gas spent", BN2Int(balStart.minus(balEnd)))

	})
}

