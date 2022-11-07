use anchor_lang::prelude::*;

#[account]
pub struct Controller{
    pub initializer: Pubkey,
    pub id: String,
    pub bump: u8,
    pub token_mint: Pubkey,
    pub token_decimal: u8,
    pub token_price: Vec<u64>, // Price, denominator: 1 SOL = token_price[0]/ token_price[1]
    
}


impl Controller{ 
    //TODO: correct this 
    pub const LEN: usize = 200; 
}