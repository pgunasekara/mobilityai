from sklearn.neural_network import MLPClassifier
from joblib import load
from flask import Flask
from flask import request
import os
from flask import Flask, flash, request, redirect, url_for
from werkzeug.utils import secure_filename
import numpy as np
import pandas as pd
from _thread import start_new_thread
from flask import abort
from data_processing import *
import uuid
import requests
import os.path

UPLOAD_FOLDER = './'
ALLOWED_EXTENSIONS = set(['csv'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

clf = load('model/mobilityAIModel.joblib')
pca = load('model/mobilityAIPCAModel.joblib')
print("Loaded model")

"""
This method is used to check if the server is alive.
"""
@app.route("/")
def hello():
    return "Hello World!"

"""
This method uses a callback system. The client posts 2 csv files, namely: accelerometer and gyroscope data
collected from the band, as well a a callback url. The server then loads these 2 files and verifies they are valid.
If the files are valid, a new thread is started with the files in memory as pandas dataframes and a 200 OK is returned.
Once the data processing thread is complete, it posts the processed data back to the callback url as a csv file.
"""
@app.route("/windowify", methods=['POST'])
def windowifyData():
    # Get the name of the uploaded files
    uploaded_files = request.files.getlist("file[]")
    callback_url = request.form['callback_url']
    test = request.form['test']
    filenames = []
    accel_df = ""
    gyro_df = ""
    for file in uploaded_files:
        # Check if the file is one of the allowed types/extensions
        if file and allowed_file(file.filename):
            # Make the filename safe, remove unsupported chars
            filename = secure_filename(file.filename).lower()
            # Move the file form the temporal folder to the upload
            # folder we setup
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            # Save the filename into a list, we'll use it later
            filenames.append(filename)

            # Make sure the server finished transferring the files
            while not os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], filename)):
                continue

            if "accel" in filename:
                accel_df = pd.read_csv(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            if "gyro" in filename:
                gyro_df = pd.read_csv(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    # The request was valid only if 2 csv files were uploaded
    if accel_df is not "" and gyro_df is not "":
        # Start a new thread to process the data
        start_new_thread(process_data, (accel_df, gyro_df, callback_url, test, ))
        for f in filenames: # We can delete the uploaded files since they're already loaded in memory as dataframes
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], f))
        return ''
    else:
        abort(401)

def confidence_filter(row):
    perp = pow(2,entropy(row))
    maxConfidence = max(row)
    cl = pd.Index(row).get_loc(maxConfidence)
    if perp > 1.2 and (cl == 0 or cl == 1):
        return 4
    return cl

transition_matrix = [[True,  True,  False, True,  True],
                     [True,  True,  False, False, True],
                     [False, False, True,  True,  True],
                     [True,  False, True,  True,  True],
                     [True,  True,  True,  True,  True]]

def validate_transition(prev, current):
  return transition_matrix[prev][current]

def save_results(accel_gyro_df,predWithConf):
    #pred = pd.DataFrame({'type': pred})
    predWithConf = pd.DataFrame({'type': predWithConf})
    accel_gyro_df = pd.concat([accel_gyro_df,predWithConf], axis=1)
    accel_gyro_df = accel_gyro_df[['epoch_start', 'epoch_end', 'type']]
    accel_gyro_df["epoch_start"] = pd.to_numeric(accel_gyro_df["epoch_start"], downcast='integer')
    accel_gyro_df["epoch_end"] = pd.to_numeric(accel_gyro_df["epoch_end"], downcast='integer')
    accel_gyro_df.drop_duplicates(subset=['epoch_start', 'epoch_end'], inplace=True)
    
    file_name = str(uuid.uuid1()) + ".csv"
    accel_gyro_df.to_csv(os.path.join(os.getcwd(), file_name), sep=',', index=False)
    print("Saved csv to: " + os.path.join(os.getcwd(), file_name))
    return file_name

"""
Function to process the data iin a new thread.
When the data is done processing, the result is posted back to the callback url.
"""
def process_data(accel_df, gyro_df, callback_url, test=False):
    print("Starting windowify")
    accel_gyro_df = preprocess_sensor_data(accel_df, gyro_df)
    print("Complete windowify")

    print("Running model")
    newX = accel_gyro_df.drop(['epoch_length', 'epoch_end', 'epoch_start'], axis=1)
    newX = pca.transform(newX)

    #predictions = clf.predict(newX)
    
    pWithConfidence = pd.DataFrame(clf.predict_proba(newX))
    pWithConfidence = pWithConfidence.apply(confidence_filter, axis=1)

    for i in range(5,len(pWithConfidence)):
        if not validate_transition(pWithConfidence[i-1], pWithConfidence[i]):
            pWithConfidence[i] = pWithConfidence.iloc[i-5:i].value_counts().idxmax()

    file_name = save_results(accel_gyro_df, pWithConfidence)
 
    with open(file_name,'rb') as activities_file:
        files = {'Activities': activities_file}
        r = requests.post(callback_url, files=files, verify=False)

    if not pWithConfidence:
        os.remove(file_name) 

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6000)
