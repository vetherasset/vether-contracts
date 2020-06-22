require('dotenv').config()
const ethers = require('ethers');
// const vether = require('./vether.js')
const BigNumber = require('bignumber.js')
const fs = require('fs')
const axios = require('axios')

function BN2Int(BN){return(((new BigNumber(BN)).toFixed()/10**18).toFixed(2))}
function getBN(BN){return(new BigNumber(BN))}
function BN2Str(BN){return(new BigNumber(BN)).toFixed(0)}
function BN2Str18(BN){return(new BigNumber(BN)).toFixed(18)}

const getAddresses = async () =>{
    const apiKey = process.env.ETHPLORER_API
    const baseURL = 'https://api.ethplorer.io/getTopTokenHolders/0x31Bb711de2e457066c6281f231fb473FC5c2afd3?apiKey='
    console.log(baseURL + apiKey + '&limit=1000')
    const response = await axios.get(baseURL + apiKey + '&limit=1000')
    let holderArray = response.data.holders
    console.log(holderArray.length)
    var owners = holderArray.map((item) => item.address)
    var ownership = holderArray.map((item) => BN2Str(getBN(item.balance)))
    var balances = {'owners': owners, 'ownership': ownership};
    await fs.writeFileSync('./data/balances.json', JSON.stringify(balances), 'utf8')
}
const getBalances = async () =>{
    const data = fs.readFileSync('./data/balances.json', 'utf8')
    const balances  = JSON.parse(data)
    const owners = balances.owners
    const ownership = balances.ownership
    let balanceArray = [];
    for(var i=0; i<owners.length; i++){
        if (owners[i] != '0x31bb711de2e457066c6281f231fb473fc5c2afd3' && owners[i] != '0x22ADE9c8a2AE6b820C94d4015a17247FccfC1389'){
            let bal = BN2Str18(getBN(ownership[i]).dividedBy(10**18))
            balanceArray.push({'owner': owners[i], 'ownership': bal})
        }
    }
    await fs.writeFileSync('./data/balanceArray.json', JSON.stringify(balanceArray), 'utf8')
}

const main = async () => {
    await getAddresses()
    await getBalances()
}


main ()