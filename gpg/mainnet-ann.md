12 May 2020

# Vether Deployed To Mainnet

https://vetherasset.org/

Contracts:
https://github.com/vetherasset/vether-contracts

*Important Details*
* Burn Address is now 0x0111011001100001011011000111010101100101 which is the binary encoding of the word "VALUE", since UniSwap forbids sending to address(0)
* addExcluded() is a function which requires a fee of 128 Vether to exclude an address from the transaction fee. 
* DefSwap was removed since it is not a standard implementation of UniSwap Registry Contract and has low liquidity.

## Vether Roadmap

Vether Asset will have the following roadmap:

*UniSwap Listing*
Listing on UniSwap (early in Era 1)

*Vether Pools*
A liquidity pool network with Vether as the settlement asset and a dynamic slip-based fee model to prevent price manipulations and maximise liquidity provider revenue, supporting asymmetric staking and withdrawals. (Era 2)

*VUSD*
A USD stablecoin collaterised by pooled assets using Vether Pools as both a pricing and liquidation mechanism, pegged against a median of 5 other stablecoins, a first-order incentive system to maintain price, with CDP holders as the buyer and seller of last resort. (Era 3)

*Vether Synthetic Assets*
Synthetic Assets collaterised by pooled assets, using Vether Pools as both a pricing and liquidation mechanism, pegged against a reference asset and with a first-order incentive system to maintain price, with CDP holders as the buyer and seller of last resort. (Era 4)

-ss