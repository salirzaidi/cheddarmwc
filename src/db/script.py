import sqlite3
import time
import random

DB_PATH = "myLog.db"

# RNTIs for the three devices
RNTIS = ["40001", "40002", "40003"]

# Function to generate a random RNTI (5-digit number)
def random_rnti():
    return random.choice(RNTIS)  # Select one of the three RNTIs

# Function to generate a random MAC_ST record
def generate_random_entry(rnti):
    return (
        int(time.time() * 1e6),  # Match 15-digit timestamp (microseconds)
        rnti,  # Use the specific RNTI passed to the function
        str(random.randint(35000, 50000)),  # DL Aggregate TBS (string)
        str(random.randint(25000, 45000)),  # UL Aggregate TBS (string)
        str(round(random.uniform(-20, 30), 1)),  # PUCCH SNR (string)
        str(round(random.uniform(-20, 30), 1)),  # PUSCH SNR (string)
        str(f"{random.uniform(1e-10, 1e-5):.14f}"),  # DL BLER (string, 14 decimals)
        str(f"{random.uniform(1e-10, 1e-5):.14f}"),  # UL BLER (string, 14 decimals)
        str(random.randint(3000, 4000)),  # UL Aggregate PRB (string)
        str(random.randint(900, 1100)),  # DL Aggregate PRB (string)
    )

# Insert data into SQLite database
def insert_data():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create a flag to keep track of whether the RNTIs should be active or paused
    active_rntis = {rnti: True for rnti in RNTIS}

    while True:
        # Randomly select which RNTI to insert data for
        for rnti in RNTIS:
            # Simulate RNTI switching off by using a random probability
            if random.random() < 0.1:  # 10% chance to pause data for this RNTI
                active_rntis[rnti] = False
            else:
                active_rntis[rnti] = True

            if active_rntis[rnti]:
                record = generate_random_entry(rnti)
                cursor.execute(
                    """INSERT INTO MAC_ST 
                    (tstamp, rnti_mac, dl_aggr_tbs, ul_aggr_tbs, pucch_snr, pusch_snr, dl_bler, ul_bler, ul_aggr_prb, dl_aggr_prb) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    record,
                )
                conn.commit()
                print(f"Inserted for RNTI {rnti}: {record}")

        time.sleep(1)  # Insert every second for active RNTIs

    conn.close()

if __name__ == "__main__":
    insert_data()
