import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { token, login, register } = useContext(AuthContext);

  const [state, setState] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (state === "Sign Up") await register(name, email, password);
      else await login(email, password);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  const inputClass =
    "mt-1 w-full rounded border border-[#2E2E46] bg-[#0F0F1A] p-2 text-base text-[#F4F3FC] outline-none focus:border-[#8274EB]";

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex min-h-screen items-center bg-[#0B0B14]"
    >
      <div className="m-auto flex min-w-[340px] flex-col items-start gap-3 rounded-xl border border-[#2A2A40] bg-[#131320] p-8 text-sm text-[#C9C8DC] shadow-lg sm:min-w-96">
        <p className="text-2xl font-semibold text-[#F4F3FC]">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </p>
        <p>
          Please {state === "Sign Up" ? "create an account" : "log in"} to track
          your expenses
        </p>

        {state === "Sign Up" && (
          <div className="w-full">
            <label htmlFor="name">Full Name</label>
            <input id="name" className={inputClass} type="text" required
              value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}

        <div className="w-full">
          <label htmlFor="email">Email</label>
          <input id="email" className={inputClass} type="email" required
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="w-full">
          <label htmlFor="password">Password</label>
          <input id="password" className={inputClass} type="password" required
            minLength={state === "Sign Up" ? 10 : undefined}
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button type="submit" disabled={submitting}
          className="w-full rounded-md bg-[#9587FF] py-2 text-base font-bold text-[#15112D] disabled:opacity-60">
          {submitting ? "Please wait…" : state === "Sign Up" ? "Create Account" : "Login"}
        </button>

        <p>
          {state === "Sign Up" ? "Already have an account? " : "Create a new account? "}
          <button type="button" className="text-[#B8AEFF] underline"
            onClick={() => setState(state === "Sign Up" ? "Login" : "Sign Up")}>
            {state === "Sign Up" ? "Login here" : "Click here"}
          </button>
        </p>
      </div>
    </form>
  );
};

export default Login;