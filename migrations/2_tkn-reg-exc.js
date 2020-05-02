var Token1 = artifacts.require("./Token1.sol") 
var Token2 = artifacts.require("./Token2.sol") 
var Token3 = artifacts.require("./Token3.sol") 
var Registry1 = artifacts.require("./Registry1.sol")
var Exchange1 = artifacts.require("./Exchange1.sol") 
var Registry2 = artifacts.require("./Registry2.sol")
var Exchange2 = artifacts.require("./Exchange2.sol") 

module.exports = function(deployer) {
  deployer.deploy(Token1);
  deployer.deploy(Token2);
  deployer.deploy(Token3);
  deployer.deploy(Registry1);
  deployer.deploy(Exchange1);
  deployer.deploy(Registry2);
  deployer.deploy(Exchange2);
};