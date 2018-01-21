
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

// const web3 = new Web3(new Web3.providers.HttpProvider(HTTP_PROVIDER));
// splittableTokenInstance = new web3.eth.Contract(ABI, ADDRESS);

fetch('contracts/ExyToken.json').then(res => {
  const ABI = res;
  const PROVIDER = '';
  const ADDRESS = '';
});