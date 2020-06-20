## VIP: 2

| Number | Title | Author | Created | Discussions | Status | Review Period End | Category | Resolution
|---|---|---|----|----|---|----|---|----|
| 2 | VIP2 - Vether Liquidity Incentives | strictly-scarce | 25 June 2020 | [discord](https://discord.gg/6UawhSB) | Draft | 25 June 2020 | Core | pending | 

-----

## Background

Vether is a strictly scarce permissionless asset that is acquired based on Proof-of-Value. However, in order for it to achieve its vision of being a Store-of-Value, the problem of liquidity needs to be addressed. 

Over the first 40 days the Vether community took the following steps to provide liquidity:
* Whitelist Uniswap V1 (128 VETH fee)
* Provide liquidity into Uniswap V1 pool
* Build a DApp interface to allow liquidity to be added easily
* Show the potential ROI based on liquidity provision from the pools.fyi API data

Despite all this and a ROI around 100% (due to high volumes), only 12 out of 250 holders participated, with less than 3000 VETH (<5% of supply) providing liquidity. The key problem is a matter of incentives. The majority of VETH holders did not want provide liquidity for fear of losing VETH due to impermanent loss, even though the ROI was quite high. 

In order for VETHER to become a meaningful store-of-value it needs to be incredibly liquid, allowing anyone to acquire or exit from it without causing high slippage. 

Additionally, it is intended for VETHER to be a DeFi asset, used for the upcoming Vether Pools and Vether Synthetic Asset platform. However the community is concerned about the uptake rate of such a platform considering the first 40 days of meager involvement in the Uniswap V1 pool.

## Solution

**Incentives**
With the successful launch of new DeFi protocols with liquidity incentives such as Balancer, Compound, Aave, THORChain and more, correct incentives are the most important aspects to new economies.  

Currently 100% of Vether's emission is claimed by anyone provably burning Ether (directly or through gas). The burn address has over 750 Ether burnt. In order to incentivise liquidity, Vether's emission can be split between the Daily Reward (50%) and a Liquidity Incentive (50%). There will now be two ways to acquire Vether:

1) Burn Ether as part of the daily burn - the reward is split fairly between everyone who burnt. 
2) Buy Vether, and then stake it into a Vether Liquidity Pool - the incentive is split fairly between anyone who stakes. 

**Benefits to Vether**
This does not change any characteristic of Vether. All Vether emitted can only be acquired by burning Ether or buying it at fair market price. However, it now directly incentives the provision of liquidity, since the only way to participate in (2) is to already hold a share of the Vether Liquidity Pool, and thus have already at some point acquired Vether. 

Additionally, large Vether holders cannot grow their share unfairly (economies of scale) since they are either fairly burning, or placing their Vether into a liquidity pool and allowing anyone else to buy it. 

Finally, as Vether holders compete to earn the Liquidity Incentive, they will be forced to provide additional capital into the pool, making Vether more and more liquid.

**Estimations**
If Vether can incentivise its own liquidity, then foreseably >90% of Vether will be accumulated in its chosen liquidity pool as Vether holders chase the yield. This will make Vether one of the most liquid assets on the Ethereum network. 

Assuming 90% involvement, Vether could have had 50% * 90% * 750 ETH = 338 ETH, or roughly 14 times more liquidity than was seen in the first 40 days.

## Specification

In order to achieve this the Vether Contract needs at a minimum the following logic:

1) Send half of the daily emission to a separate mapping
2) Allow the registration of an `incentiveAddress` to receive the incentive
3) Allow the `incentiveAddress` to claim the incentive every day

The `incentiveAddress` will be a contract that distributes the shares faily based on ownership of Uniswap V2 Liquidity Pool tokens.

The community must be able to update the Incentive Address in the future when any of the following might occur:

1) Shutdown of Uniswap V2
2) Launch of Vether Pools, as a replacement of Uniswap V2

To do this the following is required:

1) Allow Vether holders to vote to change the incentive address
2) Allow Vether Liquidity Pool stakers to vote to change the incentive address

If more than 50% of the total emitted supply votes to change to another address, then the `incentiveAddress` will change. This `51%` logic is seen in other decentralised protocols, such as Bitcoin. 

## Discussion of Incentives

**Incentivising Liquidity**
Directing 50% of the daily emission to those providing liquidity will massively increase participation in the Vether Liquidity Pool. This will have a direct benefit to the ecosystem, making Vether unquestionably liquid and countering any reservations to do with Impermanent Loss. 

**Acquiring Vether**
Vether has two primary characteristics, that it can be acquired fairly and without permission, and that all units are issued in return for provably destroying value. 

These two characteristics do not change with the addition of the Liquidity Incentive, because Vether can still only be acquired by burning Ether, or by buying it directly through the incentivised pool, from somone who acquired it by burning Ether. 

**Buying Vether**
Liquidity Providers can not amass economies of scale (the rich get richer) because all the Vether they provide in the pool are made available for purchase by anyone else. Anyone else wishing to participate in the Vether Liquidity Incentive must first acquire it or buy it. 

**Hostile Takeover**
If 90% of the circulating supply of Vether was in the pool, then foreseably someone can buy >50% of the circulating supply of Vether and attempt to change the destination address. However, by attempting to buy 50% of the supply they will cause runaway prices and will amass significant cost. 

If they did acquire 50% of the supply, then changing the incentive address to one in which they control would make the economy worthless and their costs would be irrecoverable. 

## Implementation

The revised Vether Contract has the following additional functions to implement this:

```solidity
function claimIncentive(uint era, uint day) public returns (uint value)
function voteWithBalance(address proposedAddress) public returns (bool success)
function voteFromContract(address proposedAddress, address member, uint balance) public returns (bool success)
```

The `claimIncentive(era, day)` function allows a liquidity staker to collect the day's Liquidity Incentive and distribute it to everyone staking. This does not change if the community vote to change from Uniswap to Vether Pools.

The `voteWithBalance(proposedAddress)` allows anyone to use the Vether balance on their address to cast a vote towards a new `incentiveAddress`. 

The `voteFromContract(proposedAddress, member, balance)` function allows only the current Incentive Address to register votes on behalf of a member towards a newly proposed address, using their ownership of the staked Vether balance. The contract must implement this interface correctly, and the community should check to ensure that any `incentiveAddress` they vote for is legitimate. The assumption here is that 51% of the community will never allow a malicous `incentiveAddress` to ever be elected. 

This design was chosen to simplify the logic. 



