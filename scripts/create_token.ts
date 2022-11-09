import {Bot} from"./bot/bot";
import * as solana from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

import { createAssociatedWalletAndMint, createMintToken, createTokenMetadata } from "./utils/token";
import { formatAmount } from "@metaplex-foundation/js";
import { DataV2 } from "@metaplex-foundation/mpl-token-metadata";

const  main= async()=>{
    const bot = new Bot();
    const mintAmount = BigInt(1000000000000); // 1 mil MOVE token

    let tokenMint = await createMintToken(bot.provider, 6);
    console.log(`Mint successfully: ${tokenMint}`)
    await createAssociatedWalletAndMint(bot.provider, bot.deployer, tokenMint, mintAmount);


    // const tokenMetadata = {
    //   name: "MOVE",
    //   symbol: "MOVE",
    //   uri: "https://zol3sde3elah2lh5vsptgbre7eu6wzwvlhghfuanetm6lu2rkbya.arweave.net/y5e5DJsiwH0s_ayfMwYk-SnrZtVZzHLQDSTZ5dNRUHA",
    //   sellerFeeBasisPoints: 0,
    //   creators: null,
    //   collection: null,
    //   uses: null
    // } as DataV2;
    //await createTokenMetadata(bot.provider, bot.deployer, mint, tokenMetadata);
}
  
main().catch(error => console.log(error));