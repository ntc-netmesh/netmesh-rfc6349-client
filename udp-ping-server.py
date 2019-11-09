import socket
from datetime import datetime

def ping(connection, addr):
	connection.settimeout(5)

	for i in range(0,10):
		try:
			pad = ''
			for j in range(0,55):
				pad += '0'
			data = bytes(pad + str(i),'utf-8')
			connection.sendto(data,addr)
			start = datetime.now()
			
			if(connection.recv(1)):
				end = datetime.now()

				rtt = (end-start)
				print(rtt)

				#remove this if only average is sent
				connection.sendto(bytes(str(rtt),'utf-8'),addr)
				
		except socket.timeout as e:
			e = "Lost"
			print(e)
			break

def reverse_ping(connection, addr):
	while True:
		data, recv_addr = connection.recvfrom(56)
		connection.sendto(data,recv_addr)
		string = data.decode()
		print(string)

		if string == '9':
			break


if __name__ == "__main__":
	server = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
	server.bind(('', 5005))
	#server.listen(5)

	while True:
		#connection, address = server.accept()
		server.settimeout(None)
		buf, addr = server.recvfrom(1)
		buf = buf.decode()
		print(buf)
		if buf == "0":
			ping(server, addr)
		elif buf == "1":
			reverse_ping(server,addr)