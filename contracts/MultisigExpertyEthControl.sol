pragma solidity ^0.4.11;

import './ExpertyToken.sol';


// multisignature contract, that is able to control
// ethers stored in experty token contract
contract MultisigExpertyEthControl {

  address expertyTokenAddr;

  mapping (address => bool) public isSignatory;

  mapping (uint => mapping (address => bool)) public isSigned;

  mapping(uint256 => uint8) public txSignatures;

  uint8 requiredSignatures;

  struct Tx {
    address addr;
    uint256 amount;
    address creator;
    bool rejected;
    bool executed;
    uint8 signatures;
  }
  Tx[] public txs;

  // 4 from 6 multisig wallet
  function MultisigExpertyEthControl() public {
    // 3 addresses from Experty:
    isSignatory[0x123] = true;
    isSignatory[0x123] = true;
    isSignatory[0x123] = true;

    // set required signatures
    requiredSignatures = 2;
  }

  // set experty token address after deploying experty token contract
  function setExpertyTokenAddr(address addr) public onlySignatory {
    // experty token address can be set only once after deploy;
    require(expertyTokenAddr == 0x0);
    expertyTokenAddr = addr;
  }

  // propose withdraw transaction from experty token contract
  function proposeWithdraw(address addr, uint256 amount) public onlySignatory {
    txs.push(Tx({
      addr: addr,
      amount: amount,
      creator: msg.sender,
      rejected: false,
      executed: false,
      signatures: 0
    }));
  }

  // reject proposed transaction
  function rejectWithdraw(uint txIdx) public onlySignatory {
    // only creator of transaction can reject it
    require(txs[txIdx].creator == msg.sender);
    // reject only not executed transactions
    require(!txs[txIdx].executed);
    txs[txIdx].rejected = true;
  }

  // sign specified transaction
  function signTx(uint txIdx) public onlySignatory {
    // transaction can be signed once by any participant
    require(!isSigned[txIdx][msg.sender]);

    isSigned[txIdx][msg.sender] = true;
    txs[txIdx].signatures += 1;

    withdrawAttemp(txIdx);
  }

  // try to call withdraw function
  function withdrawAttemp(uint txIdx) public {
    // check if there is enough number of signatures
    require(requiredSignatures <= txs[txIdx].signatures);

    ExpertyToken experty = ExpertyToken(expertyTokenAddr);
    experty.withdraw(txs[txIdx].addr, txs[txIdx].amount);
  }

  // only signatory can call this
  modifier onlySignatory() {
    require(isSignatory[msg.sender]);
    // make sure, that it is direct call of the function
    // and it is not called by any contract
    require(msg.sender == tx.origin);
    _;
  }
}
