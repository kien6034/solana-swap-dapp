import { Swapper } from "../bot/swapper";
import * as anchor from "@project-serum/anchor";

import {env} from "../data";

const main= async()=>{
    const swap_token = new anchor.web3.PublicKey(env.swap_token);
    const swapper = new Swapper(env.internal_id, swap_token);
 
    await swapper.withdrawSol(swapper.deployer);
}
  
main().catch(error => console.log(error));