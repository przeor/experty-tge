web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
abi = require('../build/contracts/SplittableTokenAllocation.json');
console.log('ABI ', abi);
SplittableTokenAllocation = web3.eth.contract(abi);
splittableTokenInstance = SplittableTokenAllocation.at('address here');

const SplitTFields = {
  tokensPerField: 0,
  proposalAddress: 1,
  claimedPeriods: 2,
  state: 3
}

const splits = splittableTokenInstance.splitOf.call();

const tbody = document.getElementById('tbody');
splits.map(split => {
  /* TODO return structure:
  *  <tr>
  *    <td>Address here</td>
  *    <td>Value here</td>
  *    <td>State here</td>
  *  </tr>
  */

  tbody.appendChild(/* above structure hare */);
});