import React, { useEffect, useState } from "react";
import { Pen, Trash } from "lucide-react";
import { toast } from "react-toastify";

import api from "../utils/api";
import AddExpenseModal from "../components/AddExpenseModal";
import BudgetModal from "../components/BudgetModal";
import { getCategoryColor } from "../constants/categories";

// Outside the component: created once, not on every render
const STATUS_STYLES = {
  ok: { bar: null, text: "text-gray-400", message: null },
  warning: {
    bar: "#F59E5B",
    text: "text-orange-400",
    message: "Almost at your limit",
  },
  exceeded: { bar: "#F87171", text: "text-red-400", message: "Over budget" },
};

const formatINR = (value) => `₹${value.toLocaleString("en-IN")}`;

const primaryBtn =
  "bg-[#1d1840] border border-white/10 hover:bg-[#262052] px-5 py-3 rounded-xl text-sm font-semibold transition";

const Budgets = () => {
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState([]);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState(null);

  const getBudgetStatus = async () => {
    try {
      const { data } = await api.get("/budgets/status");
      setStatuses(data.statuses);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBudgetStatus();
  }, []);

  const handleExpenseSaved = () => {
    setIsExpenseModalOpen(false);
    getBudgetStatus();
  };

  const openCreate = () => {
    setBudgetToEdit(null);
    setIsBudgetModalOpen(true);
  };

  const openEdit = (item) => {
    setBudgetToEdit(item);
    setIsBudgetModalOpen(true);
  };

  const handleBudgetSaved = () => {
    setIsBudgetModalOpen(false);
    setBudgetToEdit(null);
    getBudgetStatus();
  };

  const deleteBudget = async (category) => {
    if (!window.confirm(`Delete the ${category} budget?`)) return;
    try {
      await api.delete(`/budgets/${encodeURIComponent(category)}`);
      toast.success("Budget deleted");
      getBudgetStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete budget");
    }
  };

  const totalLimit = statuses.reduce((sum, item) => sum + item.limit, 0);
  const totalSpent = statuses.reduce((sum, item) => sum + item.spent, 0);
  const totalPercent =
    totalLimit === 0 ? 0 : Math.round((totalSpent / totalLimit) * 100);

  const today = new Date();
  const lastDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const remainingDays = lastDate.getDate() - today.getDate();

  const isOverTotal = totalSpent > totalLimit;
  const remainingTotal = Math.abs(totalLimit - totalSpent);

  const alertCount = statuses.filter(
    (item) => item.status === "warning" || item.status === "exceeded",
  ).length;

  const cardCls = "bg-[#151522] border border-white/5 rounded-2xl";

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[13px] text-gray-400 mb-1">
            {today.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Budgets & limits
          </h1>
          <p className="text-gray-400 mt-5 text-sm">
            Set category-wise limits and catch overspending before it happens.
          </p>
        </div>

        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className={primaryBtn}
        >
          Add expense
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#9587FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm mt-4">Loading budgets...</p>
        </div>
      ) : statuses.length === 0 ? (
        <div className={`${cardCls} py-20 px-4 text-center`}>
          <h3 className="font-semibold text-lg">No budgets yet</h3>
          <p className="text-gray-500 text-sm mt-2">
            Set a monthly limit for a category to start tracking.
          </p>
          <button onClick={openCreate} className={`${primaryBtn} mt-5`}>
            Create category budget
          </button>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
            <div className={`${cardCls} p-6`}>
              <p className="text-sm text-gray-400">Total monthly limit</p>
              <div className="text-3xl font-bold mt-4">
                {formatINR(totalLimit)}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Across {statuses.length}{" "}
                {statuses.length === 1 ? "category" : "categories"}
              </p>
            </div>

            <div className={`${cardCls} p-6`}>
              <p className="text-sm text-gray-400">Spent so far</p>
              <div className="text-3xl font-bold mt-4">
                {formatINR(totalSpent)}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                <span className="text-emerald-400 font-semibold">
                  {totalPercent}%
                </span>{" "}
                of total limit
              </p>
            </div>

            <div className={`${cardCls} p-6`}>
              <p className="text-sm text-gray-400">Remaining</p>
              <div
                className={`text-3xl font-bold mt-4 ${
                  isOverTotal ? "text-red-400" : ""
                }`}
              >
                {formatINR(remainingTotal)}
              </div>
              <p
                className={`text-xs mt-3 ${
                  isOverTotal ? "text-red-400" : "text-gray-500"
                }`}
              >
                {isOverTotal
                  ? "over budget"
                  : `${remainingDays} days left in month`}
              </p>
            </div>

            <div className={`${cardCls} p-6`}>
              <p className="text-sm text-gray-400">Budget alerts</p>
              <div className="text-3xl font-bold mt-4">{alertCount}</div>
              <p
                className={`text-xs font-semibold mt-3 ${
                  alertCount > 0 ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {alertCount > 0 ? "Needs attention" : "All on track"}
              </p>
            </div>
          </div>

          {/* Category cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {statuses.map((item) => {
              const isOver = item.spent > item.limit;
              const diff = Math.abs(item.limit - item.spent);
              const style = STATUS_STYLES[item.status] || STATUS_STYLES.ok;
              const categoryColor = getCategoryColor(item.category);
              const barColor = style.bar || categoryColor;
              const barWidth = Math.min(item.percentUsed, 100);

              return (
                <div key={item.category} className={`${cardCls} p-6`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">{item.category}</p>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(item)}
                        title="Edit limit"
                        className="p-2 rounded-lg text-gray-400 hover:text-[#9587FF] hover:bg-[#9587FF]/10 transition"
                      >
                        <Pen size={15} />
                      </button>
                      <button
                        onClick={() => deleteBudget(item.category)}
                        title="Delete budget"
                        className="p-2 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-red-400/10 transition"
                      >
                        <Trash size={15} />
                      </button>
                      <div
                        className="w-9 h-9 ml-1 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{
                          color: categoryColor,
                          backgroundColor: `${categoryColor}20`,
                        }}
                      >
                        {item.category.charAt(0)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      {formatINR(item.spent)}
                    </span>
                    <span className="text-xs text-gray-500">
                      / {formatINR(item.limit)}
                    </span>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-white/10 mt-4 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>

                  <p className={`text-xs mt-3 ${style.text}`}>
                    {Math.round(item.percentUsed)}% used ·{" "}
                    {isOver
                      ? `${formatINR(diff)} over`
                      : style.message || `${formatINR(diff)} remaining`}
                  </p>
                </div>
              );
            })}
          </div>

          <button onClick={openCreate} className={primaryBtn}>
            + Create category budget
          </button>
        </>
      )}

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSaved={handleExpenseSaved}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setBudgetToEdit(null);
        }}
        onSaved={handleBudgetSaved}
        budgetToEdit={budgetToEdit}
        existingBudgets={statuses}
      />
    </>
  );
};

export default Budgets;