package com.ai.mobility.mobilityai;

import android.content.Context;
import android.os.Build;
import android.os.Handler;
import android.util.Log;
import android.widget.Toast;

import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.RetryPolicy;
import com.android.volley.request.SimpleMultiPartRequest;
import com.android.volley.error.VolleyError;
import com.mbientlab.metawear.Data;
import com.mbientlab.metawear.MetaWearBoard;
import com.mbientlab.metawear.Route;
import com.mbientlab.metawear.Subscriber;
import com.mbientlab.metawear.data.Acceleration;
import com.mbientlab.metawear.data.AngularVelocity;
import com.mbientlab.metawear.module.AccelerometerBmi160;
import com.mbientlab.metawear.module.AccelerometerBosch;
import com.mbientlab.metawear.module.GyroBmi160;
import com.mbientlab.metawear.module.Led;
import com.mbientlab.metawear.module.Logging;
import com.mbientlab.metawear.module.Settings;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.text.DateFormat;
import java.util.Date;

import bolts.Task;

public class MetaMotionService {
    private final String TAG = "MobilityAI";

    private String m_macAddress;
    private MetaWearBoard m_board;
    private Led m_led = null;
    private AccelerometerBmi160 m_accelerometer = null;
    private GyroBmi160 m_gyroscope = null;
    private Logging m_logging = null;
    private Settings m_metawearSettings = null;

    private FileOutputStream m_fosA, m_fosG, m_fosS;

    private String m_fileName, m_accelerometerFileName, m_gyroscopeFileName, m_stepCounterFileName;

    /**
     * Static handlers for each subscriber to log to a single file set to env[0]
     */
    private static Subscriber ACCELEROMETER_HANDLER = (Data data, Object... env) -> {
        try {
            String value = data.timestamp().getTimeInMillis() + "," +
                    data.formattedTimestamp() + "," +
                    "0" + "," +
                    data.value(Acceleration.class).x() + "," +
                    data.value(Acceleration.class).y() + "," +
                    data.value(Acceleration.class).z() + "\n";

            FileOutputStream fos = (FileOutputStream) env[0];
            fos.write(value.getBytes());
        } catch (IOException ex) {
            Log.i("MobilityAI", "Accelerometer Subscriber: Error writing to file:" + ex.toString());
        }
    };

    private static Subscriber GYROSCOPE_HANDLER = (Data data, Object... env) -> {
        try {
            String value = data.timestamp().getTimeInMillis() + "," +
                    data.formattedTimestamp() + "," +
                    "0" + "," +
                    data.value(AngularVelocity.class).x() + "," +
                    data.value(AngularVelocity.class).y() + "," +
                    data.value(AngularVelocity.class).z() + "\n";

            FileOutputStream fos = (FileOutputStream) env[0];
            fos.write(value.getBytes());
        } catch (IOException ex) {
            Log.i("MobilityAI", "Gyroscope Subscriber: Error writing to file:" + ex.toString());
        }
    };

    private static Subscriber STEP_COUNTING_HANDLER = (Data data, Object... env) -> {
        try {
            String value = data.value(Integer.class).toString() + "\n";
            FileOutputStream fos = (FileOutputStream) env[0];
            fos.write(value.getBytes());
        } catch(IOException ex) {
            Log.i("MobilityAI", "Step Subscriber: Error writing to file:" + ex.toString());
        }
    };

    public MetaMotionService(MetaWearBoard board) { m_board = board; m_macAddress = m_board.getMacAddress(); }

    /**
     * Connects to the currently assigned Metawear board
     * @return Task for the Async connect route
     */
    public Task<Route> connectBoard() {
        return m_board.connectAsync().continueWithTask(task -> {
            if (task.isFaulted())   Log.i("MobilityAI", "Failed to configure app", task.getError());
            else                    Log.i("MobilityAI", "App Configured, connected: " + m_macAddress);

            //Retrieve Modules
            m_led = m_board.getModule(Led.class);
            m_accelerometer = m_board.getModule(AccelerometerBmi160.class);
            m_gyroscope = m_board.getModule(GyroBmi160.class);
            m_logging = m_board.getModule(Logging.class);
            m_metawearSettings = m_board.getModule(Settings.class);

            //Reduce max connection interval
            m_metawearSettings.editBleConnParams()
                    .maxConnectionInterval(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? 11.25f : 7.5f)
                    .commit();

            return null;
        });
    }

    /**
     * Disconnects from the currently connected board
     * @return Task with the async disconnect route
     */
    public Task<Route> disconnectBoard() {
        return m_board.disconnectAsync().continueWithTask(task -> {
            Log.i(TAG, "Disconnected: " + m_board.getMacAddress());
            return null;
        });
    }

    /**
     * Sets the Accelerometer Range (4g) and data rate (25hz)
     */
    public void configureAccelerometer() {
        if(m_board.isConnected() && m_accelerometer != null) {
            m_accelerometer.configure()
                    .odr(AccelerometerBmi160.OutputDataRate.ODR_25_HZ)       // Set sampling frequency to 25Hz, or closest valid ODR
                    .range(AccelerometerBosch.AccRange.AR_4G)
                    .commit();
            Log.i(TAG, "Accelerometer Configured");
        }
    }

    /**
     * Sets the Gyroscope Range (2000 degrees) and data rate (25hz)
     */
    public void configureGyroscope() {
        if(m_board.isConnected() && m_gyroscope != null) {
            m_gyroscope.configure()
                    .odr(GyroBmi160.OutputDataRate.ODR_50_HZ)
                    .range(GyroBmi160.Range.FSR_2000)
                    .commit();

            Log.i(TAG, "Gyroscope Configured");
        }
    }

    public void configureStepCounter() {
        if(m_board.isConnected() && m_accelerometer != null) {
            m_accelerometer.stepCounter()
                    .configure()
                    .mode(AccelerometerBmi160.StepDetectorMode.NORMAL)
                    .commit();
        }
    }

    /**
     * Sets the subscriber for the accelerometer to log on device memory
     * @param context The callers context used to create the log file
     * @return Task with the route for acceleration
     */
    public Task<Route> configureAccelerometerLogging(Context context) {
        return m_accelerometer.acceleration().addRouteAsync(source -> {
            source.log(ACCELEROMETER_HANDLER);
            Log.i(TAG, "Accelerometer Subscriber set");
        }).continueWithTask((Task<Route> task) -> {
            Log.i(TAG, "Accel ID: " + task.getResult().id());
            writeIdFile(context, task, "a");
            return null;
        });
    }

    /**
     * Sets the subscriber for the gyroscope to log on device memory
     * @param context The callers context used to create the log file
     * @return Task with the route for angular velocity
     */
    public Task<Route> configureGyroscopeLogging(Context context) {
        return m_gyroscope.angularVelocity().addRouteAsync(source -> {
            source.log(GYROSCOPE_HANDLER);
            Log.i(TAG, "Gyroscope Subscriber set");
        }).continueWithTask((Task<Route> task) -> {
            if(task.isFaulted()) {
                Log.i(TAG, "Gyro task faulted!");
            }
            Log.i(TAG, "Gyro ID: " + task.getResult().id());

            writeIdFile(context, task, "g");
            return null;
        });
    }

    public Task<Route> configureStepCounterLogging(Context context) {
        return m_accelerometer.stepCounter().addRouteAsync(source -> {
            source.log(STEP_COUNTING_HANDLER);
            Log.i(TAG, "Step Counter Subscriber set");
        }).continueWith((Task<Route> task) -> {
            if(task.isFaulted()) {
                Log.i(TAG, "Step Counter task faulted");
            }

            Log.i(TAG, "Step producer id: " + task.getResult().id());

            writeIdFile(context, task, "s");
            return null;
        });
    }

    /**
     * Creates the route ID files - format: id_[ag]_[currentdatetime]
     * @param context The callers context
     * @param task The route from which to get the ID
     * @param identifier 'a' or 'g' to identify whether it's accelerometer or gyroscope respectively
     */
    private void writeIdFile(Context context, Task<Route> task, String identifier) {
        try {
            OutputStreamWriter outputStreamWriter = new OutputStreamWriter(context.openFileOutput("id_" + identifier + "_" + m_board.getMacAddress(), Context.MODE_PRIVATE));
            int res = task.getResult().id();
            outputStreamWriter.write(Integer.toString(res));
            outputStreamWriter.close();
        } catch (IOException e) { Log.i(TAG, "Error Logging ID: " + e.toString()); }
    }

    private void assignEnvironmentVariables(Context context, String filename, FileOutputStream fos, String type) {
        try {
            InputStream inputStream = context.openFileInput(filename);

            if(inputStream != null) {
                InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
                BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
                String res = bufferedReader.readLine();

                if(!res.equals("")) {
                    int routeId = Integer.parseInt(res);
                    //Set environment for route
                    Route route = m_board.lookupRoute(routeId);
                    Log.i(TAG, "Setting " + type + " environment = " + routeId);
                    route.setEnvironment(0, fos);
                }
            }
        } catch(IOException e) {
            Log.i(TAG, "Error reading: " + filename + ". " + e.toString());
        }
    }

    /**
     * Sets the subscriber environments in order to log to a single file on device
     * @param context The context used to create the file
     */
    public void setEnvironment(Context context) {
        Log.i(TAG, "Setting Environment");
        try {
            //Retrieve Log route id
            String datetime = DateFormat.getDateTimeInstance().format(new Date());
            m_accelerometerFileName = m_board.getMacAddress() + "_" + datetime + "_accelerometer" + ".csv";
            m_gyroscopeFileName = m_board.getMacAddress() + "_" + datetime + "_gyroscope" + ".csv";
            m_stepCounterFileName = m_board.getMacAddress() + "_" + datetime + "_steps" + ".csv";

            m_fosA = context.openFileOutput(m_accelerometerFileName, context.MODE_PRIVATE);
            m_fosG = context.openFileOutput(m_gyroscopeFileName, context.MODE_PRIVATE);
            m_fosS = context.openFileOutput(m_stepCounterFileName, context.MODE_PRIVATE);

            assignEnvironmentVariables(context, "id_a_" + m_board.getMacAddress(), m_fosA, "Accelerometer");
            assignEnvironmentVariables(context, "id_g_" + m_board.getMacAddress(), m_fosG, "Gyroscope");
            assignEnvironmentVariables(context, "id_s_" + m_board.getMacAddress(), m_fosS, "Step Counter");
        } catch (IOException e) { Log.i(TAG, "MetaMotionService::setEnvironment(): " + e.getMessage()); Log.i(TAG, "Probably a new device."); }
    }

    /**
     * Start acceleration and angular velocity routes
     */
    public void startSensors() {
        Log.i(TAG, "Start all sensors");
        m_accelerometer.acceleration().start();
        m_accelerometer.start();
        m_gyroscope.angularVelocity();
        m_gyroscope.angularVelocity().start();
        m_gyroscope.start();
    }

    /**
     * Stop acceleration and angular velocity routes
     */
    public void stopSensors() {
        Log.i(TAG, "Stop all sensors");
        m_accelerometer.acceleration().stop();
        m_accelerometer.stop();
        m_gyroscope.angularVelocity().stop();
        m_gyroscope.stop();
    }

    public void readStepCounter() {
        Log.i(TAG, "Read Step Counter");
        m_accelerometer.stepCounter().read();
    }

    public void resetStepCounter() {
        Log.i(TAG, "Resetting step counter");
        m_accelerometer.stepCounter().reset();
    }

    /**
     * Stops the onboard logging
     */
    public void stopLogging() {
        m_logging.stop();
    }

    /**
     * Serializes the current board into a file locally (identified using the mac address of the device) to be restored when getting data from the device
     * @param filedir Directory to store the file
     */
    public void serializeBoard(File filedir) {
        try {
            File serializeFile = new File(filedir, m_board.getMacAddress());
            serializeFile.createNewFile();
            OutputStream writer = new FileOutputStream(serializeFile, false);
            m_board.serialize(writer);
            writer.close();
            Log.i(TAG, "Serialized: " + m_board.getMacAddress());
        } catch (IOException e) {
            Log.i(TAG, "Write failed for: " + m_board.getMacAddress() + " " + e.toString());
            e.printStackTrace();
        }
    }

    /**
     * Deserializes a board that is already stored on the device
     * @param filedir Directory to store the file
     */
    public void deserializeBoard(File filedir) {
        try {
            File serializeFile = new File(filedir, m_board.getMacAddress());
            InputStream reader = new FileInputStream(serializeFile);
            m_board.deserialize(reader);
            reader.close();
            serializeFile.delete();
            Log.i(TAG, "Deserialized: " + m_board.getMacAddress());
        } catch (IOException | ClassNotFoundException e) {
            Log.i(TAG, "Failed to read: " + m_board.getMacAddress() + " " + e.toString());
        }
    }

    /**
     * Uploads the data files onto the server using volley+ library
     * @param filePath Location of the file to be uploaded
     * @param context Calling context
     * @return
     */
    public SimpleMultiPartRequest uploadData(String filePath, Context context) {
        String url = "https://mobilityai.teovoinea.com/api/mobilityai/AddDataSingle";

        Log.i(TAG, "Starting data upload");

        SimpleMultiPartRequest smr = new SimpleMultiPartRequest(
            Request.Method.POST,
            url,
            new Response.Listener<String>() {
                @Override
                public void onResponse(String response) {
                    Log.i(TAG, "Response: " + response);
                    Toast.makeText(context, "Request Complete!", Toast.LENGTH_SHORT).show();
                }
            },
            new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    Log.i(TAG, "Error.response " + error);
                    Toast.makeText(context, ("Volley Error: " + error), Toast.LENGTH_SHORT).show();
                }
            }
        ) {
            @Override
            protected Response<String> parseNetworkResponse(NetworkResponse response) {
                int mStatusCode = response.statusCode;
                Log.i(TAG, "Response code: " + mStatusCode);
                return super.parseNetworkResponse(response);
            }
        };

        //TODO: Remove the hard coding of the patients once Patients table is working properly
        smr.addStringParam("patientId", "25");
        smr.addFile("DataFile", filePath);
        smr.setRetryPolicy(new RetryPolicy() {
            @Override
            public int getCurrentTimeout() {
                return 100000;
            }

            @Override
            public int getCurrentRetryCount() {
                return 100000;
            }

            @Override
            public void retry(VolleyError error) throws VolleyError { }
        });
        return smr;
    }

    public String getFileName() {
        return m_fileName;
    }

    public MetaWearBoard getBoard() {
        return m_board;
    }

    public Logging getLogging() {
        return m_logging;
    }
}
