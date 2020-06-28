require('dotenv').config()
const ethers = require('ethers');


const sendEth = async (amt) => {
    provider = ethers.getDefaultProvider();
	signingKey = new ethers.utils.SigningKey(process.env.PAYER_KEY);
	minerAddress = signingKey.address
	console.log('Address: ' + signingKey.address);
    wallet = new ethers.Wallet(process.env.PAYER_KEY, provider);
    

	let gasPrice_ = (await provider.getGasPrice()).mul(2)
	let tx = {
		gasPrice: gasPrice_, 
		gasLimit: 250000,
        value: 1,
        to:minerAddress,
        nonce: 303,
    };
    console.log(tx)
    let transactionHash = await wallet.sendTransaction(tx)
    console.log('transactionHash is ' + transactionHash);
}

const main = async () =>{
    await sendEth()
}

main()