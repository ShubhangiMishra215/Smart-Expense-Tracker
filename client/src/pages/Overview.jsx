import React, { useContext, useState } from "react";
import QuickAdd from "../components/QuickAdd";
import AddExpenseModal from "../components/AddExpenseModal";
  import { AuthContext } from "../context/AuthContext";

const Overview = () => {
  const {user} = useContext(AuthContext);
  const [isAddOpen, setIsAddOpen] = useState(false);
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 py-5">
        <div>
          
          <p className="text-[13px] text-[#A9A8C0]">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="text-2xl font-bold text-[#F4F3FC]">
                Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
        </div>
        

        <div className="flex items-center gap-3">
          {/* bell button goes here later */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="h-11 rounded-xl border border-[#3A3560] bg-[#1B1830] px-[18px] text-sm font-semibold text-[#E4E0FF] transition-colors hover:bg-[#25213F]"
          >
            Add manually
          </button>
        </div>
      </header>
      <AddExpenseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <QuickAdd />
    </>
  );
};

export default Overview;
