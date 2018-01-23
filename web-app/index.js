const SplitableResponseFields = {
  tokensPerField: 0,
  proposalAddress: 1,
  claimedPeriods: 2,
  state: 3,
  address: 4
}

const BountyFields = {
  amountField: 0,
  proposalAddressField: 1,
  bountyStateField: 2,
  address: 3
}

function addCell(value, tr) {
  const cell = document.createElement('td');
  cell.innerHTML = value;
  tr.appendChild(cell);
}

function getState(state) {
  switch (state) {
    case 0:
      return "Proposed"
    case 1:
      return "Approved"
    case 2:
      return "Rejected"
  }
}

function fullFillSplittableTable(tableId, mockResponse) {
  const table = document.getElementById(tableId);
  mockResponse.map(res => {
    const tr = document.createElement('tr');

    addCell(res[SplitableResponseFields.address], tr);
    addCell(res[SplitableResponseFields.tokensPerField].toNumber(), tr);
    addCell(res[SplitableResponseFields.claimedPeriods].toNumber(), tr);
    addCell(getState(res[SplitableResponseFields.state].toNumber()), tr);

    table.appendChild(tr);
  });
}
function fullFillBountyTable(tableId, mockResponse) {
  const table = document.getElementById(tableId);
  mockResponse.map(res => {
    const tr = document.createElement('tr');

    addCell(res[BountyFields.address], tr);
    addCell(res[BountyFields.amountField].toNumber(), tr);
    addCell(getState(res[BountyFields.bountyStateField].toNumber()), tr);

    table.appendChild(tr);
  });
}

const Web3 = require('web3');

fetch('contracts/ExyToken.json')
  .then(res => res.json())
  .then(res => {
    const ABI = res.abi;
    const BYTECODE = res.bytecode;

    // console.log('[Deploy] ABI:');
    // console.log(JSON.stringify(ABI));
    // console.log('[Deploy] BYTECODE:');
    // console.log(JSON.stringify(BYTECODE));

    const PROVIDER = 'http://localhost:8545';
    const ADDRESS = '0x78ed88f1d9351ca94b3b784d997883e1ee83f184';
    if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
    } else {
      web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER));
    }

    web3.eth.defaultAccount = web3.eth.accounts[0];
    const ExyTokenContract = web3.eth.contract(ABI);

    const SIGNATURER_1 = "0xe029b7b51b8c5B71E6C6f3DC66a11DF3CaB6E3B5"; // Grzegorz
    const SIGNATURER_2 = "0xBEE9b5e75383f56eb103DdC1a4343dcA6124Dfa3"; // Mateusz
    const SIGNATURER_3 = "0xcdD1Db16E83AA757a5B3E6d03482bBC9A27e8D49"; // Albert

    var DEPLOY = false;
    if (DEPLOY) {
      ExyTokenContract.new(
        {
          data: BYTECODE,
          arguments: [SIGNATURER_1, SIGNATURER_2, SIGNATURER_3],
          gas: 1190000 * 2
        }, function (err, res) {
          console.log(err);
          console.log(res);
        })
    } else {
      const exyTokenInstance = ExyTokenContract.at(ADDRESS);

      //if (true) {
       // web3.eth.estimateGas({ data: BYTECODE }, (err, gas) => {
        //  console.log('estimateGas propose bounty:' + gas);
          if (false) {
            exyTokenInstance.proposeBountyTransfer.sendTransaction("0x2", 111, {gas: 6063751}, function (err, res) {
              console.log('Runnig callback afeter adding bount proposal:')
              console.log(err);
              console.log(res);
            });
          }

       // });
      //}

      if (false) {
        exyTokenInstance.getBountyTransfersListLength(function (err, res) {
          console.log('Runnig allocation:')
          console.log(err);
          console.log(res);
        });
      }
      if (false) {
        exyTokenInstance.getBountyTransfers(0, function (err, res) {
          console.log('Runnig allocation:')
          console.log(err);
          console.log(res);
        });
      }


      function getAndFullfillSplitable(lengthGetter, allocationGetter, remainingGetter, sectionId, fulfillFunction) {
        let tableId = document.getElementsByClassName(sectionId)[0].getElementsByTagName('tbody')[0].id;

        lengthGetter.call((err, res) => {
          const companyListLength = res;
          const promises = [];
          function createPromise(id) {
            return new Promise(function (resolve, reject) {
              allocationGetter.call(id, (err, res) => {
                resolve(res);
              })
            });
          }
          for (let i = 0; i < companyListLength; ++i) {
            promises.push(createPromise(i));
          }
          Promise.all(promises).then(res =>
            fulfillFunction(tableId, res)
          );

          remainingGetter.call(handleError(res => {
            let section = document.getElementsByClassName(sectionId)[0];
            section.getElementsByClassName('remaining-allocation')[0].innerHTML = res.toNumber();
          }));
        });
      }

      getAndFullfillSplitable(
        exyTokenInstance.getCompanyAllocationListLength,
        exyTokenInstance.getCompanyAllocation,
        exyTokenInstance.getRemainingPartnerTokensAllocation,
        'tkn-company-table',
        fullFillSplittableTable);
      getAndFullfillSplitable(
        exyTokenInstance.getPartnerAllocationListLength,
        exyTokenInstance.getPartnerAllocation,
        exyTokenInstance.getRemainingPartnerTokensAllocation,
        'tkn-partner-table',
        fullFillSplittableTable);
      getAndFullfillSplitable(
        exyTokenInstance.getBountyTransfersListLength,
        exyTokenInstance.getBountyTransfers,
        exyTokenInstance.getRemainingBountyTokens,
        'tkn-bounty-table',
        fullFillBountyTable);
    }
  });

function handleError(fn) {
  return (err, res) => {
    if (err) {
      alert(err);
    } else {
      fn(res);
    }
  };
}