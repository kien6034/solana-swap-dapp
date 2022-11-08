use anchor_lang::error_code;

#[error_code]
pub enum ControllerError {
    InvalidPrice
}



#[error_code]
pub enum WithdrawSolError {
    InvalidPrice
}
