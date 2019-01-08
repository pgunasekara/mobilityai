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
print("Loaded model")

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/windowify", methods=['POST'])
def windowifyData():
    # Get the name of the uploaded files
    uploaded_files = request.files.getlist("file[]")
    callback_url = request.form['callback_url']
    filenames = []
    accel_df = ""
    gyro_df = ""
    for file in uploaded_files:
        # Check if the file is one of the allowed types/extensions
        if file and allowed_file(file.filename):
            # Make the filename safe, remove unsupported chars
            filename = secure_filename(file.filename)
            # Move the file form the temporal folder to the upload
            # folder we setup
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            # Save the filename into a list, we'll use it later
            filenames.append(filename)

            while not os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], filename)):
                continue

            if "accel" in filename:
                accel_df = pd.read_csv(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            if "gyro" in filename:
                gyro_df = pd.read_csv(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    if accel_df is not "" and gyro_df is not "":
        start_new_thread(process_data, (accel_df, gyro_df, callback_url,))
        for f in filenames:
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], f))
        return ''
    else:
        abort(401)

    
def process_data(accel_df, gyro_df, callback_url):
    print("Starting windowify")
    accel_gyro_df = preprocess_sensor_data(accel_df, gyro_df)
    print("Complete windowify")
    file_name = str(uuid.uuid1()) + ".csv"
    accel_gyro_df.to_csv(file_name, sep='\t')
    print("Saved csv")

    files = {'upload_file': open(file_name,'rb')}
    values = {}

    r = requests.post(callback_url, files=files, data=values)

    os.remove(file_name) 


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS