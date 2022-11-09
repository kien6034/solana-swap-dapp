# SOLANA SWAP CONTRACT 
A smart contract that allow from SOL to MOVE tokens.

## Demo website
- https://www.kien6034.com/

- Mint token address
739dVcQCH57ioTUCcYSBXFty47JSf4Hm5jqoNGuCyBXn

## Program structure 
The program using the following mechanism to handle the swap from SOL to MOVE tokens.

Generally, the state of the program is stored in programs/solana-swap-dapp/src/state/ folder
The instructions is stored in  programs/solana-swap-dapp/src/instructions/ folder

1. An initializer `initialize` a `controller` account, along with an `escrow`, via the function instructions/initialize.ts. The `controller` and the `escrow` are constructed as the PDAs from the CONTROLLER_SEED_PHASE AND ESCROW_SEED_PHASE, along with an `internal_id` and the mint address of the `MOVE token`. 

2. The `controller` holds information about how to perform swap, including `initializer` - creator of the program, who will be able to withdraw funds back to his desired wallets,  `price` - how much MOVE a user will receive when he swap SOL for MOVE, and other information (please check programs/src/state/controller.rs). For example, if the price is [10, 1], the user can swap 1 SOL for 10 MOVE tokens. Controller also receiveS and holds SOL from the `swap operation`, and the controller allows the `initializer` to withdraw SOL back.

3. In order for the user to `swap`, someone needs to deposit MOVE token to the `escrow` to provide the liquidity. The `escrow` allows only the `initializer` of the `controller` to withdraw the fund back. 

4. When a user swap, he sends some SOL to the program, and receive back some MOVE tokens. The operation is perform via the `swap` functions. -- instructions/swap

5. The `initializer` can withdraw SOL and withdraw MOVE tokens via the `withdraw_sol` and `withdraw_escrow` functions. (instructions/withdraw_sol.ts and withdraw_escrow.ts)

## Deployment
This should be done like any Anchor project, so I will not elaborate


## Interactive scripts
### Environment 
Add your private key to the file scripts/secrete.json in order to use the scripts and interact with the blockchain, under the following format
```
{
    "private_key": [164, 238, ....., 124]
}
```


### Token
To create new tokens, run `ts-node scripts/create_token.ts` 

 **_NOTE:_**  The `MOVE` token metadata and uri for this project is temporaraly stored in the folder programs/solana-swap-dapp/metda 


### Interact with the program 
Run the following  `ts-node scripts/interact/*.ts` to interact with each functions of the program.

 **_NOTE:_**: In order to interact with all the scripts, we need to `initialize` the program first (creating controller and escrow accounts) by using file `initialize.ts`. And each time you initialize, you need to provide either different `internal_id` or `token_mint`, which is located inside the `data.ts`. These data will be used to calculate the PDA needed to interact with the program properly.



## Testing 

The testing scripts is located in the `tests\` folders

Run `anchor test` to test the program

**_NOTE:_**  Before run the test, change the config in the `Anchor.toml` from devnet to localnet to test on the local.


## FE 
To run the FE, ``cd app`, remove the lock file and node modules if there are any, and run `yarn && yarn dev`