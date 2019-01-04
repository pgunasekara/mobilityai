from sklearn.neural_network import MLPClassifier
from joblib import load
from flask import Flask

app = Flask(__name__)

clf = load('model/mobilityAIModel.joblib')
print("Loaded model")

@app.route("/")
def hello():
    return "Hello World!"