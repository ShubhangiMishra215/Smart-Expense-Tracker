import { useEffect, useState } from "react";
import {
  Search,
  Pen,
  Trash,
  Plus,
  ChevronLeft,
  ChevronRight,
  ReceiptText,
  X,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";

import AddExpenseModal from "../components/AddExpenseModal";
import api from "../utils/api";
import { CATEGORIES, getCategoryColor } from "../constants/categories";

export default function Transactions() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
  });

  const getExpenseHandler = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(
        `/expenses?limit=${limit}&page=${page}&search=${encodeURIComponent(search)}`
      );

      setExpenses(data.expenses || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch transactions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      getExpenseHandler();
    }, 400);

    return () => clearTimeout(timer);
  }, [page, limit, search]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const startEdit = (expense) => {
    setEditingId(expense._id);

    setDraft({
      amount: expense.amount,
      category: expense.category,
      description: expense.description || "",
      date: expense.date
        ? new Date(expense.date).toISOString().slice(0, 10)
        : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({
      amount: "",
      category: "",
      description: "",
      date: "",
    });
  };

  const setField = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveEdit = async () => {
    try {
      if (!draft.amount || Number(draft.amount) <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      await api.patch(`/expenses/${editingId}`, {
        ...draft,
        amount: Number(draft.amount),
      });

      toast.success("Expense updated successfully");

      cancelEdit();
      getExpenseHandler();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update expense"
      );
    }
  };

  const deleteExpense = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/expenses/${id}`);

      toast.success("Transaction deleted successfully");

      if (expenses.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        getExpenseHandler();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete transaction"
      );
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleSaved = () => {
    setIsModalOpen(false);

    if (page !== 1) {
      setPage(1);
    } else {
      getExpenseHandler();
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B14] text-white p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-gray-400 mb-2">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Transactions
          </h1>

          <p className="text-gray-400 mt-2">
            Manage and track all your expenses in one place.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#9587FF] hover:bg-[#8473f5] text-white px-5 py-3 rounded-xl font-medium transition"
        >
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#151522] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">Total Transactions</p>
            <ReceiptText className="text-[#9587FF]" size={20} />
          </div>

          <h2 className="text-3xl font-bold mt-3">{total}</h2>
          <p className="text-xs text-gray-500 mt-1">
            All recorded expenses
          </p>
        </div>

        <div className="bg-[#151522] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">Showing on this page</p>
            <ReceiptText className="text-[#7FD3CF]" size={20} />
          </div>

          <h2 className="text-3xl font-bold mt-3">{expenses.length}</h2>
          <p className="text-xs text-gray-500 mt-1">
            Transactions per page: {limit}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#151522] border border-white/5 rounded-2xl p-4 mb-5">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search transactions by description..."
            className="w-full bg-[#0B0B14] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-sm text-white placeholder-gray-500 outline-none focus:border-[#9587FF] transition"
          />

          {search && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#151522] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="font-semibold text-lg">All Transactions</h2>
          <p className="text-sm text-gray-500 mt-1">
            Your recent spending activity
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#9587FF] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm mt-4">
              Loading transactions...
            </p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 rounded-2xl bg-[#9587FF]/10 flex items-center justify-center mb-4">
              <ReceiptText size={28} className="text-[#9587FF]" />
            </div>

            <h3 className="font-semibold text-lg">
              No transactions found
            </h3>

            <p className="text-gray-500 text-sm mt-2 text-center">
              {search
                ? "Try searching with a different description."
                : "Start tracking your spending by adding your first expense."}
            </p>

            {!search && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-5 flex items-center gap-2 bg-[#9587FF] hover:bg-[#8473f5] px-4 py-2.5 rounded-xl text-sm font-medium transition"
              >
                <Plus size={16} />
                Add Expense
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-white/5">
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((expense) => {
                  const isEditing = editingId === expense._id;
                  const categoryColor = getCategoryColor(
                    isEditing ? draft.category : expense.category
                  );

                  return (
                    <tr
                      key={expense._id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition"
                    >
                      {/* Description */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            value={draft.description}
                            onChange={(e) =>
                              setField("description", e.target.value)
                            }
                            className="w-full min-w-[160px] bg-[#0B0B14] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#9587FF]"
                          />
                        ) : (
                          <div>
                            <p className="font-medium text-gray-200">
                              {expense.description || "No description"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Expense
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select
                            value={draft.category}
                            onChange={(e) =>
                              setField("category", e.target.value)
                            }
                            className="bg-[#0B0B14] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#9587FF]"
                          >
                            {CATEGORIES.map((category) => (
                              <option
                                key={category.name}
                                value={category.name}
                              >
                                {category.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium"
                            style={{
                              color: categoryColor,
                              backgroundColor: `${categoryColor}20`,
                              border: `1px solid ${categoryColor}40`,
                            }}
                          >
                            {expense.category}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="date"
                            value={draft.date}
                            onChange={(e) =>
                              setField("date", e.target.value)
                            }
                            className="bg-[#0B0B14] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#9587FF] [color-scheme:dark]"
                          />
                        ) : (
                          <span className="text-sm text-gray-400">
                            {formatDate(expense.date)}
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={draft.amount}
                            onChange={(e) =>
                              setField("amount", e.target.value)
                            }
                            className="w-28 bg-[#0B0B14] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#9587FF]"
                          />
                        ) : (
                          <span className="font-semibold text-white">
                            ₹{Number(expense.amount).toLocaleString("en-IN")}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={saveEdit}
                                title="Save changes"
                                className="p-2 rounded-lg text-[#7FD3CF] hover:bg-[#7FD3CF]/10 transition"
                              >
                                <Check size={18} />
                              </button>

                              <button
                                onClick={cancelEdit}
                                title="Cancel editing"
                                className="p-2 rounded-lg text-gray-400 hover:bg-white/10 transition"
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(expense)}
                                title="Edit transaction"
                                className="p-2 rounded-lg text-gray-400 hover:text-[#9587FF] hover:bg-[#9587FF]/10 transition"
                              >
                                <Pen size={17} />
                              </button>

                              <button
                                onClick={() => deleteExpense(expense._id)}
                                title="Delete transaction"
                                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition"
                              >
                                <Trash size={17} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && expenses.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/5">
            <p className="text-sm text-gray-500">
              Showing {expenses.length} of {total} transactions
            </p>

            <div className="flex items-center gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-white/10 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span className="text-sm text-gray-400">
                Page <span className="text-white font-medium">{page}</span> of{" "}
                <span className="text-white font-medium">
                  {totalPages}
                </span>
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-white/10 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}