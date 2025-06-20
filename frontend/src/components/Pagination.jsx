import React from "react";
import { Loader2 } from "lucide-react";

const Pagination = ({
  currentPage,
  totalCount,
  limit,
  hasNext,
  hasPrevious,
  loading = false,
  onPageChange,
  onNextPage,
  onPreviousPage,
  className = "",
}) => {
  const totalPages = Math.ceil(totalCount / limit);

  // Don't render if there's only one page or no data
  if (totalPages <= 1) return null;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className={`flex items-center justify-between mt-6 px-4 py-3 bg-white rounded-lg shadow ${className}`}>
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalCount)} of {totalCount} results
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={onPreviousPage}
          disabled={!hasPrevious || loading}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        <div className="flex space-x-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' ? onPageChange(page) : null}
              disabled={loading || page === '...'}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading && page === currentPage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                page
              )}
            </button>
          ))}
        </div>
        
        <button
          onClick={onNextPage}
          disabled={!hasNext || loading}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;