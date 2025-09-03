'use client';

import { useState, useEffect } from 'react';

export function TipInput({ onChange, value, className = '' }) {
  const [amount, setAmount] = useState(value || '');
  const [fee, setFee] = useState(0);
  const [total, setTotal] = useState(0);

  // Calculate fee (0.1% capped at $1)
  useEffect(() => {
    if (!amount || isNaN(parseFloat(amount))) {
      setFee(0);
      setTotal(0);
      return;
    }
    
    const amountValue = parseFloat(amount);
    const feeValue = Math.min(amountValue * 0.001, 1); // 0.1% capped at $1
    
    setFee(feeValue);
    setTotal(amountValue + feeValue);
  }, [amount]);

  const handleChange = (e) => {
    const newAmount = e.target.value;
    // Validate input (positive numbers only, with up to 6 decimal places)
    if (newAmount === '' || (/^\d*\.?\d{0,6}$/.test(newAmount) && parseFloat(newAmount) >= 0)) {
      setAmount(newAmount);
      onChange(newAmount);
    }
  };

  return (
    <div className={`${className}`}>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={handleChange}
          placeholder="Enter amount in USDC"
          className="w-full p-md pl-16 border border-text-secondary rounded-md focus:shadow-focus outline-none"
        />
        <div className="absolute inset-y-0 left-0 flex items-center px-md text-text-secondary font-medium">
          USDC
        </div>
      </div>
      
      {amount && !isNaN(parseFloat(amount)) && (
        <div className="mt-sm text-sm text-text-secondary">
          <div className="flex justify-between">
            <span>Service Fee (0.1%, max $1):</span>
            <span>{fee.toFixed(6)} USDC</span>
          </div>
          <div className="flex justify-between font-medium mt-xs">
            <span>Total:</span>
            <span>{total.toFixed(6)} USDC</span>
          </div>
        </div>
      )}
    </div>
  );
}
