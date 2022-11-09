use anchor_lang::prelude::*;
const SOL_TO_LAMPORTS: u128 = 1000000000;

#[account]
pub struct Controller{
    pub initializer: Pubkey,
    pub id: String,
    pub bump: u8,
    pub token_mint: Pubkey,
    pub token_decimal: u8,
    pub token_price: Vec<u64>, // Price, denominator: 1 SOL = token_price[0]/ token_price[1]
    pub sol_received: u64,
    pub sol_claimed: u64
    
}


impl Controller{ 
    //TODO: correct this 
    pub const LEN: usize = 200; 
    

    pub fn get_amounts_out(&self, lamports_amount: u64) -> u64 {
        let amount_out = 
            lamports_amount as u128 * self.token_price[0] as u128 * 10u128.pow(self.token_decimal as u32) as u128
            / (self.token_price[1] as u128 * SOL_TO_LAMPORTS);

        amount_out as u64
    }
}