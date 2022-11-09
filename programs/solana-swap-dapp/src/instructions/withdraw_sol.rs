use anchor_lang::{prelude::*};
use crate::{state::Controller};


pub fn withdraw_sol(
    ctx: Context<WithdrawSol>,
    
)-> Result<()> {
    let controller = &mut ctx.accounts.controller;
    let initializer = &ctx.accounts.initializer;
    
    let withdraw_amount = controller.sol_received - controller.sol_claimed;

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