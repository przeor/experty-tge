const Types = artifacts.require('./Types.sol');
const AllocationAddressList = artifacts.require('./AllocationAddressList.sol');
const BountyTokenAllocation = artifacts.require('./BountyTokenAllocation.sol');
const ERC223MintableToken = artifacts.require('./ERC223MintableToken.sol');
const ERC223ReceivingContract = artifacts.require('./ERC223ReceivingContract.sol');
const ERC223Token = artifacts.require('./ERC223Token.sol');
const Ownable = artifacts.require('./Ownable.sol');
const SafeMath = artifacts.require('./SafeMath.sol');
const VestingAllocation = artifacts.require('./VestingAllocation.sol');
const Signatures = artifacts.require('./Signatures.sol');
const ExyToken = artifacts.require('./ExyToken.sol');

module.exports = function (deployer) {
  deployer.deploy(AllocationAddressList);
  deployer.deploy(BountyTokenAllocation);
  deployer.deploy(ERC223MintableToken);
  // deployer.deploy(ERC223ReceivingContract);
  deployer.deploy(ERC223Token);
  deployer.deploy(Ownable);
  deployer.deploy(SafeMath);
  deployer.deploy(Signatures);
  deployer.deploy(Types);

  deployer.link(SafeMath, VestingAllocation);
  deployer.link(Ownable, VestingAllocation);
  deployer.link(AllocationAddressList, VestingAllocation);
  deployer.link(Types, VestingAllocation);

  deployer.deploy(VestingAllocation);
  deployer.link(Types, ExyToken);
  deployer.link(AllocationAddressList, ExyToken);
  deployer.link(BountyTokenAllocation, ExyToken);
  deployer.link(ERC223MintableToken, ExyToken);
  deployer.link(ERC223Token, ExyToken);
  deployer.link(Ownable, ExyToken);
  deployer.link(SafeMath, ExyToken);
  deployer.link(VestingAllocation, ExyToken);
  deployer.link(Signatures, ExyToken);
  deployer.deploy(ExyToken);
};
