require('dotenv').config()
const ethers = require('ethers');
const BigNumber = require('bignumber.js')
const VETHER = require('./artifacts/VetherOld.json')
const fs = require('fs')

const addr = () => {
	return '0x31Bb711de2e457066c6281f231fb473FC5c2afd3'
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
    ethBalance = ethers.utils.formatEther(await provider.getBalance(minerAddress))
    console.log(ethBalance)

	currentEra = (new BigNumber(await contract.currentEra())).toFixed()
	currentDay = (new BigNumber(await contract.currentDay())).toFixed()
	nextDayTime = (new BigNumber(await contract.nextDayTime())).toFixed()
    console.log('era:%s - day:%s - NextDay:%s', currentEra, currentDay, nextDayTime)
    
    const data = fs.readFileSync('./data/balances.json', 'utf8')
    const balances  = JSON.parse(data)
    owners = balances.owners
    console.log(owners.length)
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
	let indexContributed = (new BigNumber(await contract.getDaysContributedForEra(address, i))).toFixed()
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
		let day = (new BigNumber(await contract.mapMemberEra_Days(address, i, j))).toFixed()
		console.log('Day at index %s is: %s', j, day)
		console.log(i, +day, address)
		let share = ethers.utils.formatEther(await contract.getEmissionShare(i, +day, address))
		console.log('share is', share)
		if (share > 0) {
			console.log(i, day, share)
            arrayShares.push({'address':address, 
            share:
                { 'era': i, 'day': day, 'share': share, 'withdrawn': false }})
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
    // for(var i = 0; i < owners.length; i++){
    //     await checkShare(owners[i])
    // }
    // await fs.writeFileSync('./data/balanceArrayShares.json', JSON.stringify(arrayShares), 'utf8')
    
    await claimShare()
    // await fileSize()
  }

  main()