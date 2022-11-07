use anchor_lang::prelude::*;


pub fn swap(
    ctx: Context<Swap>,
    
)-> Result<()> {
  
    Ok(())
}


#[derive(Accounts)]
#[instruction(internal_id: String)]
pub struct Swap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
  
}