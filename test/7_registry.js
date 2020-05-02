var Vether = artifacts.require("./Vether.sol")
var Registry1 = artifacts.require("./Registry1.sol")
var Registry2 = artifacts.require("./Registry2.sol")
const BigNumber = require('bignumber.js')
var TruffleAssert = require('truffle-assertions')

var coin; var coinAddress; var regAddress1; var regAddress2;
var acc0; var acc1; var acc2;

const Emission = '2048'; 
const send1 = 1000;

const timeDelay = 1000;
const delay = ms => new Promise(res => setTimeout(res, ms));
function BN2Str(BN) { return (new BigNumber(BN)).toFixed() }

//######################################################################################
// Vether is sent in to test the mappings of the contract
// It should send in different eras and days then run an efficient loop to find them all
//######################################################################################

contract("Vether", function(accounts) {
  constructor(accounts)
  sendEther(acc0)
  withdraws(acc0)
  testTransferFrom(acc0, acc1)
  addRegistryFail(acc0)
  addRegistry(acc0)
})

function constructor(accounts) {
  acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2];
  it("constructor events", async () => {
    let Vether = artifacts.require("Vether.sol");
    coin = await Vether.new()
    coinAddress = coin.address;
    let Registry1 = artifacts.require("Registry1.sol");
    registry1 = await Registry1.new()
    regAddress1 = registry1.address;
    let Registry2 = artifacts.require("Registry2.sol");
    registry2 = await Registry2.new()
    regAddress2 = registry2.address;
    //console.log("regAddress2:", regAddress2) 
  });
}

function sendEther(_acc) {

    it("Acc0 sends Ether", async () => {
      
      for(var i = 0; i<=2; i++) {
        if(i == 7){
          _acc = acc1;
        }
        await delay(timeDelay)
        let _era = await coin.currentEra.call()
		    let _day = await coin.currentDay.call()
        let receipt = await coin.send(send1, { from: _acc})
        // console.log("blocknumber:", receipt.logs[0].blockNumber);
        // console.log("logs:%s - first:%s", receipt.logs.length, receipt.logs[0].event); 
        //console.log('Tx%s Sent in Era: %s Day: %s', i, _era, _day)
        // console.log('Emission:', _emission)
      }
    })
}

function withdraws(_acc) {

    it("Acc0 withdraws", async () => {

     let _era = 1; let _day = 1;
     var i = 0
     do {
       let receipt = await coin.withdrawShare(_era, _day, { from: _acc })
       i++
       _day++
       if(_day > 2) {
         _era++
         _day = 1;
       }
     }
     while (_era < 2); 
     let balBN = new BigNumber(await coin.balanceOf(_acc))
     //console.log('Final User Balance: ', balBN.toFixed())
})
}

function testTransferFrom(_acc, _spender) {
    it('Add Registry', async () => {
        let balBN = new BigNumber(await coin.balanceOf(_acc))
        //console.log('User Balance: ', balBN.toFixed())
        let r1 = await coin.approve(_spender, "100", { from: _acc })
        let approval = BN2Str(await coin.allowance.call(_acc, _spender))
        //console.log('approval', approval)
        let rx = await coin.transferFrom(_acc, _spender, "100", { from: _spender })  
        let balBN2 = new BigNumber(await coin.balanceOf(_acc))
        assert.equal(balBN2, balBN - 100, "correct final balance")
    })
  }

  function addRegistryFail(_acc) {
    it('Add Incorrect Registry', async () => {
        let r3 = await coin.addRegistryInternal(regAddress1, 0, { from: _acc })
        let r1 = await coin.approve(coinAddress, "513", { from: _acc })
        let rx = await TruffleAssert.reverts(coin.addRegistry(acc1, 0, { from: _acc }))
    })
    it('Add Incorrect Index', async () => {
      let r3 = await coin.addRegistryInternal(regAddress1, 0, { from: _acc })
      let r1 = await coin.approve(coinAddress, "513", { from: _acc })
      let rx = await TruffleAssert.reverts(coin.addRegistry(regAddress1, 3, { from: _acc }))
  })
  }

function addRegistry(_acc) {
  it('Add Registry', async () => {

    let balBN = new BigNumber(await coin.balanceOf(_acc))
    //console.log('User Balance: ', balBN.toFixed())

    let r3 = await coin.addRegistryInternal(regAddress1, 0, { from: _acc })
    let registryAddrStart = await coin.registryAddrArray.call(0)
    //console.log(registryAddrStart)

    let era = (new BigNumber(await coin.currentEra.call())).toFixed()
    //console.log("lastest Era:", era)
    let r1 = await coin.approve(coinAddress, "513", { from: _acc })
    let approval = BN2Str(await coin.allowance.call(_acc, coinAddress))
    //console.log('approval', approval)
    let registryAdded = await coin.registryAdded.call()
    //console.log('registryAdded', registryAdded)
    let emission = BN2Str(await coin.emission.call())
    //console.log('emission', emission)
    let rx = await coin.addRegistry(regAddress2, 0, { from: _acc })

    let balBN2 = new BigNumber(await coin.balanceOf(_acc))
    //console.log('User Balance: ', balBN2.toFixed())
    assert.equal(balBN2, balBN - emission, "correct final balance")

    let registryAddrFinal = await coin.registryAddrArray.call(0)
    //console.log(registryAddrFinal)
    assert.equal(registryAddrFinal, regAddress2, "correct address")
  })
}


