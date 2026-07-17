import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, BookOpen, User, CheckCircle } from "lucide-react";
import { issueBook, selectTransactionLoading }
    from "../../features/transactions/transactionSlice.js";
import axiosInstance from "../../api/axiosInstance.js";

const IssueBook = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loading = useSelector(selectTransactionLoading);

    // ── Search state ──────────────────────────────────────────────────
    const [bookSearch, setBookSearch] = useState("");
    const [memberSearch, setMemberSearch] = useState("");

    // ── Selected items ────────────────────────────────────────────────
    const [selectedBook, setSelectedBook] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);

    // ── Search results ────────────────────────────────────────────────
    const [bookResults, setBookResults] = useState([]);
    const [memberResults, setMemberResults] = useState([]);
    const [searching, setSearching] = useState({ book: false, member: false });

    // ── Search books ──────────────────────────────────────────────────
    const searchBooks = async (query) => {
        setBookSearch(query);
        setSelectedBook(null);
        if (!query.trim()) { setBookResults([]); return; }
        setSearching((s) => ({ ...s, book: true }));
        try {
            const res = await axiosInstance.get("/books", {
                params: { search: query, limit: 5 }
            });
            setBookResults(res.data.data || []);
        } catch {
            setBookResults([]);
        } finally {
            setSearching((s) => ({ ...s, book: false }));
        }
    };

    // ── Search members ────────────────────────────────────────────────
    const searchMembers = async (query) => {
        setMemberSearch(query);
        setSelectedMember(null);
        if (!query.trim()) { setMemberResults([]); return; }
        setSearching((s) => ({ ...s, member: true }));
        try {
            const res = await axiosInstance.get("/members", {
                params: { search: query, limit: 5 }
            });
            setMemberResults(res.data.data || []);
        } catch {
            setMemberResults([]);
        } finally {
            setSearching((s) => ({ ...s, member: false }));
        }
    };

    // ── Issue ─────────────────────────────────────────────────────────
    const handleIssue = async () => {
        if (!selectedBook || !selectedMember) return;
        const result = await dispatch(issueBook({
            bookId: selectedBook._id,
            memberId: selectedMember._id,
        }));
        if (issueBook.fulfilled.match(result)) {
            navigate("/transactions");
        }
    };

    const canIssue = selectedBook && selectedMember
        && selectedBook.availableCopies > 0;

    return (
        <div className="max-w-2xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Issue Book</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Search and select a book and member
                    </p>
                </div>
            </div>

            {/* ── Book search ──────────────────────────────────────────── */}
            <SearchPanel
                title="Select Book"
                icon={BookOpen}
                placeholder="Search by title or ISBN..."
                value={bookSearch}
                onChange={searchBooks}
                searching={searching.book}
                results={bookResults}
                selected={selectedBook}
                onSelect={(book) => {
                    setSelectedBook(book);
                    setBookSearch(book.title);
                    setBookResults([]);
                }}
                renderResult={(book) => (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-800">
                                {book.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {book.author?.name} · {book.isbn}
                            </p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                            ${book.availableCopies > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                            {book.availableCopies > 0
                                ? `${book.availableCopies} available`
                                : "Unavailable"
                            }
                        </span>
                    </div>
                )}
                selectedDisplay={selectedBook && (
                    <SelectedCard
                        title={selectedBook.title}
                        subtitle={`${selectedBook.author?.name} · ${selectedBook.availableCopies} available`}
                        warning={selectedBook.availableCopies === 0
                            ? "No copies available" : null}
                        onClear={() => {
                            setSelectedBook(null);
                            setBookSearch("");
                        }}
                    />
                )}
            />

            {/* ── Member search ────────────────────────────────────────── */}
            <SearchPanel
                title="Select Member"
                icon={User}
                placeholder="Search by name, email or membership ID..."
                value={memberSearch}
                onChange={searchMembers}
                searching={searching.member}
                results={memberResults}
                selected={selectedMember}
                onSelect={(member) => {
                    setSelectedMember(member);
                    setMemberSearch(member.name);
                    setMemberResults([]);
                }}
                renderResult={(member) => (
                    <div>
                        <p className="text-sm font-medium text-gray-800 capitalize">
                            {member.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {member.email} · {member.membershipId}
                        </p>
                    </div>
                )}
                selectedDisplay={selectedMember && (
                    <SelectedCard
                        title={selectedMember.name}
                        subtitle={`${selectedMember.membershipId} · Limit: ${selectedMember.borrowLimit}`}
                        onClear={() => {
                            setSelectedMember(null);
                            setMemberSearch("");
                        }}
                    />
                )}
            />

            {/* ── Issue button ─────────────────────────────────────────── */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="text-sm text-gray-500">
                        {canIssue ? (
                            <span className="flex items-center gap-2 text-green-600 font-medium">
                                <CheckCircle size={16} />
                                Ready to issue — due in{" "}
                                {import.meta.env.VITE_DEFAULT_LOAN_DAYS || 14} days
                            </span>
                        ) : (
                            <span>Select a book and member to continue</span>
                        )}
                    </div>
                    <button
                        onClick={handleIssue}
                        disabled={!canIssue || loading}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700
                                   disabled:bg-gray-300 disabled:cursor-not-allowed
                                   text-white text-sm font-semibold rounded-lg
                                   transition-colors"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30
                                                 border-t-white rounded-full animate-spin" />
                                Issuing…
                            </span>
                        ) : "Issue Book"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Reusable search panel ─────────────────────────────────────────────────
const SearchPanel = ({
    title, icon: Icon, placeholder, value, onChange,
    searching, results, selected, onSelect,
    renderResult, selectedDisplay
}) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Icon size={16} className="text-gray-400" /> {title}
        </h2>

        {selectedDisplay || (
            <div className="relative">
                <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300
                               rounded-lg text-sm outline-none focus:border-blue-500"
                />

                {/* Results dropdown */}
                {(results.length > 0 || searching) && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1
                                    bg-white border border-gray-200 rounded-lg
                                    shadow-lg overflow-hidden">
                        {searching ? (
                            <div className="px-4 py-3 text-sm text-gray-400">
                                Searching…
                            </div>
                        ) : (
                            results.map((item) => (
                                <button
                                    key={item._id}
                                    onClick={() => onSelect(item)}
                                    className="w-full px-4 py-3 text-left
                                               hover:bg-gray-50 border-b border-gray-100
                                               last:border-0 transition-colors"
                                >
                                    {renderResult(item)}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        )}
    </div>
);

// ── Selected item card ────────────────────────────────────────────────────
const SelectedCard = ({ title, subtitle, warning, onClear }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg
                     border ${warning
            ? "bg-red-50 border-red-200"
            : "bg-green-50 border-green-200"
        }`}>
        <div>
            <p className={`text-sm font-medium capitalize
                           ${warning ? "text-red-800" : "text-green-800"}`}>
                {title}
            </p>
            <p className={`text-xs mt-0.5
                           ${warning ? "text-red-600" : "text-green-600"}`}>
                {warning || subtitle}
            </p>
        </div>
        <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-gray-600 underline ml-4"
        >
            Change
        </button>
    </div>
);

export default IssueBook;