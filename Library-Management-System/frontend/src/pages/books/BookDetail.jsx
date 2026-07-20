import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowLeft, BookOpen, Edit, Trash2,
    MapPin, Globe, Hash, Copy
} from "lucide-react";
import {
    fetchBookById, deleteBook,
    selectBook, selectBookLoading, clearBook
} from "../../features/books/bookSlice.js";
import { selectUser } from "../../features/auth/authSlice.js";
import Spinner from "../../components/common/Spinner.jsx";
import toast   from "react-hot-toast";

const BookDetail = () => {
    const { id }     = useParams();
    const dispatch   = useDispatch();
    const navigate   = useNavigate();
    const book       = useSelector(selectBook);
    const loading    = useSelector(selectBookLoading);
    const user       = useSelector(selectUser);
    const canEdit    = ["admin", "librarian"].includes(user?.role);
    const canDelete  = user?.role === "admin";

    useEffect(() => {
        dispatch(fetchBookById(id));
        // clear book from state when leaving page
        return () => dispatch(clearBook());
    }, [dispatch, id]);

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${book.title}"?`)) return;
        const result = await dispatch(deleteBook(id));
        if (deleteBook.fulfilled.match(result)) {
            navigate("/books");
        }
    };

    const handleCopyISBN = () => {
        navigator.clipboard.writeText(book.isbn);
        toast.success("ISBN copied!");
    };

    if (loading) return <Spinner />;
    if (!book)   return (
        <div className="text-center py-16">
            <p className="text-gray-500">Book not found</p>
            <Link to="/books" className="mt-2 text-sm text-blue-600 hover:underline">
                ← Back to books
            </Link>
        </div>
    );

    const isAvailable = book.availableCopies > 0;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">

            {/* ── Back button ─────────────────────────────────────────── */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-gray-500
                           hover:text-gray-800 transition-colors"
            >
                <ArrowLeft size={16} /> Back
            </button>

            {/* ── Main card ───────────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex flex-col md:flex-row">

                    {/* Cover */}
                    <div className="w-full md:w-56 shrink-0 bg-gradient-to-br
                                    from-blue-50 to-indigo-100 flex items-center
                                    justify-center min-h-64">
                        {book.coverImage ? (
                            <img
                                src={book.coverImage}
                                alt={book.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <BookOpen size={48} className="text-indigo-300" />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-6 md:p-8">

                        {/* Title + actions */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    {book.title}
                                </h1>
                                <p className="text-gray-500 mt-1 capitalize">
                                    by {book.author?.name || "Unknown"}
                                    {book.author?.country && (
                                        <span className="text-gray-400">
                                            {" "}· {book.author.country}
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Actions */}
                            {canEdit && (
                                <div className="flex items-center gap-2 shrink-0">
                                    <Link
                                        to={`/books/${id}/edit`}
                                        className="flex items-center gap-1.5 px-3 py-1.5
                                                   text-sm font-medium text-gray-600
                                                   border border-gray-300 rounded-lg
                                                   hover:border-blue-500 hover:text-blue-600
                                                   transition-colors"
                                    >
                                        <Edit size={14} /> Edit
                                    </Link>
                                    {canDelete && (
                                        <button
                                            onClick={handleDelete}
                                            className="flex items-center gap-1.5 px-3 py-1.5
                                                       text-sm font-medium text-gray-600
                                                       border border-gray-300 rounded-lg
                                                       hover:border-red-500 hover:text-red-600
                                                       transition-colors"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Availability badge */}
                        <div className="mt-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1
                                             text-sm font-medium rounded-full
                                             ${isAvailable
                                                 ? "bg-green-100 text-green-700"
                                                 : "bg-red-100 text-red-700"
                                             }`}>
                                <span className={`w-1.5 h-1.5 rounded-full
                                    ${isAvailable ? "bg-green-500" : "bg-red-500"}`}
                                />
                                {isAvailable
                                    ? `${book.availableCopies} of ${book.totalCopies} available`
                                    : "All copies issued"
                                }
                            </span>
                        </div>

                        {/* Meta grid */}
                        <div className="grid grid-cols-2 gap-3 mt-5">
                            <MetaItem
                                icon={Hash}
                                label="ISBN"
                                value={
                                    <span className="flex items-center gap-1.5">
                                        {book.isbn}
                                        <button
                                            onClick={handleCopyISBN}
                                            className="text-gray-400 hover:text-blue-600"
                                        >
                                            <Copy size={12} />
                                        </button>
                                    </span>
                                }
                            />
                            <MetaItem
                                icon={Globe}
                                label="Language"
                                value={book.language}
                            />
                            {book.publisher && (
                                <MetaItem
                                    icon={BookOpen}
                                    label="Publisher"
                                    value={book.publisher}
                                />
                            )}
                            {book.publishedYear && (
                                <MetaItem
                                    icon={BookOpen}
                                    label="Year"
                                    value={book.publishedYear}
                                />
                            )}
                            {book.pages && (
                                <MetaItem
                                    icon={BookOpen}
                                    label="Pages"
                                    value={`${book.pages} pages`}
                                />
                            )}
                            {book.location && (
                                <MetaItem
                                    icon={MapPin}
                                    label="Location"
                                    value={book.location}
                                />
                            )}
                        </div>

                        {/* Category + tags */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {book.category && (
                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700
                                                 text-xs font-medium rounded-full">
                                    {book.category.name}
                                </span>
                            )}
                            {book.tags?.map((tag) => (
                                <span key={tag}
                                      className="px-2.5 py-1 bg-gray-100 text-gray-600
                                                 text-xs rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>

                    </div>
                </div>

                {/* Description */}
                {book.description && (
                    <div className="px-6 md:px-8 pb-6 border-t border-gray-100 pt-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                            About this book
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {book.description}
                        </p>
                    </div>
                )}

                {/* Author bio */}
                {book.author?.bio && (
                    <div className="px-6 md:px-8 pb-6 border-t border-gray-100 pt-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                            About the author
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {book.author.bio}
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
};

// ── Meta item ─────────────────────────────────────────────────────────────
const MetaItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-2">
        <Icon size={14} className="text-gray-400 mt-0.5 shrink-0" />
        <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-sm text-gray-700 font-medium">{value}</p>
        </div>
    </div>
);

export default BookDetail;