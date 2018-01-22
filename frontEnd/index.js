const SplitTFields = {
  tokensPerField: 0,
  proposalAddress: 1,
  claimedPeriods: 2,
  state: 3
}

const BountyTFields = {
  amountField: 0,
  proposalAddressField: 1,
  bountyStateField: 2
}

const mockSplitElement = {
  address: '0x9b4f4e32c9c825b035f127ddcd086e06ddca3f69',
  state: 'Appropved',
  claimedPeriods: 1,
  tokensPerPeriod: 100
}

const mockCompanyAllocationResponse = [
  mockSplitElement,
  mockSplitElement
];

const mockPartnerAllocationResponse = [
  mockSplitElement,
  mockSplitElement
];

const mockBountyElement = {
  address: '0x9b4f4e32c9c825b035f127ddcd086e06ddca3f69',
  state: 'Appropved',
  tokens: 100
}

const mockBountyResponse = [
  mockBountyElement,
  mockBountyElement
];

function addCell(value, tr) {
  const cell = document.createElement('td');
  cell.innerHTML = value;
  tr.appendChild(cell);
}

function fullFillSplittableTable(tableId, mockResponse) {
  const table = document.getElementById(tableId);
  mockResponse.map(res => {
    const tr = document.createElement('tr');

    addCell(res.address, tr);
    addCell(res.tokensPerPeriod, tr);
    addCell(res.claimedPeriods, tr);
    addCell(res.state, tr);

    table.appendChild(tr);
  });
}
function fullFillBountyTable(tableId, mockResponse) {
  const table = document.getElementById(tableId);
  mockResponse.map(res => {
    const tr = document.createElement('tr');

    addCell(res.address, tr);
    addCell(res.tokens, tr);
    addCell(res.state, tr);

    table.appendChild(tr);
  });
}
fullFillSplittableTable('tkn-company-allocation-tbody', mockCompanyAllocationResponse);
fullFillSplittableTable('tkn-partner-allocation-tbody', mockPartnerAllocationResponse);
fullFillBountyTable('tkn-bounty-allocation-tbody', mockBountyResponse);

const Web3 = require('web3');


fetch('contracts/ExyToken.json')
.then(res => res.json())
.then(res => {
  const ABI = res.abi;
  console.log(ABI);
  const PROVIDER = 'http://localhost:8545';
  const ADDRESS = '0x282cc66d77b8c1c46c70305ed81f64cb617ed1ab';
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER));
  }
  web3.eth.defaultAccount = web3.eth.accounts[0];
  const ExyTokenContract = web3.eth.contract(ABI);
  const exyTokenInstance = ExyTokenContract.at(ADDRESS);
  let companyListLength;
  let partnerListLength;
  let bountyListLength;
  exyTokenInstance.getCompanyAllocationListLength.call((err,res) => {
    companyListLength = res.toNumber();
    const promises = [];
    function createPromise(id) {
      return new Promise(function (resolve, reject) {
        exyTokenInstance.getCompanyAllocation.call(id, (err, res) => {
          resolve(res);
        })
      });
    }
    for (let i = 0; i < companyListLength; ++i) {
      promises.push(createPromise(i));
    }
    Promise.all(promises).then(res => console.log(res));
  });
  exyTokenInstance.getPartnerAllocationListLength.call((err,res) => {
    partnerListLength = res.toNumber();
    const promises = [];
    function createPromise(id) {
      return new Promise(function (resolve, reject) {
        exyTokenInstance.getPartnerAllocation.call(id, (err, res) => {
          resolve(res);
        })
      });
    }
    for (let i = 0; i < partnerListLength; ++i) {
      promises.push(createPromise(i));
    }
    Promise.all(promises).then(res => console.log(res));
  });
  exyTokenInstance.getBountyAllocationListLength.call((err,res) => {
    bountyListLength = res.toNumber();
    const promises = [];
    function createPromise(id) {
      return new Promise(function (resolve, reject) {
        exyTokenInstance.getBountyAllocation.call(id, (err, res) => {
          resolve(res);
        })
      });
    }
    for (let i = 0; i < bountyListLength; ++i) {
      promises.push(createPromise(i));
    }
    Promise.all(promises).then(res => console.log(res));
  });
})