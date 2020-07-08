import reverse_throughput_process
import reverse_windows_scan
import asyncio
import websockets

tempfile = "./tempfile"
#server_ip = "202.90.158.168"
server_ip = "35.185.183.104"
handler = '10005'
throughput_port = '10011'
recv_window = 1000
mtu = "1460"
rtt = 16.034
connections = "1"
mss = "1080"

async def test():
    res =  await reverse_windows_scan.scan_process(
                         tempfile = tempfile, 
                         SERVER_IP = server_ip,
                         handler_port = handler,
                         throughput_port = throughput_port,
                         recv_window = recv_window,
                         mtu = mtu,
                         rtt = rtt,
                         connections = connections,
                         mss = mss)
    return res

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    group = asyncio.gather(test())
    all_groups = asyncio.gather(group)
    results = loop.run_until_complete(all_groups)
    loop.close()
    print(results)
