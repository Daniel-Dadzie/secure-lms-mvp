"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Inline SVG for Left Arrow
const ChevronLeftIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

// Inline SVG for Right Arrow
const ChevronRightIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Generate an array of page numbers (e.g., [1, 2, 3, 4, 5])
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (totalPages <= 1) return null; // Hide pagination if there's only 1 page

  return (
    <nav className="flex items-center justify-center space-x-2 mt-10" aria-label="Pagination">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600"
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      
      {/* Page Numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 ${
            currentPage === page 
              ? "bg-[#0A4A3A] text-white shadow-md" 
              : "text-slate-600 hover:bg-slate-100"
          }`}
          aria-current={currentPage === page ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600"
        aria-label="Next page"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </nav>
  );
}