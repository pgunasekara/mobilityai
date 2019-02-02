import os
import tempfile
import csv
import pytest
import pandas as pd

from app import app
import time


@pytest.fixture
def client():
    app.config['TESTING'] = True

    client = app.test_client()

    yield client

def test_hello_world(client):
    rv = client.get("/")

    assert b'Hello World!' in rv.data

def test_windowify(client):
    files = []
    try:
        # Load real training data as an example file to post to the server
        files = [open(fpath, 'rb') for fpath in ['./training_sets/untagged_sets/rebecca-test1-accel-test.csv', './training_sets/untagged_sets/rebecca-test1-gyro-test.csv']]
        # Create the request
        rv = client.post('/windowify', data={
            "file[]": files,
            "callback_url": "http://127.0.0.1/complete?id=1234",
            "test": True
        })
        # Wait for windowify
        time.sleep(20)
        print(os.listdir())
        csvFile = [x for x in os.listdir() if ".csv" in x]
        rvcsv = pd.read_csv(csvFile[0])
        # We know this file is supposed to have 407 rows
        assert rvcsv.shape[0] + 1 == 407
    finally:
        for fp in files:
            fp.close()