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


    swap = async(user: anchor.web3.Keypair, receiver: anchor.web3.PublicKey)=> {
        return await this.program.methods.swap().accounts({
            user: user.publicKey,
            receiver: receiver
        }).signers([user]).rpc();
    }

}