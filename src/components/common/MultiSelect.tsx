"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

export default function MultiSelect({
  label,
  placeholder = "분류를 선택해 주세요",
  options,
  value,
  onChange,
  className = "",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const handleRemove = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== option));
  };

  return (
    <div className={`w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-800 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between gap-2
            rounded-lg px-4 py-3 text-base
            border transition-all duration-150 min-h-[48px]
            ${isOpen
              ? "bg-white border-brand ring-1 ring-brand"
              : "bg-white border-gray-200 hover:bg-gray-100"
            }
          `}
        >
          <div className="flex-1 flex flex-wrap gap-2">
            {value.length > 0 ? (
              value.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {item}
                  <X
                    className="w-3.5 h-3.5 text-gray-500 hover:text-gray-700 cursor-pointer"
                    onClick={(e) => handleRemove(item, e)}
                  />
                </span>
              ))
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {options.map((option) => (
              <li
                key={option}
                onClick={() => handleToggle(option)}
                className={`
                  px-4 py-3 cursor-pointer text-base font-medium transition-colors duration-150
                  flex items-center justify-between
                  ${value.includes(option)
                    ? "bg-brand/20 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                {option}
                {value.includes(option) && (
                  <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
