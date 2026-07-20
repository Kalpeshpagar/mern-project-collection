import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Filter, BookOpen, Edit, Trash2 } from "lucide-react";
import {
    fetchBooks, deleteBook,
    selectBooks, selectBookPagination, selectBookLoading
} from "../../features/books/bookSlice.js";
import { selectUser } from "../../features/auth/authSlice.js";
import Spinner    from "../../components/common/Spinner.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import useDebounce from "../../hooks/useDebounce.js";

const BookList = () => {
    const dispatch   = useDispatch();
    const navigate   = useNavigate();
    const books      = useSelector(selectBooks);
    const pagination = useSelector(selectBookPagination);
    const loading    = useSelector(selectBookLoading);
    const user       = useSelector(selectUser);

    const canEdit = ["admin", "librarian"].includes(user?.role);

    // ── Filters state ─────────────────────────────────────────────────
    const [search,   setSearch]   = useState("");
    const [language, setLanguage] = useState("");
    const [page,     setPage]     = useState(1);

    // debounce search — wait 400ms after user stops typing before fetching
    const debouncedSearch = useDebounce(search, 400);

    // ── Fetch whenever filters change ─────────────────────────────────
    const fetchData = useCallback(() => {
        dispatch(fetchBooks({
            search:   debouncedSearch,
            language: language || undefined,
            page,
            limit: 12,
        }));
    }, [dispatch, debouncedSearch, language, page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // reset to page 1 when search/filter changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, language]);

    // ── Delete ────────────────────────────────────────────────────────
    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
        await dispatch(deleteBook(id));
    };

    return (
        <div className="space-y-5">

            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Books</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {pagination?.total ?? "—"} books in catalogue
                    </p>
                </div>
                {canEdit && (
                    <Link
                        to="/books/new"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600
                                   hover:bg-blue-700 text-white text-sm font-medium
                                   rounded-lg transition-colors"
                    >
                        <Plus size={16} />
                        Add Book
                    </Link>
                )}
            </div>

            {/* ── Filters ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">

                {/* Search */}
                <div className="relative flex-1">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300
                                   rounded-lg text-sm outline-none focus:border-blue-500
                                   transition-colors"
                    />
                </div>

                {/* Language filter */}
                <div className="relative">
                    <Filter
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg
                                   text-sm outline-none focus:border-blue-500 bg-white
                                   transition-colors appearance-none"
                    >
                        <option value="">All Languages</option>
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Marathi">Marathi</option>
                        <option value="Gujarati">Gujarati</option>
                    </select>
                </div>
            </div>

            {/* ── Book grid ───────────────────────────────────────────── */}
            {loading ? (
                <Spinner />
            ) : books.length === 0 ? (
                <div className="text-center py-16">
                    <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">No books found</p>
                    {canEdit && (
                        <Link
                            to="/books/new"
                            className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                        >
                            Add the first book →
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {books.map((book) => (
                        <BookCard
                            key={book._id}
                            book={book}
                            canEdit={canEdit}
                            onDelete={handleDelete}
                            onClick={() => navigate(`/books/${book._id}`)}
                        />
                    ))}
                </div>
            )}

            {/* ── Pagination ───────────────────────────────────────────── */}
            {pagination && (
                <Pagination
                    pagination={pagination}
                    onPageChange={setPage}
                />
            )}

        </div>
    );
};

// ── Book card ─────────────────────────────────────────────────────────────
const BookCard = ({ book, canEdit, onDelete, onClick }) => {
    const availabilityColor = book.availableCopies > 0
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700";

    return (
        <div
            className="bg-white border border-gray-200 rounded-xl overflow-hidden
                       hover:shadow-md transition-shadow duration-200 cursor-pointer group"
        >
            {/* Cover image */}
            <div
                onClick={onClick}
                className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100
                           flex items-center justify-center overflow-hidden"
            >
                {book.coverImage ? (
                    <img
                        src={book.coverImage}
                        alt={book.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <BookOpen size={40} className="text-indigo-300" />
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <div onClick={onClick}>
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2
                                   group-hover:text-blue-600 transition-colors">
                        {book.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                        {book.author?.name || "Unknown author"}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                                         ${availabilityColor}`}>
                            {book.availableCopies > 0
                                ? `${book.availableCopies} available`
                                : "All issued"
                            }
                        </span>
                        <span className="text-xs text-gray-400">
                            {book.language}
                        </span>
                    </div>
                </div>

                {/* Edit / Delete — librarian+ only */}
                {canEdit && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                        <Link
                            to={`/books/${book._id}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 flex items-center justify-center gap-1.5
                                       py-1.5 text-xs font-medium text-gray-600
                                       hover:text-blue-600 hover:bg-blue-50
                                       rounded-lg transition-colors"
                        >
                            <Edit size={13} /> Edit
                        </Link>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(book._id, book.title);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5
                                       py-1.5 text-xs font-medium text-gray-600
                                       hover:text-red-600 hover:bg-red-50
                                       rounded-lg transition-colors"
                        >
                            <Trash2 size={13} /> Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookList;