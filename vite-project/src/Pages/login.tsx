import { AtSignIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../Context/AppContext";
import { Toaster } from "react-hot-toast";

const Login = () => {
  const [state, setState] = useState("login");
  const [userName, setUserName] = useState("");
  const [email, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setISSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login, signup, user } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setISSubmitting(true);

    try {
      if (state === "login") {
        await login({ email, password });
      } else {
        await signup({ username: userName, email, password });
      }
    } finally {
      setISSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <>
      <Toaster />

      <main className="login-page-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2 className="text-3xl font-medium text-gray-900 dark:text-white">
            {state === "login" ? "Sign in" : "Sign up"}
          </h2>

          <p className="mt-2 text-sm text-gray-500/90 dark:text-gray-400">
            {state === "login"
              ? "Please enter email and password to access"
              : "Please enter your details to create an account."}
          </p>

          {state !== "login" && (
            <div className="mt-4">
              <label className="font-medium text-sm text-gray-700 dark:text-gray-300">
                User Name
              </label>

              <div className="relative mt-2">
                <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4.5" />
                <input
                  onChange={(e) => setUserName(e.target.value)}
                  value={userName}
                  type="text"
                  placeholder="Enter user name"
                  className="login-input"
                  required
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="font-medium text-sm text-gray-700 dark:text-gray-300">
              Email
            </label>

            <div className="relative mt-2">
              <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4.5" />
              <input
                onChange={(e) => setUserEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Enter user Email"
                className="login-input"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="font-medium text-sm text-gray-700 dark:text-gray-300">
              Password
            </label>

            <div className="relative mt-2">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4.5" />
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                placeholder="Enter user Password"
                className="login-input pr-10"
                required
                type={showPassword ? "text" : "password"}
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="login-button"
          >
            {isSubmitting
              ? "Signing..."
              : state === "login"
              ? "Login"
              : "Sign up"}
          </button>

          {state === "login" ? (
            <p className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
              Don’t have an account{" "}
              <button
                type="button"
                className="ml-1 cursor-pointer text-green-600 hover:underline"
                onClick={() => setState("sign-up")}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
              Already have an account{" "}
              <button
                type="button"
                className="ml-1 cursor-pointer text-green-600 hover:underline"
                onClick={() => setState("login")}
              >
                Login
              </button>
            </p>
          )}
        </form>
      </main>
    </>
  );
};

export default Login;

