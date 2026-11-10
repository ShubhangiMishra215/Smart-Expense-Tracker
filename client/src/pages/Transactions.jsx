import { useEffect, useState } from "react";
import { Search, Pen, Trash, ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { toast } from "react-toastify";

import AddExpenseModal from "../components/AddExpenseModal";
import api from "../utils/api";
import { CATEGORIES, getCategoryColor } from "../constants/categories";

const emptyDraft = { amount: "", category: "", description: "", date: "" };

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
  const [draft, setDraft] = useState(emptyDraft);

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
      toast.error(error.response?.data?.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(getExpenseHandler, 400);
    return () => clearTimeout(timer);
  }, [page, limit, search]);

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (d.toDateString() === new Date().toDateString()) return "Today";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const startEdit = (expense) => {
    setEditingId(expense._id);
    setDraft({
      amount: expense.amount,
      category: expense.category,
      description: expense.description || "",
      date: expense.date ? new Date(expense.date).toISOString().slice(0, 10) : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const setField = (field, value) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

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
      toast.error(error.response?.data?.message || "Failed to update expense");
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success("Transaction deleted successfully");
      if (expenses.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        getExpenseHandler();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete transaction");
    }
  };

  const handleSearch = (value) => {
    cancelEdit();
    setSearch(value);
    setPage(1);
  };

  const goToPage = (newPage) => {
    cancelEdit();
    setPage(newPage);
  };

  const handleSaved = () => {
    setIsModalOpen(false);
    if (page !== 1) setPage(1);
    else getExpenseHandler();
  };

  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  const inputCls =
    "bg-[#0B0B14] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#9587FF]";

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[13px] text-gray-400 mb-1">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-gray-400 mt-5 text-sm">
            All your spending in one place. Search, review and manage it.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1d1840] border border-white/10 hover:bg-[#262052] px-5 py-3 rounded-xl text-sm font-semibold transition"
        >
          Add manually
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm mb-5">
        <Search
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by description"
          className="w-full bg-[#151522] border border-white/10 rounded-xl py-3 pl-11 pr-10 text-sm text-white placeholder-gray-500 outline-none focus:border-[#9587FF] transition"
        />
        {search && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Table card */}
      <div className="bg-[#151522] border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#9587FF] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm mt-4">Loading transactions...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-20 px-4 text-center">
            <h3 className="font-semibold text-lg">No transactions found</h3>
            <p className="text-gray-500 text-sm mt-2">
              {search
                ? "Try searching with a different description."
                : "Add your first expense to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-white/5">
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((expense) => {
                  const isEditing = editingId === expense._id;
                  const color = getCategoryColor(
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
                            onChange={(e) => setField("description", e.target.value)}
                            className={`${inputCls} w-full min-w-[160px]`}
                          />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                              style={{ color, backgroundColor: `${color}20` }}
                            >
                              {(expense.description || "?").charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-100">
                              {expense.description || "No description"}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select
                            value={draft.category}
                            onChange={(e) => setField("category", e.target.value)}
                            className={inputCls}
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c.name} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                            style={{
                              color,
                              backgroundColor: `${color}20`,
                              border: `1px solid ${color}40`,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: color }}
                            />
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
                            onChange={(e) => setField("date", e.target.value)}
                            className={`${inputCls} [color-scheme:dark]`}
                          />
                        ) : (
                          <span className="text-sm text-gray-300">
                            {formatDate(expense.date)}
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={draft.amount}
                            onChange={(e) => setField("amount", e.target.value)}
                            className={`${inputCls} w-28 text-right`}
                          />
                        ) : (
                          <span className="font-bold text-white">
                            −₹{Number(expense.amount).toLocaleString("en-IN")}
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
                                title="Save"
                                className="p-2 rounded-lg text-[#7FD3CF] hover:bg-[#7FD3CF]/10 transition"
                              >
                                <Check size={17} />
                              </button>
                              <button
                                onClick={cancelEdit}
                                title="Cancel"
                                className="p-2 rounded-lg text-gray-400 hover:bg-white/10 transition"
                              >
                                <X size={17} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(expense)}
                                title="Edit"
                                className="p-2 rounded-lg text-gray-400 hover:text-[#9587FF] hover:bg-[#9587FF]/10 transition"
                              >
                                <Pen size={16} />
                              </button>
                              <button
                                onClick={() => deleteExpense(expense._id)}
                                title="Delete"
                                className="p-2 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-red-400/10 transition"
                              >
                                <Trash size={16} />
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

        {/* Footer */}
        {!loading && expenses.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4">
            <p className="text-sm text-gray-400">
              Showing {rangeStart}–{rangeEnd} of {total}
            </p>

            <div className="flex items-center gap-3">
              <button
                disabled={page <= 1}
                onClick={() => goToPage(Math.max(1, page - 1))}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-white/10 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span className="text-sm text-gray-400">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => goToPage(Math.min(totalPages, page + 1))}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#1d1840] border border-white/10 text-sm font-semibold hover:bg-[#262052] disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}