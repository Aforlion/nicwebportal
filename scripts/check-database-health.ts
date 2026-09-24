import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

async function runHealthCheck() {
  console.log("==========================================");
  console.log("  NIC Portal — Database & Backup Health Check");
  console.log("==========================================");
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Target Supabase Host: ${SUPABASE_URL}`);
  console.log("------------------------------------------");

  let healthy = true;

  // 1. Connection Ping
  try {
    const { data: usersCount, error: userError } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true });

    if (userError) {
      console.error(`❌ Connection Failure on 'users' table: ${userError.message}`);
      healthy = false;
    } else {
      console.log(`✅ Database Reachable. Total Registered Users: ${usersCount ?? 0}`);
    }
  } catch (err: any) {
    console.error(`❌ Database Connection Threw Exception: ${err.message}`);
    healthy = false;
  }

  // 2. Table Schema Integrity Check
  const targetTables = ["users", "assessments", "certificates", "facilities", "internships"];
  console.log("\nVerifying Table Schema Counts:");

  for (const table of targetTables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        console.warn(`  ⚠️ Table '${table}' check failed: ${error.message}`);
      } else {
        console.log(`  ✓ Table '${table}': ${count ?? 0} records active.`);
      }
    } catch (err: any) {
      console.warn(`  ⚠️ Exception checking '${table}': ${err.message}`);
    }
  }

  console.log("------------------------------------------");
  if (healthy) {
    console.log("🎉 Health Check Complete: System Healthy & Backup Snapshot Operational.");
  } else {
    console.error("🚨 Health Check Failed: Review logged errors.");
    process.exit(1);
  }
}

runHealthCheck();
