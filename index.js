
const ethUtil = require('ethereumjs-util');
const Account = require('eth-lib/lib/account');
const Web3 = require('web3');


// let HTTP_PROVIDER = 'https://kovan.infura.io/49cO6Bu58uaoA0tgS2Zi';
let HTTP_PROVIDER = 'https://mainnet.infura.io/49cO6Bu58uaoA0tgS2Zi';

let web3 = new Web3(new Web3.providers.HttpProvider(HTTP_PROVIDER));

let createSignMessage = (privateKey, message) => {
  privateKey = ethUtil.addHexPrefix(privateKey);

  const messageHash = Web3.utils.sha3(message);
  const signature = Account.sign(messageHash, privateKey);
  const vrs = Account.decodeSignature(signature);

  return {
    message,
    messageHash,
    v: vrs[0],
    r: vrs[1],
    s: vrs[2],
    signature
  };
};

let getSignMessageAuthor = (messageHash, signature) => {
  return Account.recover(messageHash, signature);
};

let privkey = 'afd62050b6d11a2e1428aa39db9cd399dfa30de386e2d18144a9ddd7009110aa';
// 0x515E5AfB9A7246a87F3283A43d96cee9702b7583

let msg = createSignMessage(privkey, 'test');

console.log(msg);

let addr = getSignMessageAuthor(msg.messageHash, msg.signature);

console.log(addr);

// "0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658", "0x1c", "0x274c0aed0c2957d5ccc95eaeebe438888599eada9874663d456b46fd343c798d", "0x5fd8d04fa272d0570800fba63c48a0c756972e6ae5992c5bed632c4f27ae2e7d"



console.log('TEST: ', Web3.utils.sha3(Web3.utils.toHex(40)));
