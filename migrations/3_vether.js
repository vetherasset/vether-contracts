let Vether = artifacts.require("./Vether.sol");

module.exports = function(deployer, network) {
  deployer.deploy(Vether);
};
