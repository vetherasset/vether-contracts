require('dotenv').config()
const ethers = require('ethers');
const VETHER = require('./artifacts/VetherOld.json')
const BigNumber = require('bignumber.js')
const fs = require('fs')
const axios = require('axios')

const addr1 = () => {
    return '0x31Bb711de2e457066c6281f231fb473FC5c2afd3'
}
const addr2 = () => {
    return '0x01217729940055011F17BeFE6270e6E59B7d0337'
}

const abi = () => {
    return VETHER.abi
}

function BN2Int(BN) { return (((new BigNumber(BN)).toFixed() / 10 ** 18).toFixed(2)) }
function getBN(BN) { return (new BigNumber(BN)) }
function BN2Str(BN) { return (new BigNumber(BN)).toFixed(0) }
function BN2Str18(BN) { return (new BigNumber(BN)).toFixed(18) }

const getAddresses = async () => {
    provider = ethers.getDefaultProvider();

    contract1 = new ethers.Contract(addr1(), abi(), provider)
    const apiKey = process.env.ETHPLORER_API
    const baseURL = 'https://api.ethplorer.io/getTopTokenHolders/0x31Bb711de2e457066c6281f231fb473FC5c2afd3?apiKey='
    console.log(baseURL + apiKey + '&limit=1000')
    const response = await axios.get(baseURL + apiKey + '&limit=1000')
    let holderArray = response.data.holders
    console.log(holderArray.length)
    var owners = holderArray.map((item) => item.address)
    let balances = []

    let ownerString = ""
    let balanceString = ""
    for (let i = 0; i < owners.length; i++) {
        if (!blacklist(owners[i])) {
            var ownership = BN2Str(await contract1.balanceOf(owners[i]))
            balances.push({ 'owner': owners[i], 'ownership': ownership });
            ownerString = ownerString + "," + owners[i]
            console.log(ownership)
            balanceString = balanceString + "," + ownership
            if ((i % 100 == 0 && i != 0) || (i == owners.length - 1)) {
                var balancesStr = { 'owners': ownerString, 'ownership': balanceString };
                await fs.writeFileSync(`./data/balancesV1-${i}.md`, JSON.stringify(balancesStr), 'utf8')
                ownerString = ""
                balanceString = ""
            }
        }


    }
    await fs.writeFileSync(`./data/balancesV1.json`, JSON.stringify(balances), 'utf8')

    contract2 = new ethers.Contract(addr2(), abi(), provider)
    const baseURL2 = 'https://api.ethplorer.io/getTopTokenHolders/0x01217729940055011F17BeFE6270e6E59B7d0337?apiKey='
    console.log(baseURL2 + apiKey + '&limit=1000')
    const response2 = await axios.get(baseURL2 + apiKey + '&limit=1000')
    let holderArray2 = response2.data.holders
    console.log(holderArray2.length)
    var owners2 = holderArray2.map((item) => item.address)
    // var ownership2 = holderArray2.map((item) => BN2Str(await contract2.balanceOf(item.address)))
    var balances2 = [];


    let ownerString2 = ""
    let balanceString2 = ""
    for (let i = 0; i < owners2.length; i++) {
        if (!blacklist(owners[i])) {
            var ownership2 = BN2Str(await contract2.balanceOf(owners2[i]))
            balances2.push({ 'owner': owners2[i], 'ownership': ownership2 });

            ownerString2 = ownerString2 + "," + owners2[i]
            console.log(ownership2)
            balanceString2 = balanceString2 + "," + ownership2
            if ((i % 100 == 0 && i != 0) || (i == owners2.length - 1)) {
                var balancesStr2 = { 'owners': ownerString2, 'ownership': balanceString2 };
                await fs.writeFileSync(`./data/balancesV2-${i}.md`, JSON.stringify(balancesStr2), 'utf8')
                ownerString2 = ""
                balanceString2 = ""
            }
        }
    }
    await fs.writeFileSync(`./data/balancesV2.json`, JSON.stringify(balances2), 'utf8')

    // var ownerss =[]; // = holderArray.map((item) => item.address)
    // var ownerships=[]; // = holderArray.map((item) => BN2Str(getBN(item.balance)))
    // for(let i = 0; i<holderArray.length; i++){
    //     ownerss.push(holderArray[i].address)
    //     ownerships.push(BN2Str(getBN(holderArray[i].balance)))
    //     if((i%100 == 0 && i != 0) || (i==holderArray.length-1)){
    //         var balances = {'owners': ownerss, 'ownership': ownerships};
    //         await fs.writeFileSync(`./data/balances-${i}.json`, JSON.stringify(balances), 'utf8')
    //         ownerss = []
    //         ownerships=[]
    //     }
    // }



}
const getBalances = async () => {
    let balanceArray = [];
    const data = fs.readFileSync('./data/balancesV1.json', 'utf8')
    const balances = JSON.parse(data)
    // const owners = balances.owners
    // const ownership = balances.ownership
    for (var i = 0; i < balances.length; i++) {
        if (blacklist(balances[i].owner) == 'false') {
            console.log(balances[i].owner, balances[i].ownership, blacklist(balances[i].owner))
            let bal = BN2Str18(getBN(balances[i].ownership).dividedBy(10 ** 18))
            balanceArray.push({ 'owner': balances[i].owner, 'ownership': bal, 'version': 'vether1' })
        }
    }
    const data2 = fs.readFileSync('./data/balancesV2.json', 'utf8')
    const balances2 = JSON.parse(data2)
    // const owners2 = balances2.owners
    // const ownership2 = balances2.ownership
    for (var i = 0; i < balances2.length; i++) {
        if (blacklist(balances2[i].owner) == 'false') {
            console.log(balances2[i].owner, balances2[i].ownership, blacklist(balances2[i].owner))
            let bal = BN2Str18(getBN(balances2[i].ownership).dividedBy(10 ** 18))
            balanceArray.push({ 'owner': balances2[i].owner, 'ownership': bal, 'version': 'vether2' })
        }
    }
    console.log('writing')
    await fs.writeFileSync(`./data/balanceArrayV1V2.json`, JSON.stringify(balanceArray), 'utf8')
    let total = balanceArray.reduce((total, item) => +item.ownership + total, 0)
    console.log(total)
}

const blacklist = (address) => {
    if (address == '0x31bb711de2e457066c6281f231fb473fc5c2afd3'
        || address == '0x22ADE9c8a2AE6b820C94d4015a17247FccfC1389'
        || address == '0x0111011001100001011011000111010101100101'
        || address == '0x01217729940055011F17BeFE6270e6E59B7d0337'
        || address == '0xef764bac8a438e7e498c2e5fccf0f174c3e3f8db') {
        return 'true'
    } else if (address == '0x01217729940055011f17befe6270e6e59b7d0337'){
        // console.log('blakclist', address, 'true')
        return 'true'
    } else {
        return 'false'
    }
}

const main = async () => {
    // await getAddresses()
    await getBalances()
}


main()