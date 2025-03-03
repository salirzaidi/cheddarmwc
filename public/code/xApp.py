import xapp_sdk as ric
import time
import os
import pdb
import sqlite3


conn = None



####################
#### MAC INDICATION CALLBACK
####################

#  MACCallback class is defined and derived from C++ class mac_cb
class MACCallback(ric.mac_cb):
    # Define Python class 'constructor'
    def __init__(self):
        # Call C++ base class constructor
        ric.mac_cb.__init__(self)
        self.db_name = "/home/syedzaidi/Desktop/dashboard/cheddarmwc/src/db/myLog.db"
        self.conn =  None
        self.oldtstamp = 0
        self.deltaT = 10
     
    # Override C++ method: virtual void handle(swig_mac_ind_msg_t a) = 0;

    def db_init(self):
        try:
            self.conn = sqlite3.connect(self.db_name,check_same_thread=False)
            print("Opened database successfully")
        except:
            print("Error in Opening the DB")

    
    
    def db_cleanup(self):
        try:
            self.conn.close()
            print("Closing db")
        except:
            print("Error in closing the DB")

    def db_insertMAC(self, stats, tstamp, mode):
        if mode:
        # Debug prints
            print(tstamp)
            print(stats.dl_aggr_tbs)
            print(stats.pucch_snr)
            print(stats.pusch_snr)
            print(stats.dl_aggr_prb)
            print(stats.ul_aggr_prb)
            print(stats.ul_bler)
            print(stats.dl_bler)
            print(stats.wb_cqi)
            print(stats.rnti)
            self.db_init()
            # Constructing the SQL insert query
            #insert_query = "INSERT INTO MAC_ST (tstamp, rnti_mac, dl_aggr_tbs, ul_aggr_tbs, pucch_snr, pusch_snr, dl_bler, ul_bler) VALUES ("+tstamp+",'"+str(stats.rnti)+"','"+str(stats.dl_aggr_tbs)+"','"+str(stats.ul_aggr_tbs)+"','"+str(stats.pucch_snr)+"','"+str(stats.pusch_snr)+"','"+str(stats.dl_bler)+"','"+str(stats.ul_bler)+"');"
            insert_query = """
                INSERT INTO MAC_ST (tstamp, rnti_mac, dl_aggr_tbs, ul_aggr_tbs, pucch_snr, pusch_snr, dl_bler, ul_bler, ul_aggr_prb, dl_aggr_prb)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?);
                """

            # Prepare the values to be inserted
            values = (
                tstamp,  # Ensure tstamp is already in the correct format (int or float depending on your database schema)
                stats.rnti,
                stats.dl_aggr_tbs,
                stats.ul_aggr_tbs,
                stats.pucch_snr,
                stats.pusch_snr,
                stats.dl_bler,
                stats.ul_bler,
                stats.ul_aggr_prb,
                stats.dl_aggr_prb
             )
            print(insert_query)
            
            cursor = self.conn.cursor()

            select_query = "SELECT COUNT(*) FROM MAC_ST WHERE tstamp = ?;"

            # Execute the SELECT query with the tstamp as the parameter
            cursor.execute(select_query, (tstamp,))

            # Fetch the result of the SELECT query (a single row with the count)
            existing_row_count = cursor.fetchone()[0]

            # Step 2: If no rows exist (existing_row_count == 0), proceed with the insert
            if existing_row_count == 0:
                try:
                    # Execute the insert query
                    if self.conn is not None:
                        self.conn.execute(insert_query,values)
                        self.conn.commit()
                        self.oldtstamp = tstamp
                        print("Sucessfully entered in db")
                    
                except sqlite3.Error as e:
                     # Catch SQLite-specific errors and print the exception message
                    print(f"SQLite Error: {e}")
                except Exception as e:
                    # Catch any other general exceptions
                    print(f"An error occurred: {e}")
            self.db_cleanup()
        

    def handle(self, ind):
        # Print swig_mac_ind_msg_t
        
        if len(ind.ue_stats) > 0:
            t_now = time.time_ns() / 1000.0
            t_mac = ind.tstamp / 1.0
            t_diff = t_now - t_mac
            print('MAC Indication tstamp = ' + str(t_mac) + ' latency = ' + str(t_diff) + ' μs')
            for i in range(len(ind.ue_stats)):
                self.db_insertMAC(ind.ue_stats[i],ind.tstamp,1)
        


            

####################
#### RLC INDICATION CALLBACK
####################

class RLCCallback(ric.rlc_cb):
    # Define Python class 'constructor'
    def __init__(self):
        # Call C++ base class constructor
        ric.rlc_cb.__init__(self)
    # Override C++ method: virtual void handle(swig_rlc_ind_msg_t a) = 0;
    def handle(self, ind):
        # Print swig_rlc_ind_msg_t
        if len(ind.rb_stats) > 0:
            t_now = time.time_ns() / 1000.0
            t_rlc = ind.tstamp / 1.0
            t_diff = t_now - t_rlc
            print('RLC Indication tstamp = ' + str(ind.tstamp) + ' latency = ' + str(t_diff) + ' μs')
            print('RLC rnti = '+ str(ind.rb_stats[0].rnti))
            #print('Buffer Size RX: '+ str(ind.rb_stats[0].rxbuf_occ_bytes))
            


####################
####  GENERAL 
####################

ric.init()


conn = ric.conn_e2_nodes()
assert(len(conn) > 0)
for i in range(0, len(conn)):
    print("Global E2 Node [" + str(i) + "]: PLMN MCC = " + str(conn[i].id.plmn.mcc))
    print("Global E2 Node [" + str(i) + "]: PLMN MNC = " + str(conn[i].id.plmn.mnc))

####################
#### MAC INDICATION
####################

mac_hndlr = []
for i in range(0, len(conn)):
    mac_cb = MACCallback()
    hndlr = ric.report_mac_sm(conn[i].id, ric.Interval_ms_10, mac_cb)
    mac_hndlr.append(hndlr)     
    time.sleep(1000)



####################
#### RLC INDICATION
####################

rlc_hndlr = []
for i in range(0, len(conn)):
    rlc_cb = RLCCallback()
    hndlr = ric.report_rlc_sm(conn[i].id, ric.Interval_ms_10, rlc_cb)
    rlc_hndlr.append(hndlr) 
    time.sleep(1000)



for i in range(0, len(mac_hndlr)):
    ric.rm_report_mac_sm(mac_hndlr[i])

for i in range(0, len(rlc_hndlr)):
    ric.rm_report_rlc_sm(rlc_hndlr[i])

# Avoid deadlock. ToDo revise architecture 
while ric.try_stop == 0:
    time.sleep(0)
    print("here")

print("Test finished")