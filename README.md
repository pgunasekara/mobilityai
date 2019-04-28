<p align="center">
    <img src="https://github.com/pgunasekara/4zp6/raw/master/media/logo_transparent.png">
</p>

# MobilityAI

[![Build Status](https://dev.azure.com/rebecca-tran/rebecca-tran/_apis/build/status/pgunasekara.4zp6?branchName=master)](https://dev.azure.com/rebecca-tran/rebecca-tran/_build/latest?definitionId=1?branchName=master)

## Introduction

It is shown that early mobilization and physical therapy is a safe and effective intervention method that can have a significant impact on patient health. A sensor band will be used to measure mobility data from patients. Machine Learning will then be applied to accelerometer and gyroscope sensor data to accurately determine the actions the sensor band is measuring. The nurses can then use this data to determine how mobile a patient is during their stay compared to their pre-hospitalization mobility levels.

## Features

- [x] 95% machine learning model classification accuracy 🧠
    - [x] Standing 🕴
    - [x] Sitting ⑁
    - [x] Lying down 🛌
    - [x] Walking 🚶‍♀️
- [x] Sensor band battery lasts 12+ hours 🔋
- [x] Sensor band is easy to clean, wear and remove ✨
- [x] Compare baseline mobility to recorded mobility 💪
- [x] Other things? (eg: live data streaming, ...)


## Machine Leaning

Machine learning experimentation is being done on Google CoLab. The editing link can be found [here](https://colab.research.google.com/drive/1682HSUzAxL24l9kzixJNzauv5SLOFaeF). (Requires McMaster Unviersity account)

The data is being recorded from the band at 25Hz intervals, containing accelerometer and gyroscope measurements.
The data is then processed into 2.5 second long windows with a 2 second overlap between each window.
Each window then processes statistical information such as average, minimum, and maximum values for x, y, and z rotational and acceleration values.
This preprocessing creates 24 features for our data set 

```|{accelerometer, gyroscope}| * |{x, y, z}| * |{max, min, avg, var}| = 24```

This 24 feature data set is then dimensionally reduced with [Principle Component Analysis using Minka's MLE to guess the dimension](https://scikit-learn.org/stable/modules/generated/sklearn.decomposition.PCA.html). The results set is then passed to a [Multilayer Perceptron](https://scikit-learn.org/stable/modules/generated/sklearn.neural_network.MLPClassifier.html#sklearn.neural_network.MLPClassifier) classifier model where the hyperparameters are tuned to maximize test set accuracy.

To get started with the machine learning side of this project, visit the Google Colab link above and check out the [machine_learning directory](https://github.com/pgunasekara/4zp6/tree/master/machine_learning).

## Sensor Band

Patients will wear the clinical grade wristband, [MetaMotionR (MMR)](https://mbientlab.com/metamotionr/), produced by MbientLab with several sensors including a pressure sensor, temperature sensor, and an Inertial Measurement Unit (IMU). The unit is housed in an IP40 case and is strapped on the user with a rubber wrist band.

### Features

* 8MB of NOR flash memory that can be used to log data
* Stream data live using a Bluetooth
* 100 mAH rechargeable battery that can be recharged using a micro-USB connection


![Band](https://raw.githubusercontent.com/pgunasekara/4zp6/master/poster/wristband.jpg)

To get started with the sensor band side of this project, check out the [frontend directory](https://github.com/pgunasekara/4zp6/tree/master/frontend).

## Server & Database

The server stores two data sets, accelerometer and gyroscope. It determines when and how the subject is moving. The data sets are collected through the bands that patients will be wearing. The Android application will upload this data after it is collected. The app can request data to display it to the user.

![Architecture](https://raw.githubusercontent.com/pgunasekara/4zp6/master/poster/becca_2.png)

To get started with the server and database side of this project, checkout the [backend directory](https://github.com/pgunasekara/4zp6/tree/master/backend/mobilityAI).

## Setup instructions
The following are instructions on how to set up the entire backend, including the machine learning portion using docker on a server.

1. Install ![Docker CE](https://docs.docker.com/install/) and ![Docker Compose](https://docs.docker.com/compose/install/)
2. Install Nginx and start it.
3. Edit /etc/nginx/sites-available/default (your configuration file might have a different name or a different location) and set the following for port 80:
```
location / {                                                      
    proxy_pass http://localhost:5000;                             
    proxy_http_version 1.1;                                       
    proxy_set_header Upgrade $http_upgrade;                       
    proxy_set_header Connection keep-alive;                       
    proxy_set_header Host $host;                                  
    proxy_cache_bypass $http_upgrade;                             
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;                 
}                                                                 
```
4. Test the changes by running `sudo nginx -t` and reload nginx `sudo nginx -s reload`
5. Clone this repository anywhere on the machine.
6. To start the docker services run `sudo docker-compose up -d --build web`
7. Once completed the status of the container can be checked by using `sudo docker logs <name of image>`
    a. To get the name of the image (there are 3 running, the dotnet server, the ML server, and the postgres instance) run `sudo docker ps` and look under the "IMAGE" column (the names at the time of writing this are: dotnet server: 'mobilityai_web', ML server: 'mobilityai_ml', and Postgres: 'postgres').
 8. To create a bash shell into one of the instances, use `sudo docker ps` to get the "CONTAINER ID" for the desired instance, then run `sudo docker exec -it <container ID> bash'

## Screenshots

![Band Info](https://raw.githubusercontent.com/pgunasekara/4zp6/master/media/band_info.png)
![Patient Info](https://raw.githubusercontent.com/pgunasekara/4zp6/master/media/patient_info.jpg)
