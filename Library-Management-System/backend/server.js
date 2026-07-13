import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import app        from "./src/app.js";
import connectDB  from "./src/config/db.js";
import cron       from "node-cron";
import { Transaction } from "./src/models/transaction.model.js";

const PORT = process.env.PORT || 4000;

// ── Connect database ──────────────────────────────────────────────────────
connectDB();

// ── Cron job — mark overdue transactions daily at midnight ────────────────
// runs every day at 00:00
cron.schedule("0 0 * * *", async () => {
    try {
        const result = await Transaction.updateMany(
            {
                status:     "issued",
                dueDate:    { $lt: new Date() },
                returnDate: null,
            },
            { $set: { status: "overdue" } }
        );
        console.log(`[CRON] Overdue check: ${result.modifiedCount} transactions marked overdue`);
    } catch (error) {
        console.error("[CRON] Overdue check failed:", error.message);
    }
});

// ── Start server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`LMS API: http://localhost:${PORT}/api/v1/health`);
});