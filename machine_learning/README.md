In this directory, we keep the latest version of our machine learning model in the `model` directory.

Our training data exists in the `traning_sets` diirectory.

# Machine Learning Server

This tool wraps our latest model with a flask http server. This allows us to interface our existing SciKit Learn machine learning model written in python with the main backend server written in C#.

## Run instustrctions

```pipenv shell```

```pipenv install```

```flask run```