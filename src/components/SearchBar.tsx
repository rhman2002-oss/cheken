import React from "react";
import { Search, X } from "lucide-react";
import { restaurantData } from "@/config/restaurant";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange }) => {
  const { uiTexts } = restaurantData;

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <span className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-text-muted">
          <Search className="w-5 h-5" />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={uiTexts.searchPlaceholder}
          className="w-full ps-11 pe-10 py-3 rounded-input bg-surface border border-border-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-text-main placeholder-text-muted transition-all duration-200 outline-none shadow-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="absolute inset-y-0 end-0 flex items-center pe-3 text-text-muted hover:text-text-main"
            aria-label="مسح البحث"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
