import asyncio
import websockets
import json
import random
import sys
from constants import *
import traceback
import normal_client, reverse_client

'''
    registers this client on to the server queue
    @PARAMS:
        mode_function   :   function object of the mode of choice.
                            start_normal_client for normal mode
                            start_reverse_client for reverse mode
        server_ip       :   IPv4 address of the server
'''
async def queue_client(mode_function, server_ip, client_hash, cir):
    socket = None
    results = None
    
    try:
        print("server IP: " + server_ip)
        async with websockets.connect("ws://"+server_ip+":"+str(QUEUE_PORT)) as socket:
            print("Sending client hash...")
            await socket.send(str(client_hash))
            #go signal
            current_turn = None
            f = None
            # while not "CURRENT_TURN" == current_turn: 
            while current_turn != str(0):
                print("BEFORE current_turn")
                print(current_turn)
                current_turn = await socket.recv()
                print("AFTER current_turn")
                print(current_turn)
                queue_placement_filename = "tempfiles/queue/queue_place"
                with open(queue_placement_filename, "w+") as f:
                    f.write(current_turn)

                # send current_turn data to api endpoint
            
            f.close()
            
            #await the function mode
            results = mode_function(server_ip, cir)
            results = await asyncio.wait_for(results, timeout=DEFAULT_TIMEOUT_VAL)
            
            await socket.send("done")
            print_this = await socket.recv()
            print(print_this)
    except:
        try:
            filename = "tempfiles/queue/queue_log"
            logf = open(filename,"a+")
            traceback.print_exc(file=logf)
            logf.close()
            await socket.close()
        except:
            pass
    
    return results



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
    print("retrieve_function: " + str(mode))
    if mode == NORMAL_MODE:
        return normal_client.start_normal_client
    elif mode == REVERSE_MODE:
        return reverse_client.start_reverse_test
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
        client_hash     :   the provided hash value of the client host
        cir             :   
    @RETURN:
        results         :   results of either the normal or reverse mode
                                process. Check the normal_client/reverse_client
                                modules for more details.
'''
def join_queue(mode, server_ip, client_hash, cir):
    print("join_queue")
    filename = "tempfiles/queue/queue_log"
    try:
        mode_function = retrieve_function(mode)
        loop = asyncio.get_event_loop()
        group = asyncio.gather(queue_client(mode_function, server_ip, client_hash, cir))
        all_groups = asyncio.gather(group)
        results = loop.run_until_complete(all_groups)
        #loop.close()
        return results
    except:
        try:
            logf = open(filename,"a+")
            traceback.print_exc(file=logf)
            logf.close()
        except:
            pass
    return

'''
    should only be used for testing,
    edit freely
'''
if __name__ == "__main__":
    results = join_queue(NORMAL_MODE, DEFAULT_SERVER, "random_hash", 10)
    #results = join_queue(REVERSE_MODE, DEFAULT_SERVER, "random_hash")
    #loop = asyncio.get_event_loop()
    #group = asyncio.gather(queue_client(normal_client.start_normal_client, sys.argv[1]))
    ##group = asyncio.gather(queue_client(reverse_client.start_reverse_test, sys.argv[1]))
    #all_groups = asyncio.gather(group)
    #results = loop.run_until_complete(all_groups)
    #loop.close()
    print(results)
