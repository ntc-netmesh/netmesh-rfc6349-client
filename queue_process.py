import asyncio
import websockets
import json
import random
import sys
from constants import *
import normal_client, reverse_client

'''
    registers this client on to the server queue
    @PARAMS:
        mode_function   :   function object of the mode of choice.
                            start_normal_client for normal mode
                            start_reverse_client for reverse mode
        server_ip       :   IPv4 address of the server
'''
async def queue_client(mode_function, server_ip):
    async with websockets.connect("ws://"+server_ip+":"+str(QUEUE_PORT)) as socket:
        await socket.send("asdffdafsf")
        #go signal
        port_num = await socket.recv()
        #await the function mode
        results = mode_function(server_ip)
        results = await results
        print(results)
        await socket.send("done")
        print_this = await socket.recv()
        print(print_this)

'''
    returns an awaitable async coroutine based on the mode value passed
    @PARAMS:
        mode            :   selected from two constant values declared
                                in the constants module which indicate
                                the mode:
                                NORMAL_MODE for normal mode
                                REVERSE_MODE for reverse mode
    @RETURN:
        normal          :   coroutine for normal mode
        reverse         :   coroutine for reverse mode
'''
def retrieve_function(mode):
    if mode == NORMAL_MODE:
        return normal_client.start_normal_client
    elif mode == REVERSE_MODE:
        return reverse_mode.start_reverse_test
    return

'''
    wrapper function to be evoked by the client gui to join the 
        queue and start the test based on available modes
    @PARAMS:
        mode            :   selected from two constant values declared
                                in the constants module which indicate
                                the mode:
                                NORMAL_MODE for normal mode
                                REVERSE_MODE for reverse mode
        server_ip       :   IPv4 address of the server
    @RETURN:
        results         :   results of either the normal or reverse mode
                                process. Check the normal_client/reverse_client
                                modules for more details.
'''
def join_queue(mode, server_ip):
    try:
        mode_function = retrieve_function(mode)
        loop = asyncio.get_event_loop()
        group = asyncio.gather(queue_client(mode_function, server_ip))
        all_groups = asyncio.gather(group)
        results = loop.run_until_complete(all_groups)
        loop.close()
        return results
    except:
        pass
    return

'''
    should only be used for testing,
    edit freely
'''
if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    #group = asyncio.gather(queue_client(normal_client.start_normal_client, sys.argv[1]))
    group = asyncio.gather(queue_client(reverse_client.start_reverse_test, sys.argv[1]))
    all_groups = asyncio.gather(group)
    results = loop.run_until_complete(all_groups)
    loop.close()
    print(results)
