var Dice2Win = artifacts.require("./Dice2Win.sol");
var BigNumber = require('bignumber.js');
var utils = require('ethereumjs-util');

const mainAccount = "0x0A0802280ECEFC7d44b35E98a571F53eCDd80d2d";
const SecretSigner = "0x0A0802280ECEFC7d44b35E98a571F53eCDd80d2d";
const Croupier = "0x0A0802280ECEFC7d44b35E98a571F53eCDd80d2d";

var Dice2WinInstance;

async function SetupInstance() {
    Dice2WinInstance = await Dice2Win.deployed();
}

var playerlist = [ 
    '0x08bF6cad34292f41073448B3324C448c78986716',
    '0x9a00Ae2281E537785828669c723a92f1F0d32C57',
];

var randomNumber = 0;

async function generateNumber() {
    randomNumber = randomNumber + 1;
}



function stringToBytes (str) {  
        var ch, st, re = [];   
        for (var i = 0; i < str.length; i++ ) {     
            ch = str.charCodeAt(i);   
            st = [];         
            do {      
                 st.push( ch & 0xFF ); 
                 ch = ch >> 8;
            } while ( ch );
            re = re.concat( st.reverse() );   
         }   // return an array of bytes   
         return re;
}

async function PlayDice(playerAccount) {
    generateNumber();
    var betMask = 40;
    var modulo = 100;
    var currentBlockNumber = await web3.eth.blockNumber;
    var commitLastBlock = currentBlockNumber + 100;
    var shaRandomNumber = await Dice2WinInstance.getCommit(randomNumber);
    var signatureHash = await Dice2WinInstance.getSignatureHash(commitLastBlock, shaRandomNumber);  
    var result = await web3.eth.sign(SecretSigner, signatureHash); 
    var messageBuffer = new Buffer(signatureHash, 'hex');
    console.log(result);
 
    result = result.substr(2, result.length);
    var r =  result.substr(0, 64);
    var s =  result.substr(64, 64);
    let v = web3.toDecimal(result.substr(128, 2)) + 27;
    r = stringToBytes(r);
    console.log(r);
    s = stringToBytes(s);
    var returnaddress = await Dice2WinInstance.recover(commitLastBlock, shaRandomNumber, r, s)
    console.log(returnaddress);

    var r1 = new Buffer(result.substring(0, 64), 'hex')
    var s1 = new Buffer(result.substring(64, 128), 'hex')
    var v1 = new Buffer((parseInt(result.substring(128, 130)) + 27).toString());
    console.log(r1);
    console.log(s1);    
    var pub = utils.ecrecover(messageBuffer, v1, r1, s1);


    var recoveredAddress = '0x' + utils.pubToAddress(pub).toString('hex')

    console.log('recoveredAddress: ',   recoveredAddress);

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
    console.log(result);
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

