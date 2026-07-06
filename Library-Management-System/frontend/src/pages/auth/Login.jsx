import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Library, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { login, selectAuthLoading, selectAuthError, clearError }
    from "../../features/auth/authSlice.js";

// ── Validation schema ─────────────────────────────────────────────────────
const loginSchema = z.object({
    email:    z.string().email("Enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

const Login = () => {
    const dispatch  = useDispatch();
    const navigate  = useNavigate();
    const loading   = useSelector(selectAuthLoading);
    const error     = useSelector(selectAuthError);
    const [showPassword, setShowPassword] = useState(false);

    // clear any previous errors when component mounts
    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data) => {
        const result = await dispatch(login(data));
        if (login.fulfilled.match(result)) {
            navigate("/");   // DashboardRedirect handles role-based routing
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800
                        flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* ── Logo ──────────────────────────────────────────── */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center
                                    w-14 h-14 bg-blue-600 rounded-2xl mb-4">
                        <Library size={28} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        Library Management
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">
                        Sign in to your account
                    </p>
                </div>

                {/* ── Card ──────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-xl p-8">

                    {/* API error */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200
                                        rounded-lg text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2
                                               text-gray-400 pointer-events-none"
                                />
                                <input
                                    {...register("email")}
                                    type="email"
                                    placeholder="you@example.com"
                                    className={`
                                        w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm
                                        outline-none transition-colors
                                        ${errors.email
                                            ? "border-red-400 focus:border-red-500 bg-red-50"
                                            : "border-gray-300 focus:border-blue-500"
                                        }
                                    `}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2
                                               text-gray-400 pointer-events-none"
                                />
                                <input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className={`
                                        w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm
                                        outline-none transition-colors
                                        ${errors.password
                                            ? "border-red-400 focus:border-red-500 bg-red-50"
                                            : "border-gray-300 focus:border-blue-500"
                                        }
                                    `}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2
                                               text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword
                                        ? <EyeOff size={16} />
                                        : <Eye    size={16} />
                                    }
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700
                                       disabled:bg-blue-400 disabled:cursor-not-allowed
                                       text-white text-sm font-semibold rounded-lg
                                       transition-colors duration-150"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30
                                                     border-t-white rounded-full animate-spin" />
                                    Signing in…
                                </span>
                            ) : "Sign in"}
                        </button>

                    </form>

                    {/* Register link */}
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Register here
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
};

export default Login;