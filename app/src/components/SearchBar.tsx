import { useEffect, useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 250);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  return (
    <form
      className="flex w-full items-center"
      onSubmit={(event) => {
        event.preventDefault();
        onChange(localValue);
      }}
    >
      <div className="relative min-w-0 flex-1">
        <input
          type="text"
          placeholder="Search"
          value={localValue}
          onChange={(event) => setLocalValue(event.target.value)}
          className="h-10 w-full rounded-l-full border border-[#303030] bg-[#121212] pl-4 pr-10 text-sm text-[#f1f1f1] placeholder:text-[#888] focus:border-[#1c62b9] focus:outline-none"
          aria-label="Search videos"
        />
        {localValue && (
          <button
            type="button"
            onClick={() => setLocalValue('')}
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[#f1f1f1] hover:bg-white/10"
            aria-label="Clear search"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>
      <button
        type="submit"
        className="grid h-10 w-16 shrink-0 place-items-center rounded-r-full border border-l-0 border-[#303030] bg-[#222] hover:bg-[#2e2e2e]"
        aria-label="Search"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#f1f1f1]" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}
