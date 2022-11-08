use anchor_lang::{prelude::*};
use crate::{state::Controller, CONTROLLER_PDA_SEED};
use anchor_spl::token::{TokenAccount, Transfer};


//use crate::errors::WithdrawSolError;

pub fn withdraw_escrow(
    ctx: Context<WithdrawEscrow>,
    
)-> Result<()> {
    let controller = &mut ctx.accounts.controller;
    let escrow = &ctx.accounts.escrow;
    let initializer_token_acconunt = &ctx.accounts.initiializer_token_account;
    let token_program = &ctx.accounts.token_program;

    //********** Transfer token amount to initializer  ********* */
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
        to: initializer_token_acconunt.to_account_info(),
        authority: controller.to_account_info()
    };
    let cpi_ctx = CpiContext::new_with_signer(
        token_program.to_account_info(),
        transfer_ix,
        outer.as_slice()
    );
    anchor_spl::token::transfer(cpi_ctx, escrow.amount)?;
    
    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawEscrow<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,

    #[account(
       mut, 
       has_one = initializer
    )]
    pub controller: Account<'info, Controller>,  
    
    #[account(mut)]
    pub escrow: Account<'info, TokenAccount>,

    #[account(
        mut
    )]
    pub initiializer_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,

    /// CHECK: This is not dangerous
    pub token_program: AccountInfo<'info>,
}