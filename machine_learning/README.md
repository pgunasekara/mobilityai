In this directory, we keep the latest version of our machine learning model in the `model` directory.

Our training data exists in the `traning_sets` diirectory.

# Machine Learning Server

This tool wraps our latest model with a flask http server. This allows us to interface our existing SciKit Learn machine learning model written in python with the main backend server written in C#.

## Run instustrctions

* ```pipenv shell```

* ```pipenv install```

* ```pipenv run python3 app.py```

This server is also available as a `systemctl` service.

To add the service to `systemctl`:

* ```sudo cp mlservice.service /etc/systemd/system/```
* ```sudo systemctl start mlservice.service```
