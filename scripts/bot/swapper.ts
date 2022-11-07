import {Bot} from "./bot";
import * as anchor from "@project-serum/anchor";


const CONTROLLER_PDA_SEED = "controller";
const ESCROW_PDA_SEED = "escrow";


interface PDAParam {
    key: anchor.web3.PublicKey,
    bump: number
}

export class Swapper extends Bot { 
    id: string;

    constructor(
        id: string,
        provider?: anchor.AnchorProvider, 
        deployer?: anchor.web3.Keypair
    ){
        super(provider, deployer);
        this.program = anchor.workspace.SolanaSwapDapp;
        this.id = id;
    }


    getControllerPDA = async(mint: anchor.web3.PublicKey): Promise<PDAParam> => {
        const [pda, bump] = await anchor.web3.PublicKey
        .findProgramAddress(
            [
            anchor.utils.bytes.utf8.encode(CONTROLLER_PDA_SEED),
            mint.toBuffer(),
            anchor.utils.bytes.utf8.encode(this.id)
            ],
            this.program.programId
        );

        return {
            key: pda,
            bump: bump
        }
    }

    getEscrowPDA = async(mint: anchor.web3.PublicKey): Promise<PDAParam> => {
        const [pda, bump] = await anchor.web3.PublicKey
        .findProgramAddress(
            [
            anchor.utils.bytes.utf8.encode(ESCROW_PDA_SEED),
            mint.toBuffer(),
            anchor.utils.bytes.utf8.encode(this.id)
            ],
            this.program.programId
        );

        return {
            key: pda,
            bump: bump
        }
    }

    initialize = async(
        initializer: anchor.web3.Keypair, 
        tokenMint: anchor.web3.PublicKey,
        id: String, 
        token_price: anchor.BN[], 
        token_decimal: number
    )=> {
        let controllerPDA = await this.getControllerPDA(tokenMint);
        let escrowPDA = await this.getEscrowPDA(tokenMint);

        return await this.program.methods.initialize(id, token_price, token_decimal).accounts({
            initializer: initializer.publicKey,
            tokenMint: tokenMint,
            controller: controllerPDA.key,
            escrow: escrowPDA.key
        }).signers([initializer]).rpc();
    }


    swap = async(user: anchor.web3.Keypair, receiver: anchor.web3.PublicKey)=> {
        return await this.program.methods.swap().accounts({
            user: user.publicKey,
            receiver: receiver
        }).signers([user]).rpc();
    }

}