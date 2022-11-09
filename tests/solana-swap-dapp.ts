import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Swapper } from "../scripts/bot/swapper";
import { createMintToken, createUserAndAssociatedWallet, getSplBalance, transferToken } from "../scripts/utils/token";
import { SolanaSwapDapp } from "../target/types/solana_swap_dapp";
import * as assert from "assert";

const CONTROLLER_ID= "1";
const MOVE_DECIMAL = 6;
const MOVE_PRICE = [new anchor.BN(10), new anchor.BN(1)]; // 1 move = 0.1 SOL

describe("solana-swap-dapp", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaSwapDapp as Program<SolanaSwapDapp>;

  let swapper: Swapper;

  // We are going to work with this MOVE token latter
  let token_mint: anchor.web3.PublicKey;

  let deployer: anchor.web3.Keypair;
  let deployer_token_wallet: anchor.web3.PublicKey;

  let alice: anchor.web3.Keypair;
  let alice_token_wallet: anchor.web3.PublicKey;

  let bob: anchor.web3.Keypair;
  let bob_token_wallet: anchor.web3.PublicKey;

  const SOL_TO_LAMPORT = new anchor.BN(1000000000)

  const INITIAL_DEPLOYER_BALANCE = BigInt(1000000000000);
  const INITIAL_ALICE_TOKEN_BALANCE = BigInt(100);

  it("Set up test space!", async () => {
    
    /**
     * Swapper: the contract instance in which we can use to test and interact with the blockchain 
     * 
     * token_mint: The mint address of the MOVE token. 
     * 
     * deployer, deployer_token_wallet: The initializer of the contract (The escrow contract token - not added yet). The deployer will get some token to provide liquidity for the swapping 
     * alice - alice_token_wallet: Alice wallet is created, and she will get  Alice will swap MOVE for SOL (optional - This is not required)
     * bob - bob_token_wallet: Bob and his ata token account will be created, but he gets no MOVE token initially
     */
    

    token_mint = await createMintToken(provider, MOVE_DECIMAL);
    [deployer, deployer_token_wallet] = await createUserAndAssociatedWallet(provider,token_mint,true, INITIAL_DEPLOYER_BALANCE); 
    [alice, alice_token_wallet] = await createUserAndAssociatedWallet(provider,token_mint,true, INITIAL_ALICE_TOKEN_BALANCE);
    [bob, bob_token_wallet] = await createUserAndAssociatedWallet(provider,token_mint,false); 

    swapper = new Swapper(CONTROLLER_ID, token_mint, provider, deployer); // for my bot, need to add the provider and the deployer inorder to use localnet
  });


  it("Inititalize", async()=>{
    await swapper.initialize(deployer, CONTROLLER_ID, MOVE_PRICE, MOVE_DECIMAL);
  })


  it("Swap", async()=>{ 
    const controllerPDA = await swapper.getControllerPDA();
    let controllerInfo = await swapper.provider.connection.getAccountInfo(controllerPDA.key);
    let preSwapControllerBalance = controllerInfo.lamports;
   
    let escrowPDA = await swapper.getEscrowPDA();
    await transferToken(swapper.provider, deployer_token_wallet, escrowPDA.key, deployer, 10000000000);


    let swapAmount = new anchor.BN(1000000000);
    await swapper.swap(bob, bob_token_wallet, swapAmount);

    controllerInfo = await swapper.provider.connection.getAccountInfo(controllerPDA.key);
    let postSwapControllerBalance = controllerInfo.lamports;
    
    assert.ok(postSwapControllerBalance - preSwapControllerBalance == swapAmount.toNumber(), "Controller Balance should increase by an swap amount");
    let bobMoveBalance = await getSplBalance(swapper.provider, bob_token_wallet);
    let expectedBobReceiveBalance = swapAmount.mul(MOVE_PRICE[0]).mul(new anchor.BN(10).pow(new anchor.BN(MOVE_DECIMAL + 1))).div(MOVE_PRICE[0]).div(SOL_TO_LAMPORT)
    assert.ok(expectedBobReceiveBalance.toNumber() == Number(bobMoveBalance), "Bob receive an incorect amount");
    // ASSERTION
    /**
     * Controller SOL balance should increase by: 1 SOL (10^9 lamports)
     * Bob token wallet balance should increase by: 10 MOVE (10 * 10^MOVE_DECIMAL) 
     */

  
  })  

  it("Withdraw SOL from the smart contract", async()=>{
    await swapper.withdrawSol(deployer)

    let deployerAccountInfo = await swapper.provider.connection.getAccountInfo(deployer.publicKey);
    console.log(deployerAccountInfo);
  })  

  it("Withdraw MOVE token from the smart contract", async()=>{
    let escrowPDA = await swapper.getEscrowPDA();
    // Check escrow balacne 
    let escrowBalance = await getSplBalance(swapper.provider, escrowPDA.key);
    console.log(escrowBalance)

    let deployerBalance = await getSplBalance(swapper.provider, deployer_token_wallet);
    console.log(deployerBalance)
    let tx = await swapper.withdrawEscrow(deployer, deployer_token_wallet)

    let escrowBalance2 = await getSplBalance(swapper.provider, escrowPDA.key);
    
    console.log(escrowBalance2)
    deployerBalance = await getSplBalance(swapper.provider, deployer_token_wallet);
    console.log(deployerBalance)

  })  
});
