pragma solidity ^0.4.11;

// experty token contract
contract ExpertyToken {
  function splitPartnersAllocation(address unlockedAddr, address addr, uint256 fractionEXY) public;
}

// multisignature contract, that is able to control
// ethers stored in experty token contract
contract MultisigExpertyEthControl {

  address expertyTokenAddr;

  mapping (address => bool) public isSignatory;

  mapping (uint => mapping (address => bool)) public isSigned;

  mapping(uint256 => uint8) public txSignatures;

  uint8 requiredSignatures;

  struct Tx {
    address unlockedAddr;
    address addr;
    uint256 fractionEXY;
    address creator;
    bool rejected;
    bool executed;
    uint8 signatures;
  }
  Tx[] public txs;

  // 4 from 6 multisig wallet
  function MultisigExpertyEthControl() public {
    // 6 signatories:
    // 3 from Bitcoin Suisse:
    isSignatory[0x123] = true;
    isSignatory[0x123] = true;
    isSignatory[0x123] = true;
    // 3 from Experty AG:
    isSignatory[0x123] = true;
    isSignatory[0x123] = true;
    isSignatory[0x123] = true;

    // set required signatures
    requiredSignatures = 4;
  }

  // set experty token address after deploying experty token contract
  function setExpertyTokenAddr(address addr) public onlySignatory {
    // experty token address can be set only once after deploy;
    require(expertyTokenAddr == 0x0);
    expertyTokenAddr = addr;
  }

  // propose tx transaction from experty token contract
  function proposeTx(address unlockedAddr, address addr, uint256 fractionEXY) public onlySignatory {
    txs.push(Tx({
      unlockedAddr: unlockedAddr,
      addr: addr,
      fractionEXY: fractionEXY,
      creator: msg.sender,
      rejected: false,
      executed: false,
      signatures: 0
    }));
  }

  // reject proposed transaction
  function rejectTx(uint txIdx) public onlySignatory {
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

    txCallAttemp(txIdx);
  }

  // try to call tx function
  function txCallAttemp(uint txIdx) public {
    // check if there is enough number of signatures
    require(requiredSignatures <= txs[txIdx].signatures);

    ExpertyToken experty = ExpertyToken(expertyTokenAddr);
    experty.splitPartnersAllocation(txs[txIdx].unlockedAddr, txs[txIdx].addr, txs[txIdx].fractionEXY);
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
