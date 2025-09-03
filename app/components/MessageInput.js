'use client';

import { useState } from 'react';

export function MessageInput({ onChange, value }) {
  const [message, setMessage] = useState(value || '');

  const handleChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    onChange(newMessage);
  };

  return (
    <textarea
      value={message}
      onChange={handleChange}
      placeholder="Add a personalized message"
      rows={4}
      className="w-full p-md border border-text-secondary rounded-md focus:shadow-focus outline-none resize-none"
    />
  );
}
  