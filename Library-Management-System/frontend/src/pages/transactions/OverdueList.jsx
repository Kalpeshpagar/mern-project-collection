import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Eye } from "lucide-react";
import {
    fetchOverdueBooks,
    selectOverdueBooks, selectTransactionPagination, selectTransactionLoading
} from "../../features/transactions/transactionSlice.js";
import Spinner    from "../../components/common/Spinner.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import { format }  from "date-fns";

const OverdueList = () => {
    const dispatch   = useDispatch();
    const navigate   = useNavigate();
    const overdue    = useSelector(selectOverdueBooks);
    const pagination = useSelector(selectTransactionPagination);
    const loading    = useSelector(selectTransactionLoading);
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(fetchOverdueBooks({ page, limit: 10, sortBy: "dueDate", order: "asc" }));
    }, [dispatch, page]);

    return (
        <div className="space-y-5">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <AlertCircle size={22} className="text-red-500" />
                    Overdue Books
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    {pagination?.total ?? "—"} overdue transactions —
                    sorted by oldest due date first
                </p>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {loading ? <Spinner /> : overdue.length === 0 ? (
                    <div className="text-center py-16">
                        <AlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm font-medium">
                            No overdue books 🎉
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                            All borrowed books are within their due dates
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-red-50 text-red-600 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-3 text-left">Book</th>
                                    <th className="px-6 py-3 text-left">Member</th>
                                    <th className="px-6 py-3 text-left">Due Date</th>
                                    <th className="px-6 py-3 text-left">Days Overdue</th>
                                    <th className="px-6 py-3 text-left">Est. Fine</th>
                                    <th className="px-6 py-3 text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {overdue.map((t) => (
                                    <tr key={t._id}
                                        className="hover:bg-red-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-800 line-clamp-1">
                                                {t.book?.title || "—"}
                                            </p>
                                            <p className="text-xs font-mono text-gray-400 mt-0.5">
                                                {t.book?.isbn}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-800 capitalize">
                                                {t.member?.name || "—"}
                                            </p>
                                            <p className="text-xs font-mono text-gray-400 mt-0.5">
                                                {t.member?.membershipId}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-red-600 font-medium">
                                            {format(new Date(t.dueDate), "dd MMM yyyy")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-0.5 bg-red-100
                                                             text-red-700 text-xs font-semibold
                                                             rounded-full">
                                                {t.daysOverdue}d
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-red-600">
                                            ₹{t.estimatedFine}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() =>
                                                    navigate(`/transactions/${t._id}/return`)
                                                }
                                                className="p-1.5 rounded-lg text-gray-400
                                                           hover:text-blue-600 hover:bg-blue-50
                                                           transition-colors"
                                                title="Process Return"
                                            >
                                                <Eye size={15} />
                                            </button>
                                        </td>
                                    </tr>
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

export default OverdueList;