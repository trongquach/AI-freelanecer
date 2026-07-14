-- Fix any existing negative balances before applying constraints
UPDATE escrow_accounts 
SET balance = 0 
WHERE balance < 0;

UPDATE escrow_accounts 
SET locked_amount = 0 
WHERE locked_amount < 0;

UPDATE escrow_accounts 
SET balance = locked_amount 
WHERE balance < locked_amount;

-- Add check constraints to enforce wallet integrity at the database level
ALTER TABLE escrow_accounts 
ADD CONSTRAINT chk_balance_positive CHECK (balance >= 0),
ADD CONSTRAINT chk_locked_positive CHECK (locked_amount >= 0),
ADD CONSTRAINT chk_balance_ge_locked CHECK (balance >= locked_amount);
