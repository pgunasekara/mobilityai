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
import android.view.WindowManager;
import android.view.animation.DecelerateInterpolator;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.mbientlab.metawear.android.BtleService;

import bolts.Task;

public class DeviceInfoActivity extends AppCompatActivity implements ServiceConnection {

    private TextView m_batteryPercentage, m_devName, m_macAddr, m_lastSync;
    private Button m_syncButton, m_reassignButton;
    private ProgressBar m_batteryCircle;

    private MetaMotionService m_metaMotion;
    private String m_macAddress;
    private BtleService.LocalBinder m_serviceBinder;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_device_info);

        m_macAddress = getIntent().getStringExtra("EXTRA_MAC_ADDR");

        //Populate Views
        findViews();

        //Populate activity fields and set battery progress bar
        populateFields();

        getApplicationContext().bindService(new Intent(this, BtleService.class),
                this, Context.BIND_AUTO_CREATE);

//        getWindow().setFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS, WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        getApplicationContext().unbindService(this);
    }

    @Override
    public void onServiceConnected(ComponentName name, IBinder service) {
        m_serviceBinder = (BtleService.LocalBinder) service;

        final BluetoothManager btManager = (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
        final BluetoothDevice remoteDevice = btManager.getAdapter().getRemoteDevice(m_macAddress);

        m_metaMotion.connect(m_macAddress, remoteDevice);

        //Get battery data and set
//        int battery
        m_metaMotion.setBatteryLevel(R.id.batteryPercentage);
    }

    @Override
    public void onServiceDisconnected(ComponentName name) { }


    /**
     * HELPER FUNCTIONS
     */

    private void populateFields() {
        String name = getIntent().getStringExtra("EXTRA_USER");
        String macAddr = getIntent().getStringExtra("EXTRA_MAC_ADDR");
        int rssi = getIntent().getIntExtra("EXTRA_RSSI", -100);
        String lastSync = getIntent().getStringExtra("EXTRA_LAST_SYNC");

        setTitle(name);
//        m_batteryPercentage.setText();
        m_macAddr.setText(macAddr);
        m_lastSync.setText(lastSync);

        //Set battery circle
        ObjectAnimator animation = ObjectAnimator.ofInt(m_batteryCircle, "progress", 75);
        animation.setDuration(3000); // in milliseconds
        animation.setInterpolator(new DecelerateInterpolator());
        animation.start();

    }

    private void findViews() {
        m_batteryPercentage = findViewById(R.id.batteryPercentage);
        m_devName = findViewById(R.id.devName);
        m_macAddr = findViewById(R.id.devMacAddr);
        m_lastSync = findViewById(R.id.devLastSync);
        m_batteryCircle = findViewById(R.id.progressBar);
    }
}
