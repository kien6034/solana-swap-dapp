import { Swapper } from "../bot/swapper";
import * as anchor from "@project-serum/anchor";

import {env} from "../data";
import { getAtaAccount, transferToken } from "../utils/token";


const CONTROLLER_ID= "1";
const MOVE_DECIMAL = 6;
const MOVE_PRICE = [new anchor.BN(10), new anchor.BN(1)]; // 1 move = 0.1 SOL


const main= async()=>{
    const swap_token = new anchor.web3.PublicKey(env.swap_token);
    const swapper = new Swapper(env.internal_id, swap_token);
 
    let deployerATA = await getAtaAccount(swap_token, swapper.deployer.publicKey);
    let swapAmount = new anchor.BN(1000000000); // 1 SOL -> get 10 MOVE
    await swapper.swap(swapper.deployer, deployerATA, swapAmount);
}
  
main().catch(error => console.log(error));