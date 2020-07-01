let Vether1 = artifacts.require("./Vether1.sol");
let Vether2 = artifacts.require("./Vether2.sol");
let Vether3 = artifacts.require("./Vether3.sol");
let Vether4 = artifacts.require("./Vether4.sol");
module.exports = function(deployer, network) {
  deployer.deploy(Vether1);
  deployer.deploy(Vether2);
  deployer.deploy(Vether3);
  deployer.deploy(Vether4);
};
