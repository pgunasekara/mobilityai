package com.ai.mobility.mobilityai;

import android.animation.ObjectAnimator;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.IBinder;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.view.animation.DecelerateInterpolator;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.mbientlab.metawear.Data;
import com.mbientlab.metawear.MetaWearBoard;
import com.mbientlab.metawear.Route;
import com.mbientlab.metawear.android.BtleService;
import com.mbientlab.metawear.builder.RouteComponent;
import com.mbientlab.metawear.data.Acceleration;
import com.mbientlab.metawear.data.AngularVelocity;
import com.mbientlab.metawear.module.Accelerometer;
import com.mbientlab.metawear.module.GyroBmi160;
import com.mbientlab.metawear.module.Led;
import com.mbientlab.metawear.module.Logging;
import com.mbientlab.metawear.module.Settings;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.text.DateFormat;
import java.util.Date;

import bolts.Continuation;
import bolts.Task;

public class DeviceInfoActivity extends AppCompatActivity implements ServiceConnection {
    private final String TAG = "MobilityAI";


    private TextView m_batteryPercentage, m_devName, m_macAddr, m_lastSync, m_batteryText;
    private Button m_syncButton, m_reassignButton, m_startLoggingButton, m_stopLoggingButton;
    private ProgressBar m_batteryCircle, m_syncProgressBar, m_loadingBar;

    private MetaMotionService m_metaMotion;
    private String m_macAddress;
    private BtleService.LocalBinder m_serviceBinder;
    private MetaWearBoard m_board;
    private Led m_led = null;
    private Accelerometer m_accelerometer = null;
    private GyroBmi160 m_gyroscope = null;
    private Logging m_logging = null;
    private Settings m_metawearSettings = null;

    //Logging data
    StringBuilder m_accelerometerLog, m_gyroscopeLog;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_device_info);

        initialize();

        findViews();

        //Hide all elements until service is connected
        hideAllElements();

        m_macAddress = getIntent().getStringExtra("EXTRA_MAC_ADDR");

        getApplicationContext().bindService(new Intent(this, BtleService.class),
                this, Context.BIND_AUTO_CREATE);

//        getWindow().setFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS, WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);

        //Serialize and save board state
        if(m_board != null) {

            m_board.disconnectAsync().continueWithTask(task -> {
                serializeBoard();
                return null;
            });
        }
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        //Reconnect board
        deserializeBoard();
        m_board.connectAsync().continueWith(task -> {
            Log.i(TAG, "Connected!");
            return null;
        });
    }

    private void hideAllElements() {
        m_batteryPercentage.setVisibility(View.INVISIBLE);
        m_devName.setVisibility(View.INVISIBLE);
        m_macAddr.setVisibility(View.INVISIBLE);
        m_lastSync.setVisibility(View.INVISIBLE);
        m_batteryText.setVisibility(View.INVISIBLE);
        m_syncButton.setVisibility(View.INVISIBLE);
        m_reassignButton.setVisibility(View.INVISIBLE);
        m_batteryCircle.setVisibility(View.INVISIBLE);
        m_syncProgressBar.setVisibility(View.INVISIBLE);

        //Show loading bar
        m_loadingBar.setVisibility(View.VISIBLE);
    }

    private void showAllElements() {
        m_batteryPercentage.setVisibility(View.VISIBLE);
        m_devName.setVisibility(View.VISIBLE);
        m_macAddr.setVisibility(View.VISIBLE);
        m_lastSync.setVisibility(View.VISIBLE);
        m_batteryText.setVisibility(View.VISIBLE);
        m_syncButton.setVisibility(View.VISIBLE);
        m_reassignButton.setVisibility(View.VISIBLE);
        m_batteryCircle.setVisibility(View.VISIBLE);
        m_syncProgressBar.setVisibility(View.VISIBLE);

        //Hide loading bar
        m_loadingBar.setVisibility(View.INVISIBLE);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        if(m_board.isConnected()) {

            m_board.disconnectAsync().continueWith(task -> {
               if(!task.isFaulted()) {
                   Log.i(TAG, "Disconnected " + m_macAddress);
               }
               serializeBoard();
               return null;
            });
        }

        getApplicationContext().unbindService(this);
    }

    @Override
    public void onServiceConnected(ComponentName name, IBinder service) {
        m_serviceBinder = (BtleService.LocalBinder) service;
        m_metaMotion = new MetaMotionService(m_serviceBinder);

        final BluetoothManager btManager = (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
        final BluetoothDevice remoteDevice = btManager.getAdapter().getRemoteDevice(m_macAddress);

        m_board = m_serviceBinder.getMetaWearBoard(remoteDevice);

        deserializeBoard();

        m_board.connectAsync().continueWithTask(task -> {
            if (task.isFaulted()) {
                Log.i("MobilityAI", "Failed to configure app", task.getError());
            } else {

                Log.i("MobilityAI", "App Configured, connected: " + m_macAddress);

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

                m_board.readBatteryLevelAsync().continueWith(new Continuation<Byte, Object>() {
                    @Override
                    public Object then(Task<Byte> task1) throws Exception {
                        if(task1.isFaulted()) {
                            Log.i(TAG, "TASK FAULTED");
                        } else {
                            int batteryVal = task1.getResult().intValue();
                            m_batteryPercentage.setText(batteryVal + "%");

                            ObjectAnimator animation = ObjectAnimator.ofInt(m_batteryCircle, "progress", batteryVal);
                            animation.setDuration(3000); // in milliseconds
                            animation.setInterpolator(new DecelerateInterpolator());
                            animation.start();
                        }

                        showAllElements();
                        return null;
                    }
                }, Task.UI_THREAD_EXECUTOR);
            }

            m_startLoggingButton.setOnClickListener(l -> {
                Log.i(TAG, "START LOGGING");
                //Reconfigure
                configureAccelerometer();
                configureGyroscope();
                configureLogging().continueWith(task1 -> {
                    m_accelerometer.acceleration().start();
                    m_accelerometer.start();
                    m_gyroscope.angularVelocity().start();
                    m_gyroscope.start();

                    m_logging.start(true);

                    Log.i(TAG, "Done");

                    return null;
                });
//
                //Reprogram accelerometer and gyroscope


                //Restart logging

            });

            m_stopLoggingButton.setOnClickListener(l -> {
                //Stop accelerometer and gyroscope
                Log.i(TAG, "STOP LOGGING");

                //TOOD: Only do this if not already configured
//                configureLogging();

                m_accelerometer.acceleration().stop();
                m_accelerometer.stop();
                m_gyroscope.angularVelocity().stop();
                m_gyroscope.stop();

                Log.i(TAG, "STOP");

                //Stop logging
                m_logging.stop();

//                Collect Log
                m_logging.downloadAsync(100, (long nEntriesLeft, long totalEntries) -> {
                    m_syncProgressBar.setProgress((int)totalEntries - (int)nEntriesLeft);
                    m_syncProgressBar.setMax((int)totalEntries);
                }).continueWithTask(t -> {
                    if(t.isFaulted()) {
                        Toast.makeText(this, "Failed to download log file.", Toast.LENGTH_LONG).show();
                        Log.i(TAG, "Failed to download log file.");
                    } else {
                        Log.i(TAG, "Log downloaded successfully");
                        //Clear Log
                        m_logging.clearEntries();

                        //Save data from string builders into local file until ready to be sent to server
//                        Log.i(TAG, m_accelerometerLog.toString());
//                        Log.i(TAG, m_gyroscopeLog.toString());

                        //Save to file
                        String datetime = DateFormat.getDateTimeInstance().format(new Date());

                        //Accelerometer File
//                        createCSV("accelerometer-" + datetime,
//                                    m_accelerometerLog.toString());
//                        createCSV("gyroscope-" + datetime,
//                                m_gyroscopeLog.toString());

                        Log.i(TAG, "Location: " + this.getFilesDir().getAbsolutePath());
                    }

                    //Clear everything on the board
                    m_board.tearDown();
                    return null;
                });
            });
            return null;
        });

        //Populate Views
        findViews();

        //Populate activity fields and set battery progress bar
        populateFields();

        programOnClick();
    }

    @Override
    public void onServiceDisconnected(ComponentName name) { }


    /**
     * HELPER FUNCTIONS
     */

    private void populateFields() {
        String name = getIntent().getStringExtra("EXTRA_USER");
        String macAddr = "MAC Address: " + getIntent().getStringExtra("EXTRA_MAC_ADDR");
        int rssi = getIntent().getIntExtra("EXTRA_RSSI", -100);
        String lastSync = "Last Sync: " + getIntent().getStringExtra("EXTRA_LAST_SYNC");

        setTitle(name);
        m_macAddr.setText(macAddr);
        m_lastSync.setText(lastSync);
    }

    private void findViews() {
        m_batteryPercentage = findViewById(R.id.batteryPercentage);
        m_devName = findViewById(R.id.devName);
        m_macAddr = findViewById(R.id.devMacAddr);
        m_lastSync = findViewById(R.id.devLastSync);
        m_batteryCircle = findViewById(R.id.progressBar);
        m_syncProgressBar = findViewById(R.id.syncProgress);
        m_syncButton = findViewById(R.id.syncButton);
        m_reassignButton = findViewById(R.id.reassignButton);
        m_batteryText = findViewById(R.id.batteryIdentifier);
        m_loadingBar = findViewById(R.id.loadingCircle);
        m_startLoggingButton = findViewById(R.id.startLoggingButton);
        m_stopLoggingButton = findViewById(R.id.stopLoggingButton);
    }

    private void initialize() {
        m_accelerometerLog = new StringBuilder();
        m_gyroscopeLog = new StringBuilder();
    }

    private void setSyncButtonOnClickHandler() {
        if(m_board.isConnected()) {
            m_syncButton.setOnClickListener((View v) -> {
                //Stop accelerometer and gyroscope
                m_accelerometer.acceleration().stop();
                m_accelerometer.stop();
                m_gyroscope.angularVelocity().stop();
                m_gyroscope.stop();

                //Stop logging
                m_logging.stop();

                //Collect Log
                m_logging.downloadAsync().continueWithTask(task -> {
                   if(task.isFaulted()) {
                       Toast.makeText(this, "Failed to download log file.", Toast.LENGTH_LONG).show();
                       Log.i(TAG, "Failed to download log file.");
                   } else {
                        Log.i(TAG, "Log downloaded successfully");
                   }

                   //Clear everything on the board
                   m_board.tearDown();
                    return null;
                });


                //Clear Log
                m_logging.clearEntries();

                //Save data from string builders into local file until ready to be sent to server
                Log.i(TAG, m_accelerometerLog.toString());
                Log.i(TAG, m_gyroscopeLog.toString());

                //Clear stringbuilders
                m_accelerometerLog.setLength(0);
                m_gyroscopeLog.setLength(0);

                //Reconfigure
                configureAccelerometer();
                configureGyroscope();
                configureLogging();

                //Restart logging
                m_logging.start(true);

                //Reprogram accelerometer and gyroscope
                m_accelerometer.acceleration().start();
                m_accelerometer.start();
                m_gyroscope.angularVelocity().start();
                m_gyroscope.start();
            });
        }
    }

    private void programOnClick() {
        if(m_board.isConnected()) {

        }
    }

    private void configureAccelerometer() {
        if(m_board.isConnected() && m_accelerometer != null) {
            m_accelerometer.configure()
                           .odr(25f)       // Set sampling frequency to 25Hz, or closest valid ODR
                           .commit();
            Log.i(TAG, "AC");
        }
    }

    private void configureGyroscope() {
        if(m_board.isConnected() && m_gyroscope != null) {
            m_gyroscope.configure()
                       .odr(GyroBmi160.OutputDataRate.ODR_25_HZ)
                       .range(GyroBmi160.Range.FSR_2000)
                       .commit();

            Log.i(TAG, "GC");
        }
    }

    private FileOutputStream fos;

    private Task<Route> configureLogging() {
        //Configure Accelerometer
        if(m_board.isConnected() && m_logging != null && m_accelerometer != null ) {
            //Append initial log line
            Log.i(TAG, "here");
//             m_accelerometerLog.append("epoch (ms),time (-13:00),elapsed (s),x-axis (g),y-axis (g),z-axis (g)\n");
            //Add new async route to log data
            return m_accelerometer.acceleration().addRouteAsync((RouteComponent source) -> {
                source.log((Data data, Object... env) -> {
//                    m_accelerometerLog
//                            .append(data.timestamp().getTimeInMillis()).append(",")
//                            .append(data.formattedTimestamp()).append(",")
//                            .append("0").append(",")
//                            .append(data.value(Acceleration.class).x()).append(",")
//                            .append(data.value(Acceleration.class).y()).append(",")
//                            .append(data.value(Acceleration.class).z()).append("\n");
                    String value = data.timestamp().getTimeInMillis()+","+data.formattedTimestamp()+","+"0"+","+data.value(Acceleration.class).x()+","+data.value(Acceleration.class).y()+","+data.value(Acceleration.class).z()+"\n";
                    try {
                        FileOutputStream fosX = (FileOutputStream) env[0];
                        fosX.write(value.getBytes());
                    } catch (IOException e) {
//                        Log.i(TAG, "AE: " + e.getMessage());
                    }

//                    Log.i(TAG, value);
                });

            }).continueWith(task -> {
                String datetime = DateFormat.getDateTimeInstance().format(new Date());
                fos = openFileOutput("accelerometer-" + datetime, MODE_PRIVATE);

                task.getResult().setEnvironment(0, fos);
                return null;
            });
        }

        return null;

        //Configure Gyroscope
//        if(m_board.isConnected() && m_logging != null && m_gyroscope != null) {
//            //Append first line of Gyroscope
//            m_gyroscopeLog.append("epoch (ms),time (-13:00),elapsed (s),x-axis (deg/s),y-axis (deg/s),z-axis (deg/s)\n");
//
//            //Add new async route to log data
//            m_gyroscope.angularVelocity().addRouteAsync((RouteComponent source) -> {
//                source.log((Data data, Object... env) -> {
//                    m_gyroscopeLog
//                            .append(data.timestamp().getTimeInMillis()).append(",")
//                            .append(data.formattedTimestamp()).append(",")
//                            .append("0").append(",")
//                            .append(data.value(AngularVelocity.class).x()).append(",")
//                            .append(data.value(AngularVelocity.class).y()).append(",")
//                            .append(data.value(AngularVelocity.class).z()).append("\n");
//                });
//            });
//        }
    }

    private void createCSV(String filename, String data) {
        try {
            OutputStreamWriter writer = new OutputStreamWriter(this.openFileOutput(filename, Context.MODE_PRIVATE));
            writer.write(data);
            writer.close();
        } catch (IOException e) {
            Log.i(TAG, "Write failed for: " + filename + " " + e.toString());
        }
    }

    private void serializeBoard() {
        try {
            File serializeFile = new File(this.getFilesDir(), m_board.getMacAddress());
            serializeFile.createNewFile();
            OutputStream writer = new FileOutputStream(serializeFile, false);
            m_board.serialize(writer);
            writer.close();
            Log.i(TAG, "Serialized: " + m_board.getMacAddress());
        } catch (IOException e) {
            Log.i(TAG, "Write failed for: " + m_board.getMacAddress() + " " + e.toString());
            e.printStackTrace();
            Log.i(TAG, "Trace");
        }
    }

    private void deserializeBoard() {
        try {
            File serializeFile = new File(this.getFilesDir(), m_board.getMacAddress());
            InputStream reader = new FileInputStream(serializeFile);
            m_board.deserialize(reader);
            reader.close();
            serializeFile.delete();
            Log.i(TAG, "Deserialized: " + m_board.getMacAddress());
        } catch (IOException e) {
            Log.i(TAG, "Failed to read - 1: " + m_board.getMacAddress() + " " + e.toString());
        } catch (ClassNotFoundException e) {
            Log.i(TAG, "Failed to read - 2: " + m_board.getMacAddress() + " " + e.toString());
        }
    }
}
