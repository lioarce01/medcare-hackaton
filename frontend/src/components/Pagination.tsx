import React from "react";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  limit,
  total,
  onPageChange,
  className = "",
}) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handlePrev}
        disabled={page === 1}
        className="px-2 py-1 border rounded disabled:opacity-50"
      >
        Prev
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={page === totalPages}
        className="px-2 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
      <span className="ml-2 text-sm text-gray-500">
        {total} results
      </span>
    </div>
  );
};

export default Pagination;