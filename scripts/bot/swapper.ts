import {Bot} from "./bot";
import * as anchor from "@project-serum/anchor";


export class Swapper extends Bot { 
    internalId: string;

    constructor(
        provider?: anchor.AnchorProvider, 
        deployer?: anchor.web3.Keypair
    ){
        super(provider, deployer);
        this.program = anchor.workspace.SolanaSwapDapp;
    }

}