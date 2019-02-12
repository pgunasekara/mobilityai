package com.ai.mobility.mobilityai;

import android.animation.ObjectAnimator;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.IBinder;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.view.animation.DecelerateInterpolator;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.mbientlab.metawear.Data;
import com.mbientlab.metawear.MetaWearBoard;
import com.mbientlab.metawear.Route;
import com.mbientlab.metawear.Subscriber;
import com.mbientlab.metawear.android.BtleService;
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
import java.io.OutputStreamWriter;
import java.text.DateFormat;
import java.util.Date;
import java.util.Locale;

import bolts.Continuation;
import bolts.Task;

public class DeviceInfoActivity extends AppCompatActivity implements ServiceConnection {
    private final String TAG = "MobilityAI";

    private TextView m_batteryPercentage, m_devName, m_macAddr, m_lastSync, m_batteryText;
    private Button m_syncButton, m_reassignButton, m_startLoggingButton, m_stopLoggingButton;
    private ProgressBar m_batteryCircle, m_syncProgressBar, m_loadingBar;

    private String m_macAddress;
    private BtleService.LocalBinder m_serviceBinder;
    private MetaWearBoard m_board;
    private Accelerometer m_accelerometer = null;
    private GyroBmi160 m_gyroscope = null;
    private Logging m_logging = null;
    private Settings m_metawearSettings = null;

    AlertDialog.Builder builder;

    private static Subscriber DATA_HANDLER = new Subscriber() {
        @Override
        public void apply(Data data, Object... env) {
            try {
                FileOutputStream fos = (FileOutputStream) env[0];
                String value =
                        data.timestamp().getTimeInMillis()+","
                                +data.formattedTimestamp()+","+
                                "0"+","
                                +data.value(Acceleration.class).x()+","
                                +data.value(Acceleration.class).y()+","
                                +data.value(Acceleration.class).z()+"\n";
                fos.write(value.getBytes());
            } catch (IOException ex) {
                Log.i("MobilityAI", "Error writing to file:" + ex.toString());
            }
        }
    };

    //TODO: Refactor this class to use MetaMotionService

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_device_info);

        initializeDialogBuilder();
        findViews();
        hideAllElements(); //Hide all elements until service is connected

        m_macAddress = getIntent().getStringExtra("EXTRA_MAC_ADDR");

        getApplicationContext().bindService(new Intent(this, BtleService.class),
                this, Context.BIND_AUTO_CREATE);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);

        //Serialize and save board state
        if(m_board != null) {
            m_board.disconnectAsync().continueWithTask(task -> {
                //serializeBoard();
                return null;
            });
        }
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        //Reconnect board
        //deserializeBoard();
        m_board.connectAsync().continueWith(task -> {
            Log.i(TAG, "Device restored");
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
               //serializeBoard();
               return null;
            });
        }

        getApplicationContext().unbindService(this);
    }

    @Override
    public void onServiceConnected(ComponentName name, IBinder service) {
        m_serviceBinder = (BtleService.LocalBinder) service;

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
                Log.i(TAG, "Start Logging");
                //Reconfigure
                configureAccelerometer();
                configureGyroscope();
                configureLogging().continueWith(task1 -> {
                    m_accelerometer.acceleration().start();
                    m_accelerometer.start();
                    m_gyroscope.angularVelocity().start();
                    m_gyroscope.start();

                    serializeBoard();

                    m_logging.start(true);

                    Log.i(TAG, "Done");

                    return null;
                });
            });

            m_stopLoggingButton.setOnClickListener(l -> {
                //Stop accelerometer and gyroscope
                Log.i(TAG, "Stop Logging");

                m_accelerometer.acceleration().stop();
                m_accelerometer.stop();
                m_gyroscope.angularVelocity().stop();
                m_gyroscope.stop();

                //Stop logging
                m_logging.stop();

                setEnv();

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
    }

    private Task<Route> addRoutes() {
        return m_accelerometer.acceleration().addRouteAsync(source -> {
            source.log(DATA_HANDLER);
        });
    }

    private FileOutputStream fos;
    private void setEnv() {
        try {
            InputStream inputStream = this.openFileInput("id-"+m_board.getMacAddress());
            if(inputStream != null) {
                InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
                BufferedReader bufferedReader = new BufferedReader(inputStreamReader);

                String res = bufferedReader.readLine();
                int routeId = Integer.parseInt(res);
                //Set env for route
                Route accelRoute = m_board.lookupRoute(routeId);
                String datetime = DateFormat.getDateTimeInstance().format(new Date());
                fos = openFileOutput("accelerometer-"+datetime, MODE_PRIVATE);
                fos.write("epoch (ms),time (-13:00),elapsed (s),x-axis (g),y-axis (g),z-axis (g)\n".getBytes());
                accelRoute.setEnvironment(0, fos);
            }
        } catch (IOException e) { Log.i(TAG, "DeviceInfoActivity::setEnv(): " + e.toString()); }
    }

    @Override
    public void onServiceDisconnected(ComponentName name) { }


    /**
     * Populate fields with intent extras passed in from caller activity
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

    /**
     * Initializes all the views on the page
     */
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

        m_reassignButton.setOnClickListener(l -> {
            AlertDialog dialog = builder.create();
            dialog.show();
        });
    }

    /**
     * Sync button handler to connect, sync data, and restart logging
     */
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

    /**
     * Set ODR for accelerometer
     */
    private void configureAccelerometer() {
        if(m_board.isConnected() && m_accelerometer != null) {
            m_accelerometer.configure()
                           .odr(25f)       // Set sampling frequency to 25Hz, or closest valid ODR
                           .commit();
            Log.i(TAG, "Accelerometer Configured");
        }
    }

    /**
     * Set ODR and range for gyroscope
     */
    private void configureGyroscope() {
        if(m_board.isConnected() && m_gyroscope != null) {
            m_gyroscope.configure()
                       .odr(GyroBmi160.OutputDataRate.ODR_25_HZ)
                       .range(GyroBmi160.Range.FSR_2000)
                       .commit();

            Log.i(TAG, "Gyroscope Configured");
        }
    }

    /**
     * Add logging handler and environment variables
     * @return Route for logging task
     */
    private Task<Route> configureLogging() {
        //Configure Accelerometer
        if(m_board.isConnected() && m_logging != null && m_accelerometer != null ) {
            //Add new async route to log data
            return m_accelerometer.acceleration().addRouteAsync((RouteComponent source) -> {
                source.log(DATA_HANDLER);
            }).continueWith((Task<Route> task) -> {
                try {

                    OutputStreamWriter outputStreamWriter = new OutputStreamWriter(this.openFileOutput("id-"+m_board.getMacAddress(), Context.MODE_PRIVATE));
                    int res = task.getResult().id();
                    outputStreamWriter.write(Integer.toString(res));
                    outputStreamWriter.close();
                }catch (IOException e) { }

                return null;
            });
        }
        return null;
    }

    /**
     * Serializes the current board into a local file to be restored later
     */
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

    /**
     * Restores the current board if already serialized
     */
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

    /**
     * Create the dialog builder
     * TODO: populate this with real data
     */
    private void initializeDialogBuilder() {
        builder = new AlertDialog.Builder(this);
        builder.setTitle("Select a New User ID").setSingleChoiceItems(R.array.patientnames, 0, new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                //User clicked on this
            }
        });
        builder.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                //user clicked OK
            }
        });

        builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                //User clicked Cancel
            }
        });
    }
}
