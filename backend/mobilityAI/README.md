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

## Endpoints
### GetAllAccelerometer() && GetAllGyroscope()
- Retrieve all rows of data in the Accelerometer/Gyroscope tables
- Results are returned in a list of objects of either Accelerometer or Gyroscope type

### AddData(AccelerometerFile, GyroscopeFile)
- Given a .CSV file in the following format: 
    - Id (data type: string, Unique Identifier)
    - Epoch (data type: long)
    - Timestamp (data type: DateTime)
    - Elapsed (data type: double)
    - XAxis (data type: double)
    - YAxis (data type: double)
    - ZAxis (data type: double)
- Parses through the file and adds each row to the specified table

### GetRangeAccelerometer(start, end) && GetRangeGyroscope(start, end)
- Given a start and end epoch time, retrieves all the data between the range specified
- Results are returned in a JSON file

### SetDeviceInfo(id, name, userid, lastsync)
- Matches up the ID from the Devices Table to the ID in the parameter 
- Updates a given device information with the Id, Name, UserId, and the time it was last synced

### GetDeviceInfo(macAddress)
- Given a macAddress, return the user information and the device information
- Result is returned in a JSON file
