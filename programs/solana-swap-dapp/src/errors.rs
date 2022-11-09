use anchor_lang::error_code;

#[error_code]
pub enum ControllerError {
    InvalidPrice,
    InvalidID
}

#[error_code]
pub enum SwapError {
    InsufficientFund
}


#[error_code]
pub enum WithdrawSolError {
    InvalidPrice
}
