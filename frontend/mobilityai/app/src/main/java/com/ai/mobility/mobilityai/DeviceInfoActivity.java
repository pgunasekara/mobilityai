package com.ai.mobility.mobilityai;

import android.animation.ObjectAnimator;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.WindowManager;
import android.view.animation.DecelerateInterpolator;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.mbientlab.metawear.MetaWearBoard;
import com.mbientlab.metawear.android.BtleService;
import com.mbientlab.metawear.module.Accelerometer;
import com.mbientlab.metawear.module.GyroBmi160;
import com.mbientlab.metawear.module.Led;
import com.mbientlab.metawear.module.Logging;

import bolts.Continuation;
import bolts.Task;

public class DeviceInfoActivity extends AppCompatActivity implements ServiceConnection {
    private final String TAG = "MobilityAI";


    private TextView m_batteryPercentage, m_devName, m_macAddr, m_lastSync;
    private Button m_syncButton, m_reassignButton;
    private ProgressBar m_batteryCircle;

    private MetaMotionService m_metaMotion;
    private String m_macAddress;
    private BtleService.LocalBinder m_serviceBinder;
    private MetaWearBoard m_board;
    private Led m_led;
    private Accelerometer m_accelerometer;
    private GyroBmi160 m_gyroscope;
    private Logging m_logging;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_device_info);

        m_macAddress = getIntent().getStringExtra("EXTRA_MAC_ADDR");

        getApplicationContext().bindService(new Intent(this, BtleService.class),
                this, Context.BIND_AUTO_CREATE);

//        getWindow().setFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS, WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        if(m_board.isConnected()) {
            m_board.disconnectAsync().continueWith(task -> {
               if(!task.isFaulted()) {
                   Log.i(TAG, "Disconnected " + m_macAddress);
               }

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

        m_board.connectAsync().continueWithTask(task -> {
            if (task.isFaulted()) {
                Log.i("MobilityAI", "Failed to configure app", task.getError());
            } else {

                Log.i("MobilityAI", "App Configured, connected: " + m_macAddress);

                //Retrieve Modules
                m_led = m_board.getModule(Led.class);
                m_accelerometer = m_board.getModule(Accelerometer.class);
                m_gyroscope = m_board.getModule(GyroBmi160.class);

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
                        return null;
                    }
                }, Task.UI_THREAD_EXECUTOR);
            }
            return null;
        });

//        m_metaMotion.connect(m_macAddress, remoteDevice);
//
//        int batteryLevel = m_metaMotion.getBoard().readBatteryLevelAsync().getResult().intValue();
//        m_batteryPercentage.setText(batteryLevel);



        //Get battery data and set
//        int battery
        //m_metaMotion.setBatteryLevel(R.id.batteryPercentage);

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
    }

    private void programOnClick() {
        if(m_board.isConnected()) {

        }
    }
}
