#!/bin/bash


#
#   THROUGHPUT TEST
#

while [ $# -gt 0 ]; do
  case "$1" in
    --data_sent=*)
      _data_sent="${1#*=}"
      ;;
    --ideal_thpt=*)
      _ideal_thpt="${1#*=}"
      ;;
    --ave_thpt=*)
      _ave_thpt="${1#*=}"
      ;;
    --base_rtt=*)
      _base_rtt="${1#*=}"
      ;;
    --ave_rtt=*)
      _ave_rtt="${1#*=}"
      ;;
    --retx_bytes=*)
      _retx_bytes="${1#*=}"
      ;;
    --dur=*)
      _dur="${1#*=}"
      ;;
    *)
      printf "***************************\n"
      printf "* Error: Invalid argument.*\n"
      printf "***************************\n"
      exit 1
  esac
  shift
done

if [[ -z "$_data_sent" || -z "$_ideal_thpt" || -z "$_ave_thpt" || -z "$_base_rtt" || -z "$_ave_rtt" || -z "$_retx_bytes" || -z "$_dur" ]]
then
echo "Throughput Analysis"
echo "Usage: ./analysis.sh --data_sent=<total_data_sent> --ideal_thpt=<ideal_thpt> --ave_thpt=<ave_thpt> --base_rtt=<baseline_rtt> --ave_rtt=<average_rtt> --retx_bytes=<retransmitted_bytes> "
echo "<data_sent> in MBytes"
echo "<ideal_thpt> subscription plan in Mbps"
echo "<ave_thpt> in Mbits/sec"
echo "<baseline_rtt> base rtt in ms"
echo "<average_rtt> average rtt in ms"
echo "<retransmitted_bytes> in Bytes"
echo "Example: ./analysis.sh --data_sent=125480068 --ideal_thpt=100 --ave_thpt=50 --base_rtt=20 --ave_rtt=30 --retx_bytes=4500 "
exit 1;

fi

touch ./thpt_extract.py
cat << EOF > thpt_extract.py
#!/usr/bin/python3
import sys
data_sent= float(sys.argv[1])
ideal_thpt= float(sys.argv[2])
actual_thpt= float(sys.argv[3])
base_rtt= float(sys.argv[4])
ave_rtt= float(sys.argv[5])
retx_bytes= float(sys.argv[6])
ideal_time = (data_sent * 8) / ideal_thpt
actual_time = float(sys.argv[7])
ttr = actual_time / ideal_time
buf_del = ( (ave_rtt - base_rtt) / base_rtt ) * 100
tcp_eff= ( ( (data_sent * 1000000) - retx_bytes) / (data_sent * 1000000) ) * 100
print("transfer_avg: " + str(actual_time) + " seconds")
print("transfer_ideal: " + str(ideal_time) + " seconds")
print("tcp_ttr: " + str(ttr))
print("buffer_delay: " + str(buf_del)+"%")
print("tcp_efficiency: " + str(tcp_eff)+"%")

EOF
chmod +x thpt_extract.py
python3 thpt_extract.py $_data_sent $_ideal_thpt $_ave_thpt $_base_rtt $_ave_rtt $_retx_bytes $_dur
rm thpt_extract.py

