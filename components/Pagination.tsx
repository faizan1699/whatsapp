import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  showPageSizeSelector?: boolean
  showItemCounter?: boolean
  maxVisiblePages?: number
  className?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  showItemCounter = true,
  maxVisiblePages = 5,
  className = ''
}: PaginationProps) {
  const generatePageNumbers = () => {
    const pages: number[] = []
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show smart pagination with ellipsis
      const halfVisible = Math.floor(maxVisiblePages / 2)
      let startPage = Math.max(1, currentPage - halfVisible)
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
      
      // Adjust start if we're near the end
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }
      
      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) {
          pages.push(-1) // Ellipsis indicator
        }
      }
      
      // Add visible pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      // Add ellipsis and last page if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push(-1) // Ellipsis indicator
        }
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const pageNumbers = generatePageNumbers()
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  if (totalPages <= 1) return null

  return (
    <div className={`flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 ${className}`}>
      <div className="flex items-center justify-between flex-1">
        {/* Item Counter */}
        {showItemCounter && (
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startItem}</span> to{' '}
              <span className="font-medium">{endItem}</span> of{' '}
              <span className="font-medium">{totalItems}</span> results
            </p>
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          {/* Page Size Selector */}
          {showPageSizeSelector && onPageSizeChange && (
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">Show</label>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <label className="text-sm text-gray-700">per page</label>
            </div>
          )}
          
          {/* Pagination Controls */}
          <div className="flex items-center space-x-1">
            {/* First Page */}
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="First page"
            >
              «
            </button>
            
            {/* Previous Page */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              ‹
            </button>
            
            {/* Page Numbers */}
            {pageNumbers.map((page, index) => {
              if (page === -1) {
                // Ellipsis
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-1 text-sm text-gray-500"
                  >
                    ...
                  </span>
                )
              }
              
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1 text-sm border rounded transition-colors ${
                    page === currentPage
                      ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            })}
            
            {/* Next Page */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              ›
            </button>
            
            {/* Last Page */}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Last page"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for pagination state management
export function usePagination(initialPageSize = 10) {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(initialPageSize)

  const resetPagination = React.useCallback(() => {
    setCurrentPage(1)
  }, [])

  const handlePageChange = React.useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handlePageSizeChange = React.useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when page size changes
  }, [])

  return {
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    resetPagination,
    handlePageChange,
    handlePageSizeChange
  }
}
