pragma solidity ^0.4.11;

import "./ERC223Token.sol";
import "./ERC223ReceivingContract.sol";
import "./SafeMath.sol";

contract ERC223MintableToken is ERC223Token {
  using SafeMath for uint;
  uint internal circulatingSupply;
  function mint(address to, uint value) internal {
    uint codeLength;

    assembly {
      // Retrieve the size of the code on target address, this needs assembly .
      codeLength := extcodesize(to)
    }

    circulatingSupply += value;

    balanceOf[to] = balanceOf[to].add(value);
    if (codeLength > 0) {
      ERC223ReceivingContract receiver = ERC223ReceivingContract(to);
      bytes memory empty;
      receiver.tokenFallback(msg.sender, value, empty);
    }
    Mint(to, value);
  }

  event Mint(address indexed to, uint value);
}
