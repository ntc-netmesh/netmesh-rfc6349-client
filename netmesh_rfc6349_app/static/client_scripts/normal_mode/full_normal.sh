#!/bin/bash

IP=202.90.158.6
PORT=12000

# Auth
GLOBAL_DATA='{"username":"user1","mode":"normal"}'

TOKEN=$(curl --header "Content-Type: application/json"\
  --request POST --silent \
  --data '{"username":"user1","password":"user1"}' \
  $IP:$PORT/api/auth/login \
  | jq -r '.access_token'
)

# EXECUTE MTU

#MTU_PORT=$(curl --header "Content-Type: application/json"\
#  --header "Authorization: Bearer $TOKEN"\
#  --request GET --silent \
#  --data $GLOBAL_DATA \
#  $IP:$PORT/api/normal/mtu \
#  | jq -r '.port'
#)
#
#echo "MTU port : $MTU_PORT";
#sleep 1;

MTU=$(./mtu.sh wlp3s0 $IP)
echo "MTU: $MTU"
MTU=1500

MTU_POST=$(curl --header "Content-Type: application/json"\
  --header "Authorization: Bearer $TOKEN"\
  --request POST --silent \
  --data "{\"username\":\"user1\",\"mode\":\"normal\",\"mtu\":$MTU}" \
  $IP:$PORT/api/normal/mtu
)

sleep 1;

# EXECUTE RTT

#RTT_PORT=$(curl --header "Content-Type: application/json"\
#  --header "Authorization: Bearer $TOKEN"\
#  --request GET --silent \
#  --data $GLOBAL_DATA \
#  $IP:$PORT/api/normal/rtt \
#  | jq -r '.port'
#)
#
#echo "RTT port : $RTT_PORT";
#sleep 1;

RTT=$(./rtt.sh wlp3s0 $IP)
echo "RTT: $RTT"
RTT=20


RTT_POST=$(curl --header "Content-Type: application/json"\
  --header "Authorization: Bearer $TOKEN"\
  --request POST --silent \
  --data "{\"username\":\"user1\",\"mode\":\"normal\",\"rtt\":$RTT}" \
  $IP:$PORT/api/normal/rtt
)

sleep 1;

# EXECUTE BDP

RTT=20
BDP_PORT=$(curl --header "Content-Type: application/json"\
  --header "Authorization: Bearer $TOKEN"\
  --request GET --silent \
  --data "{\"username\":\"user1\",\"mode\":\"normal\",\"rtt\":$RTT}" \
  $IP:$PORT/api/normal/bdp \
  | jq -r '.port'
)

echo "BDP port : $BDP_PORT";
sleep 1;

BDP=$(./bb.sh $RTT $IP $BDP_PORT normal)
echo "BDP RESULTS: $BDP"
BDP=2000000
RWND=3000
BB=1000

BDP_POST=$(curl --header "Content-Type: application/json"\
  --header "Authorization: Bearer $TOKEN"\
  --request POST --silent \
  --data "{\"username\":\"user1\",\"mode\":\"normal\",\"bb\":$BB,\"bdp\":$BDP,\"rwnd\":$RWND}" \
  $IP:$PORT/api/normal/bdp
)

sleep 1;

# EXECUTE THPT

BDP=2000000
RWND=3000
BB=1000
RTT=20
THPT_PORT=$(curl --header "Content-Type: application/json"\
  --header "Authorization: Bearer $TOKEN"\
  --request GET --silent \
  --data "{\"username\":\"user1\",\"mode\":\"normal\",\"rtt\":$RTT,\"rwnd\":$RWND}" \
  $IP:$PORT/api/normal/thpt \
  | jq -r '.port'
)

echo "THPT port : $THPT_PORT";
sleep 1;

THPT=$(./thpt.sh $RTT $RWND 1000 $IP $THPT_PORT normal)
echo "THPT RESULTS: $THPT"
THPT_AVG=900
THPT_IDEAL=1000
TRANSFER_AVG=10
TRANSFER_IDEAL=9
TCP_TTR=1.1
AVE_RTT=40
BUF_DEL=100

THPT_POST=$(curl --header "Content-Type: application/json"\
  --header "Authorization: Bearer $TOKEN"\
  --request POST --silent \
  --data "{\"username\":\"user1\",\"mode\":\"normal\",\"thpt_avg\":$THPT_AVG,\"thpt_ideal\":$THPT_IDEAL,\"transfer_avg\":$TRANSFER_AVG,\"transfer_ideal\":$TRANSFER_IDEAL,\"tcp_ttr\":$TCP_TTR,\"ave_rtt\":$AVE_RTT,\"buf_del\":$BUF_DEL}" \
  $IP:$PORT/api/normal/thpt
)
sleep 1;

curl --header "Content-Type: application/json"\
  --header "Authorization: Bearer $TOKEN"\
  --request GET --silent \
  $IP:$PORT/api/normal/


