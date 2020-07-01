var Token1 = artifacts.require("./Token1.sol") 
var Token2 = artifacts.require("./Token2.sol") 
var Token3 = artifacts.require("./Token3.sol") 
var Registry1 = artifacts.require("./Registry1.sol")
var Exchange1 = artifacts.require("./Exchange1.sol") 
var Registry2 = artifacts.require("./Registry2.sol")
var Exchange2 = artifacts.require("./Exchange2.sol") 
// var Vether = artifacts.require("./Vether.sol");
// let AttackToken = artifacts.require("./attackToken.sol");
// let AttackContract= artifacts.require("./attackContract.sol");

let Vether1 = artifacts.require("./Vether1.sol");
let Vether2 = artifacts.require("./Vether2.sol");
let Vether3 = artifacts.require("./Vether3.sol");
let Vether4 = artifacts.require("./Vether4.sol");

module.exports = async() => {
    const token1 = await Token1.new();
    Token1.setAsDeployed(token1)
    const token2 = await Token2.new();
    Token1.setAsDeployed(token2)
    const token3 = await Token3.new();
    Token1.setAsDeployed(token3)
    const registry1 = await Registry1.new();
    Registry1.setAsDeployed(registry1)
    const registry2 = await Registry2.new();
    Registry2.setAsDeployed(registry2)
    const exchange1 = await Exchange1.new();
    Exchange1.setAsDeployed(exchange1)
    const exchange2 = await Exchange2.new();
    Exchange2.setAsDeployed(exchange2)

    const vether1 = await Vether1.new();
    Vether1.setAsDeployed(vether1)
    const vether2 = await Vether2.new(vether1.address);
    Vether2.setAsDeployed(vether2)
    const vether3 = await Vether3.new(vether1.address, vether2.address);
    Vether3.setAsDeployed(vether3)
    const vether4 = await Vether4.new(vether1.address, vether2.address, vether3.address);
    Vether4.setAsDeployed(vether4)

};
