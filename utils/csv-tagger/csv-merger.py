from datetime import datetime
import pandas as pd 
import sys

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
Convert a date string to a datetime object for easier comparison

"""
def epoch_to_datetime(ts):
	# figure out how to fit milliseconds
	try:
		return datetime.fromtimestamp(int(ts) / 1000.0)
	except OverflowError:
		return ts

"""
Give a line in the source file, find the proper timestamp to tag it
with.

assumption made that the first pointer in the tagging_data is 
less than everything timestamp in the csv data.
"""
def find_prev_source(dt,ptr,data):
	ptr = ptr if ptr >= 0 else 0

	while dt >= data['start_time'][ptr]:
		if ptr == len(data) - 1:
			return ptr
		ptr += 1
	return ptr - 1


"""
Given the source CSV and the tagging data csv, tag the source csv
"""
def perform_tagging(source,tagging_data):
	tagged_array = []
	tag_ptr = 0
	src_ptr = 0
	while src_ptr < len(source):
		tag_ptr = find_prev_source(source[src_ptr],tag_ptr,tagging_data)
		if tag_ptr == -1:
			tagged_array.append(tagging_data['state'][0])
		else:
			tagged_array.append(tagging_data['state'][tag_ptr])
		src_ptr += 1
	return tagged_array

def main():
	msg1= "Path to source csv file that you will be attaching actions to:"
	msg2= "Path to timestamp + actions csv file:"
	msg3= "Path to output file:"
	fname1 = get_file_name(1,msg1)
	fname2 = get_file_name(2,msg2)
	fname3 = get_file_name(3,msg2)

	contents = pd.read_csv(fname1)
	tagging_data = pd.read_csv(fname2)

	clean_timestamps = [epoch_to_datetime(i) for i in contents['epoch (ms)']]
	tagging_data['start_time'] = [epoch_to_datetime(i) for i in tagging_data['start_time']]

	tagged_data = perform_tagging(clean_timestamps,tagging_data)
	contents['state'] = tagged_data
	contents.to_csv(fname3,index=False)


if __name__ == '__main__':
	main()