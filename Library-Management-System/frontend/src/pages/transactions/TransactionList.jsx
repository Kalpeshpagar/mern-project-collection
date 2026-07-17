import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, Search, Filter, Eye } from "lucide-react";
import {
    fetchTransactions,
    selectTransactions, selectTransactionPagination, selectTransactionLoading
} from "../../features/transactions/transactionSlice.js";
import Spinner    from "../../components/common/Spinner.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import useDebounce from "../../hooks/useDebounce.js";
import { format }  from "date-fns";

const STATUS_OPTIONS = ["issued", "returned", "overdue", "renewed", "lost"];

const TransactionList = () => {
    const dispatch      = useDispatch();
    const navigate      = useNavigate();
    const transactions  = useSelector(selectTransactions);
    const pagination    = useSelector(selectTransactionPagination);
    const loading       = useSelector(selectTransactionLoading);

    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [page,   setPage]   = useState(1);

    const debouncedSearch = useDebounce(search, 400);

    const fetchData = useCallback(() => {
        dispatch(fetchTransactions({
            status:  status  || undefined,
            member:  debouncedSearch || undefined,
            page,
            limit: 10,
        }));
    }, [dispatch, status, debouncedSearch, page]);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { setPage(1); }, [status, debouncedSearch]);

    return (
        <div className="space-y-5">

            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {pagination?.total ?? "—"} total transactions
                    </p>
                </div>
                <button
                    onClick={() => navigate("/transactions/issue")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600
                               hover:bg-blue-700 text-white text-sm font-medium
                               rounded-lg transition-colors"
                >
                    <ArrowLeftRight size={16} /> Issue Book
                </button>
            </div>

            {/* ── Filters ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search by member ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300
                                   rounded-lg text-sm outline-none focus:border-blue-500"
                    />
                </div>
                <div className="relative">
                    <Filter
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg
                                   text-sm outline-none focus:border-blue-500 bg-white
                                   appearance-none"
                    >
                        <option value="">All Statuses</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Table ───────────────────────────────────────────────── */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {loading ? <Spinner /> : transactions.length === 0 ? (
                    <div className="text-center py-16">
                        <ArrowLeftRight size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm">No transactions found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-3 text-left">Book</th>
                                    <th className="px-6 py-3 text-left">Member</th>
                                    <th className="px-6 py-3 text-left">Issue Date</th>
                                    <th className="px-6 py-3 text-left">Due Date</th>
                                    <th className="px-6 py-3 text-left">Status</th>
                                    <th className="px-6 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.map((t) => (
                                    <TransactionRow
                                        key={t._id}
                                        transaction={t}
                                        onView={() => navigate(`/transactions/${t._id}/return`)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {pagination && (
                <Pagination pagination={pagination} onPageChange={setPage} />
            )}
        </div>
    );
};

// ── Transaction row ───────────────────────────────────────────────────────
const TransactionRow = ({ transaction: t, onView }) => {
    const isOverdue = t.status === "overdue";
    const isPending = t.status === "issued" || t.status === "overdue";

    return (
        <tr className={`transition-colors hover:bg-gray-50
                        ${isOverdue ? "bg-red-50/40" : ""}`}>
            <td className="px-6 py-4">
                <p className="font-medium text-gray-800 line-clamp-1">
                    {t.book?.title || "—"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                    {t.book?.isbn || ""}
                </p>
            </td>
            <td className="px-6 py-4">
                <p className="text-gray-800 capitalize">{t.member?.name || "—"}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {t.member?.membershipId || ""}
                </p>
            </td>
            <td className="px-6 py-4 text-gray-600">
                {format(new Date(t.issueDate), "dd MMM yyyy")}
            </td>
            <td className={`px-6 py-4 font-medium
                            ${isOverdue ? "text-red-600" : "text-gray-600"}`}>
                {format(new Date(t.dueDate), "dd MMM yyyy")}
            </td>
            <td className="px-6 py-4">
                <StatusBadge status={t.status} />
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                    <button
                        onClick={onView}
                        className="p-1.5 rounded-lg text-gray-400
                                   hover:text-blue-600 hover:bg-blue-50
                                   transition-colors"
                        title={isPending ? "Return Book" : "View"}
                    >
                        <Eye size={15} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

const statusStyles = {
    issued:   "bg-blue-100   text-blue-700",
    returned: "bg-green-100  text-green-700",
    overdue:  "bg-red-100    text-red-700",
    renewed:  "bg-yellow-100 text-yellow-700",
    lost:     "bg-gray-100   text-gray-700",
};

const StatusBadge = ({ status }) => (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs
                      font-medium capitalize
                      ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
    </span>
);

export default TransactionList;