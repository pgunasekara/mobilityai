package com.ai.mobility.mobilityai;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.Context;
import android.os.Build;
import android.util.Log;

import com.mbientlab.metawear.Data;
import com.mbientlab.metawear.MetaWearBoard;
import com.mbientlab.metawear.Route;
import com.mbientlab.metawear.Subscriber;
import com.mbientlab.metawear.android.BtleService;
import com.mbientlab.metawear.builder.RouteBuilder;
import com.mbientlab.metawear.builder.RouteComponent;
import com.mbientlab.metawear.data.Acceleration;
import com.mbientlab.metawear.data.AngularVelocity;
import com.mbientlab.metawear.module.Accelerometer;
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
import java.text.DateFormat;
import java.util.Date;
import java.util.HashMap;

import bolts.Continuation;
import bolts.Task;

public class MetaMotionService {
    private final String TAG = "MobilityAI";

    private String m_macAddress;
    private MetaWearBoard m_board;
    private Led m_led = null;
    private Accelerometer m_accelerometer = null;
    private GyroBmi160 m_gyroscope = null;
    private Logging m_logging = null;
    private Settings m_metawearSettings = null;

    private FileOutputStream m_fosA;
    private FileOutputStream m_fosG;

    public MetaMotionService() { }

    public Task<Route> connectBoard() {
        return m_board.connectAsync().continueWith(task -> {
            if (task.isFaulted())   Log.i("MobilityAI", "Failed to configure app", task.getError());
            else                    Log.i("MobilityAI", "App Configured, connected: " + m_macAddress);

            //Retrieve Modules
            m_led = m_board.getModule(Led.class);
            m_accelerometer = m_board.getModule(Accelerometer.class);
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

    public Task<Route> disconnectBoard() {
        return m_board.disconnectAsync().continueWith(task -> {
            //Serialize board?
            return null;
        });
    }

    public void configureAccelerometer() {
        if(m_board.isConnected() && m_accelerometer != null) {
            m_accelerometer.configure()
                    .odr(25f)       // Set sampling frequency to 25Hz, or closest valid ODR
                    .commit();
            Log.i(TAG, "Accelerometer Configured");
        }
    }

    public void configureGyroscope() {
        if(m_board.isConnected() && m_gyroscope != null) {
            m_gyroscope.configure()
                    .odr(GyroBmi160.OutputDataRate.ODR_25_HZ)
                    .range(GyroBmi160.Range.FSR_2000)
                    .commit();

            Log.i(TAG, "Gyroscope Configured");
        }
    }

    public Task<Route> configureLogging() {
        return m_accelerometer.acceleration().addRouteAsync(source -> {
            source.log((Data data, Object... env) -> {
                try {
                    String value = data.timestamp().getTimeInMillis()+","+
                            data.formattedTimestamp()+","+
                            "0"+","+
                            data.value(Acceleration.class).x()+","+
                            data.value(Acceleration.class).y()+","+
                            data.value(Acceleration.class).z()+"\n";

                    FileOutputStream fos = (FileOutputStream) env[0];
                    fos.write(value.getBytes());
                } catch (IOException ex) {
                    Log.i("MobilityAI", "Error writing to file:" + ex.toString());
                }
            });
        }).continueWith(task -> {
            m_gyroscope.angularVelocity().addRouteAsync(source -> {
                source.log((Data data, Object... env) -> {
                    try {
                        String value = data.timestamp().getTimeInMillis()+","+
                                data.formattedTimestamp()+","+
                                "0"+","+
                                data.value(AngularVelocity.class).x()+","+
                                data.value(AngularVelocity.class).y()+","+
                                data.value(AngularVelocity.class).z()+"\n";

                        FileOutputStream fos = (FileOutputStream) env[1];
                        fos.write(value.getBytes());
                    } catch (IOException ex) {
                        Log.i("MobilityAI", "Error writing to file:" + ex.toString());
                    }
                });
            });

            return null;
        });
    }

    public void setEnvironment(Context context) {
        try {
            //Retrieve Log route id
            InputStream inputStream = context.openFileInput("id_a_" + m_board.getMacAddress());
            if(inputStream != null) {
                InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
                BufferedReader bufferedReader = new BufferedReader(inputStreamReader);

                String res = bufferedReader.readLine();
                int routeId = Integer.parseInt(res);
                //Set env for route
                Route accelRoute = m_board.lookupRoute(routeId);
                String datetime = DateFormat.getDateTimeInstance().format(new Date());
                m_fosA = context.openFileOutput("accelerometer-"+datetime, context.MODE_PRIVATE);
                m_fosA.write("epoch (ms),time (-13:00),elapsed (s),x-axis (g),y-axis (g),z-axis (g)\n".getBytes());
                accelRoute.setEnvironment(0, m_fosA);

                //TODO: Delete id file
            }

            inputStream = context.openFileInput("id_g_" + m_board.getMacAddress());
            if(inputStream != null) {
                InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
                BufferedReader bufferedReader = new BufferedReader(inputStreamReader);

                String res = bufferedReader.readLine();
                int routeId = Integer.parseInt(res);
                //Set env for route
                Route gyroRoute = m_board.lookupRoute(routeId);
                String datetime = DateFormat.getDateTimeInstance().format(new Date());
                m_fosG = context.openFileOutput("accelerometer-"+datetime, context.MODE_PRIVATE);
                m_fosG.write("epoch (ms),time (-13:00),elapsed (s),x-axis (g),y-axis (g),z-axis (g)\n".getBytes());
                gyroRoute.setEnvironment(1, m_fosG);

                //TODO: Delete id file
            }
        } catch (IOException e) {}
    }

    

    public void serializeBoard(String filedir) {
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

    public void deserializeBoard(String filedir) {
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
}
