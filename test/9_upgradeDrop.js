const Vether1 = artifacts.require("./Vether1.sol")
const Vether2 = artifacts.require("./Vether2.sol")
const Vether4 = artifacts.require("./Vether4.sol")
const BigNumber = require('bignumber.js')
const TruffleAssert = require('truffle-assertions')

var vether1; var vether2; var vether4;
var acc0; var acc1; var acc2; var acc3; var accBurn;

const upgradeHeight1 = 3
const upgradeHeight2 = 5
const sendEth = 1000;
const deposit = sendEth.toString()
const Emission = '2048';
const burnAddress = '0x0111011001100001011011000111010101100101'

function BN2Str(BN) { return (new BigNumber(BN)).toFixed() }
function getBN(BN) { return ((new BigNumber(BN))) }
const delay = ms => new Promise(res => setTimeout(res, ms));

//######################################################################################
// getVether (eth in, withdraw)
// pays fees (transfer)
// redeems ok
// tries to start emission, fail
// rolls past upgradeHeight
// starts emission
// redeems the rest
//######################################################################################

// Test Params
// totalSupply = 64000
// daysPerEra = 20, secondsPerDay = 2
// upgradeHeight1 = 3
// upgradeHeight2 = 5


contract("Upgrade Vether", async accounts => {
	constructor(accounts)
	deploy3(accounts)
	distribute()
	// sendEtherFail('v2') // Fail in 2
	// sendEther('v1', acc0) // 1-1
	// sendEther('v1', acc0) // 1-2
	// withdraws('v1', acc0, 1, 1)
	// withdraws('v1', acc0, 1,2)
	// transfer('v1', acc1)	// send some to acc1
	// excludeVether('v1') //burnAddress in Vether1
	// snapshot('v1') //snapshot Vether1 in 2
	// upgradeTo2(acc0) // upgrade acc0 to Vether2
	// sendEther('v2', acc0) // 1-3 mine Vether2
	// sendEther('v2', acc0) // 1-4 mine Vether2
	// withdraws('v2', acc0, 1,3) // withdraw Vether2
	// deploy3(accounts)
	// withdraws('v2', acc0, 1,4) // withdraw Vether2
	// transfer('v2', acc2) // send some to acc2
	// excludeVether('v2') //burnAddress in Vether2
	// snapshot('v2') //snapshot Vether2 in 3
	// upgradeTo4from1(acc1)
	// upgradeTo4from2(acc0)
	// upgradeTo4from2(acc2)
	// sendEther('v4', acc0) // 1-5 mine Vether4
	// sendEther('v4', acc0) // 1-6 mine Vether4
	// withdraws('v4', acc0, 1,5) // withdraw Vether4
	// withdraws('v4', acc0, 1,6) // withdraw Vether4
	// transfer3(acc3) // send some to acc2
	// excludeVether('v4')
	// sendEther('v1', acc0) // 1-2
	// withdraws('v1', acc0, 1, 4)
	// sendEther('v2', acc0) // 1-4 mine Vether2
	// withdraws('v2', acc0, 1,6) // withdraw Vether2
	// failUpgradeTo4from1(acc0) // can't claim too much
	// failUpgradeTo4from2(acc0) // can't claim too much
	// sendEther('v2', acc2) // 1-4 mine Vether2
	// withdraws('v2', acc2, 1,7) // withdraw Vether2
	// failUpgradeTo4from2(acc2) // can't claim too much
	// purge()
})


function constructor(accounts) {
	acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2]; acc3 = accounts[3];
	accBurn = acc2;
	it("initializes oldVether and newVether with correct params", async () => {

		vether1 = await Vether1.new()
		vether2 = await Vether2.new(vether1.address)
		console.log('vether1', vether1.address)
		console.log('vether2', vether2.address)

	})
}

function deploy3(accounts) {
	acc0 = accounts[0]; acc1 = accounts[1]; acc2 = accounts[2]; acc3 = accounts[3];
	accBurn = acc2;
	it("initializes Vether4 with correct params", async () => {

		vether4 = await Vether4.new(vether1.address, vether2.address)
		console.log('vether4', vether4.address)

		const genesisOld = BN2Str(await vether1.genesis())
		const genesis = BN2Str(await vether4.genesis())
		assert.equal(genesis, genesisOld)
		
		const ndt3 = getBN(await vether4.nextDayTime())
		console.log(BN2Str(ndt3))

		const currentDay = await vether4.currentDay()
		assert.equal(currentDay, upgradeHeight2)

		const totalFees = BN2Str(await vether2.totalFees())
		assert.equal(totalFees, BN2Str(await vether4.totalFees()))

		const totalBurnt = BN2Str(await vether2.totalBurnt())
		assert.equal(totalBurnt, BN2Str(await vether4.totalBurnt()))

		const totalSupply = BN2Str(await vether2.totalSupply())
		assert.equal(totalSupply, BN2Str(await vether4.totalSupply()))

		const totalEmitted = BN2Str(await vether4.totalEmitted())
		assert.equal(totalEmitted, (upgradeHeight2 - 1) * 2048)

		for(let i =1; i<upgradeHeight1; i++){
			const units = BN2Str(await vether1.mapEraDay_Units(1,i))
			assert.equal(units, BN2Str(await vether4.mapEraDay_Units(1,i)))
			console.log(i, units)
		}
		for(let i =upgradeHeight1; i<upgradeHeight2; i++){
			const units = BN2Str(await vether2.mapEraDay_Units(1,i))
			assert.equal(units, BN2Str(await vether4.mapEraDay_Units(1,i)))
			console.log(i, units)
		}

	})
}

const owners = [0x0a2542a170aa02b96b588aa3af8b09ab22a9d7ac,0xed41d87e495490cab6451de1ca7b72771b75e0fe,0xcd1c84f035788ab653ce5351461f53e6af86a419,0x6d5f308b843abe97309f772618c6ce716ebd8eed,0xc59f0df06b93aa31986b1fb34e7ccc6ee51cdec2,0xadb3868a75b8c28581e12ebfec552671ef083aac,0x735aa305a273f59d6fe6929c98cb80662ecb3098,0x96b2ff605f979765088e52c57657ba6bd3cbc9cf,0xe6ac52d788b3a8a6d9811042f10941776899c29d,0x8d344570b8425c3658686d230c7bb3d9031b6b90,0xf91969b0c492adeec949483f8a71b20fe2ffc9de,0x88c3adca695a935699356250d54eb0d3e0c1a206,0x2adbc63f1a72d33b8050521eca1b57d335bd9dbc,0x07fc63bb1bfb664b1fcb41d8193738cad1255c09,0x9610c7a3dc1d09ed29e822652c4aa57a58e9c0b4,0x8acc5677f98b86c407bfa7861f53857430ba3904,0x493221aca0d732098f36fd43e414a7c98d056218,0x8a3db8e88dba75038f32d98daee70dc7812a8f0e,0xac70df3f90ba3a7876cb9ea86833c09132f07728,0x11051d33685f661c2f8a48465b77ec0a2fe7a51d,0x679a4d07fe8433b247e02a5afe7c4e1d8d7f9490,0x1887f4dbda11305508179db515ac2c8dfbf3b9fc,0xe1e2a831205bf1b30927cf8b2a5c82b8a548d34b,0x21fb8e54a34f462c3642b5dc3e529206fdf7b324,0x602cd80de210d4253f671276a85fabcfa3ee1c7f,0x630c2d090aed8c4791a1d4f5ef7fb51468049dce,0xdcf9527f8f83d00b5556d70bbe67b35dd4d9b1bc,0x787aa24888876ea08ed99bf4f8b618737881cb16,0x21cc1ddafae60e254f22d89d2a77707a350849b6,0xf9263986be319e0444b600a73501ef7689cdb022,0xf81669039cde3d6014349e7cf3d5fbab1dc4bfd5,0x93f5af632ce523286e033f0510e9b3c9710f4489,0x23eebb090c430783bf0665478ea6d5793b44a3c3,0x523e1b1255a60acd4e0a31b3f4b1241cdbc4e064,0x24f6c2a2cb0590eb29b7476ca6470eecc51f29c7,0xc16ccac44cbf7a75d8dfa421d6a58332fcf98bd5,0xa6d2535612975da08797d89f9ed627dd239e3e24,0xdf3214b148b715d53f2579bbd2bc75ff2074a4bc,0xb9c37ed113879e85c83d5338ff40f5009b2ec271,0x3562a4df9fb30d7b1cb1447c24eaa9b540edfcd7,0x30edbbe335100db1484ebbc7191fe75a465963c9,0xf8e9e12bc1a51b4de0a95feb5c58c49a89df7cd6,0x76af3fbaeb4c7df2f84e609735d07ecce57b67da,0xc78eed7b6ef98ff11dd7f557c67ae0abdd69227b,0x84a24d50c1cdbc044f4aec7f21a0fb83226659a8,0xbb9066f6cbef2415b3a6dcfe0956c5665ff7a4a2,0x3073d8984554a6038a8232fb23afd0d3330ffcd9,0x1218223b44ea08540c811375f1a380e93d60a6d2,0xfd1c3e8a636820c88a3d58f9028e0e6e61ad87ba,0x9ce1bd85d18986d311b67182f2d6ecf6e583cf5b,0x016e93087771b576abb556f07ad01e94b92d5564,0x7dabbbb80d608ad72313e46872dca283ebef557f,0x172dd80f16e625226915c209766194511fc76e48,0xcda459ba2e5bbba181c7e0aa559eeef7cbe1a04b,0x97b8a636af8249d249d26ea30086b3bde384b069,0x79eb9979b99ec37e2162d251e54cafb9ae1f7f82,0xae1a1cdb13ec86506831531d9e52456b2c0eb625,0x415313d949570f626ee15574d535e77bb6f2da0f,0x92598e499f4c576104105279cf926df447f2d044,0x46842c4d148e1396478677290d8b4bf3b8416f45,0xb63bb45b2ef614ce087dc01c98013d87fd757896,0x020c186d4c8dee8bc7452897fc63d5c7c6e1a2d2,0x6ff7aad60f9acadb6e65765cf6425116ef2f447b,0x87562af67d3319560308188e2a790bd5348f0f2f,0x18cc1af10e48cf405506ee15331bb3e4bf116e70,0xdf632ea5ba8283488aae8538e17a2f802243a61a,0x4aa3f3e453bc0a678107f1d7c06f3b7cc0359c2b,0x0d8763e73cd4b0d3af778f25190e4a07bbfe57e4,0x4a3a7cbbcdf48ef38cc75214f918584cab49bffc,0x4cef35f2ec6d8f7a8cd3fdd26291221435135e74,0xd8efd5a06351b57e297e95684bb84d673f4e298c,0x997221b4f12974f723deb297894cb3a91ffce64f,0x9a75d93f1eddd752b4246c92340b2e7dacccb67f,0x99a41f138172a493fca0743c3c440d4ec7f54fe9,0xb4de38d688a91ec1af12b963358f8b3488b098be,0xf96dc79fafc7c4e26370f63d412b671a17c81eab,0xb193e0c44e883008fb40dccdd648960cdebeeb94,0x47b093c50e6f5911240173919cfcd744b577989c,0x97c9d92326b896cf870dccb714bf0e1a9d45e2d3,0x05d2b89bd65d8b73a0d8ce000efa621640dfa4c8,0x64f11fa0278c42e1a6d20a738bd9db2b101a87fd,0xc784aa191b4562d4ae860b851461d7fac80acf33,0x9e98f2ee9d7cb793fa8d7a47c936e22b065ed7a8,0x126fe1ada25abdbd0584b60f3e5156807ee18fc9,0x3ad966f61b764033913e007b5fe1b9faa93ab0a4,0xd4d00ffa0b656521d44bd857bd7c5eeb27d3a48e,0x7ac84c73e2ed3b520511a126c1cc0e3501e616b8,0xe8b2ccfdfa7056006a7c320321f71ab0203f2544,0x935516e2c60861acc2d0c097d801dba69ae3a484,0xe8f1b51cfc9e01f32177949a69e647da46e54c3c,0x07835b9275de07920086b3085bdb6503fbe14b19,0xa8b8ea4c083890833f24817b4657888431486444,0x645bfc0cda187e1c482dac2c513cf635180d52af,0x16335d6050ee8ec82203048a66e6ef306f778f2d,0x4c1bb7635d7ceca02ff8121a737bf4ae6dcf45f1,0x84f0a7680b7bd0fb81186ecc2500b55ba401fda0,0xf21f468c31b1742d23fa47bd172e0bf48a2b5d8b,0x407c94d2e4463866398f2b7e23c481ef6eed24dc,0x3120670b117855b54306c548216a4c25dc704982,0xb96cd0befa836d4f6805ec8613dcad1d172ff2e2,0x85074d8f0a54725279344484a7b8bfe335fe02d6]
const ownership = [1649576558089386007875,695298234394474858866,663027328271383759262,329170099999999978043,299700000000000000000,259740000000000000000,612095668584576080322,240116750929813629964,235609749741228677315,199800000000000000000,175000000000000000000,174809497844176753438,172322531175741097251,165705905034621510177,146199929422237666551,141000000000000000000,127838178817336736820,112449661947969599746,110968362890926126366,217022959508879208588,101576887701515447479,99900000000000000000,95000000000000000000,94477588369760068069,88682455489744424010,88450101587109075091,1561498130495738983664,72184619475133410615,68594853711759299290,60444109064914773266,57385901959896806740,53263906426517040647,52137109481841566268,51881042817360512974,50679682313634415264,48085912714511257703,45240081618051480889,41661177261043617461,37149690494162343788,36506795518242825048,35725508364222074626,35540873339798142481,34995390685625741872,32058000918289595902,31388778383931316006,31333738710790340410,30517373269709588833,30211350422209012789,29972556798560799142,28829058602859521751,27352154053710342051,25472832339321344402,25451623620773747667,25007855854955452239,24950025000000000000,22851156042810513382,22393439915813674291,21579232894667158758,20234754183737644059,20006284683964363935,20000000000000000000,19030923392035459145,18614220085637360917,18155672381648401412,17980832023512480298,17692520167245317958,14290203345688829850,13767550705053732219,12306008582981215213,11126621367208465807,10964994706667824991,10757645497478867592,10499812379030936742,10286348934444952300,10000000000000000000,9990000000000000000,9007748885459068963,8908331141848360090,8000000000000000000,7769646310357253734,6827545298981984201,6390216999810903069,6120915485175501870,318421261962520623325,5689640530431505455,5498500000000000000,5418687439765834963,5399453117517166311,5335155288692390708,4921182306846031239,4533462000000000000,3714057838194617204,3432001981951321468,3369146166502249028,2516847553875395489,2314501071721487590,2248161210456010671,2010433761036918399,1998000000000000000,1897198421837188684,1555692147395027593]


function distribute() {

	it('distributes', async () => {
		// let owners = [acc0, acc1, acc2]
		// let ownership = [100, 90, 80]
		await vether4.distribute(owners, ownership)
		let acc0Own2 = await vether4.balanceOf(acc0)
		let acc1Own2 = await vether4.balanceOf(acc1)
		let acc2Own2 = await vether4.balanceOf(acc2)
		console.log(BN2Str(acc0Own2))
		console.log(BN2Str(acc1Own2))
		console.log(BN2Str(acc2Own2))

	})
}



function sendEther(_vether, _acc) {

	it(`Acc0 sends Ether to ${_vether} Vether`, async () => {
		await delay(2100);

		let vether
		if (_vether == 'v1') { vether = vether1; }
		else if (_vether == 'v2') { vether = vether2; }
		else { vether = vether4; }

		var _era; var _day;

		_era = await vether.currentEra(); _day = await vether.currentDay();
		let _emission = BN2Str(await vether.emission())
		console.log('Era: %s - Day: %s - Emission: %s', _era, _day, _emission)

		let tx = await vether.send(sendEth, { from: _acc })
		// let logs = tx.receipt.logs
		// for (var i=0; i<logs.length; i++){
		// 	console.log('event - %s, day - %s', logs[i].event, BN2Str(logs[i].args.day))
		// }

		let units = await vether.mapEraDay_MemberUnits.call(_era, _day, _acc);
		assert.equal(units, deposit, "the units is correct");

		let totalUnits = await vether.mapEraDay_Units.call(_era, _day);
		assert.equal(totalUnits, deposit, "the total units is correct");

		let vetherBal = new BigNumber(await vether.balanceOf(vether.address)).toFixed();
		console.log(BN2Str(vetherBal))

		let valueShare = await vether.getEmissionShare(_era, _day, _acc);
		assert.equal(BN2Str(valueShare), _emission, "the value share is correct");

		let valueLeft = await vether.mapEraDay_EmissionRemaining.call(_era, _day);
		assert.equal(valueLeft, _emission, "the value left is correct");

		let vetherOldBal1 = new BigNumber(await vether.balanceOf(vether.address)).toFixed();

		console.log(BN2Str(units), BN2Str(totalUnits), BN2Str(valueShare), BN2Str(valueLeft), BN2Str(vetherOldBal1))

	})
}

function withdraws(_vether, _acc, _era, _day) {

	it(`Acc0 withdraws from ${_vether} Vether`, async () => {

		let vether
		if (_vether == 'v1') { vether = vether1; }
		else if (_vether == 'v2') { vether = vether2; }
		else { vether = vether4; }

		let _bal = Emission

		let valueStart = getBN(await vether.getEmissionShare(_era, _day, _acc));
		let balBNStart = getBN(await vether.balanceOf(_acc))

		let tx = await vether.withdrawShare(_era, _day, { from: _acc })
		// console.log(tx.receipt.logs)
		// let logs = tx.receipt.logs
		// for (var i=0; i<logs.length; i++){
		// 	console.log('event - %s, day - %s', logs[i].event, BN2Str(logs[i].args.day))
		// }

		let balBN = new BigNumber(await vether.balanceOf(_acc))
		assert.equal(balBN.toFixed(), valueStart.plus(balBNStart), "correct acc bal")

		let units = BN2Str(await vether.mapEraDay_MemberUnits.call(_era, _day, _acc))
		assert.equal(units, "0", "the units is correct");

		let totalUnits = await vether.mapEraDay_UnitsRemaining.call(_era, _day);
		assert.equal(totalUnits, "0", "the total units is correct");

		let valueShare = await vether.getEmissionShare(_era, _day, _acc);
		assert.equal(valueShare, "0", "the value share is correct");

		let valueLeft = await vether.mapEraDay_EmissionRemaining.call(_era, _day);
		assert.equal(valueLeft, "0", "the value left is correct");

		let vetherOldBal1 = await vether.balanceOf(vether.address);
		//console.log("vether Balance", vetherOldBal1.toNumber());

		let balBNFinal = new BigNumber(await vether.balanceOf(_acc))
		console.log('Final User Balance: ', balBNFinal.toFixed())
	})
}

function transfer(_vether, _acc) {
	it("allows a transfer between accounts for fees", async () => {

		let vether; let vetherNew;
		if (_vether == 'v1') { vether = vether1; vetherNew=vether2}
		else if (_vether == 'v2') { vether = vether2; vetherNew=vether4}
		else { vether = vether4; vetherNew=vether4}

		let vetherOldBal1 = getBN(await vether.balanceOf(vether.address));
		//console.log("vether Balance Start:", vetherOldBal1.toNumber());
		let acc0Bal1 = getBN(await vether.balanceOf(acc0));
		let acc1Bal1 = getBN(await vether.balanceOf(_acc));
		//console.log("Account0 Balance: ", acc0Bal1.toNumber()); //console.log("Account1 Balance: ", acc1Bal1.toNumber());
		let remaining1 = getBN(await vetherNew.getRemainingAmount())

		let r = await vether.transfer(_acc, deposit, { from: acc0 })
		let r2 = await vether.transfer(_acc, deposit, { from: acc0 })
		let r3 = await vether.transfer(acc0, deposit, { from: _acc })

		let acc0Bal2 = getBN(await vether.balanceOf(acc0));
		let acc1Bal2 = getBN(await vether.balanceOf(_acc));
		//console.log("Account0 New Balance: ", acc0Bal2.toNumber()); //console.log("Account1 New Balance: ", acc1Bal2.toNumber());
		assert.equal(BN2Str(acc0Bal1.minus(acc0Bal2)), "1001", "correct acc0 balance")
		assert.equal(BN2Str(acc1Bal2.minus(acc1Bal1)), "998", "correct acc1 balance")

		let vetherOldBal2 = getBN(await vether.balanceOf(vether.address));
		//console.log("vether Balance End:", vetherOldBal2.toNumber());
		assert.equal(BN2Str(vetherOldBal2.minus(vetherOldBal1)), "3", "correct vether balance")

		let vetherFees = await vether.totalFees();
		//console.log("Fees:", vetherFees.toNumber());
		assert.equal(vetherFees.toNumber(), "3", "correct vetherFees")

		let remaining2 = getBN(await vetherNew.getRemainingAmount())
		assert.equal(BN2Str(remaining1.minus(remaining2)), '3')
	})
}

function excludeVether(_vether) {

	it("Excludes swap address", async () => {

		let vether
		if (_vether == 'v1') { vether = vether1; 
			await vether.addExcluded(burnAddress, { from: acc0 })
			assert.equal(await vether.mapAddress_Excluded(burnAddress), true)
		}
		else if (_vether == 'v2') { vether = vether2; 
			await vether.changeExcluded(burnAddress, { from: acc0 })
			assert.equal(await vether.mapAddress_Excluded(burnAddress), true)
		}
		else { vether = vether4; 
			await vether.addExcluded(acc0, { from: acc0 })
			assert.equal(await vether.mapAddress_Excluded(acc0), true)
			console.log(BN2Str(await vether4.excludedCount()))
			console.log((await vether4.excludedArray(0)))
			console.log((await vether4.excludedArray(1)))
			console.log((await vether4.excludedArray(2)))
		}
	})
}

function snapshot(_vether) {
	// it('fails from non-deployer', async () => {
	// 	let vether; let vetherNew;
	// 	if (_vether == 'v1') { vether = vether1; vetherNew=vether2}
	// 	else if (_vether == 'v2') { vether = vether2; vetherNew=vether4}
	// 	else { vether = vether4; }

	// 	let owners = [acc0, acc1, acc2]
	// 	let ownership = [Emission, Emission / 2, Emission / 4]
	// 	TruffleAssert.reverts(vetherNew.snapshot(owners, ownership, { from: acc1 }))

	// 	console.log('ownership acc0', BN2Str(await vetherNew.mapPreviousOwnership(acc0)))
	// 	console.log('ownership acc1', BN2Str(await vetherNew.mapPreviousOwnership(acc1)))
	// 	console.log('ownership acc2', BN2Str(await vetherNew.mapPreviousOwnership(acc2)))
	// })
	it('adds previous owners', async () => {
		let vether; let vetherNew;
		if (_vether == 'v1') { vether = vether1; vetherNew=vether2
			let owners = [acc0, acc1, acc2]
			let acc0Own = await vether.balanceOf(acc0)
			let acc1Own = await vether.balanceOf(acc1)
			let acc2Own = await vether.balanceOf(acc2)
			let ownership = [acc0Own, acc1Own, acc2Own]
			await vetherNew.snapshot(owners, ownership)
		}
		else if (_vether == 'v2') { vether = vether2; vetherNew=vether4
			let owners = [acc0, acc1, acc2]
			let acc0Own1 = await vether1.balanceOf(acc0)
			let acc1Own1 = await vether1.balanceOf(acc1)
			let acc2Own1 = await vether1.balanceOf(acc2)
			let ownership1 = [acc0Own1, acc1Own1, acc2Own1]
			await vetherNew.snapshot(owners, ownership1)
			let acc0Own2 = await vether2.balanceOf(acc0)
			let acc1Own2 = await vether2.balanceOf(acc1)
			let acc2Own2 = await vether2.balanceOf(acc2)
			let ownership2 = [acc0Own2, acc1Own2, acc2Own2]
			await vetherNew.snapshot(owners, ownership2)
		}
		else { vether = vether4; }
		console.log('ownership acc0', BN2Str(await vetherNew.mapPreviousOwnership(acc0)))
		console.log('ownership acc1', BN2Str(await vetherNew.mapPreviousOwnership(acc1)))
		console.log('ownership acc2', BN2Str(await vetherNew.mapPreviousOwnership(acc2)))
	})
}

function sendEtherFail(_vether) {

	it("fails if sending too early", async () => {
		let vether
		if (_vether == 'v1') {vether = vether1;} 
		else if (_vether == 'v2') {vether = vether2;} 
		else {vether = vether4;}
		// console.log(_vether)
		// console.log(vether.address)
		TruffleAssert.reverts(vether.send(sendEth, { from: acc0 }))
	})
}

function upgradeTo2(_acc) {

	// it("fails an upgrade for too much", async () => {
	// 	console.log('ownership acc', BN2Str(await vether4.mapPreviousOwnership(_acc)))
	// 	await vether.approve(vether4.address, '10000000', {from:_acc})
	// 	TruffleAssert.reverts(vether4.upgrade('10000000'))
	// })

	it(`allows ${_acc} to upgrade all from Vether1 to Vether2`, async () => {
		let balanceLeft = await vether1.balanceOf(_acc)
		let upgradedAmount = getBN(await vether2.upgradedAmount())
		console.log('balanceLeft', BN2Str(balanceLeft))
		console.log('ownership acc', BN2Str(await vether2.mapPreviousOwnership(_acc)))
		let remaining = getBN(await vether2.getRemainingAmount())
		console.log('remainig', BN2Str(remaining))
		console.log('balanceBurnStart', BN2Str(await vether1.balanceOf(burnAddress)))

		await vether1.approve(vether2.address, balanceLeft, { from: _acc })
		let tx = await vether2.upgrade(balanceLeft, { from: _acc })
		// console.log(tx.receipt.logs)

		let balanceBurn = await vether1.balanceOf(burnAddress)
		console.log('balanceBurn', BN2Str(balanceBurn))
		// assert.equal(balanceBurn, balanceLeft.toString())
		let remainingEnd = getBN(await vether2.getRemainingAmount())
		console.log('remainingEnd', BN2Str(remainingEnd))
		assert.equal(BN2Str(remaining.minus(remainingEnd)), BN2Str(balanceLeft))


		let newUpgradedAmount = BN2Str(await vether2.upgradedAmount())
		assert.equal(newUpgradedAmount, BN2Str(upgradedAmount.plus(balanceLeft)))
		console.log('holders', BN2Str(await vether2.holders()))
		console.log('holder0', await vether2.holderArray(0))
	})
}

function upgradeTo4from1(_acc) {

	it("allows a Vether1 upgrade to Vether4 starts", async () => {
		let balanceLeft = await vether1.balanceOf(_acc)
		let remaining = getBN(await vether4.getRemainingAmount())
		let upgradedAmount = getBN(await vether4.upgradedAmount())
		console.log('balanceLeft', BN2Str(balanceLeft))
		console.log('ownership acc', BN2Str(await vether4.mapPreviousOwnership(_acc)))
		await vether1.approve(vether4.address, balanceLeft, { from: _acc })
		console.log('allowance', BN2Str(await vether1.allowance(_acc, vether4.address)))

		let balanceBurn1 = getBN(await vether1.balanceOf(burnAddress))
		await vether4.claim({ from: _acc })
		let balanceBurn2 = getBN(await vether1.balanceOf(burnAddress))
		
		// assert.equal(BN2Str(balanceBurn2.minus(balanceBurn1)), BN2Str(balanceLeft))
		let remainingEnd = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingEnd)), balanceLeft.toString())
		//console.log(BN2Str(remainingEnd))

		let newUpgradedAmount = BN2Str(await vether4.upgradedAmount())
		assert.equal(newUpgradedAmount, BN2Str(upgradedAmount.plus(balanceLeft)))

		const remainingNew = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingNew)), BN2Str(balanceLeft))
		console.log('remainingNew', BN2Str(remainingNew))
		console.log('balance', BN2Str(await vether4.balanceOf(_acc)))
		console.log('holders', BN2Str(await vether4.holders()))
		console.log('holder0', await vether4.holderArray(0))

	})
}
function upgradeTo4from2(_acc) {

	it("allows a Vether2 upgrade to Vether4", async () => {
		let balanceLeft = await vether2.balanceOf(_acc)
		let remaining = getBN(await vether4.getRemainingAmount())
		let upgradedAmount = getBN(await vether4.upgradedAmount())
		console.log('balanceLeft', BN2Str(balanceLeft))
		console.log('ownership acc', BN2Str(await vether4.mapPreviousOwnership(_acc)))
		await vether2.approve(vether4.address, balanceLeft, { from: _acc })
		console.log('allowance', BN2Str(await vether2.allowance(_acc, vether4.address)))

		let balanceBurn1 = getBN(await vether2.balanceOf(burnAddress))
		await vether4.claim({ from: _acc })
		let balanceBurn2 = getBN(await vether2.balanceOf(burnAddress))
		
		// assert.equal(BN2Str(balanceBurn2.minus(balanceBurn1)), BN2Str(balanceLeft))
		let remainingEnd = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingEnd)), balanceLeft.toString())
		//console.log(BN2Str(remainingEnd))

		let newUpgradedAmount = BN2Str(await vether4.upgradedAmount())
		assert.equal(newUpgradedAmount, BN2Str(upgradedAmount.plus(balanceLeft)))

		const remainingNew = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingNew)), BN2Str(balanceLeft))
		console.log('remainingNew', BN2Str(remainingNew))
		console.log('balance', BN2Str(await vether4.balanceOf(_acc)))
		console.log('holders', BN2Str(await vether4.holders()))
		console.log('holder0', await vether4.holderArray(0))

	})
}

function transfer3(_acc) {
	it("allows a transfer between accounts for fees", async () => {
		let vether = vether4
		let vetherOldBal1 = getBN(await vether.balanceOf(vether.address));
		//console.log("vether Balance Start:", vetherOldBal1.toNumber());
		let acc0Bal1 = getBN(await vether.balanceOf(acc0));
		let acc1Bal1 = getBN(await vether.balanceOf(_acc));
		//console.log("Account0 Balance: ", acc0Bal1.toNumber()); //console.log("Account1 Balance: ", acc1Bal1.toNumber());

		let r = await vether.transfer(_acc, deposit, { from: acc0 })
		let r2 = await vether.transfer(_acc, deposit, { from: acc0 })
		let r3 = await vether.transfer(acc0, deposit, { from: _acc })

		let acc0Bal2 = getBN(await vether.balanceOf(acc0));
		let acc1Bal2 = getBN(await vether.balanceOf(_acc));
		//console.log("Account0 New Balance: ", acc0Bal2.toNumber()); //console.log("Account1 New Balance: ", acc1Bal2.toNumber());
		assert.equal(BN2Str(acc0Bal1.minus(acc0Bal2)), "1001", "correct acc0 balance")
		assert.equal(BN2Str(acc1Bal2.minus(acc1Bal1)), "998", "correct acc1 balance")

		let vetherOldBal2 = getBN(await vether.balanceOf(vether.address));
		//console.log("vether Balance End:", vetherOldBal2.toNumber());
		assert.equal(BN2Str(vetherOldBal2.minus(vetherOldBal1)), "3", "correct vether balance")

		let vetherFees = await vether.totalFees();
		//console.log("Fees:", vetherFees.toNumber());
		assert.equal(vetherFees.toNumber(), "3", "correct vetherFees")

	})
}

function failUpgradeTo4from1(_acc) {

	it("fails a Vether1 upgrade to Vether4", async () => {
		let balanceLeft = await vether1.balanceOf(_acc)
		let remaining = getBN(await vether4.getRemainingAmount())
		let upgradedAmount = getBN(await vether4.upgradedAmount())
		console.log('balanceLeft', BN2Str(balanceLeft))
		console.log('ownership acc', BN2Str(await vether4.mapPreviousOwnership(_acc)))
		await vether1.approve(vether4.address, balanceLeft, { from: _acc })
		console.log('allowance', BN2Str(await vether1.allowance(_acc, vether4.address)))

		let balanceBurn1 = getBN(await vether1.balanceOf(burnAddress))
		await vether4.claim({ from: _acc })
		let balanceBurn2 = getBN(await vether1.balanceOf(burnAddress))
		
		// assert.equal(BN2Str(balanceBurn2.minus(balanceBurn1)), BN2Str(0))
		let remainingEnd = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingEnd)), BN2Str(0))
		//console.log(BN2Str(remainingEnd))

		let newUpgradedAmount = BN2Str(await vether4.upgradedAmount())
		assert.equal(newUpgradedAmount, BN2Str(upgradedAmount.plus(0)))

		const remainingNew = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingNew)), BN2Str(0))
		console.log('remainingNew', BN2Str(remainingNew))
		console.log('balance', BN2Str(await vether4.balanceOf(_acc)))
		console.log('holders', BN2Str(await vether4.holders()))
		console.log('holder0', await vether4.holderArray(0))
		console.log('holder1', await vether4.holderArray(1))
		console.log('holder2', await vether4.holderArray(2))
		console.log('holder3', await vether4.holderArray(3))
		console.log('holder4', await vether4.holderArray(4))

	})
}
function failUpgradeTo4from2(_acc) {

	it("fails a Vether2 upgrade to Vether4", async () => {
		let balanceLeft = await vether2.balanceOf(_acc)
		let remaining = getBN(await vether4.getRemainingAmount())
		let upgradedAmount = getBN(await vether4.upgradedAmount())
		console.log('balanceLeft', BN2Str(balanceLeft))
		console.log('ownership acc', BN2Str(await vether4.mapPreviousOwnership(_acc)))
		await vether2.approve(vether4.address, balanceLeft, { from: _acc })
		console.log('allowance', BN2Str(await vether2.allowance(_acc, vether4.address)))

		let balanceBurn1 = getBN(await vether2.balanceOf(burnAddress))
		await vether4.claim({ from: _acc })
		let balanceBurn2 = getBN(await vether2.balanceOf(burnAddress))
		
		// assert.equal(BN2Str(balanceBurn2.minus(balanceBurn1)), BN2Str(0))
		let remainingEnd = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingEnd)), BN2Str(0))
		//console.log(BN2Str(remainingEnd))

		let newUpgradedAmount = BN2Str(await vether4.upgradedAmount())
		assert.equal(newUpgradedAmount, BN2Str(upgradedAmount.plus(0)))

		const remainingNew = getBN(await vether4.getRemainingAmount())
		assert.equal(BN2Str(remaining.minus(remainingNew)), BN2Str(0))
		console.log('remainingNew', BN2Str(remainingNew))
		console.log('balance', BN2Str(await vether4.balanceOf(_acc)))
		console.log('holders', BN2Str(await vether4.holders()))
		console.log('holder0', await vether4.holderArray(0))

	})
}

function purge() {
	it('purge', async () => {
		let owners = [acc0, acc1, acc2]
		let acc0Own = await vether4.balanceOf(acc0)
		let acc1Own = await vether4.balanceOf(acc1)
		let acc2Own = await vether4.balanceOf(acc2)
		let ownership = [acc0Own, acc1Own, acc2Own]
		await vether4.purgeDeployer()
		TruffleAssert.reverts(vether4.snapshot(owners, ownership, { from: acc0 }))

	})
}
