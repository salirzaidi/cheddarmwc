import sqlite3 from 'sqlite3';
import path from 'path';
import { NextResponse } from 'next/server';

const DB_PATH = path.join(process.cwd(), 'src', 'db', 'myLog.db');

// Function to clear all data from the MAC_ST table
function clearAllData() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error("Error opening database:", err.message);
        reject("Failed to connect to the database.");
      }
    });

    db.run('DELETE FROM MAC_ST', (err) => {
      if (err) {
        console.error("Error deleting data:", err.message);
        reject("Failed to delete data.");
      } else {
        console.log("All data cleared from MAC_ST.");
        resolve("All data cleared.");
      }
    });

    db.close();  // Close the connection
  });
}

// Function to handle the POST request to clear all data
export async function POST(req) {
  try {
    // Call the function to clear data
    const message = await clearAllData();
    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
