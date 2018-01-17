const ExpertyToken = artifacts.require("./ExpertyToken.sol");
const MultisigExpertyEthControl = artifacts.require('./MultisigExpertyEthControl.sol');
const MultisigExpertyLockedControl = artifacts.require('./MultisigExpertyLockedControl.sol');

module.exports = function(deployer) {
  deployer.deploy(ExpertyToken);
  deployer.link(ExpertyToken, MultisigExpertyEthControl);
  deployer.link(ExpertyToken, MultisigExpertyLockedControl);
  deployer.deploy(MultisigExpertyEthControl);
  deployer.deploy(MultisigExpertyLockedControl);
};
