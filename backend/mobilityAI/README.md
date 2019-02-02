# MobilityAI
The MobilityAI backend is comprised of a PostgreSQL database and a dotnet core web api. The database will store all of the raw and processed data after the ML model has tagged the raw data and its corresponding movement activities. The purpose of the server is to interact with the Android app and the ML Model, returning the data that is requested and adding the raw/processed data to the database.

## Prerequisite Software
- .NET Core SDK 2.2+
- Visual Studio Code
- PostgreSQL
- Postman (Optional)

## Usage
- Startup PostgreSQL and import SensorDatabase
- Open project folder in Visual Studio code `code -r backend/`
- Restore dotnet packages + tools `dotnet restore`
- Run Server using `F5` or `dotnet run`

## Adding Service to Systemctl
- Publish project: `dotnet publish -c Release -o [PUBLISH_DIRECTORY]`
- Update paths in mobilityai.service to point to publish folder for project.
- Enable Service: `sudo systemctl enable mobilityai.service`
- Start Service: `sudo systemctl start mobilityai.service`
- To check service status: `sudo systemctl status mobilityai.service`

## Endpoints
### GetAllAccelerometer() && GetAllGyroscope()
- Retrieve all rows of data in the Accelerometer/Gyroscope tables
- Results are returned in a list of objects of either Accelerometer or Gyroscope type

### AddData(AccelerometerFile, GyroscopeFile, PatientId)
- Given a .CSV file in the following format: 
    - Id (data type: string, Unique Identifier)
    - PatientId (data type: int)
    - Epoch (data type: long)
    - Timestamp (data type: DateTime)
    - Elapsed (data type: double)
    - XAxis (data type: double)
    - YAxis (data type: double)
    - ZAxis (data type: double)
- Parses through the file and adds each row to the specified table

### GetRangeAccelerometer(start, end, patientId) && GetRangeGyroscope(start, end, patientId)
- Given a patient ID, start and end epoch time, retrieves all the data between the range specified that belongs to the specific patient
- Results are returned in a JSON file

### SetDeviceInfo(id, name, userid, lastsync)
- Matches up the ID from the Devices Table to the ID in the parameter 
- Updates a given device information with the Id, Name, UserId, and the time it was last synced

### GetDeviceInfo(macAddress)
- Given a macAddress, return the user information and the device information
- Result is returned in a JSON file

### AddPatientData(PatientData)
- Given a JSON file, th

### SignUpUser(email, firstName, lastName, password)
- Adding a new user's credentials and information to the database for future reference and signing in

### MLCallBack(Id, Activities)
- Allows the machine learning server to send back the labeled data 

### GetActivityData(Start, End, PatientId)
- Given a patient ID, start and end epoch time, retrieves the processed activity data
- Results are returned in a JSON file