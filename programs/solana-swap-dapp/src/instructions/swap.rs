use anchor_lang::prelude::*;
use anchor_lang::system_program;

// SIMPLE function to swap SOL using the contract

pub fn swap(
    ctx: Context<Swap>,
    
)-> Result<()> {
    let user = &mut ctx.accounts.user;
    let receiver = &mut ctx.accounts.receiver;

    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(), 
        system_program::Transfer {
            from: user.to_account_info(),
            to: receiver.to_account_info(),
        });
    system_program::transfer(cpi_context, 100000000000)?;
    Ok(())
}


#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub receiver: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}