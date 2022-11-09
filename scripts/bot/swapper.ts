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
    tokenMint: anchor.web3.PublicKey;

    constructor(
        id: string,
        tokenMint: anchor.web3.PublicKey,
        provider?: anchor.AnchorProvider, 
        deployer?: anchor.web3.Keypair
    ){
        super(provider, deployer);
        this.program = anchor.workspace.SolanaSwapDapp;
        this.id = id;
        this.tokenMint = tokenMint
    }


    getControllerPDA = async(): Promise<PDAParam> => {
        const [pda, bump] = await anchor.web3.PublicKey
        .findProgramAddress(
            [
            anchor.utils.bytes.utf8.encode(CONTROLLER_PDA_SEED),
            this.tokenMint.toBuffer(),
            anchor.utils.bytes.utf8.encode(this.id)
            ],
            this.program.programId
        );

        return {
            key: pda,
            bump: bump
        }
    }

    getEscrowPDA = async(): Promise<PDAParam> => {
        const [pda, bump] = await anchor.web3.PublicKey
        .findProgramAddress(
            [
            anchor.utils.bytes.utf8.encode(ESCROW_PDA_SEED),
            this.tokenMint.toBuffer(),
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
        id: String, 
        token_price: anchor.BN[], 
        token_decimal: number
    )=> {
        let controllerPDA = await this.getControllerPDA();
        let escrowPDA = await this.getEscrowPDA();

        return await this.program.methods.initialize(id, token_price, token_decimal).accounts({
            initializer: initializer.publicKey,
            tokenMint: this.tokenMint,
            controller: controllerPDA.key,
            escrow: escrowPDA.key
        }).signers([initializer]).rpc();
    }


    swap = async(user: anchor.web3.Keypair, userTokenAccount: anchor.web3.PublicKey, amount: anchor.BN)=> {
        let controllerPDA = await this.getControllerPDA();
        let escrowPDA = await this.getEscrowPDA();

        return await this.program.methods.swap(amount).accounts({
            user: user.publicKey,
            controller: controllerPDA.key,
            tokenMint: this.tokenMint, 
            escrow: escrowPDA.key, 
            userTokenAccount: userTokenAccount
        }).signers([user]).rpc();
    }

    withdrawSol = async(initializer: anchor.web3.Keypair)=> {
        let controllerPDA = await this.getControllerPDA();

        return await this.program.methods.withdrawSol().accounts({
            initializer: initializer.publicKey,
            controller: controllerPDA.key
        }).signers([initializer]).rpc();
    }

    withdrawEscrow = async(initializer: anchor.web3.Keypair, initializer_token_account: anchor.web3.PublicKey) => {
        let controllerPDA = await this.getControllerPDA();
        let escrowPDA = await this.getEscrowPDA();

        return await this.program.methods.withdrawEscrow().accounts({
            initializer: initializer.publicKey,
            controller: controllerPDA.key,
            escrow: escrowPDA.key,
            initializerTokenAccount: initializer_token_account
        }).signers([initializer]).rpc();
    }

}