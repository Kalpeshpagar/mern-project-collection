import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ pagination, onPageChange }) => {
    // guard: don't render if pagination data hasn't loaded yet
    if (!pagination) return null;

    const { page, totalPages, total, limit, hasNextPage, hasPrevPage } = pagination;

    // don't render if only one page
    if (totalPages <= 1) return null;

    // ── Page number buttons ───────────────────────────────────────────
    // shows max 5 page buttons centered around current page
    const getPageNumbers = () => {
        const delta   = 2;   // pages to show on each side of current
        const start   = Math.max(1, page - delta);
        const end     = Math.min(totalPages, page + delta);
        const numbers = [];

        for (let i = start; i <= end; i++) {
            numbers.push(i);
        }
        return numbers;
    };

    const pageNumbers = getPageNumbers();

    // range text e.g. "Showing 11 – 20 of 137"
    const rangeStart = (page - 1) * limit + 1;
    const rangeEnd   = Math.min(page * limit, total);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between
                        gap-3 px-4 py-3 border-t border-gray-200 bg-white">

            {/* ── Range text ────────────────────────────────────────── */}
            <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-800">{rangeStart}</span>
                {" – "}
                <span className="font-medium text-gray-800">{rangeEnd}</span>
                {" of "}
                <span className="font-medium text-gray-800">{total}</span>
                {" results"}
            </p>

            {/* ── Buttons ───────────────────────────────────────────── */}
            <div className="flex items-center gap-1">

                {/* Prev */}
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={!hasPrevPage}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100
                               disabled:opacity-40 disabled:cursor-not-allowed
                               transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>

                {/* First page + ellipsis */}
                {pageNumbers[0] > 1 && (
                    <>
                        <PageBtn num={1} current={page} onClick={onPageChange} />
                        {pageNumbers[0] > 2 && (
                            <span className="px-1 text-gray-400 text-sm">…</span>
                        )}
                    </>
                )}

                {/* Page number buttons */}
                {pageNumbers.map((num) => (
                    <PageBtn
                        key={num}
                        num={num}
                        current={page}
                        onClick={onPageChange}
                    />
                ))}

                {/* Last page + ellipsis */}
                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                            <span className="px-1 text-gray-400 text-sm">…</span>
                        )}
                        <PageBtn num={totalPages} current={page} onClick={onPageChange} />
                    </>
                )}

                {/* Next */}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={!hasNextPage}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100
                               disabled:opacity-40 disabled:cursor-not-allowed
                               transition-colors"
                >
                    <ChevronRight size={16} />
                </button>

            </div>
        </div>
    );
};

// ── Single page number button ─────────────────────────────────────────────
const PageBtn = ({ num, current, onClick }) => (
    <button
        onClick={() => onClick(num)}
        className={`
            w-8 h-8 rounded-lg text-sm font-medium transition-colors
            ${num === current
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }
        `}
    >
        {num}
    </button>
);

export default Pagination;