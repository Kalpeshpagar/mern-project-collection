import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, BookOpen, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import {
    fetchTransactionById, returnBook, renewBook,
    selectTransaction, selectTransactionLoading, clearTransaction
} from "../../features/transactions/transactionSlice.js";
import Spinner from "../../components/common/Spinner.jsx";
import { format, differenceInDays } from "date-fns";

const ReturnBook = () => {
    const { id }        = useParams();
    const dispatch      = useDispatch();
    const navigate      = useNavigate();
    const transaction   = useSelector(selectTransaction);
    const loading       = useSelector(selectTransactionLoading);

    useEffect(() => {
        dispatch(fetchTransactionById(id));
        return () => dispatch(clearTransaction());
    }, [dispatch, id]);

    // ── Return ────────────────────────────────────────────────────────
    const handleReturn = async () => {
        if (!window.confirm("Confirm book return?")) return;
        const result = await dispatch(returnBook(id));
        if (returnBook.fulfilled.match(result)) {
            navigate("/transactions");
        }
    };

    // ── Renew ─────────────────────────────────────────────────────────
    const handleRenew = async () => {
        if (!window.confirm("Renew this book for another 14 days?")) return;
        const result = await dispatch(renewBook(id));
        if (renewBook.fulfilled.match(result)) {
            navigate("/transactions");
        }
    };

    if (loading && !transaction) return <Spinner />;
    if (!transaction) return (
        <div className="text-center py-16">
            <p className="text-gray-500">Transaction not found</p>
        </div>
    );

    const today       = new Date();
    const dueDate     = new Date(transaction.dueDate);
    const isOverdue   = today > dueDate;
    const daysOverdue = isOverdue
        ? differenceInDays(today, dueDate)
        : 0;
    const daysLeft    = !isOverdue
        ? differenceInDays(dueDate, today)
        : 0;
    const perDayRate  = 2;
    const estimatedFine = daysOverdue * perDayRate;
    const isReturnable  = ["issued", "overdue"].includes(transaction.status);
    const isRenewable   = transaction.status === "issued"
                          && transaction.renewCount < 2;

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
                    <h1 className="text-2xl font-bold text-gray-900">
                        Return / Renew Book
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Transaction details and actions
                    </p>
                </div>
            </div>

            {/* ── Transaction summary ──────────────────────────────────── */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">

                {/* Book */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center
                                    justify-center text-blue-600 shrink-0">
                        <BookOpen size={18} />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">
                            {transaction.book?.title}
                        </p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                            {transaction.book?.isbn}
                        </p>
                    </div>
                </div>

                {/* Member */}
                <Row label="Member" value={
                    <span className="capitalize">{transaction.member?.name}</span>
                } />
                <Row label="Membership ID" value={
                    <span className="font-mono">{transaction.member?.membershipId}</span>
                } />
                <Row label="Issue Date" value={
                    format(new Date(transaction.issueDate), "dd MMM yyyy")
                } />
                <Row label="Due Date" value={
                    <span className={isOverdue ? "text-red-600 font-semibold" : ""}>
                        {format(dueDate, "dd MMM yyyy")}
                    </span>
                } />
                <Row label="Renewals Used" value={
                    `${transaction.renewCount} / 2`
                } />
                <Row label="Status" value={
                    <StatusBadge status={transaction.status} />
                } />
            </div>

            {/* ── Overdue warning ──────────────────────────────────────── */}
            {isOverdue && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                        <AlertCircle size={18} />
                        Overdue by {daysOverdue} {daysOverdue === 1 ? "day" : "days"}
                    </div>
                    <p className="text-sm text-red-600">
                        Estimated fine:{" "}
                        <span className="font-bold">₹{estimatedFine}</span>
                        {" "}(₹{perDayRate}/day × {daysOverdue} days)
                    </p>
                </div>
            )}

            {/* ── Days remaining ───────────────────────────────────────── */}
            {!isOverdue && isReturnable && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-green-700 font-semibold">
                        <CheckCircle size={18} />
                        {daysLeft === 0
                            ? "Due today — please return"
                            : `${daysLeft} ${daysLeft === 1 ? "day" : "days"} remaining`
                        }
                    </div>
                </div>
            )}

            {/* ── Already returned ─────────────────────────────────────── */}
            {!isReturnable && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-sm text-gray-600 text-center">
                        This book has already been{" "}
                        <span className="font-medium">{transaction.status}</span>.
                    </p>
                </div>
            )}

            {/* ── Actions ─────────────────────────────────────────────── */}
            {isReturnable && (
                <div className="flex items-center gap-3">

                    {/* Renew */}
                    {isRenewable && (
                        <button
                            onClick={handleRenew}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2
                                       py-2.5 border-2 border-blue-600 text-blue-600
                                       hover:bg-blue-50 font-semibold text-sm rounded-lg
                                       disabled:opacity-50 transition-colors"
                        >
                            <RefreshCw size={16} />
                            Renew (14 days)
                        </button>
                    )}

                    {/* Return */}
                    <button
                        onClick={handleReturn}
                        disabled={loading}
                        className={`flex-1 flex items-center justify-center gap-2
                                   py-2.5 font-semibold text-sm rounded-lg
                                   disabled:opacity-50 transition-colors text-white
                                   ${isOverdue
                                       ? "bg-red-600 hover:bg-red-700"
                                       : "bg-green-600 hover:bg-green-700"
                                   }`}
                    >
                        <CheckCircle size={16} />
                        {isOverdue
                            ? `Return & Collect ₹${estimatedFine} Fine`
                            : "Return Book"
                        }
                    </button>
                </div>
            )}
        </div>
    );
};

// ── Helpers ───────────────────────────────────────────────────────────────
const Row = ({ label, value }) => (
    <div className="flex items-center justify-between py-1">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
);

const statusStyles = {
    issued:   "bg-blue-100   text-blue-700",
    returned: "bg-green-100  text-green-700",
    overdue:  "bg-red-100    text-red-700",
    renewed:  "bg-yellow-100 text-yellow-700",
    lost:     "bg-gray-100   text-gray-700",
};

const StatusBadge = ({ status }) => (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                      capitalize ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
    </span>
);

export default ReturnBook;