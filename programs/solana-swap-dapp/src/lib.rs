use anchor_lang::prelude::*;

declare_id!("J1KNgjD2T5M1wzi9fqJhBCmcLV8yp1r86AnarpZvySST");

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

pub const CONTROLLER_PDA_SEED: &[u8] = b"controller";
pub const ESCROW_PDA_SEED: &[u8] = b"escrow";
pub const MAX_STRING_LEN: usize = 50;
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

    pub fn swap(ctx: Context<Swap>, swap_amount: u64) -> Result<()> {
        instructions::swap::swap(ctx, swap_amount)
    }

    pub fn withdraw_sol(ctx: Context<WithdrawSol>) -> Result<()> {
        instructions::withdraw_sol::withdraw_sol(ctx)
    }

    pub fn withdraw_escrow(ctx: Context<WithdrawEscrow>) -> Result<()> {
        instructions::withdraw_escrow::withdraw_escrow(ctx)
    }
}

