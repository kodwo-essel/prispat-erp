/**
 * Fix Supply Receipt Arrival Dates
 * ---------------------------------
 * Some supply receipts and their associated Supply audit records were saved
 * with an incorrect arrivalDate of 2026-12-03 (03 Dec 2026) instead of
 * 2026-03-12 (12 Mar 2026).
 *
 * This script:
 *  1. Finds all SupplyReceipt docs where arrivalDate is 2026-12-03
 *  2. Updates them (and their linked Supply records) to 2026-03-12
 *  3. Updates the linked Finance expense records as well
 *
 * Run with:  npx tsx scripts/fix-supply-dates.ts
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const WRONG_DATE = new Date("2026-12-03T00:00:00.000Z");
const RIGHT_DATE = new Date("2026-03-12T00:00:00.000Z");

// ── Inline minimal schemas (avoid importing Next.js app code) ────────────────

const ReceiptItemSchema = new mongoose.Schema({}, { strict: false });
const SupplyReceiptSchema = new mongoose.Schema(
    { arrivalDate: Date, receiptNumber: String, invoiceId: String },
    { strict: false, timestamps: true }
);
const SupplySchema = new mongoose.Schema({ arrivalDate: Date }, { strict: false, timestamps: true });
const FinanceSchema = new mongoose.Schema({ date: Date, txId: String }, { strict: false, timestamps: true });

const SupplyReceipt =
    mongoose.models.SupplyReceipt || mongoose.model("SupplyReceipt", SupplyReceiptSchema);
const Supply =
    mongoose.models.Supply || mongoose.model("Supply", SupplySchema);
const Finance =
    mongoose.models.Finance || mongoose.model("Finance", FinanceSchema);

async function run() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI not set in .env.local");

    console.log("🔌 Connecting to MongoDB…");
    await mongoose.connect(uri);
    console.log("✅ Connected.\n");

    // ── 1. Find affected receipts ──────────────────────────────────────────
    const wrongStart = new Date("2026-12-03T00:00:00.000Z");
    const wrongEnd = new Date("2026-12-03T23:59:59.999Z");

    const affected = await SupplyReceipt.find({
        arrivalDate: { $gte: wrongStart, $lte: wrongEnd }
    }).lean();

    if (affected.length === 0) {
        console.log("ℹ️  No supply receipts with the wrong date were found. Nothing to do.");
        await mongoose.disconnect();
        return;
    }

    console.log(`Found ${affected.length} receipt(s) to fix:\n`);
    for (const r of affected) {
        console.log(
            `  • ${(r as any).receiptNumber}  |  arrivalDate: ${(r as any).arrivalDate.toISOString()}  |  invoiceId: ${(r as any).invoiceId ?? "none"}`
        );
    }
    console.log();

    // ── 2. Fix SupplyReceipt documents ────────────────────────────────────
    const receiptResult = await SupplyReceipt.updateMany(
        { arrivalDate: { $gte: wrongStart, $lte: wrongEnd } },
        { $set: { arrivalDate: RIGHT_DATE } }
    );
    console.log(`✅ SupplyReceipt: updated ${receiptResult.modifiedCount} document(s).`);

    // ── 3. Fix linked Supply (audit) records ──────────────────────────────
    const supplyResult = await Supply.updateMany(
        { arrivalDate: { $gte: wrongStart, $lte: wrongEnd } },
        { $set: { arrivalDate: RIGHT_DATE } }
    );
    console.log(`✅ Supply audit: updated ${supplyResult.modifiedCount} document(s).`);

    // ── 4. Fix linked Finance expense records ─────────────────────────────
    const financeResult = await Finance.updateMany(
        { date: { $gte: wrongStart, $lte: wrongEnd } },
        { $set: { date: RIGHT_DATE } }
    );
    console.log(`✅ Finance: updated ${financeResult.modifiedCount} document(s).`);

    console.log("\n🎉 Migration complete. All dates corrected to 2026-03-12 (12 Mar 2026).");
    await mongoose.disconnect();
}

run().catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
});
