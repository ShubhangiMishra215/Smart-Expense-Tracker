import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-page font-sans text-ink">
      <Sidebar />
      <main className="min-w-0 flex-1 px-10 pb-12 pt-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;