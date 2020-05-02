var Token1 = artifacts.require("./Token1.sol") 
var Token2 = artifacts.require("./Token2.sol") 
var Token3 = artifacts.require("./Token3.sol") 
var Registry1 = artifacts.require("./Registry1.sol")
var Exchange1 = artifacts.require("./Exchange1.sol") 
var Registry2 = artifacts.require("./Registry2.sol")
var Exchange2 = artifacts.require("./Exchange2.sol") 

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
};