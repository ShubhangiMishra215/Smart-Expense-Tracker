import { useState } from "react";
import { toast } from "react-toastify";
import api from "../utils/api";
import { CATEGORY_NAMES } from "../constants/categories";

const emptyForm = { amount: "", category: "Food", description: "", date: "" };

export default function AddExpenseModal({ isOpen, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setForm(emptyForm);
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const amount = Number(form.amount);
    if (!amount || amount < 0.01) {
      setError("Amount must be at least 0.01");
      return;
    }

    const body = { amount, category: form.category };
    if (form.description.trim()) body.description = form.description.trim();
    if (form.date) body.date = form.date; // leave the key out when empty

    try {
      setLoading(true);
      const res = await api.post("/expenses", body);
      toast.success("Expense saved");
      (res.data.alerts || []).forEach((a) =>
        toast.warning(a.message ?? String(a)),
      );
      onSaved?.(res.data.expense);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-xl border border-line bg-input px-3 text-ink outline-none focus:border-accent [color-scheme:dark]";

  const labelClass =
    "flex flex-col gap-1 text-sm font-semibold text-nav-active-ink";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-line bg-card p-6 text-ink"
      >
        <h2 className="text-lg font-bold">Add expense</h2>

        <label className={labelClass}>
          Amount (₹)
          <input
            name="amount"
            type="number"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Category
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className={inputClass}
          >
            {CATEGORY_NAMES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Description (optional)
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Date (optional, defaults to today)
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className={inputClass}
          />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="h-11 rounded-xl border border-line px-5 font-semibold text-ink hover:bg-hover"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl bg-accent px-5 font-bold text-accent-ink disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}