package com.ai.mobility.mobilityai;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.widget.Button;

import com.mbientlab.metawear.MetaWearBoard;
import com.mbientlab.metawear.Route;
import com.mbientlab.metawear.android.BtleService;

public class DevActivity extends AppCompatActivity implements ServiceConnection {

    Button rs0, rs1, sr0, sr1, st0, st1;

    private String d1 = "D1:87:11:D8:F3:C0";
    private String d0 = "D0:D1:72:CD:1C:FC";

    private BtleService.LocalBinder serviceBinder;
    private MetaWearBoard board;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dev);
        rs0 = findViewById(R.id.rs0);
        rs1 = findViewById(R.id.rs1);
        sr0 = findViewById(R.id.sr0);
        sr1 = findViewById(R.id.sr1);
        st0 = findViewById(R.id.st0);
        st1 = findViewById(R.id.st1);

        getApplicationContext().bindService(new Intent(this, BtleService.class),
                this, Context.BIND_AUTO_CREATE);



        rs0.setOnClickListener(l -> {

        });
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        // Unbind the service when the activity is destroyed
        getApplicationContext().unbindService(this);
    }

    @Override
    public void onServiceConnected(ComponentName name, IBinder service) {
        serviceBinder = (BtleService.LocalBinder) service;
    }

    @Override
    public void onServiceDisconnected(ComponentName name) { }


    public void retrieveBoard(String addr) {
        final BluetoothManager btManager=
                (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
        final BluetoothDevice remoteDevice=
                btManager.getAdapter().getRemoteDevice(addr);

        // Create a MetaWear board object for the Bluetooth Device
        board = serviceBinder.getMetaWearBoard(remoteDevice);
    }

    private void startLogging() {

    }

    private void stopLogging() {

    }

    private void resetBoard() {

    }

}
