// components/AddExpenseModal.jsx
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
    "h-11 w-full rounded-xl border border-[#2E2E46] bg-[#0F0F1A] px-3 text-[#F4F3FC] outline-none focus:border-[#8274EB]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-[#3A3560] bg-[#171527] p-6 text-[#F4F3FC]"
      >
        <h2 className="text-lg font-bold">Add expense</h2>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[#D5CFFF]">
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

        <label className="flex flex-col gap-1 text-sm font-semibold text-[#D5CFFF]">
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

        <label className="flex flex-col gap-1 text-sm font-semibold text-[#D5CFFF]">
          Description (optional)
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-semibold text-[#D5CFFF]">
          Date (optional, defaults to today)
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className={inputClass}
          />
        </label>

        {error && <p className="text-sm text-[#F7B3A2]">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="h-11 rounded-xl border border-[#3A3560] px-5 font-semibold text-[#E4E0FF]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl bg-[#9587FF] px-5 font-bold text-[#15112D] disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}