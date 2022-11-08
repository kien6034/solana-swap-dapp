import * as anchor from "@project-serum/anchor";
import { Program, splitArgsAndCtx } from "@project-serum/anchor";
import { Swapper } from "../scripts/bot/swapper";
import { createMintToken, createUserAndAssociatedWallet, getSplAccountInfo, getSplBalance, transferToken } from "../scripts/utils/token";
import { SolanaSwapDapp } from "../target/types/solana_swap_dapp";

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

  const SOL_PER_LAMPORT = 0.000000001; // For quick development, temporaly use normal number (i confident that there will be no overflow)

  const INITIAL_DEPLOYER_BALANCE = BigInt(100000000);
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
    [deployer, deployer_token_wallet] = await createUserAndAssociatedWallet(provider,token_mint,true, BigInt(100000000)); 
    [alice, alice_token_wallet] = await createUserAndAssociatedWallet(provider,token_mint,true, BigInt(10000000));
    [bob, bob_token_wallet] = await createUserAndAssociatedWallet(provider,token_mint,false); 

    swapper = new Swapper(CONTROLLER_ID, token_mint, provider, deployer); // for my bot, need to add the provider and the deployer inorder to use localnet
  });


  it("Inititalize", async()=>{
    await swapper.initialize(deployer, CONTROLLER_ID, MOVE_PRICE, MOVE_DECIMAL);
  })


  it("Transfer SOL to the smart contract", async()=>{
    
    let controllerPDA = await swapper.getControllerPDA();
    await swapper.swap(alice, bob.publicKey);

    let aliceAccountinfo = await swapper.provider.connection.getAccountInfo(alice.publicKey);
    console.log(aliceAccountinfo)


    let controllerAccountInfo = await swapper.provider.connection.getAccountInfo(controllerPDA.key);
    console.log(controllerAccountInfo)
  })  

  it("Withdraw SOL from the smart contract", async()=>{
    await swapper.withdrawSol(deployer)

    let deployerAccountInfo = await swapper.provider.connection.getAccountInfo(deployer.publicKey);
    console.log(deployerAccountInfo);
  })  

  it("Withdraw MOVE token from the smart contract", async()=>{
    let escrowPDA = await swapper.getEscrowPDA();

    await transferToken(swapper.provider, alice_token_wallet, escrowPDA.key, alice, 1000000);

    // Check escrow balacne 
    let escrowBalance = await getSplBalance(swapper.provider, escrowPDA.key);
    console.log(escrowBalance)
    await swapper.withdrawEscrow(deployer, deployer_token_wallet)

    escrowBalance = await getSplBalance(swapper.provider, escrowPDA.key);
    console.log(escrowBalance)
  })  
});
