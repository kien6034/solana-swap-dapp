use anchor_lang::{prelude::*, system_program::Transfer};
use crate::{state::Controller, CONTROLLER_PDA_SEED};
use anchor_lang::system_program;

use anchor_spl::token::{ TokenAccount};

//use crate::errors::WithdrawSolError;

pub fn withdraw_sol(
    ctx: Context<WithdrawSol>,
    
)-> Result<()> {
    let controller = &mut ctx.accounts.controller;
    let initializer = &ctx.accounts.initializer;
    
    let withdraw_amount = controller.sol_received - controller.sol_claimed;

    // let bump_vector = controller.bump.to_le_bytes();
    // let inner = vec![
    //     CONTROLLER_PDA_SEED,
    //     controller.id.as_ref(),
    //     controller.token_mint.as_ref(),
    //     bump_vector.as_ref()
    // ];
    // let outer = vec![inner.as_slice()];
    
    // let cpi_context = CpiContext::new_with_signer(
    //     ctx.accounts.system_program.to_account_info(), 
    //     system_program::Transfer {
    //         from: controller.to_account_info(),
    //         to: initializer.to_account_info(),
    //     },
    //     outer.as_slice()
    // );

    // system_program::transfer(cpi_context, withdraw_amount)?;

    **controller.to_account_info().try_borrow_mut_lamports()? -= withdraw_amount;
    **initializer.try_borrow_mut_lamports()? += withdraw_amount;

    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawSol<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,

    #[account(
       mut, 
       has_one = initializer
    )]
    pub controller: Account<'info, Controller>,    
    pub system_program: Program<'info, System>,
}