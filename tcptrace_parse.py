import re
import pandas

def read_tcp():
	input_file = open("output.csv", "r")
	data = input_file.readlines()
	input_file.close()

	#for i in data():

def test():
	result = pandas.read_csv("out.csv")
	print(result)

if __name__ == "__main__":
	test()