const Signatures = artifacts.require("./Signatures.sol");
const ExyToken = artifacts.require('./ExyToken.sol');

module.exports = function (deployer) {
  deployer.deploy(Signatures);
  deployer.deploy(ExyToken);
};
