import { useState, useRef, useEffect } from "react";

type DropdownOption = {
  value: string;
  label: string;
};

type DropdownProps = {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  emptyMessage?: string;
};

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  required,
  emptyMessage,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-3 border border-gray-300 rounded-md bg-white text-gray-700 hover:border-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <span className={selected ? "text-gray-700" : "text-gray-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <span
          className={`transition-transform duration-200 text-gray-400 ${isOpen ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {options.length === 0 ? (
            <li
              className="px-3 py-2 cursor-pointer text-sm 
                text-gray-700 hover:bg-gray-50"
            >
              {emptyMessage}
            </li>
          ) : (
            options.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 cursor-pointer text-sm ${
                  option.value === value
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}

      {required && (
        <input
          tabIndex={-1}
          required
          value={value}
          onChange={() => {}}
          className="absolute opacity-0 w-0 h-0"
        />
      )}
    </div>
  );
}
