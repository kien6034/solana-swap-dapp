use anchor_lang::prelude::*;
use crate::{state::Controller};
use anchor_spl::token::{ Mint, TokenAccount};

use crate::{CONTROLLER_PDA_SEED,ESCROW_PDA_SEED};
use crate::errors::ControllerError;
use std::str;

/// Initialize functions will init a controller to control the swapper, and also create an escrow to hold MOVE token under the controller's authority
pub fn initialize(
    ctx: Context<Initialize>,
    id: String,
    token_price: Vec<u64>,
    token_decimal: u8
)-> Result<()> {
    require!(token_price.len() == 2, ControllerError::InvalidPrice);

    let controller = &mut ctx.accounts.controller;
    let initializer = &ctx.accounts.initializer;

    controller.initializer = initializer.key();
    controller.id = id.clone();
    controller.token_price = token_price;
    controller.token_decimal = token_decimal;
    controller.sol_received = 0;
    controller.sol_claimed = 0;
    controller.bump = *ctx.bumps.get(str::from_utf8(CONTROLLER_PDA_SEED).unwrap()).unwrap();

    
    msg!("action: initialize");
    // TODO: add more logs here
    Ok(())
}

#[derive(Accounts)]
#[instruction(id: String)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub token_mint: Account<'info, Mint>,

    #[account(
        init,
        payer=initializer, 
        space = Controller::LEN,
        seeds = [CONTROLLER_PDA_SEED.as_ref(), token_mint.key().as_ref() ,id.as_ref()],
        bump
    )]
    pub controller: Account<'info, Controller>,

    #[account(
        init, 
        payer=initializer,
        seeds=[ESCROW_PDA_SEED.as_ref(), token_mint.key().as_ref(), id.as_ref()],
        bump,
        token::mint=token_mint,
        token::authority=controller,
    )]
    pub escrow: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: This is not dangerous 
    pub token_program: AccountInfo<'info>
}