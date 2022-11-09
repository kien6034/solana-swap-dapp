import { Swapper } from "../bot/swapper";
import * as anchor from "@project-serum/anchor";

import {env} from "../data";
import { getAtaAccount, transferToken } from "../utils/token";

const main= async()=>{
    const swap_token = new anchor.web3.PublicKey(env.swap_token);
    const swapper = new Swapper(env.internal_id, swap_token);
 
    let deployerATA = await getAtaAccount(swap_token, swapper.deployer.publicKey);
    await swapper.withdrawEscrow(swapper.deployer, deployerATA);
}
  
main().catch(error => console.log(error));