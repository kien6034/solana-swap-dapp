use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

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

