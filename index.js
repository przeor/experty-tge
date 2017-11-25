
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
