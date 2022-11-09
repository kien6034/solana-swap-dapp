import {getDeployer, getProvider} from "../utils/provider";
import * as solana from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";

export class Bot {
    deployer: solana.Keypair;
    provider: anchor.AnchorProvider;
    program: anchor.Program;

    constructor( provider?: anchor.AnchorProvider, deployer?: anchor.web3.Keypair){
      //local net  
      if (provider){
        this.provider = provider;

        if (!deployer){
          console.log("----------- Require custom deployer for testing -----------");
          process.exit(1);
        }
        this.deployer= deployer;
      }
      
      //devnet or mainnet
      else{
        this.deployer = getDeployer();
        this.provider = getProvider(this.deployer);
      }
      
      anchor.setProvider(this.provider);    
    }
}