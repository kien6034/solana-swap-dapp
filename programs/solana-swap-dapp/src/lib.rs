use anchor_lang::prelude::*;

declare_id!("6hfMUbmduTkg4vjCUa3TS68xGtT9wmcEc3UrpKNkAVaP");

pub mod errors;
pub mod instructions;


use instructions::*;

#[program]
pub mod solana_swap_dapp {
    use super::*;

    pub fn swap(ctx: Context<Swap>) -> Result<()> {
        instructions::swap::swap(ctx)
    }
}

