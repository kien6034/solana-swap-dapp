import * as solana from "@solana/web3.js";
import { ConfirmOptions } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import * as fs from "fs";

const rpc = solana.clusterApiUrl("devnet");
const options: ConfirmOptions = {
    preflightCommitment: 'processed'
}
export const getProvider = (deployer: solana.Keypair) => {
    const connection = new solana.Connection(rpc);
    
    const provider = new anchor.AnchorProvider( 
        connection,
        new anchor.Wallet(deployer),
        options
    )

    return provider
}


export const  getDeployer = () => {
    try {
        const rawData = fs.readFileSync("scripts/secret.json", 'utf8');
        let private_key = Uint8Array.from(JSON.parse(rawData)["private_key"]); 
        let deployer = solana.Keypair.fromSecretKey(private_key);

        return deployer;
    
        
    } catch {
        console.log("ERROR ********* CAN NOT GET THE PRIVATE KEY ****************")
        process.exit(1);
    }

}