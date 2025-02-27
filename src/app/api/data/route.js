import sqlite3 from 'sqlite3';
import path from 'path';
import { NextResponse } from 'next/server';

const DB_PATH = path.join(process.cwd(), 'src', 'db', 'myLog.db');

// Store the interval ID globally for stopping insertion later
let insertionInterval;

// RNTIs for the three devices
const RNTIS = ['40001', '40002', '40003'];

// Function to generate random MAC_ST entry
function generateRandomEntry(rnti) {
  const timestamp = Math.floor(Date.now() * 1e3); // timestamp in microseconds
  return [
    timestamp, // tstamp
    rnti, // rnti_mac
    (Math.floor(Math.random() * (50000 - 35000 + 1)) + 35000).toString(), // dl_aggr_tbs
    (Math.floor(Math.random() * (45000 - 25000 + 1)) + 25000).toString(), // ul_aggr_tbs
    (Math.random() * (30 - -20) + -20).toFixed(1).toString(), // pucch_snr
    (Math.random() * (30 - -20) + -20).toFixed(1).toString(), // pusch_snr
    (Math.random() * (1e-5 - 1e-10) + 1e-10).toFixed(14).toString(), // dl_bler
    (Math.random() * (1e-5 - 1e-10) + 1e-10).toFixed(14).toString(), // ul_bler
    (Math.floor(Math.random() * (4000 - 3000 + 1)) + 3000).toString(), // ul_aggr_prb
    (Math.floor(Math.random() * (1100 - 900 + 1)) + 900).toString(), // dl_aggr_prb
  ];
}

// Function to handle the POST request for starting/stopping the data insertion
export async function POST(req) {
  const { toggle } = await req.json(); // Parse toggle state from request body

  // If toggle is "on", start data insertion
  if (toggle === 'on') {
    if (!insertionInterval) {
      const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error("Error opening database:", err.message);
          return NextResponse.json({ error: "Failed to connect to the database." }, { status: 500 });
        }
      });

      const activeRntis = { '40001': true, '40002': true, '40003': true }; // All RNTIs active initially

      // Start data insertion every second
      insertionInterval = setInterval(() => {
        for (const rnti of RNTIS) {
          if (Math.random() < 0.1) {
            activeRntis[rnti] = false;
          } else {
            activeRntis[rnti] = true;
          }

          if (activeRntis[rnti]) {
            const record = generateRandomEntry(rnti);
            db.run(
              `INSERT INTO MAC_ST (tstamp, rnti_mac, dl_aggr_tbs, ul_aggr_tbs, pucch_snr, pusch_snr, dl_bler, ul_bler, ul_aggr_prb, dl_aggr_prb) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              record,
              (err) => {
                if (err) {
                  console.error("Error inserting data:", err.message);
                  clearInterval(insertionInterval);
                  return NextResponse.json({ error: "Failed to insert data." }, { status: 500 });
                }
                console.log(`Inserted data for RNTI ${rnti}:`, record);
              }
            );
          }
        }
      }, 1000); // Insert data every second for active RNTIs

      return NextResponse.json({ message: "Data generation started." });
    } else {
      return NextResponse.json({ message: "Data generation already running." });
    }
  } else if (toggle === 'off') {
    // If toggle is "off", stop data insertion
    if (insertionInterval) {
      clearInterval(insertionInterval);  // Stop the insertion interval
      insertionInterval = null;  // Reset interval ID
      return NextResponse.json({ message: "Data generation stopped." });
    } else {
      return NextResponse.json({ message: "No data generation process is running." });
    }
  }

  // If toggle state is invalid
  return NextResponse.json({ error: "Invalid toggle state." }, { status: 400 });
}
