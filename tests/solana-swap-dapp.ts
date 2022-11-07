import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Swapper } from "../scripts/bot/swapper";
import { createMintToken, createUserAndAssociatedWallet, getAccountInfo } from "../scripts/utils/token";
import { SolanaSwapDapp } from "../target/types/solana_swap_dapp";

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
    

    token_mint = await createMintToken(provider);
    [deployer, deployer_token_wallet] = await createUserAndAssociatedWallet(provider,token_mint,true, BigInt(100000000)); 
    [alice, alice_token_wallet] = await createUserAndAssociatedWallet(provider,token_mint,true, BigInt(10000000));
    [bob, bob_token_wallet] = await createUserAndAssociatedWallet(provider,token_mint,false); 

    swapper = new Swapper(provider, deployer); // for my bot, need to add the provider and the deployer inorder to use localnet
  });


  it("Transfer SOL via the smart contract", async()=>{
   
    await swapper.swap(alice, bob.publicKey);

    let aliceAccountinfo = await swapper.provider.connection.getAccountInfo(alice.publicKey);
    console.log(aliceAccountinfo)


    let bobAccountInfo = await swapper.provider.connection.getAccountInfo(bob.publicKey);
    console.log(bobAccountInfo)
  })  
});
