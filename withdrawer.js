require('dotenv').config()
const ethers = require('ethers');
const BigNumber = require('bignumber.js')
const VETHER = require('./artifacts/VetherOld.json')
const fs = require('fs')
const axios = require('axios')

const addr = () => {
	return '0x31Bb711de2e457066c6281f231fb473FC5c2afd3'
}

const addr2 = () => {
    return '0x01217729940055011F17BeFE6270e6E59B7d0337'
}

const abi = () => {
	return VETHER.abi
}

const timeDelay = 15*60*1000;
const delay = ms => new Promise(res => setTimeout(res, ms));

var provider; var signingKey;
var minerAddress; var payoutAddress; var wallet; var contract; var vethBalance; var ethBalance;
var currentEra; var currentDay; var nextDayTime;
var owners;
let arrayDays = []; let arrayShares = []; let arrayTx = [];
var cycles; var txCount;
var times = { 'start': "", 'cycle': "", 'query':"" };

var addresses = [];
let arrayAddress = []

const updateDetails = async () => {
	const cycleTime = new Date(Date.now()).toLocaleTimeString("en-gb")
	console.log('updating details at time:', cycleTime)
	times = { 'start': times.start, 'cycle': cycleTime, 'query': times.query  }
	provider = ethers.getDefaultProvider();
	signingKey = new ethers.utils.SigningKey(process.env.PAYER_KEY);
	minerAddress = signingKey.address
	console.log('Address: ' + signingKey.address);
	wallet = new ethers.Wallet(process.env.PAYER_KEY, provider);
	contract = new ethers.Contract(addr(), abi(), wallet)
	contract2 = new ethers.Contract(addr2(), abi(), wallet)
    ethBalance = ethers.utils.formatEther(await provider.getBalance(minerAddress))
    console.log(ethBalance)

	currentEra = (new BigNumber(await contract.currentEra())).toFixed()
	currentDay = (new BigNumber(await contract.currentDay())).toFixed()
	nextDayTime = (new BigNumber(await contract.nextDayTime())).toFixed()
	console.log('era:%s - day:%s - NextDay:%s', currentEra, currentDay, nextDayTime)

	//Holder Map 2
	// const apiKey = process.env.ETHPLORER_API
    // const baseURL = 'https://api.ethplorer.io/getAddressTransactions/0x01217729940055011F17BeFE6270e6E59B7d0337?apiKey='
    // console.log(baseURL + apiKey + '&limit=50')
	// const response = await axios.get(baseURL + apiKey + '&limit=50')
	// console.log(response.data)
	// addresses = response.data.map(item => item.from)
	// for(var i = 0; i < addresses.length; i++){
	// 	let share = {'address': addresses[i], 'withdrawn': false, 'tx': "null"}
	// 	arrayAddress.push(share)
	// }
	// console.log(addresses)
	// for(var i = 0; i<addresses.length; i++){
	// 	await checkShare(addresses[i])
	// 	await fs.writeFileSync(`./data/vether2Shares49.json`, JSON.stringify(arrayShares), 'utf8')
	// }
	// await fs.writeFileSync(`./data/arrayAddress49.json`, JSON.stringify(addresses), 'utf8')

	// Etherscan map
	// const baseURLES = 'http://api.etherscan.io/api?module=account&action=txlist&address=0x31Bb711de2e457066c6281f231fb473FC5c2afd3&startblock=0&endblock=99999999&sort=asc'
	// const resp = await axios.get(baseURLES)
	// // console.log(resp.data)
	// addresses = resp.data.map(item => item.from)
	// console.log(addresses)
    // await fs.writeFileSync(`./data/arrayAddress-start.json`, JSON.stringify(arrayAddress), 'utf8')
}

const getEtherscan = async() => {
    const data = fs.readFileSync('./data/etherscan.json', 'utf8')
	const etherscan = JSON.parse(data)
	const allAddresses = etherscan.result.map(item => item.from)
	addresses = [...new Set(allAddresses)]
	await fs.writeFileSync(`./data/etherscanAddresses.json`, JSON.stringify(addresses), 'utf8')
}

const scanEtherscan = async() =>{
	const data = fs.readFileSync('./data/etherscanAddresses.json', 'utf8')
	const arrayAddress = JSON.parse(data)
	for(var i = 0; i<arrayAddress.length; i++){
		await checkShare(arrayAddress[i])
		await fs.writeFileSync(`./data/etherscanShares.json`, JSON.stringify(arrayShares), 'utf8')
	}
}

const etherscanFilter = async() => {
	const data = fs.readFileSync('./data/etherscanShares.json', 'utf8')
	const arrayShares = JSON.parse(data)
	let arrayShare44 = arrayShares.filter(item => +item.share.day <= 44)
	// console.log(arrayShareFilter)
	await fs.writeFileSync(`./data/etherscanShares44.json`, JSON.stringify(arrayShare44), 'utf8')
	// let total = arrayShares.reduce((total, item) => +item.share.share + total)
	// console.log('total %s VETH from %s users', total, arrayShares.length)
}

const etherscanTotal= async() => {
	const data = fs.readFileSync('./data/etherscanShares44.json', 'utf8')
	const arrayShares44 = JSON.parse(data)
	let total = arrayShares44.reduce((total, item) => (new BigNumber(item.share.share)).plus(total), 0)
	// console.log(total)
	console.log('total %s VETH from %s users', total.toFixed(), arrayShares44.length)
}

const checkShare = async (address) => {
	//console.log(arrayShares)
	console.log('checking shares for ', address)
	await checkAll(address)
}

async function checkAll(address) {
	for (var i = 1; i <= currentEra; i++) {
		console.log('check all, era: ', i)
		await checkEra(i, address)
	}
}

async function checkEra(i, address) {
	let indexContributed = (new BigNumber(await contract2.getDaysContributedForEra(address, i))).toFixed()
	console.log('Check currentEra: %s, currentDays contributed: %s', i, indexContributed)
	for (var j = 1; j <= indexContributed; j++) {
		console.log('checking index:%s', j-1)
		await checkDay(i, j-1, indexContributed, address)
	}
}

async function checkDay(i, j, length, address) {
	console.log("Checking currentEra %s, Index %s, currentDay %s", i, j, currentDay)
	if (i < currentEra || (i == currentEra && j < length)) {
		console.log(address, i, j)
		let day = (new BigNumber(await contract2.mapMemberEra_Days(address, i, j))).toFixed()
		console.log('Day at index %s is: %s', j, day)
		console.log(i, +day, address)
		let share = ethers.utils.formatEther(await contract2.getEmissionShare(i, +day, address))
		console.log('share is', share)
		if (share > 0) {
			console.log(i, day, share)
            arrayShares.push({'address':address, 
            share:
                { 'era': i, 'day': day, 'share': share, 'withdrawn': false, 'tx': null }})
		}
	}
}

const claimShare = async () => {
    console.log('claiming shares')
    const data = fs.readFileSync('./data/balanceArrayShares.json', 'utf8')
    const arrayShares  = JSON.parse(data)
	for (var i = 0; i < arrayShares.length; i++) {
        let shareObj = arrayShares[i].share
		console.log('withdrawn', shareObj.withdrawn)
		if (shareObj.withdrawn == false) {
			let era = shareObj.era; let day = shareObj.day; let share = shareObj.share; let withdrawn = shareObj.withdrawn;
			if(era < currentEra || (era >= currentEra && day < currentDay)) {
				// console.log('withdraw: ', era, day, share, withdrawn)
                // era = shareObj.era; day = shareObj.day; share = shareObj.share; withdrawn = shareObj.withdrawn;
				// console.log('withdraw: ', era, day, share, true)
				let tx = await contract.withdrawShareForMember(era, day, arrayShares[i].address);
				console.log(tx.hash);
                await tx.wait();
                arrayShares[i].share = { 'era': era, 'day': day, 'share': share, 'withdrawn': true, 'tx': tx.hash}
                await fs.writeFileSync('./data/arrayShares.json', JSON.stringify(arrayShares), 'utf8')
			}
		}
    }
}

const claimShareES = async () => {
    console.log('claiming shares')
    const data = fs.readFileSync('./data/etherscanShares44.json', 'utf8')
    let arraySharesES  = JSON.parse(data)
	for (var i = 0; i < arraySharesES.length; i++) {
        let shareObj = arraySharesES[i].share
		console.log('withdrawn', shareObj.withdrawn)
		if (shareObj.withdrawn == false) {
			let era = shareObj.era; let day = +shareObj.day; let share = shareObj.share; let withdrawn = shareObj.withdrawn;
			console.log('withdraw: ', era, day, share, withdrawn)
			era = shareObj.era; day = shareObj.day; share = shareObj.share; withdrawn = shareObj.withdrawn;
			console.log('withdraw: ', era, day, share, true)
			let tx = await contract.withdrawShareForMember(era, day, arraySharesES[i].address, {gasPrice:40*10**9});
			console.log(tx.hash);
			await tx.wait();
			arraySharesES[i].share = { 'era': era, 'day': day, 'share': share, 'withdrawn': true, 'tx': tx.hash}
			await fs.writeFileSync('./data/arraySharesES.json', JSON.stringify(arraySharesES), 'utf8')
		}
	}
	//console.log(arraySharesES)
}

const claimShareV2 = async () => {
    console.log('claiming shares')
    const data = fs.readFileSync('./data/vether2Shares.json', 'utf8')
    let arraySharesV2  = JSON.parse(data)
	for (var i = 0; i < arraySharesV2.length; i++) {
		let shareObj = arraySharesV2[i].share
		let era = shareObj.era; let day = +shareObj.day; let share = shareObj.share; let withdrawn = shareObj.withdrawn;
		console.log('withdrawn', shareObj.withdrawn)
		if (withdrawn == false && day <49) {
			
			console.log('withdraw: ', era, day, share, withdrawn)
			era = shareObj.era; day = shareObj.day; share = shareObj.share; withdrawn = shareObj.withdrawn;
			console.log('withdraw: ', era, day, share, true)
			let tx = await contract2.withdrawShareForMember(era, day, arraySharesV2[i].address, {gasPrice:40*10**9});
			console.log(tx.hash);
			await tx.wait();
			arraySharesV2[i].share = { 'era': era, 'day': day, 'share': share, 'withdrawn': true, 'tx': tx.hash}
			await fs.writeFileSync('./data/arraySharesV2.json', JSON.stringify(arraySharesV2), 'utf8')
		}
	}
	//console.log(arraySharesES)
}

const claimShare1 = async (arrayAddress) => {
    console.log('claiming shares 1')
	let day = 44
	for(var i = 0; i < arrayAddress.length; i++){
		console.log('withdrawn', arrayAddress[i].withdrawn)
		if (arrayAddress[i].withdrawn == false) {
			console.log(1, day, arrayAddress[i].address)
			let value = await contract.getEmissionShare(1, day, arrayAddress[i].address);
			console.log('value', +value)
			if(+value>0){
				console.log("withdrawing")
				let tx = await contract.withdrawShareForMember(1, day, arrayAddress[i].address);
				console.log(tx.hash);
				await tx.wait();
				let share = {'address': arrayAddress[i].address, 'withdrawn': true, 'tx': tx.hash}
				// let share = {'address': arrayAddress[i].address, 'withdrawn': true, 'tx': 'test'}
				arrayAddress[i] = share
				await fs.writeFileSync('./data/arrayAddress-final.json', JSON.stringify(arrayAddress), 'utf8')
			}
			
		}
	}
}


const claimShareBalance = async () => {
	console.log('claiming shares 1')
	// const data = fs.readFileSync('./data/arrayAddress49.json', 'utf8')
    // let owners  = JSON.parse(data)
	const data = fs.readFileSync('./data/export.csv', 'utf8')
	var owners = data.split(/\r?\n/);
	console.log(owners)
    // const balances  = JSON.parse(data)
    // const owners = balances.owners
	let day = 49
	let arrayAddress = []
	for(var i = 0; i < owners.length; i++){

		// console.log('withdrawn', arrayAddress[i].withdrawn)
		// if (arrayAddress[i].withdrawn == false) {
			console.log(1, day, owners[i])
			let value = await contract2.getEmissionShare(1, day, owners[i]);
			console.log('value', +value)
			if(+value>0){
				console.log("withdrawing")
				let tx = await contract2.withdrawShareForMember(1, day, owners[i], {gasPrice:60*10**9});
				console.log(tx.hash);
				await tx.wait();

				let share = {'address': owners[i].address, 'withdrawn': true, 'tx': tx.hash}
				// let share = {'address': arrayAddress[i].address, 'withdrawn': true, 'tx': 'test'}
				// owners[i] = share
				arrayAddress[i] = share
				await fs.writeFileSync('./data/arrayAddress-49.json', JSON.stringify(arrayAddress), 'utf8')
			}
			
		// }
	}
}

const fileSize = async () => {
    console.log('file size')
    const data = fs.readFileSync('./data/balanceArrayShares.json', 'utf8')
    const arrayShares  = JSON.parse(data)
    let total = arrayShares.reduce((a, item) => a + Number(item.share.share), 0)
    let number = arrayShares.length
    console.log("%s VETH for %s users", total, number)
}

const main = async () => {

	// const startTime = new Date(Date.now()).toLocaleString("en-gb")
	// times = { 'start': startTime, 'cycle': times.cycle, 'query': times.query  }
	await updateDetails()
	// await scanEtherscan()
	// await etherscanTotal()
	// await claimShareES()
	// await claimShareV2()
    await claimShareBalance()
	// await claimShare1(arrayAddress)

    // await fs.writeFileSync('./data/balanceArrayShares.json', JSON.stringify(arrayShares), 'utf8')
    
    // await claimShare()
    // await fileSize()
  }

  main()