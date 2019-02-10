"""
These functions are copied from the Google Colab notebook.
We need to turn this into a library that can also be imported by the Colab notebook.
"""
import sys
import pandas as pd
from sklearn import preprocessing
import numpy as np
from random import randint
import math
from scipy.stats import entropy

def preprocess_accel_data(df):
    processed = ""
    df[['x-axis (g)','y-axis (g)','z-axis (g)']] = df[['x-axis (g)','y-axis (g)','z-axis (g)']].apply(pd.to_numeric)
    testing2 = preprocessing.normalize(df[['x-axis (g)','y-axis (g)','z-axis (g)']])
    testing_data = np.concatenate((df[['epoch (ms)', 'elapsed (s)']], testing2), axis=1)
    testing = pd.DataFrame(data=testing_data[0:,0:],    # values
            index=[i for i in range(1, len(testing_data) + 1)],    # 1st column as index
            columns=['epoch (ms)', 'elapsed (s)', 'x-axis (g)','y-axis (g)','z-axis (g)'])
    testing = windowify(2500, 500, testing)
    p = []
    for group_name, window in testing.groupby(level=0):
        p.append(accelerometer_stats(window))
    processed = pd.DataFrame(p)
    processed = processed.sort_values(by=['epoch_start'])
    processed.dropna(inplace=True)
    return processed

def preprocess_gyro_data(df):
    processed = ""
    df[['x-axis (deg/s)', 'y-axis (deg/s)', 'z-axis (deg/s)']] = df[['x-axis (deg/s)', 'y-axis (deg/s)', 'z-axis (deg/s)']].apply(pd.to_numeric)
    testing2 = preprocessing.normalize(df[['x-axis (deg/s)', 'y-axis (deg/s)', 'z-axis (deg/s)']])
    testing_data = np.concatenate((df[['epoch (ms)', 'elapsed (s)']], testing2), axis=1)
    testing = pd.DataFrame(data=testing_data[0:,0:],    # values
        index=[i for i in range(1, len(testing_data) + 1)],    # 1st column as index
        columns=['epoch (ms)', 'elapsed (s)', 'x-axis (deg/s)','y-axis (deg/s)','z-axis (deg/s)'])
    testing = windowify(2500, 500, testing)
    p = []
    for group_name, window in testing.groupby(level=0):
        p.append(gyroscope_stats(window))
    processed = pd.DataFrame(p)
    processed = processed.sort_values(by=['epoch_start'])
    processed.dropna(inplace=True)
    return processed

def windows(d, w, t):
  r = np.arange(len(d))
  s = r[::t]
  z = list(zip(s, s + w))
  f = '{0[0]}:{0[1]}'.format
  g = lambda t: d.iloc[t[0]:t[1]]
  return pd.concat(map(g, z), keys=map(f, z))
  
def windowify(size, step, dataset):
  frequency_hz = 1000/25
  window_size_in_elements = math.ceil(size / frequency_hz)
  window_step_in_elements = math.ceil(step / frequency_hz)
  
  return windows(dataset, window_size_in_elements, window_step_in_elements)

def is_contained_by(absorbing_row,merging_row):
    return absorbing_row['epoch_start'] < merging_row['epoch_start'] and \
        absorbing_row['epoch_end'] > merging_row['epoch_end']

def get_merge_distance(absorbing_row,merging_row):
    start_dist = abs(absorbing_row['epoch_start'] - merging_row['epoch_start'])
    end_dist = abs(absorbing_row['epoch_end'] - merging_row['epoch_end'])
    return start_dist + end_dist
  
def merge_rows(absorbing_row,merging_row):
    return absorbing_row[['epoch_start','epoch_length','epoch_end']].astype('int64').append(merging_row[3:]).to_dict()

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

def performMerge(df1,df2):
    mergeable_series_lst = build_mergeable_dataframes(df1,df2)
    mergeable_df = pd.DataFrame.from_records(mergeable_series_lst)
    typecast_map = {"epoch_end":"int64","epoch_start":"int64","epoch_length":"int64"}
    for i in typecast_map.keys():
        mergeable_df[i] = mergeable_df[i].astype(typecast_map[i])

    return pd.merge(df1,mergeable_df,on=['epoch_start','epoch_end','epoch_length'])

def preprocess_sensor_data(accelerometer_csv, gyroscope_csv):
    accel_df = preprocess_accel_data(accelerometer_csv)
    gyro_df = preprocess_gyro_data(gyroscope_csv)

    ret = performMerge(accel_df,gyro_df)
    return ret

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
