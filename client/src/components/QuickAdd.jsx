import { Pen, ScanLine, Trash } from "lucide-react";
import React, { useRef, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import { CATEGORY_NAMES, getCategoryColor } from "../constants/categories";

const inputCls =
  "h-11 w-full rounded-[10px] border border-line bg-input px-3 text-[15px] text-ink outline-none focus:border-accent [color-scheme:dark]";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const QuickAdd = () => {
  const [text, setText] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});
  const fileRef = useRef(null);

  const busy = loading || scanning;

  const parseHandler = async () => {
    if (!text.trim()) {
      toast.error("Describe your expense first");
      return;
    }
    setLoading(true);
    setScanError(null);
    try {
      const { data } = await api.post("/expenses/parse", { text });
      setExpenses(data.expenses);
      setAlerts(data.alerts);
      setText("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const scanHandler = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }

    const formData = new FormData();
    formData.append("receipt", file);

    setScanning(true);
    setScanError(null);
    try {
      const { data } = await api.post("/expenses/scan", formData);
      setExpenses([data.expense]);
      setAlerts(data.alerts);
      toast.success("Expense saved from receipt");
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      if (error.response?.status === 422) {
        setScanError({ fileName: file.name, message });
      } else {
        toast.error(message);
      }
    } finally {
      setScanning(false);
    }
  };

  const deleteHandler = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((exp) => exp._id !== id));
      toast.success("Expense deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete");
    }
  };

  const startEdit = (expense) => {
    setEditingId(expense._id);
    setDraft({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date.slice(0, 10),
    });
  };

  const saveEdit = async () => {
    try {
      const { data } = await api.patch(`/expenses/${editingId}`, {
        ...draft,
        amount: Number(draft.amount),
      });
      setExpenses((prev) =>
        prev.map((exp) => (exp._id === editingId ? data.expense : exp)),
      );
      setEditingId(null);
      toast.success("Expense updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update");
    }
  };

  const setField = (field) => (e) =>
    setDraft((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <section
      aria-label="Quick add"
      className="flex flex-col gap-4 rounded-[18px] border border-line bg-card p-6 text-ink"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Quick add</h2>
        <span className="text-[13px] text-muted">
          Type it the way you'd say it, or scan a receipt
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 basis-80 flex-col gap-1.5">
          <label
            htmlFor="qa"
            className="text-[13px] font-semibold text-nav-active-ink"
          >
            Describe your expense
          </label>
          <input
            id="qa"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !busy && parseHandler()}
            disabled={busy}
            placeholder="Paid 450 for dinner yesterday"
            className="h-[52px] w-full rounded-xl border border-accent bg-input px-4 text-base text-ink outline-none placeholder:text-muted/60 disabled:opacity-60"
          />
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <button
            onClick={parseHandler}
            disabled={busy}
            className="h-[52px] cursor-pointer rounded-xl bg-accent px-6 text-[15px] font-bold text-accent-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Parsing" : "Parse"}
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={scanHandler}
          />
          <button
            onClick={() => fileRef.current.click()}
            disabled={busy}
            className="flex h-[52px] cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-hover px-5 text-[15px] font-semibold text-ink hover:bg-nav-active disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ScanLine size={18} aria-hidden="true" />
            Scan receipt
          </button>
        </div>
      </div>

      {scanning && (
        <div className="flex flex-col gap-1 rounded-[14px] border border-dashed border-line bg-input px-[18px] py-4">
          <div className="text-sm font-semibold">Reading your receipt</div>
          <div className="text-[13px] text-muted">
            This can take up to 15 seconds.
          </div>
        </div>
      )}

      {scanError && (
        <div className="flex flex-col gap-3 rounded-[14px] border border-danger/40 bg-danger/10 px-[18px] py-4">
          <div className="text-[13px] text-muted">
            {scanError.fileName}. Nothing was saved.
          </div>
          <div className="text-sm font-semibold text-danger">
            We couldn't find the amount or date
          </div>
          <div className="text-[13px] text-muted">
            Try a clearer photo with the whole receipt in frame.
          </div>
          <div>
            <button
              onClick={() => fileRef.current.click()}
              className="h-11 cursor-pointer rounded-[10px] bg-danger px-4 text-sm font-bold text-page"
            >
              Try another photo
            </button>
          </div>
        </div>
      )}

      {expenses.map((expense) => {
        const isEditing = editingId === expense._id;
        const color = getCategoryColor(expense.category);

        return (
          <div
            key={expense._id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-line-soft bg-page px-[18px] py-4"
          >
            {isEditing ? (
              <>
                <div className="grid flex-1 basis-80 grid-cols-2 gap-3">
                  <input
                    type="number"
                    aria-label="Amount"
                    value={draft.amount}
                    onChange={setField("amount")}
                    className={inputCls}
                  />
                  <select
                    aria-label="Category"
                    value={draft.category}
                    onChange={setField("category")}
                    className={inputCls}
                  >
                    {CATEGORY_NAMES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    aria-label="Date"
                    value={draft.date}
                    onChange={setField("date")}
                    className={inputCls}
                  />
                  <input
                    type="text"
                    aria-label="Description"
                    value={draft.description}
                    onChange={setField("description")}
                    className={inputCls}
                  />
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setEditingId(null)}
                    className="h-11 cursor-pointer rounded-[10px] border border-line px-[18px] text-sm font-semibold text-ink hover:bg-hover"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="h-11 cursor-pointer rounded-[10px] bg-accent px-5 text-sm font-bold text-accent-ink"
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <div className="text-xs text-muted">Amount</div>
                    <div className="text-[22px] font-bold tracking-tight">
                      ₹{Number(expense.amount).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-muted">Category</div>
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        color,
                        backgroundColor: `${color}20`,
                        border: `1px solid ${color}40`,
                      }}
                    >
                      {expense.category}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Date</div>
                    <div className="text-[15px] font-semibold">
                      {formatDate(expense.date)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Description</div>
                    <div className="text-[15px] font-semibold">
                      {expense.description}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(expense)}
                    aria-label="Edit expense"
                    className="cursor-pointer rounded-lg p-2 text-muted hover:bg-accent/10 hover:text-accent"
                  >
                    <Pen size={17} />
                  </button>
                  <button
                    onClick={() => deleteHandler(expense._id)}
                    aria-label="Delete expense"
                    className="cursor-pointer rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash size={17} />
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}

      {alerts.length > 0 &&
        alerts.map((a) => {
          const over = a.status === "exceeded";
          return (
            <div
              key={a.category}
              className={`flex flex-col gap-1 rounded-xl border px-3.5 py-3 ${
                over
                  ? "border-danger/40 bg-danger/10"
                  : "border-warning/40 bg-warning/10"
              }`}
            >
              <div
                className={`text-sm font-semibold ${
                  over ? "text-danger" : "text-warning"
                }`}
              >
                {a.category} budget{" "}
                {over ? "exceeded" : `at ${Math.round(a.percentUsed)}%`}
              </div>
              <div className="text-[13px] text-muted">
                {over
                  ? `₹${a.spent - a.limit} over your ₹${a.limit} limit this month`
                  : `₹${a.limit - a.spent} left of ₹${a.limit} this month`}
              </div>
            </div>
          );
        })}
    </section>
  );
};

export default QuickAdd;