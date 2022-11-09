import * as anchor from "@project-serum/anchor";
import { AnchorError, Program } from "@project-serum/anchor";
import * as spl from '@solana/spl-token';
import { DataV2, createCreateMetadataAccountV2Instruction } from '@metaplex-foundation/mpl-token-metadata';
import { findMetadataPda } from "@metaplex-foundation/js";


export const createMintToken = async (provider: anchor.AnchorProvider, decimal: number): Promise<anchor.web3.PublicKey> => {
    const tokenMint = new anchor.web3.Keypair();
    const lamportsForMint = await provider.connection.getMinimumBalanceForRentExemption(spl.MintLayout.span);
    let tx = new anchor.web3.Transaction();

    // Allocate mint
    tx.add(
        anchor.web3.SystemProgram.createAccount({
            programId: spl.TOKEN_PROGRAM_ID,
            space: spl.MintLayout.span,
            fromPubkey: provider.wallet.publicKey,
            newAccountPubkey: tokenMint.publicKey,
            lamports: lamportsForMint,
        })
    )
    // Allocate wallet account
    tx.add(
      spl.createInitializeMintInstruction(
        tokenMint.publicKey,
        decimal,
        provider.wallet.publicKey,
        provider.wallet.publicKey
      )
    );
    const signature = await provider.sendAndConfirm(tx, [tokenMint]);

    return tokenMint.publicKey;
  }


export const getAtaAccount = async(mint: anchor.web3.PublicKey, wallet: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey> =>{
    let userAssociatedTokenAccount = await spl.getAssociatedTokenAddress(
        mint,
        wallet
    )
    return userAssociatedTokenAccount
}


export const createAtaAccount = async(provider: anchor.AnchorProvider, fee_payer:anchor.web3.Keypair, mint: anchor.web3.PublicKey, user: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey> => {
     // Create a token account for the user and mint some tokens
    const userAssociatedTokenAccount = await spl.getAssociatedTokenAddress(
      mint,
      user
    )

    const txFundTokenAccount = new anchor.web3.Transaction();
    txFundTokenAccount.add(spl.createAssociatedTokenAccountInstruction(
      fee_payer.publicKey,
      userAssociatedTokenAccount,
      user,
      mint
    ))

    const txFundTokenSig = await provider.sendAndConfirm(txFundTokenAccount, [fee_payer]);

    return userAssociatedTokenAccount
}

/// This function faucets 5 SOL for each new created account, and determine if either createAsssociated Wallet and mint token to that ATA account of the mint Account
export const createUserAndAssociatedWallet = async (provider: anchor.AnchorProvider, mint: anchor.web3.PublicKey, createAta: boolean, amount?: bigint ): Promise<[anchor.web3.Keypair, anchor.web3.PublicKey | undefined]> => {
    const user = new anchor.web3.Keypair();
    let userAssociatedTokenAccount: anchor.web3.PublicKey | undefined = undefined;

    // Fund user with some SOL
    let txFund = new anchor.web3.Transaction();
    txFund.add(anchor.web3.SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: user.publicKey,
        lamports: 5 * anchor.web3.LAMPORTS_PER_SOL,
    }));
    const sigTxFund = await provider.sendAndConfirm(txFund);

    if (mint) {
        // Create a token account for the user and mint some tokens
        userAssociatedTokenAccount = await spl.getAssociatedTokenAddress(
            mint,
            user.publicKey
        )
          
        if (!amount && createAta == false){
          //pass 
        }  
        else{
          const txFundTokenAccount = new anchor.web3.Transaction();
        if (createAta){
          txFundTokenAccount.add(spl.createAssociatedTokenAccountInstruction(
            user.publicKey,
            userAssociatedTokenAccount,
            user.publicKey,
            mint
          
        ))
        }
        

        if (amount){
          txFundTokenAccount.add(spl.createMintToInstruction(
            mint,
            userAssociatedTokenAccount,
            provider.wallet.publicKey,
            amount
        ));
        }

        
        const payer = anchor.web3.Keypair.generate();

        // Airdropping tokens to a payer.
        await provider.connection.confirmTransaction(
          await provider.connection.requestAirdrop(payer.publicKey, 1000000000),
          "processed"
        );
        
        
        const txFundTokenSig = await provider.sendAndConfirm(txFundTokenAccount, [user]);

        let data = await spl.getAccount(provider.connection, userAssociatedTokenAccount);
        }

        
    }
    return [user, userAssociatedTokenAccount];
}  

export const createAssociatedWalletAndMint = async(provider: anchor.AnchorProvider,wallet: anchor.web3.Keypair, mint: anchor.web3.PublicKey, amount: bigint) =>{ 
  const txFundTokenAccount = new anchor.web3.Transaction();

    const userAssociatedTokenAccount = await spl.getAssociatedTokenAddress(
      mint,
      wallet.publicKey
    )

    txFundTokenAccount.add(spl.createAssociatedTokenAccountInstruction(
      wallet.publicKey,
      userAssociatedTokenAccount,
      wallet.publicKey,
      mint
      // spl.ASSOCIATED_TOKEN_PROGRAM_ID,
      // spl.TOKEN_PROGRAM_ID,
      // mint,
      // userAssociatedTokenAccount,
      // user.publicKey,
      // user.publicKey,
  ))
    txFundTokenAccount.add(spl.createMintToInstruction(
      mint,
      userAssociatedTokenAccount,
      provider.wallet.publicKey,
      amount
    ))

    const txFundTokenSig = await provider.sendAndConfirm(txFundTokenAccount, [wallet]);
    console.log(txFundTokenSig);
}

export const createTokenMetadata = async(provider: anchor.AnchorProvider, wallet: anchor.web3.Keypair, mint: anchor.web3.PublicKey, tokenMetaData: DataV2)=>{
  const metadataPDA = await findMetadataPda(mint);

  const txFundTokenAccount = new anchor.web3.Transaction();

  txFundTokenAccount.add(
    createCreateMetadataAccountV2Instruction({
      metadata: metadataPDA,
      mint: mint, 
      mintAuthority: wallet.publicKey,
      payer: wallet.publicKey,
      updateAuthority: wallet.publicKey
    },{
      createMetadataAccountArgsV2:{
        data: tokenMetaData,
        isMutable: true
      }
    })
  )
  const txFundTokenSig = await provider.sendAndConfirm(txFundTokenAccount, [wallet]);
  console.log(txFundTokenSig);
}

export const transferToken = async(provider: anchor.AnchorProvider, source: anchor.web3.PublicKey, destination: anchor.web3.PublicKey, owner: anchor.web3.Keypair, amount: number)=>{
  const txTransfer = new anchor.web3.Transaction;

  txTransfer.add(spl.createTransferInstruction(
    source,
    destination,
    owner.publicKey,
    amount
  ));
  await provider.sendAndConfirm(txTransfer, [owner]);
}

export const approveToken = async(provider: anchor.AnchorProvider, account: anchor.web3.PublicKey, delegate: anchor.web3.PublicKey, owner: anchor.web3.Keypair, amount: bigint)=>{
  const txTransfer = new anchor.web3.Transaction;

  txTransfer.add(spl.createApproveInstruction(
    account, 
    delegate, 
    owner.publicKey, 
    amount
  ));
  await provider.sendAndConfirm(txTransfer, [owner]);
}

export const getSplAccountInfo = async(provider: anchor.AnchorProvider, tokenAccount: anchor.web3.PublicKey) =>{
  return await spl.getAccount(provider.connection, tokenAccount)
}

export const getSplBalance = async(provider: anchor.AnchorProvider, tokenAccount: anchor.web3.PublicKey) =>{
  const accountInfo = await spl.getAccount(provider.connection, tokenAccount);
  return accountInfo.amount;
}