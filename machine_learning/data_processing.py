import sys
import pandas as pd
from sklearn import preprocessing
import numpy as np
from random import randint

def create_training_set(root,files):
    df = pd.read_csv(root+files[0])
    for i in range(1,len(files)):
        df = df.append(pd.read_csv(root+files[i]))
    return df

def preprocess_sensor_data(accelerometer_csv, gyroscope_csv):
    #print("Processing accelerometer")
    accelerometer_csv = accelerometer_csv.sort_values(by=['epoch (ms)'])
    accel2 = preprocessing.normalize(accelerometer_csv[['x-axis (g)','y-axis (g)','z-axis (g)']])
    accelerometer_data = np.concatenate((accelerometer_csv[['epoch (ms)', 'elapsed (s)']], accel2), axis=1)
    accelerometer_csv = pd.DataFrame(data=accelerometer_data[0:,0:],    # values
                index=[i for i in range(1, len(accelerometer_data) + 1)],    # 1st column as index
                columns=['epoch (ms)', 'elapsed (s)', 'x-axis (g)','y-axis (g)','z-axis (g)'])

    #print("Processing gyro")
    gyroscope_csv = gyroscope_csv.sort_values(by=['epoch (ms)'])
    gyro2 = preprocessing.normalize(gyroscope_csv[['x-axis (deg/s)', 'y-axis (deg/s)', 'z-axis (deg/s)']])
    gyroscope_data = np.concatenate((gyroscope_csv[['epoch (ms)', 'elapsed (s)']], gyro2), axis=1)
    gyroscope_csv = pd.DataFrame(data=gyroscope_data[0:,0:],    # values
                index=[i for i in range(1, len(gyroscope_data) + 1)],    # 1st column as index
                columns=['epoch (ms)', 'elapsed (s)', 'x-axis (deg/s)','y-axis (deg/s)','z-axis (deg/s)'])

    #print("Windowifying accelerometer")
    accelerometer_windows = windowify(2500, 500, accelerometer_csv, accelerometer_stats)
    accel_df = pd.DataFrame.from_records(accelerometer_windows)
    
    #print("Windowifying gyro")
    gyroscope_windows = windowify(2500, 500, gyroscope_csv, gyroscope_stats)
    gyro_df = pd.DataFrame.from_records(gyroscope_windows)

    #print("Merging")
    mergeable_series_lst = build_mergeable_dataframes(accel_df,gyro_df)
    mergeable_df = pd.DataFrame.from_records(mergeable_series_lst)
    typecast_map = {"epoch_end":"int64","epoch_start":"int64","epoch_length":"int64"}
    for i in typecast_map.keys():
        mergeable_df[i] = mergeable_df[i].astype(typecast_map[i])
    
    accel_gyro_df = pd.merge(accel_df,mergeable_df,on=['epoch_start','epoch_end','epoch_length'])

    return accel_gyro_df

def windowify(size, step, dataset, stats_func):
    # Get the first timestamp
    start = dataset['epoch (ms)'].iloc[0]
    
    #index of the starting timestamp
    start_index = 0
    
    #index of the beginning of the next step
    step_index = 0
    
    #current index
    i = 0
    
    #stores all the windows
    windows = []
    
    #length of the dataset
    dataset_length = dataset['epoch (ms)'].count()
    
    while i < dataset_length:
        optimal_step = start + step
        min_step_distance = sys.maxsize
        #while we haven't reached the end of the dataset and we still have no completed an entire window
        while i < dataset_length and start + size >= dataset['epoch (ms)'].iloc[i]:
            #Find the closest entry to where the step _would_ be
            if abs(optimal_step - dataset['epoch (ms)'].iloc[i]) < min_step_distance:
                step_index = i
                min_step_distance = abs(optimal_step - dataset['epoch (ms)'].iloc[i])
            i += 1
            
        #we have a window of duration size that starts at index start_index and ends at i
        window_frame = dataset[start_index:i]
        
        #calculate some information about the window and store it
        windows.append(stats_func(window_frame))
        
        if i == dataset_length:
            break
        
        if dataset['epoch (ms)'].iloc[i] - dataset['epoch (ms)'].iloc[i-1] > size * 2:
            step_index = i + 1

        #start the next window
        i = step_index
        start_index = step_index
        start = dataset['epoch (ms)'].iloc[i]
        
    return windows

def is_contained_by(absorbing_row,merging_row):
    return absorbing_row['epoch_start'] < merging_row['epoch_start'] and \
        absorbing_row['epoch_end'] > merging_row['epoch_end']

def get_merge_distance(absorbing_row,merging_row):
    start_dist = abs(absorbing_row['epoch_start'] - merging_row['epoch_start'])
    end_dist = abs(absorbing_row['epoch_end'] - merging_row['epoch_end'])
    return start_dist + end_dist
  
def merge_rows(absorbing_row,merging_row):
    return absorbing_row[['epoch_start','epoch_length','epoch_end']].astype('int64').append(merging_row[4:]).to_dict()

def build_mergeable_dataframes(df1,df2):
    res = []
    df1_ptr,df2_ptr = 0,0
    while df2_ptr < df2['epoch_start'].count():
        row_to_merge = df2.iloc[df2_ptr]
        if is_contained_by(df1.iloc[df1_ptr],row_to_merge):
            res.append(merge_rows(df1.iloc[df1_ptr],row_to_merge))
        else:
            #display(df1_ptr,df2_ptr,df1['epoch_start'].count())
            distToPrev = get_merge_distance(df1.iloc[df1_ptr],row_to_merge)
            nxt_ptr = df1_ptr + 1 if df1_ptr + 1 < df1['epoch_start'].count() else df1_ptr
            distToNext = get_merge_distance(df1.iloc[nxt_ptr],row_to_merge)
            
            if distToPrev < distToNext:
                res.append(merge_rows(df1.iloc[df1_ptr],row_to_merge))
            else:
                res.append(merge_rows(df1.iloc[nxt_ptr],row_to_merge))
                df1_ptr=nxt_ptr
        df2_ptr += 1
    return res

def accelerometer_stats(window_frame):
    return {
        "accel_x_avg": window_frame["x-axis (g)"].mean(),
        "accel_x_max": window_frame["x-axis (g)"].max(),
        "accel_x_min": window_frame["x-axis (g)"].min(),
        "accel_x_var": window_frame["x-axis (g)"].var(),
        
        "accel_y_avg": window_frame["y-axis (g)"].mean(),
        "accel_y_max": window_frame["y-axis (g)"].max(),
        "accel_y_min": window_frame["y-axis (g)"].min(),
        "accel_y_var": window_frame["y-axis (g)"].var(),
        
        "accel_z_avg": window_frame["z-axis (g)"].mean(),
        "accel_z_max": window_frame["z-axis (g)"].max(),
        "accel_z_min": window_frame["z-axis (g)"].min(),
        "accel_z_var": window_frame["z-axis (g)"].var(),
        
        "epoch_start": window_frame["epoch (ms)"].min(),
        "epoch_end": window_frame["epoch (ms)"].max(),
        "epoch_length": window_frame["epoch (ms)"].max() - window_frame["epoch (ms)"].min()
    }

def gyroscope_stats(window_frame):
    return {
        "gyro_x_avg": window_frame["x-axis (deg/s)"].mean(),
        "gyro_x_max": window_frame["x-axis (deg/s)"].max(),
        "gyro_x_min": window_frame["x-axis (deg/s)"].min(),
        "gyro_x_var": window_frame["x-axis (deg/s)"].var(),
        
        "gyro_y_avg": window_frame["y-axis (deg/s)"].mean(),
        "gyro_y_max": window_frame["y-axis (deg/s)"].max(),
        "gyro_y_min": window_frame["y-axis (deg/s)"].min(),
        "gyro_y_var": window_frame["y-axis (deg/s)"].var(),
        
        "gyro_z_avg": window_frame["z-axis (deg/s)"].mean(),
        "gyro_z_max": window_frame["z-axis (deg/s)"].max(),
        "gyro_z_min": window_frame["z-axis (deg/s)"].min(),
        "gyro_z_var": window_frame["z-axis (deg/s)"].var(),
        
        "epoch_start": window_frame["epoch (ms)"].min(),
        "epoch_end": window_frame["epoch (ms)"].max(),
        "epoch_length": window_frame["epoch (ms)"].max() - window_frame["epoch (ms)"].min()
    }
