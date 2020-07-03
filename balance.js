require('dotenv').config()
const ethers = require('ethers');
const VETHER = require('./artifacts/VetherOld.json')
const BigNumber = require('bignumber.js')
const fs = require('fs')
const axios = require('axios')

const delay = ms => new Promise(res => setTimeout(res, ms));

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

const getAddressesBoth = async () => {
    provider = ethers.getDefaultProvider();
    contract1 = new ethers.Contract(addr1(), abi(), provider)
    contract2 = new ethers.Contract(addr2(), abi(), provider)

    const apiKey = process.env.ETHPLORER_API
    const baseURL = 'https://api.ethplorer.io/getTopTokenHolders/0x31Bb711de2e457066c6281f231fb473FC5c2afd3?apiKey='
    console.log(baseURL + apiKey + '&limit=1000')
    const response = await axios.get(baseURL + apiKey + '&limit=1000')
    let holderArray = response.data.holders
    console.log(holderArray.length)
    var owners1 = holderArray.map((item) => item.address)

    const baseURL2 = 'https://api.ethplorer.io/getTopTokenHolders/0x01217729940055011F17BeFE6270e6E59B7d0337?apiKey='
    console.log(baseURL2 + apiKey + '&limit=1000')
    const response2 = await axios.get(baseURL2 + apiKey + '&limit=1000')
    let holderArray2 = response2.data.holders
    console.log(holderArray2.length)
    var owners2 = holderArray2.map((item) => item.address)

    for (let i = 0; i < owners2.length; i++) {
        owners1.push(owners2[i])
    }
    console.log(owners1.length)
    console.log(owners1)

    let owners = [...new Set(owners1)]
    console.log(owners.length)
    console.log(owners)

    let balances = []
    let ownerString = ""
    let balanceString = ""
    for (let i = 0; i < owners.length; i++) {
        if (blacklist(owners[i]) == 'false') {
            var ownership1 = getBN(await contract1.balanceOf(owners[i]))
            var ownership2 = getBN(await contract2.balanceOf(owners[i]))
            var ownership = ownership1.plus(ownership2)
            let bal1 = BN2Str18(getBN(ownership1).dividedBy(10 ** 18))
            let bal2 = BN2Str18(getBN(ownership2).dividedBy(10 ** 18))
            console.log(owners[i], BN2Str(ownership), bal1, bal2)
            balances.push({ 'owner': owners[i], 'ownership': BN2Str(ownership), "vether1": bal1, "vether2": bal2 });
            ownerString = ownerString + "," + owners[i]
            // console.log(BN2Str(ownership))
            balanceString = balanceString + "," + ownership
            if ((i % 100 == 0 && i != 0) || (i == owners.length - 1)) {
                var balancesStr = { 'owners': ownerString, 'ownership': balanceString };
                await fs.writeFileSync(`./data/balancesV12-${i}.md`, JSON.stringify(balancesStr), 'utf8')
                ownerString = ""
                balanceString = ""
            }
        }
        await fs.writeFileSync(`./data/balancesV12.json`, JSON.stringify(balances), 'utf8')
    }
    // await fs.writeFileSync(`./data/balancesV12.json`, JSON.stringify(balances), 'utf8')
}

const cleanAddresses = async () => {
    provider = ethers.getDefaultProvider();
    contract1 = new ethers.Contract(addr1(), abi(), provider)
    contract2 = new ethers.Contract(addr2(), abi(), provider)

    const data = fs.readFileSync('./data/balancesV12.json', 'utf8')
    const balanceObject = JSON.parse(data)

    let balances = []
    let ownerString = ""
    let balanceString = ""
    for (let i = 0; i < owners.length; i++) {
        if (blacklist(owners[i]) == 'false') {
            var ownership1 = getBN(await contract1.balanceOf(owners[i]))
            var ownership2 = getBN(await contract2.balanceOf(owners[i]))
            var ownership = ownership1.plus(ownership2)
            let bal1 = BN2Str18(getBN(ownership1).dividedBy(10 ** 18))
            let bal2 = BN2Str18(getBN(ownership2).dividedBy(10 ** 18))
            console.log(owners[i], BN2Str(ownership), bal1, bal2)
            balances.push({ 'owner': owners[i], 'ownership': BN2Str(ownership), "vether1": bal1, "vether2": bal2 });
            ownerString = ownerString + "," + owners[i]
            // console.log(BN2Str(ownership))
            balanceString = balanceString + "," + ownership
            if ((i % 100 == 0 && i != 0) || (i == owners.length - 1)) {
                var balancesStr = { 'owners': ownerString, 'ownership': balanceString };
                await fs.writeFileSync(`./data/balancesV12-${i}.md`, JSON.stringify(balancesStr), 'utf8')
                ownerString = ""
                balanceString = ""
            }
        }
        await fs.writeFileSync(`./data/balancesV12.json`, JSON.stringify(balances), 'utf8')
    }
    // await fs.writeFileSync(`./data/balancesV12.json`, JSON.stringify(balances), 'utf8')
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
    // console.log(address)
    if (address == '0x31bb711de2e457066c6281f231fb473fc5c2afd3'
        || address == '0x22ADE9c8a2AE6b820C94d4015a17247FccfC1389'
        || address == '0x0111011001100001011011000111010101100101'
        || address == '0x01217729940055011F17BeFE6270e6E59B7d0337'
        || address == '0xef764bac8a438e7e498c2e5fccf0f174c3e3f8db') {
        return 'true'
    } else if (address == '0x01217729940055011f17befe6270e6e59b7d0337') {
        // console.log('blakclist', address, 'true')
        return 'true'
    } else {
        return 'false'
    }

    // 0x506d07722744e4a390cd7506a2ba1a8157e63745,
    // 0x5100276ff4561d05a502527de00e9515129e3cfe,
    // 0x1e576095fdd79a2ec8301fee7f02f34213302dd4,
    // 0xf1ad4bfdf8829d55ec0ce7900ef9d122b2610673,
    // 0x40a7cb7052c274cc2e568c324b4c5d94383bec4f,
    // 0x693c188e40f760ecf00d2946ef45260b84fbc43e,
    // 0x944586cf150c0b10913734ccca59a872490e0377,
    // 0xf00ed9Bc9e51151d4Cdd602BD8b02a650E94d6E5,
    // 0x8CD11B38A32cc7e09259B3437AB0582238cF2227,
    // 0xef764BAC8a438E7E498c2E5fcCf0f174c3E3F8dB,
    // 0x944586CF150C0b10913734cccA59A872490E0377,
    // 0x693c188E40F760ecF00d2946ef45260b84FBc43e,
    // 0x8a3960472B3D63894B68DF3f10F58F11828d6fd9,
    // 0x693c188E40F760ecF00d2946ef45260b84FBc43e,
    // 0xF1Ad4BFDF8829d55eC0Ce7900EF9d122B2610673,
}

const checkTotals = () => {
    let balanceArray = [];
    const data = fs.readFileSync('./data/balancesV12.json', 'utf8')
    const balances = JSON.parse(data)
    let total = balances.reduce((total, item) => +item.ownership + total, 0)
    let totalV1 = balances.reduce((total, item) => +item.vether1 + total, 0)
    let totalV2 = balances.reduce((total, item) => +item.vether2 + total, 0)

    let totalStr = BN2Str18(getBN(total).dividedBy(10 ** 18))
    console.log('Total V1&V2', totalStr)
    console.log('TotalV1', totalV1)
    console.log('TotalV2', totalV2)
    console.log('Max Emitted Vether', 2048 * 49)
    console.log('Vether lost to fees/contracts', BN2Str18(getBN(2048 * 49 - +totalStr)))
}

const reExport = async () => {
    let balanceArray = [];
    let ownerString = ""
    let balanceString = ""
    let total = getBN(0)
    const data = fs.readFileSync('./data/balancesV12.json', 'utf8')
    const balances = JSON.parse(data)
    for (let i = 0; i < balances.length; i++) {
        ownerString = ownerString + "," + balances[i].owner
        var ownership = getBN(balances[i].ownership).toFixed()
        total = total.plus(ownership)
        // console.log(BN2Str(ownership))
        balanceString = `${balanceString},${(ownership)}`
        if ((i % 100 == 0 && i != 0) || (i == balances.length - 1)) {
            var balancesStr = { 'owners': ownerString, 'ownership': balanceString };
            await fs.writeFileSync(`./data/balancesV12451-${i}.md`, JSON.stringify(balancesStr), 'utf8')
            ownerString = ""
            balanceString = ""
        }
    }
    console.log('total', total.toFixed())
}

const audit = async () => {
    let balanceArray = [];
    const data1 = JSON.parse(fs.readFileSync('./data/balancesV12451-100.md', 'utf8'))
    let ownership1 = data1.ownership.split(/,/);
    for(var i = 1; i<ownership1.length; i++){
        balanceArray.push(new BigNumber(ownership1[i]));
    }
    // ownership1.forEach((element) => {
    //     balanceArray.push(new BigNumber(Number(element)));
    //     // console.log(new BigNumber(element))
    // });
    // let total1 = ownership1.reduce((total, item) => +item + total, 0)
    // console.log(total1.toFixed())
    // const data2 = JSON.parse(fs.readFileSync('./data/balancesV12451-200.md', 'utf8'))
    // let ownership2 = data2.ownership.split(/,/);
    // for(var i = 1; i<ownership2.length; i++){
    //     balanceArray.push(new BigNumber(ownership2[i]));
    // }
    // ownership2.forEach((element) => {
    //     balanceArray.push(new BigNumber(element));
    // });
    // let total2 = ownership2.reduce((total, item) => +item + total, 0)
    // console.log(total2)
    // const data3 = JSON.parse(fs.readFileSync('./data/balancesV12451-284.md', 'utf8'))
    // let ownership3 = data3.ownership.split(/,/);
    // for(var i = 1; i<ownership3.length; i++){
    //     balanceArray.push(new BigNumber(ownership3[i]));
    // }
    // ownership3.forEach((element) => {
    //     balanceArray.push(new BigNumber(element));
    // });
    // let total3 = ownership3.reduce((total, item) => +item + total, 0)
    // console.log(total3)

    // console.log(balanceArray)
    // let numberArray = []
    // for(var i = 0; i<balanceArray.length; i++){
    //     let number = new BigNumber(balanceArray[i])
    //     numberArray.push(number)
    // }
    let total3 = balanceArray[0]
    for(var i = 1; i<balanceArray.length; i++){
        let number = balanceArray[i]
        total3 = total3.plus(number)
        console.log(total3)
    }
    // let number2 = total3.plus(balanceArray[1])
    console.log(total3.toFixed())
    // console.log(number2)

    // console.log('max', 2048*50)
    // console.log('actual', total3.toFixed())
    // console.log('diff', (getBN(2048*50).minus(total3)).toFixed())
    

    // jp 3560193398263119884845

}

const refunders = async () => {
    const data = fs.readFileSync('./data/uniswapTx.csv', 'utf8')
    var txHashArray = data.split(/\r?\n/);

    const apiKey = process.env.ETHPLORER_API
    const baseURL = 'https://api.ethplorer.io/getTxInfo/'

    let fromArray = []
    
	for(var i = 0; i < txHashArray.length; i++){
        let apiURL = (baseURL + txHashArray[i] + '?apiKey=' + apiKey)
        const response = await axios.get(apiURL)
        console.log(i, response.data.from, response.data.operations[0].value)
        let object = {"address":response.data.from, "value":response.data.operations[0].value}
        fromArray.push(object)
        await fs.writeFileSync(`./data/uniswapFrom.json`, JSON.stringify(fromArray), 'utf8')
        await delay(1000)
    }
}

const consolidate = async () => {
    const data = fs.readFileSync('./data/uniswapFrom.json', 'utf8')
    const objects = JSON.parse(data)
    let addresses = []
    let balances = []
    for(var i = 0; i < objects.length; i++){
        if(!addresses.includes(objects[i].address)){
            addresses.push(objects[i].address)
            balances.push((+objects[i].value))
            // console.log('new', objects[i].address, objects[i].value)
        } else {
            let index = addresses.indexOf(objects[i].address)
            let bal = balances[index]
            let total = +bal + +objects[i].value
            balances[index] = total
            // console.log('existing', objects[i].address, index, bal, objects[i].value, total)
        }
    }
    console.log(addresses, addresses.length)
    console.log(balances, balances.length)
    let value = []
    value = balances.map((item) => ((new BigNumber(item)).dividedBy(10**18)).toFixed())
    console.log(value)
    let final =  []
    for(var i = 0; i < value.length; i++){
        let object = {"address":addresses[i], "value":value[i]}
        final.push(object)
    }
    console.log(final)
}


const main = async () => {
    // await getAddresses()
    // await getAddressesBoth()
    // checkTotals()
    // reExport()
    // audit()
    // refunders()
    consolidate()
}


main()