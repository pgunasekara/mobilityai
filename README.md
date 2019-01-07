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
- [x] Record baseline mobility to recorded mobility 💪
- [x] Other things? (eg: live data streaming, ...)


## Machine Leaning

Machine learning experimentation is being done on Google CoLab. The editing link can be found [here](https://colab.research.google.com/drive/1682HSUzAxL24l9kzixJNzauv5SLOFaeF)

### TODO:

- Talk about the model used
- Talk about the window sizes used
- Talk about windowify processing times?

## Sensor Band

Patients will wear the clinical grade wristband, MetaMotionR (MMR), produced by MbientLab with several sensors including a pressure sensor, temperature sensor, and an Inertial Measurement Unit (IMU). The unit is housed in an IP40 case and is strapped on the user with a rubber wrist band.

### TODO:
- Add links to band stats
- Add links to images

## Server & Database

The server stores two data sets, accelerometer and gyroscope. It determines when and how the subject is moving. The data sets are collected through the bands that patients will be wearing. The Android application will upload this data after it is collected. The app can request data to display it to the user.

### TODO:
- Add links to the poster architecture diagram
- App screenshots
