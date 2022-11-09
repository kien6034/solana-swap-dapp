import { Swapper } from "../bot/swapper";
import * as anchor from "@project-serum/anchor";

import {env} from "../data";


const CONTROLLER_ID= "1";
const MOVE_DECIMAL = 6;
const MOVE_PRICE = [new anchor.BN(10), new anchor.BN(1)]; // 1 move = 0.1 SOL


const  main= async()=>{
    const internal_id = env.internal_id;
    const swap_token = new anchor.web3.PublicKey(env.swap_token);
    const swapper = new Swapper(env.internal_id, swap_token);
    
    await swapper.initialize(swapper.deployer, internal_id, MOVE_PRICE, MOVE_DECIMAL);
}
  
  main().catch(error => console.log(error));