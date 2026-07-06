import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Library, Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import { register as registerUser, selectAuthLoading,
         selectAuthError, clearError } from "../../features/auth/authSlice.js";

// ── Validation schema ─────────────────────────────────────────────────────
const registerSchema = z.object({
    name:            z.string().min(2, "Name must be at least 2 characters"),
    email:           z.string().email("Enter a valid email address"),
    phone:           z.string().min(10, "Enter a valid phone number").optional()
                       .or(z.literal("")),
    password:        z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path:    ["confirmPassword"],   // attach error to confirmPassword field
    }
);

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loading  = useSelector(selectAuthLoading);
    const error    = useSelector(selectAuthError);
    const [showPassword,        setShowPassword]        = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(registerSchema) });

    const onSubmit = async (data) => {
        // strip confirmPassword — backend doesn't need it
        const { confirmPassword, ...userData } = data;
        const result = await dispatch(registerUser(userData));
        if (registerUser.fulfilled.match(result)) {
            navigate("/login");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800
                        flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center
                                    w-14 h-14 bg-blue-600 rounded-2xl mb-4">
                        <Library size={28} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        Create Account
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">
                        Register as a library member
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200
                                        rounded-lg text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        {/* Name */}
                        <FormField
                            label="Full name"
                            error={errors.name}
                            icon={User}
                        >
                            <input
                                {...register("name")}
                                type="text"
                                placeholder="John Doe"
                                className={inputClass(errors.name)}
                            />
                        </FormField>

                        {/* Email */}
                        <FormField
                            label="Email address"
                            error={errors.email}
                            icon={Mail}
                        >
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="you@example.com"
                                className={inputClass(errors.email)}
                            />
                        </FormField>

                        {/* Phone */}
                        <FormField
                            label="Phone number (optional)"
                            error={errors.phone}
                            icon={Phone}
                        >
                            <input
                                {...register("phone")}
                                type="tel"
                                placeholder="9876543210"
                                className={inputClass(errors.phone)}
                            />
                        </FormField>

                        {/* Password */}
                        <FormField
                            label="Password"
                            error={errors.password}
                            icon={Lock}
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2
                                               text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            }
                        >
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                placeholder="Min. 8 characters"
                                className={inputClass(errors.password)}
                            />
                        </FormField>

                        {/* Confirm password */}
                        <FormField
                            label="Confirm password"
                            error={errors.confirmPassword}
                            icon={Lock}
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2
                                               text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword
                                        ? <EyeOff size={16} />
                                        : <Eye    size={16} />
                                    }
                                </button>
                            }
                        >
                            <input
                                {...register("confirmPassword")}
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Repeat your password"
                                className={inputClass(errors.confirmPassword)}
                            />
                        </FormField>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700
                                       disabled:bg-blue-400 disabled:cursor-not-allowed
                                       text-white text-sm font-semibold rounded-lg
                                       transition-colors duration-150 mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30
                                                     border-t-white rounded-full animate-spin" />
                                    Creating account…
                                </span>
                            ) : "Create account"}
                        </button>

                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
};

// ── Reusable form field wrapper ───────────────────────────────────────────
// keeps each field DRY — label + icon + error message in one place
const FormField = ({ label, error, icon: Icon, children, rightElement }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <Icon
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2
                               text-gray-400 pointer-events-none"
                />
            )}
            {children}
            {rightElement}
        </div>
        {error && (
            <p className="mt-1 text-xs text-red-500">{error.message}</p>
        )}
    </div>
);

// ── Input class helper ────────────────────────────────────────────────────
const inputClass = (error) => `
    w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm
    outline-none transition-colors
    ${error
        ? "border-red-400 focus:border-red-500 bg-red-50"
        : "border-gray-300 focus:border-blue-500"
    }
`;

export default Register;