use anchor_lang::prelude::*;

declare_id!("6hfMUbmduTkg4vjCUa3TS68xGtT9wmcEc3UrpKNkAVaP");

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

pub const CONTROLLER_PDA_SEED: &[u8] = b"controller";
pub const ESCROW_PDA_SEED: &[u8] = b"escrow";

#[program]
pub mod solana_swap_dapp {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>, 
        id: String,
        token_price: Vec<u64>,
        token_decimal: u8
    ) -> Result<()> {
        instructions::initialize::initialize(ctx, id, token_price, token_decimal)
    }

    pub fn swap(ctx: Context<Swap>) -> Result<()> {
        instructions::swap::swap(ctx)
    }
}

