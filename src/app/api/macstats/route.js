import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function GET(req, res) {
  try {
    const db = await open({
      filename: "src/db/myLog.db",
      driver: sqlite3.Database,
    });

    // Fetch latest records with distinct RNTIs (keeping only the latest 2-3 RNTIs)
    const latestRecords = await db.all(`
      WITH LatestData AS (
        SELECT * FROM mac_st
        ORDER BY tstamp DESC
        LIMIT 100  -- Fetch the last 100 records to ensure we get at least 2-3 RNTIs
      )
      SELECT * FROM LatestData
      WHERE rnti_mac IN (
        SELECT DISTINCT rnti_mac FROM LatestData
        LIMIT 3  -- Only keep up to 3 most recent RNTIs
      )
      ORDER BY tstamp ASC;  -- Keep trend correct
    `);

    await db.close();

    return Response.json({ success: true, data: latestRecords });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
