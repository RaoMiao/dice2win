var Dice2Win = artifacts.require("./Dice2Win.sol");
var BigNumber = require('bignumber.js');

const mainAccount = "0x13Afd24848f08a06Ac21c9320aA6217BC9a7c9D1";
const SecretSigner = "0x13Afd24848f08a06Ac21c9320aA6217BC9a7c9D1";
const Croupier = "0x13Afd24848f08a06Ac21c9320aA6217BC9a7c9D1";

var Dice2WinInstance;

async function SetupInstance() {
    Dice2WinInstance = await Dice2Win.deployed();
}

var playerlist = [ 
    '0xB9B2cf809241A1Ee1Cc1b985f0bD8bd875aE8671',
    '0xD424eaf9625C25125eA966eD8361D56Ae29b32c2',
];

var randomNumber = 0;

async function generateNumber() {
    randomNumber = randomNumber + 1;
}

async function PlayDice(playerAccount) {
    generateNumber();
    var betMask = 40;
    var modulo = 100;
    var currentBlockNumber = await web3.eth.blockNumber;
    var commitLastBlock = currentBlockNumber + 100;
    console.log(String(randomNumber));
    var shaRandomNumber = web3.sha3(randomNumber."EVWithdraw(address,uint256,bytes32)".getBytes(StandardCharsets.UTF_8));
    var keccak256Number = web3.toDecimal(shaRandomNumber);
    console.log(keccak256Number)
    var r = "00"
    var s = "00"


    result = null;
    try {
        result = await Dice2WinInstance.placeBet(betMask, modulo, commitLastBlock, shaRandomNumber, r, s, { from: playerAccount, value: 1e18 });
    } catch (error) {
        console.log(error);     
        throw error;            
    }
    if(result.tx == undefined || result.tx == null){
        console.log(result);
        throw result;
    }
    console.log(result);
    console.log(result.logs[0].args);
    var minedBlock = await web3.eth.getBlock(result.receipt.blockNumber);
    var minedBlockHash = minedBlock.hash;

    result = null;
    try {
        result = await Dice2WinInstance.settleBet(randomNumber, minedBlockHash, { from: mainAccount, value: 0 });
    } catch (error) {
        console.log(error);     
        throw error;            
    }
    if(result.tx == undefined || result.tx == null){
        console.log(result);
        throw result;
    }
    console.log(result.logs[0].args);
}


async function EveryOneWantPlayDice() {
    //while(true){
        await PlayDice(playerlist[0]);
    //}
}

async function DoMyTest() {
    console.log("DoMyTest");
    await SetupInstance();
    await EveryOneWantPlayDice();
}

DoMyTest();

module.exports = function (callback) {

}

