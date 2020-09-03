import asyncio
import websockets
import json
import random
import sys
import threading
import time
from constants import *
import traceback
import normal_client, reverse_client
import eel


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
        socket = await websockets.connect("ws://"+server_ip+":"+str(QUEUE_PORT))
        print("Sending client hash...")
        await socket.send(str(client_hash))
        #go signal
        current_turn = await socket.recv()
        f = None
        print(" #########################################################################################################")
        print("CURRENT TURN: ",current_turn)
        try:
            current_turn = int(current_turn)
            #print("set_queue : ",current_queue_place)
            eel.open_queue_dialog()
            eel.set_queue(current_turn)
        except:
            pass

        # while not "CURRENT_TURN" == current_turn: 
        print("ENTERING WHILE LOOP")
        while current_turn != "CURRENT_TURN":
            try:
                print("BEFORE current_turn")
                print(current_turn)
                current_turn = await socket.recv()
                print("AFTER current_turn")
                print(current_turn)
            except:
                print("reconnecting")
                socket = await websockets.connect("ws://"+server_ip+":"+str(QUEUE_PORT))
                print("SENDING CLIENT HASH")
                await socket.send(str(client_hash))

        eel.printprogress("Waiting for Server...")
        eel.close_queue_dialog()
        print(current_turn,"\n")
        print("Exited loop")
        results = mode_function(server_ip, cir)
        results = await asyncio.wait_for(results, timeout=DEFAULT_TIMEOUT_VAL)

        print("results")
        print(results)
        
        await socket.send("done")
        print_this = await socket.recv()
        print(print_this)
        await socket.close()
    except:
        traceback.print_exc()
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
        print("exited Try join Queue")
        #loop.close()
        return results
    except:
        traceback.print_exc()
        print("entered except join Queue")
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
    results = join_queue(REVERSE_MODE, DEFAULT_SERVER, "random_hash", 10)
    #results = join_queue(REVERSE_MODE, DEFAULT_SERVER, "random_hash")
    #loop = asyncio.get_event_loop()
    #group = asyncio.gather(queue_client(normal_client.start_normal_client, sys.argv[1]))
    ##group = asyncio.gather(queue_client(reverse_client.start_reverse_test, sys.argv[1]))
    #all_groups = asyncio.gather(group)
    #results = loop.run_until_complete(all_groups)
    #loop.close()
    print(results)
