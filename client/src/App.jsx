import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import { ToastContainer } from "react-toastify";
import Transactions from "./pages/Transactions";

const Page = ({ title }) => <h1 className="text-2xl font-bold">{title}</h1>;

const App = () => {
  return (
    
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Overview />} />
        <Route path="/transactions" element={<Transactions/>} />
        <Route path="/budgets" element={<Page title="Budgets" />} />
        <Route path="/recurring" element={<Page title="Recurring" />} />
        <Route path="/groups" element={<Page title="Groups" />} />
        <Route path="/summary" element={<Page title="AI summary" />} />
      </Route>
    </Routes>
  );
};

export default App;