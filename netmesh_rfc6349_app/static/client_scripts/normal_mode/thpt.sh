#!/bin/bash


#
#   THROUGHPUT TEST
#

while [ $# -gt 0 ]; do
  case "$1" in
    --mtu=*)
      _mtu="${1#*=}"
      ;;
    --rtt=*)
      _rtt="${1#*=}"
      ;;
    --rwnd=*)
      _rwnd="${1#*=}"
      ;;
    --ideal=*)
      _ideal="${1#*=}"
      ;;
    --ip=*)
      _ip="${1#*=}"
      ;;
    --port=*)
      _port="${1#*=}"
      ;;
    --mode=*)
      _mode="${1#*=}"
      ;;
    *)
      printf "***************************\n"
      printf "* Error: Invalid argument.*\n"
      printf "***************************\n"
      exit 1
  esac
  shift
done

if [[ -z "$_mtu" || -z "$_rtt" || -z "$_ip" || -z "$_port" || -z "$_rwnd" || -z "$_ideal" || -z "$_mode" ]]
then
echo "Normal Mode Throughput Test"
echo "Usage: ./thpt.sh --rtt=<rtt> --mtu=<mtu> --rwnd=<rwnd> --ideal=<ideal> --ip=<ip> --port=<port> --mode=<mode>"
echo "<rtt> in milliseconds"
echo "<rwnd> in KB"
echo "<ideal> subscription plan in Mbps"
echo "<ip> in server ip"
echo "<port> provided port by server"
echo "<mode> normal/reverse"
echo "Example: ./thpt.sh --mtu=1500 --rtt=30 --rwnd=2000 --ideal=100 --ip=127.0.0.1 --port=8888 --mode=normal"
exit 1;

fi

# iperf3 
# | extract results line 

# ORIGINAL IMPLEMENTATION (SUBJECT TO REVIEW)
#THPT=$(iperf3 --client $_ip --port $_port --time 5 --window $_rwndK --format m --bandwidth 100M)
if [[ "$_mode" = "normal" ]];
then
  _mode="";
elif [[ "$_mode" = "reverse" ]];
then
  _mode="--reverse";
else
  echo "invalid mode"
  exit 1;
fi

OUT=$(iperf3 $_mode --client $_ip --port $_port --time 10 --omit 5 --format m --json \
  | jq '.end | { "bytes" : .sum_sent.bytes, "thpt" : .sum_sent.bits_per_second, "retx": .sum_sent.retransmits } + { "mean_rtt" : .streams[].sender.mean_rtt }') 

AVE_THPT=$(echo $OUT | jq '.thpt/1000000')
DATA_SENT=$(echo $OUT | jq '.bytes/1000000')
AVE_RTT=$(echo $OUT | jq '.mean_rtt/1000')
RETX_BYTES=$(echo $OUT | jq ".retx * $_mtu")

if [[ -z "$AVE_THPT" || -z "$DATA_SENT" || -z "$AVE_RTT" ]]
then
echo "Throughput Test failed"
exit 1;
fi

echo "Total Data Sent: $DATA_SENT Mbytes"
echo "Total Data Retransmitted: $RETX_BYTES Bytes"
echo "thpt_avg: $AVE_THPT Mbits/sec"
echo "thpt_ideal: $_ideal Mbits/sec"

if [[ "$_mode" = "" ]];
then
  echo "ave_rtt: $AVE_RTT ms"
elif [[ "$_mode" = "reverse" ]];
then
  # retrieve job_id data
  echo "ave_rtt: Reverse Mode ave_rtt should be retrieved from server separately"
else
  echo "invalid mode"
  exit 1;
fi

#touch thpt_extract.py
#cat << EOF > thpt_extract.py
#
#import sys
#data_sent= float(sys.argv[1])
#ideal_thpt= float(sys.argv[2])
#actual_thpt= float(sys.argv[3])
#base_rtt= float(sys.argv[4])
#ave_rtt= float(sys.argv[5])
#retx_bytes= float(sys.argv[6])
#ideal_time = data_sent * 8 / ideal_thpt
#actual_time = 10
#ttr = actual_time / ideal_time
#buf_del = ( (ave_rtt - base_rtt) / base_rtt ) * 100
#tcp_eff= ( ( (data_sent*1000000) - retx_bytes) / (data_sent*1000000) ) * 100
#print("transfer_avg: 10 seconds")
#print("transfer_ideal: " + str(ideal_time)+" seconds")
#print("tcp_ttr: " + str(ttr))
#print("buffer_delay: " + str(buf_del)+"%")
#print("tcp_efficiency: " + str(tcp_eff)+"%")
#
#EOF
#
#python thpt_extract.py $DATA_SENT $_ideal $AVE_THPT $_rtt $AVE_RTT $RETX_BYTES
#rm thpt_extract.py

