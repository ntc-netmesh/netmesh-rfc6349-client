import asyncio
import websockets
import json
import random
from constants import *
import normal_client, reverse_client

'''
    registers this client on to the server queue
    @PARAMS:
        mode_function   :   function object of the mode of choice.
                            start_normal_client for normal mode
                            start_reverse_client for reverse mode
'''
async def queue_client(mode_function):
    async with websockets.connect("ws://202.92.132.191:"+str(QUEUE_PORT)) as socket:
        await socket.send("asdffdafsf")
        #go signal
        port_num = await socket.recv()
        #await the function mode
        results = mode_function()
        results = await results
        print(results)
        await socket.send("done")
        print_this = await socket.recv()
        print(print_this)

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    #group = asyncio.gather(*[message(i) for i in range(1, 10)])
    group = asyncio.gather(queue_client(normal_client.start_normal_client))
    all_groups = asyncio.gather(group)
    results = loop.run_until_complete(all_groups)
    #loop.close()
