import numpy as np
import pandas as pd
import requests
import uuid
import os

def main():
    print("loading old data")
    old_accel = pd.read_csv('./training_sets/untagged_sets/new-7-roberto-dec11_MetaWear_2018-12-11T17.00.45.816_D18711D8F3C0_Accelerometer_25.000Hz_1.4.4.csv')
    old_gyro = pd.read_csv('./training_sets/untagged_sets/new-7-roberto-dec11_MetaWear_2018-12-11T17.00.45.816_D18711D8F3C0_Gyroscope_25.000Hz_1.4.4.csv')

    new_starting_time = 1550308889000 #feb 16, 9AM
    old_accel_starting_time = old_accel.iloc[0]['epoch (ms)']
    old_gyro_starting_time = old_gyro.iloc[0]['epoch (ms)']

    print("old accel starting time: " + str(old_accel_starting_time))
    print("old gyro starting time: " + str(old_gyro_starting_time))

    upload_count = 0

    while new_starting_time < 1550316089000: #feb 16, 11AM
        print("currently uploading file: " + str(upload_count))
        accel_diff_time = new_starting_time - old_accel_starting_time
        gyro_diff_time = new_starting_time - old_gyro_starting_time
        
        print("accel diff time: " + str(accel_diff_time))
        print("gyro diff time: " + str(gyro_diff_time))

        new_accel, new_gyro = modify_epoch(old_accel, old_gyro, accel_diff_time, gyro_diff_time)

        upload_data(new_accel, new_gyro)

        new_starting_time =  max(new_accel.iloc[-1]['epoch (ms)'], new_gyro.iloc[-1]['epoch (ms)'])
        old_accel_starting_time = new_accel.iloc[0]['epoch (ms)']
        old_gyro_starting_time = new_gyro.iloc[0]['epoch (ms)']

        print("last accel: " + str(new_accel.iloc[-1]['epoch (ms)']))
        print("last gyro: " + str(new_gyro.iloc[-1]['epoch (ms)']))

        print("new starting time is: " + str(new_starting_time))

        upload_count += 1

def modify_epoch(accel_df, gyro_df, accel_diff_time, gyro_diff_time):
    print("changing timestamps")
    accel_df['epoch (ms)'] = accel_df['epoch (ms)'].apply(lambda x: x + accel_diff_time)
    gyro_df['epoch (ms)'] = gyro_df['epoch (ms)'].apply(lambda x: x + gyro_diff_time)
    return accel_df, gyro_df

def upload_data(accel_df, gyro_df):
    print("saving as csv")
    accel_file_name = str(uuid.uuid1()) + "-accel.csv"
    accel_df.to_csv(os.path.join(os.getcwd(), accel_file_name), sep=',', index=False)

    gyro_file_name = str(uuid.uuid1()) + "-gyro.csv"
    gyro_df.to_csv(os.path.join(os.getcwd(), gyro_file_name), sep=',', index=False)

    print("uploading")
    with open(accel_file_name, 'rb') as accel_file:
        with open(gyro_file_name, 'rb') as gyro_file:
            files = {
                'AccelerometerFile': accel_file,
                'GyroscopeFile': gyro_file
            }
            requests.post(url = 'https://mobilityai.teovoinea.com/api/MobilityAI/AddData?PatientId=2', files=files)
    
    print("deleting")
    os.remove(accel_file_name)
    os.remove(gyro_file_name)


if __name__ == "__main__":
    main()