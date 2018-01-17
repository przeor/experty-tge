const ERC223Token = artifacts.require('./ERC223Token.sol');
const ExpertyToken = artifacts.require("./ExpertyToken.sol");

module.exports = function(deployer) {
  deployer.deploy(ERC223Token);
  deployer.link(ERC223Token, ExpertyToken);
  deployer.deploy(ExpertyToken);
};
