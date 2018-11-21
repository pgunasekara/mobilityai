from datetime import datetime
import pandas as pd 
import sys

"""
Used for testing purposes, returns a sample (time,action) list	
"""
def get_test_partitions():
	return [["2018-11-11T17:56:25.078","STANDING"],
		["2018-11-11T17:56:28.078","SITTING"],
		["2018-11-11T17:56:30.326","CRYING"],
		["2018-11-11T17:56:31.078","STANDING"]]

"""
Attempt to extract filename from the command line, ask user for it 
if none found, and then do basic validation.
"""
def get_file_name(pos,msg):
	# extract for argv
	fname = None

	if pos < len(sys.argv):
		fname = sys.argv[pos]

	while not fname:
		fname = input(msg)

	# validate that this is proper file
	return fname

"""
Read CSV and put it into Pandas DF object
"""
def get_file_contents(fn):
	return pd.read_csv(fn) 

"""
Convert a date string to a datetime object for easier comparison

"""
def timestamp_to_datetime(ts):
	# figure out how to fit milliseconds
	try:
		return datetime.strptime(ts, '%Y-%m-%dT%H:%M:%S.%f')
	except ValueError:
		return ts

"""
Give a line in the source file, find the proper timestamp to tag it
with.

assumption made that the first pointer in the tagging_data is 
less than everything timestamp in the csv data.
"""
def find_prev_source(ln,ptr,data):
	dt = ln[0] # get datetime

	while dt >= data[ptr][0]:
		if ptr == len(data) - 1:
			return ptr
		ptr += 1
	return ptr - 1


"""
Given the source CSV and the tagging data csv, tag the source csv
"""
def perform_tagging(source,tagging_data):
	tag_ptr = 0
	src_ptr = 0
	while src_ptr < len(source):
		tag_ptr = find_prev_source(source[src_ptr],tag_ptr,tagging_data)
		source[src_ptr].append(tagging_data[tag_ptr][1])
		src_ptr += 1

def main():
	msg1= "Path to source csv file that you will be attaching actions to:"
	msg2= "Path to timestamp + actions csv file:"
	msg3= "Path to output file:"
	fname1 = get_file_name(1,msg1)
	fname2 = get_file_name(2,msg2)
	fname3 = get_file_name(3,msg2)

	contents = pd.read_csv(fname1)
	tagging_data = pd.read_csv(fname2)


	contents['occurence_time'] = [timestamp_to_datetime(i) for i in contents['occurence_time']]
	tagging_data['start_time'] = [timestamp_to_datetime(i) for i in tagging_data['start_time']]

	getTaggedData = perform_tagging(contents,tagging_data)
	contents.to_csv(fname,index=False)


if __name__ == '__main__':
	main()