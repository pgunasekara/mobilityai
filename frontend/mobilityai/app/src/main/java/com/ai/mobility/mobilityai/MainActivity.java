package com.ai.mobility.mobilityai;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanResult;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.ParcelUuid;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v4.app.FragmentManager;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.View;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Button;
import android.widget.ImageButton;

import com.ai.mobility.mobilityai.MetaMotionDeviceAdapter.OnItemClickListener;
import com.mbientlab.bletoolbox.scanner.BleScannerFragment;
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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.UUID;

import bolts.Continuation;
import bolts.Task;

public class MainActivity extends AppCompatActivity implements ServiceConnection {//, BleScannerFragment.ScannerCommunicationBus {
    //Metawear classes
    private BtleService.LocalBinder serviceBinder;
    private Led led;
    private MetaWearBoard board;
    private Accelerometer accelerometer;
    private GyroBmi160 gyroscope;
    private Logging logging;

    private MetaMotionService metaMotion;

    private final String MW_MAC_ADDRESS= "D1:87:11:D8:F3:C0";
    private Button led_on, led_off;

    private static final String TAG = "MobilityAI";
    private static final int REQUEST_ENABLE_BT = 1, PERMISSION_REQUEST_COARSE_LOCATION= 2;

    //RecylerView
    private RecyclerView m_bleList;
    private MetaMotionDeviceAdapter m_adapter;
    private ArrayList<MetaMotionDevice> m_deviceList;

    private ImageButton m_refreshButton;


    //Bluetooth Scanning
    private BluetoothAdapter m_bluetoothAdapter;
    private BluetoothLeScanner m_bluetoothLeScanner;
    private boolean m_isScanning = false;
    private Handler m_handler;
    private ScanCallback m_leScanCallback;
    private HashSet<ParcelUuid> m_filterServiceUuids;
    private BleScannerFragment.ScannerCommunicationBus commBus= null;
    private boolean m_isScanReady;
    private ArrayList<BluetoothDevice> m_devices;
    private static final long SCAN_PERIOD = 10000L;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

//        commBus= (BleScannerFragment.ScannerCommunicationBus) FragmentManager.findFragmentById(5);

        m_refreshButton = (ImageButton) findViewById(R.id.refreshButton);

        m_bleList = (RecyclerView) findViewById(R.id.bleList);
        m_bleList.setLayoutManager(new LinearLayoutManager(this));
        m_deviceList = new ArrayList<>();
        m_adapter = new MetaMotionDeviceAdapter(this,
                m_deviceList,
                new MetaMotionDeviceAdapter.OnItemClickListener() {
                    @Override
                    public void onItemClick(MetaMotionDevice device) {
                        //Open a new intent
                        Intent intent = new Intent(getBaseContext(), DeviceInfoActivity.class);
                        intent.putExtra("EXTRA_MAC_ADDR", device.getMacAddr());
                        intent.putExtra("EXTRA_RSSI", device.getRssi());
                        intent.putExtra("EXTRA_USER", device.getAssignedUser());
                        intent.putExtra("EXTRA_NAME", device.getName());
                        intent.putExtra("EXTRA_LAST_SYNC", device.getLastSync());
                        startActivity(intent);

                    }
                });
        m_bleList.setAdapter(m_adapter);

        m_handler = new Handler();

        //Enabling BLE
        //Get the Bluetooth adapter
        final BluetoothManager bluetoothManager = (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
        m_bluetoothAdapter = bluetoothManager.getAdapter();
        m_bluetoothLeScanner = m_bluetoothAdapter.getBluetoothLeScanner();

        //Enable bluetooth if not already enabled
        if(m_bluetoothAdapter == null || !m_bluetoothAdapter.isEnabled()) {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
        } else {
            m_isScanReady = true;
        }
        Log.i(TAG, "m_isScanReady = "+m_isScanReady);

        UUID[] filterUuids= new UUID[] {UUID.fromString("326a9000-85cb-9195-d9dd-464cfbbae75a")};//commBus.getFilterServiceUuids();
        m_filterServiceUuids = new HashSet<>();
        for(UUID uuid : filterUuids) {
            m_filterServiceUuids.add(new ParcelUuid(uuid));
        }

        if(m_isScanReady)   startBleScan();



        // Bind the service when the activity is created
        getApplicationContext().bindService(new Intent(this, BtleService.class),
                this, Context.BIND_AUTO_CREATE);
    }

    //TODO: Delete this function once Bluetooth stuff is working
    private void createListData() {
        MetaMotionDevice m = new MetaMotionDevice("MetaMotion A", "Rebecca Tran", "D1:87:11:D8:F3:C0", 50, "January 2, 2019", 0);
        m_deviceList.add(m);
        m = new MetaMotionDevice("MetaMotion B", "Teo Voinea", "D1:87:11:D8:F3:C0", 15, "January 1, 2019", 0);
        m_deviceList.add(m);
        m = new MetaMotionDevice("MetaMotion C", "Roberto Temelkovski", "D1:87:11:D8:F3:C0", 75, "January 1, 2019", 0);
        m_deviceList.add(m);
    }

    @Override
    public void onDestroy() {
        stopBleScan();
        super.onDestroy();

        // Unbind the service when the activity is destroyed
        getApplicationContext().unbindService(this);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        switch (requestCode) {
            case REQUEST_ENABLE_BT:
                startBleScan();
                break;
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    @Override
    public void onServiceConnected(ComponentName name, IBinder service) {
        serviceBinder = (BtleService.LocalBinder) service;

        Log.i(TAG, "Service Connected");

//        retrieveBoard();
    }

    @Override
    public void onServiceDisconnected(ComponentName name) {
        if(board != null) {
            board.disconnectAsync().continueWith(new Continuation<Void, Void>() {
                @Override
                public Void then(Task<Void> task) throws Exception {
                    return null;
                }
            });
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
        switch (requestCode) {
            case PERMISSION_REQUEST_COARSE_LOCATION:
                if(grantResults[0] != PackageManager.PERMISSION_GRANTED) {
                    //TODO: Handle if permission denied
                } else {
                    m_isScanReady = true;
                    startBleScan();
                }
                break;
        }
    }

    private void startBleScan() {
        m_adapter.clear();
        m_isScanning = true;

        Log.i(TAG, "Started Scan");
        //Change icon to X
//        m_refreshButton.setImageResource(R.drawable.);

        m_handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                Log.i(TAG, "Stopped Scan");
                stopBleScan();
            }
        }, SCAN_PERIOD);

        m_leScanCallback = new ScanCallback() {
            @Override
            public void onScanResult(int callbackType, ScanResult result) {
                if(result.getScanRecord() != null && result.getScanRecord().getServiceUuids() != null) {
                    boolean valid = true;
                    for(ParcelUuid it : result.getScanRecord().getServiceUuids()) {
                        valid &= m_filterServiceUuids.contains(it);
                    }

                    Log.i(TAG, "Valid: "+valid);

                    if(valid) {
                        m_handler.post(new Runnable() {
                            @Override
                            public void run() {
                                Log.i(TAG, "Updating with: "+result.getDevice().getAddress());
                                m_adapter.update(new MetaMotionDevice(
                                        "MetaMotion A",
                                        "John Smith",
                                        result.getDevice().getAddress(),
                                        50,
                                        "Jan 5, 2019",
                                        result.getRssi()));
                            }
                        });
                    }
                }

            super.onScanResult(callbackType, result);
            }
        };

        m_bluetoothLeScanner.startScan(m_leScanCallback);
    }

    private void stopBleScan() {
        Log.i(TAG, "Stop Scan");
        if(m_isScanning) {
            m_bluetoothLeScanner.stopScan(m_leScanCallback);
        }

        m_isScanning = false;
        //TODO: Change the scan button
    }


    public void openActivity(View view) {
        Log.i(TAG, "Open Activity");
        Intent intent = new Intent(this, DeviceInfoActivity.class);
        startActivity(intent);
    }

}
