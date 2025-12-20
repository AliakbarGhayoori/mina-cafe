type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export function SearchBox({ value, onChange, placeholder }: SearchBoxProps) {
  return (
    <input
      className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}


