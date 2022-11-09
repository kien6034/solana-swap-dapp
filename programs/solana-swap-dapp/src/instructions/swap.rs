use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::Transfer;

use crate::CONTROLLER_PDA_SEED;
use crate::ESCROW_PDA_SEED;
use crate::state::Controller;
use anchor_spl::token::{TokenAccount, Mint};
use crate::errors::SwapError;

// SIMPLE function to swap SOL using the contract
pub const ONE_SOL: u64 = 1000000000;

pub fn swap(
    ctx: Context<Swap>,
    swap_amount: u64
)-> Result<()> {
    let user = &mut ctx.accounts.user;
    let controller = &mut ctx.accounts.controller;

    let escrow = &mut ctx.accounts.escrow;
    let user_token_account = &mut ctx.accounts.user_token_account;
    let token_program = &ctx.accounts.token_program;
    
    // Get SOL from the swapper 
    controller.sol_received += swap_amount;
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(), 
        system_program::Transfer {
            from: user.to_account_info(),
            to: controller.to_account_info(),
        });
    system_program::transfer(cpi_context, swap_amount)?;

    // Transfer MOVE token back to the user 
    let amounts_out = controller.get_amounts_out(swap_amount);

    require!(escrow.amount >= amounts_out, SwapError::InsufficientFund);
    let bump_vector = controller.bump.to_le_bytes();

    let inner = vec![
        CONTROLLER_PDA_SEED.as_ref(),
        controller.token_mint.as_ref(),
        controller.id.as_ref(), 
        bump_vector.as_ref()
    ];
    let outer = vec![inner.as_slice()];

    let transfer_ix = Transfer {
        from: escrow.to_account_info(),
        to: user_token_account.to_account_info(),
        authority: controller.to_account_info()
    };

    let cpi_ctx = CpiContext::new_with_signer(
        token_program.to_account_info(),
        transfer_ix,
        outer.as_slice()
    );
    anchor_spl::token::transfer(cpi_ctx, amounts_out)?;
    Ok(())
}


#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [CONTROLLER_PDA_SEED, token_mint.key().as_ref(), controller.id.as_ref()], bump = controller.bump
    )]
    pub controller: Account<'info, Controller>,
    pub token_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,

    #[account(
        mut,
        seeds = [ESCROW_PDA_SEED, token_mint.key().as_ref(), controller.id.as_ref()], bump = controller.escrow_bump
    )]
    pub escrow: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = token_mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: This is not dangerous
    pub token_program: AccountInfo<'info>,

    pub rent: Sysvar<'info, Rent>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub associated_token_program: AccountInfo<'info>,
}