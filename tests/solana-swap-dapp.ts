import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Swapper } from "../scripts/bot/swapper";
import { createMintToken, createUserAndAssociatedWallet, getSplBalance, transferToken } from "../scripts/utils/token";
import { SolanaSwapDapp } from "../target/types/solana_swap_dapp";
import * as assert from "assert";

const CONTROLLER_ID= "1";
const MOVE_DECIMAL = 6;
const MOVE_PRICE = [new anchor.BN(10), new anchor.BN(1)]; // 1 move = 0.1 SOL
const swapAmount = new anchor.BN(1000000000); // Bob is going to swap 1 SOL for 10 MOVE
let expectedReceiveAmount= null; // Expected amount that Bob is going to receive
const depositAmount = 10000000; // Amount that alice use to deposit to the escrow (add liquidity)

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
  const INITIAL_ALICE_TOKEN_BALANCE = BigInt(10000000000);

  it("Set up test space!", async () => {
    
    /**
     * Swapper: the contract instance in which we can use to test and interact with the blockchain 
     * 
     * token_mint: The mint address of the MOVE token. 
     * 
     * deployer, deployer_token_wallet: The initializer of the contract (The escrow contract token - not added yet). The initializer can withdraw SOL and MOVE token from the program (controller & escrow)
     * alice - alice_token_wallet: Alice wallet is created, and she will get some MOVE tokens.  Alice will be the one who provide liquidity by putting MOVE token in to the escrow
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

    let controllerPDA = await swapper.getControllerPDA();
    let escrowPDA = await swapper.getEscrowPDA();

    let controllerInfo =  await swapper.provider.connection.getAccountInfo(controllerPDA.key);
    let escrowInfo =  await swapper.provider.connection.getAccountInfo(controllerPDA.key);

    assert.ok(controllerInfo.lamports > 0, "Controller has not been created");
    assert.ok(escrowInfo.lamports > 0, "Escrow has not been created");
  })


  it("Swap", async()=>{ 
    const controllerPDA = await swapper.getControllerPDA();
    let controllerInfo = await swapper.provider.connection.getAccountInfo(controllerPDA.key);
    let preSwapControllerBalance = controllerInfo.lamports;
    
    let bobInfo = await swapper.provider.connection.getAccountInfo(bob.publicKey);
    let preSwapBobBalance = bobInfo.lamports;

    let escrowPDA = await swapper.getEscrowPDA(); 
    await transferToken(swapper.provider, alice_token_wallet, escrowPDA.key, alice, depositAmount);

    // Bob swap
    await swapper.swap(bob, bob_token_wallet, swapAmount);

    controllerInfo = await swapper.provider.connection.getAccountInfo(controllerPDA.key);
    let postSwapControllerBalance = controllerInfo.lamports;

    bobInfo = await swapper.provider.connection.getAccountInfo(bob.publicKey);
    let postSwapBobBalance = bobInfo.lamports;

     // ASSERTION
    /**
     * Controller SOL balance should increase by: 1 SOL (10^9 lamports)
     * Bob token wallet balance should increase by: 10 MOVE (10 * 10^MOVE_DECIMAL) 
     */
    assert.ok(preSwapBobBalance - postSwapBobBalance >= swapAmount.toNumber(), "Bob balance should be deducted by an amount greater than 1 SOL"); // bob pay some lamports for gas fee 
    assert.ok(postSwapControllerBalance - preSwapControllerBalance == swapAmount.toNumber(), "Controller Balance should increase by an swap amount");
    let bobMoveBalance = await getSplBalance(swapper.provider, bob_token_wallet);
    expectedReceiveAmount = swapAmount.mul(MOVE_PRICE[0]).mul(new anchor.BN(10).pow(new anchor.BN(MOVE_DECIMAL + 1))).div(MOVE_PRICE[0]).div(SOL_TO_LAMPORT)
    assert.ok(expectedReceiveAmount.toNumber() == Number(bobMoveBalance), "Bob receive an incorect amount");
   

  
  })  

  it("Alice cannot withdraw SOL", async()=> {
    try {
      await swapper.withdrawSol(alice)
    }
    catch (error) {
      assert.equal(error.error.errorMessage, 'A has one constraint was violated', "wrong error msg");
      return;
    }
    assert.fail("The instruction should fail since alice is not the initializer");
  })

  it("Deployer can withdraw SOL", async()=> {
    const controllerPDA = await swapper.getControllerPDA();
    let controllerInfo = await swapper.provider.connection.getAccountInfo(controllerPDA.key);
    let preSwapControllerBalance = controllerInfo.lamports;
    
    let deployerInfo = await swapper.provider.connection.getAccountInfo(deployer.publicKey);
    let preSwapDeployerBalance = deployerInfo.lamports;

    //Deployer withdraw SOL
    await swapper.withdrawSol(deployer);

    controllerInfo = await swapper.provider.connection.getAccountInfo(controllerPDA.key);
    let postSwapControllerBalance = controllerInfo.lamports;
    
    deployerInfo = await swapper.provider.connection.getAccountInfo(deployer.publicKey);
    let postSwapDeployerBalance = deployerInfo.lamports;
  
    assert.ok(preSwapControllerBalance - postSwapControllerBalance== swapAmount.toNumber(), "The SOL balance in the controller should get deducted");
    assert.ok(postSwapDeployerBalance - preSwapDeployerBalance >= (swapAmount.toNumber() - 100000), "The SOL balance in the deployer should get increase"); // minus some tx fee
  })

  it("Alice cannot withdraw MOVE", async()=> {
    try {
      await swapper.withdrawEscrow(alice, alice_token_wallet)
    }
    catch (error) {
      assert.equal(error.error.errorMessage, 'A has one constraint was violated', "wrong error msg");
      return;
    }
    assert.fail("The instruction should fail since alice is not the initializer");
  })

  it("Deployer can withdraw MOVE", async()=>{
    let escrowPDA = await swapper.getEscrowPDA();
    // Check escrow balacne 
    let preEscrowBalance = await getSplBalance(swapper.provider, escrowPDA.key);

    let preDeployerBalance = await getSplBalance(swapper.provider, deployer_token_wallet);
    await swapper.withdrawEscrow(deployer, deployer_token_wallet)

    let postEscrowBalance = await getSplBalance(swapper.provider, escrowPDA.key);
    let postDeployerBalance = await getSplBalance(swapper.provider, deployer_token_wallet);

    assert.ok(preEscrowBalance - postEscrowBalance == BigInt(depositAmount- expectedReceiveAmount), "Escrow balance should get deducted ");
    assert.ok(postDeployerBalance - preDeployerBalance == BigInt(depositAmount- expectedReceiveAmount), "Deployer balance should get increased");
  })  
});
