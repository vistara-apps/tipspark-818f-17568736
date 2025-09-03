'use client';

import { useState } from 'react';

export function TipInput({ onChange, value }) {
  const [amount, setAmount] = useState(value || '');

  const handleChange = (e) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    onChange(newAmount);
  };

  return (
    <input
      type="number"
      value={amount}
      onChange={handleChange}
      placeholder="Enter amount in USDC"
      className="w-full p-md border border-text-secondary rounded-md focus:shadow-focus outline-none"
    />
  );
}
  