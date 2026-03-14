"use client";

import { useState } from "react";

interface WalletSearchProps {
  onSearch: (address: string) => void;
  loading: boolean;
}

export default function WalletSearch({ onSearch, loading }: WalletSearchProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search wallet address"
        className="search-input"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !input.trim()}
        className="search-btn"
      >
        {loading ? "Loading..." : "Search"}
      </button>
    </form>
  );
}
