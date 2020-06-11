let AttackToken = artifacts.require("./AttackToken.sol");
let AttackContract= artifacts.require("./AttackContract.sol");

module.exports = function(deployer, network) {
  deployer.deploy(AttackToken);
  deployer.deploy(AttackContract);
};
