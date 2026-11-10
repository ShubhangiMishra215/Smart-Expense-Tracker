import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";

import api from "../utils/api";
import { CATEGORIES } from "../constants/categories";

export default function BudgetModal({
  isOpen,
  onClose,
  onSaved,
  budgetToEdit, // null = create mode
  existingBudgets, // the statuses array
}) {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset the form every time the modal opens
  useEffect(() => {
    if (!isOpen) return;
    setCategory(budgetToEdit ? budgetToEdit.category : "");
    setLimit(budgetToEdit ? String(budgetToEdit.limit) : "");
  }, [isOpen, budgetToEdit]);

  if (!isOpen) return null;

  const isEdit = Boolean(budgetToEdit);
  const existing = existingBudgets.find((b) => b.category === category);
  const isUpdate = isEdit || Boolean(existing);

  const handleCategoryChange = (value) => {
    setCategory(value);
    // Picking a category that already has a budget prefills its limit
    const found = existingBudgets.find((b) => b.category === value);
    setLimit(found ? String(found.limit) : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!limit || Number(limit) <= 0) {
      toast.error("Please enter a limit greater than 0");
      return;
    }

    try {
      setSaving(true);
      await api.post("/budgets", { category, limit: Number(limit) });
      toast.success(isUpdate ? "Budget updated" : "Budget created");
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save budget");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full bg-[#0B0B14] border border-white/10 rounded-lg px-3 py-3 text-sm outline-none focus:border-[#9587FF]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#151522] border border-white/5 rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">
              {isEdit ? "Edit budget" : "Create category budget"}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Set a monthly spending limit for a category.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Category</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              disabled={isEdit}
              className={`${inputCls} disabled:opacity-60`}
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            {!isEdit && existing && (
              <p className="text-xs text-orange-400 mt-2">
                This category already has a budget. Saving will update its limit.
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Monthly limit (₹)
            </label>
            <input
              type="number"
              min="1"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="e.g. 5000"
              className={inputCls}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl text-sm text-gray-300 border border-white/10 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#1d1840] border border-white/10 hover:bg-[#262052] px-5 py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50"
            >
              {saving ? "Saving..." : isUpdate ? "Update budget" : "Save budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}