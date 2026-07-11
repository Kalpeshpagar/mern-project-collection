// ── Format as Indian Rupees ───────────────────────────────────────────────
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "—";
    return new Intl.NumberFormat("en-IN", {
        style:    "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};
// formatCurrency(1240)   → "₹1,240"
// formatCurrency(1240.5) → "₹1,240.50"
// formatCurrency(0)      → "₹0"

// ── Plain number with commas ──────────────────────────────────────────────
export const formatNumber = (num) => {
    if (num === null || num === undefined) return "—";
    return new Intl.NumberFormat("en-IN").format(num);
};
// formatNumber(12400) → "12,400"

// ── Fine calculation helper ───────────────────────────────────────────────
export const calculateFine = (daysOverdue, perDayRate = 2) => {
    if (!daysOverdue || daysOverdue <= 0) return 0;
    return daysOverdue * perDayRate;
};