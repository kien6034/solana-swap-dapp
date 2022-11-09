use anchor_lang::prelude::*;
const SOL_TO_LAMPORTS: u128 = 1000000000;
use crate::{MAX_STRING_LEN};

#[account]
pub struct Controller{
    pub initializer: Pubkey,
    pub id: String,
    pub bump: u8,
    pub token_mint: Pubkey,
    pub token_decimal: u8,
    pub token_price: Vec<u64>, // Price, denominator: 1 SOL = token_price[0]/ token_price[1]
    pub sol_received: u64,
    pub sol_claimed: u64,
    pub escrow_bump: u8
}

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const MAX_STRING_LENGTH: usize = MAX_STRING_LEN + 4; // 50 bytes + 4 bytes prefix

const U8_SIZE_LENGTH: usize = 1;
const TOKEN_PRICE_LENGTH: usize = 2 * 8 + 4; // 2 elements + 4 bytes prefix
const U64_SIZE_LENGTH: usize = 8;

impl Controller{ 
    pub const LEN: usize = DISCRIMINATOR_LENGTH
        + MAX_STRING_LENGTH
        + U8_SIZE_LENGTH 
        + PUBLIC_KEY_LENGTH 
        + U8_SIZE_LENGTH
        + TOKEN_PRICE_LENGTH
        + U64_SIZE_LENGTH 
        + U64_SIZE_LENGTH
        + U8_SIZE_LENGTH;
    

    pub fn get_amounts_out(&self, lamports_amount: u64) -> u64 {
        let amount_out = 
            lamports_amount as u128 * self.token_price[0] as u128 * 10u128.pow(self.token_decimal as u32) as u128
            / (self.token_price[1] as u128 * SOL_TO_LAMPORTS);

        amount_out as u64
    }
}