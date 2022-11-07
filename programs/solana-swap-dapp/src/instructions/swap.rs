use anchor_lang::prelude::*;
use anchor_lang::system_program;

// SIMPLE function to swap SOL using the contract

pub const ONE_SOL: u64 = 1000000000;

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
    system_program::transfer(cpi_context, ONE_SOL)?;
    Ok(())
}


#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: This is not dangerous
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}