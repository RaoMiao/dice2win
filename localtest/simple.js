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

function check() {
    var privkey = new Buffer('3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1', 'hex');
    var data = utils.keccak('a');
    console.log(data)
    var vrs = utils.ecsign(data, privkey);
    var pubkey = utils.ecrecover(data, vrs.v, vrs.r, vrs.s);
    // Check !
    var check1 = pubkey.toString('hex') ==
    utils.privateToPublic(privkey).toString('hex');
    var check2 = utils.publicToAddress(pubkey).toString('hex') ==
    utils.privateToAddress(privkey).toString('hex');

    console.log(check1);
    console.log(check2);
}

function printObj(_obj) {
    var property = ""; 
    for (var item in _obj) {
        property += "属性：" + item + "数值：" + _obj[item] + "\n";
    }
    console.log(property);
}

async function PlayDice(playerAccount) {
    generateNumber();
    var betMask = 40;
    var modulo = 100;
    var currentBlockNumber = await web3.eth.blockNumber;
    var commitLastBlock = currentBlockNumber + 100;
    var shaRandomNumber = await Dice2WinInstance.getCommit(randomNumber);

    var privkey = new Buffer('c783a1d36860d5bc55e1f1b30ce3d0bebe4073c21f363e697ce35b47ccdac723', 'hex');
    var signatureHash = await Dice2WinInstance.getSignatureHash(shaRandomNumber);
    //printObj(signatureHash)
    var signatureHash2 = await Dice2WinInstance.getSignatureHash2(randomNumber);
    //printObj(signatureHash2)
    var bytes = web3.fromAscii(signatureHash);
    printObj(bytes);

    var data = utils.keccak(utils.keccak(randomNumber));
    //printObj(data.toString())

    var vrs = utils.ecsign(data, privkey);
    //console.log(vrs);
    var r = vrs.r.toString();
    var s = vrs.s.toString();
    //console.log(r)
    //console.log(s)
    
    
    var returnaddress = await Dice2WinInstance.recover(commitLastBlock, shaRandomNumber, r, s)
    console.log(returnaddress);


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

}


async function EveryOneWantPlayDice() {
    //while(true){
        await PlayDice(playerlist[0]);
    //}
}

async function DoMyTest() {
    console.log("DoMyTest");
    await SetupInstance();
    //await TestSignature();

    //check();
    await EveryOneWantPlayDice();
}

DoMyTest();

module.exports = function (callback) {

}

