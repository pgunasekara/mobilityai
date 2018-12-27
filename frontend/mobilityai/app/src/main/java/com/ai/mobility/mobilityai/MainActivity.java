package com.ai.mobility.mobilityai;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.View;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Button;

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

import bolts.Continuation;
import bolts.Task;

public class MainActivity extends AppCompatActivity implements ServiceConnection {
    //Metawear classes
    private BtleService.LocalBinder serviceBinder;
    private Led led;
    private MetaWearBoard board;
    private Accelerometer accelerometer;
    private GyroBmi160 gyroscope;
    private Logging logging;

    private final String MW_MAC_ADDRESS= "D1:87:11:D8:F3:C0";
    private Button led_on, led_off;
    private static final String TAG = "MobilityAI";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        FloatingActionButton fab = (FloatingActionButton) findViewById(R.id.fab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
            }
        });

        led_on = (Button) findViewById(R.id.led_on);
        led_off = (Button) findViewById(R.id.led_off);

        led_on.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View v) {
                Log.i(TAG, "Turn on LED");
                led.editPattern(Led.Color.BLUE, Led.PatternPreset.BLINK)
                    .repeatCount((byte) 20)
                    .commit();
                led.play();
            }
        });

        led_off.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.i(TAG, "Turn off LED");
                led.stop(true);
            }
        });

        findViewById(R.id.start).setOnClickListener((View v) -> {
            logging.start(false);
            accelerometer.acceleration().start();
            accelerometer.start();
            gyroscope.angularVelocity().start();
            gyroscope.start();
            Log.i(TAG, "Start Accelerometer/Gyroscope");
        });

        findViewById(R.id.stop).setOnClickListener((View v) -> {
            accelerometer.stop();
            accelerometer.acceleration().stop();
            gyroscope.stop();
            gyroscope.angularVelocity().stop();

            Log.i(TAG, "Stop Accelerometer/Gyroscope");
            logging.stop();
            logging.downloadAsync().continueWith(new Continuation<Void, Void>() {
                @Override
                public Void then(Task<Void> task) throws Exception {
                    if(task.isFaulted()) {
                        Log.i(TAG, "Log download failed");
                    } else {
                        Log.i(TAG, "Log download complete");
                    }
                    board.tearDown();
                    return null;
                }
            });
        });

        // Bind the service when the activity is created
        getApplicationContext().bindService(new Intent(this, BtleService.class),
                this, Context.BIND_AUTO_CREATE);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        // Unbind the service when the activity is destroyed
        getApplicationContext().unbindService(this);
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

        retrieveBoard();
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

    private void retrieveBoard() {
        final BluetoothManager btManager=
                (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
        final BluetoothDevice remoteDevice=
                btManager.getAdapter().getRemoteDevice(MW_MAC_ADDRESS);

        // Create a MetaWear board object for the Bluetooth Device
        board = serviceBinder.getMetaWearBoard(remoteDevice);

        board.connectAsync().onSuccessTask(new Continuation<Void, Task<Route>>() {
            //Route to log accelerometer data
            @Override
            public Task<Route> then(Task<Void> task) throws Exception {
                Log.i("MobilityAI", "Connected: "+MW_MAC_ADDRESS);

                //Retrieve Modules
                led = board.getModule(Led.class);
                accelerometer = board.getModule(Accelerometer.class);

                logging = board.getModule(Logging.class);

                //Configure accelerometer to set sampling rate to 25Hz
                accelerometer.configure()
                        .odr(25f)       // Set sampling frequency to 25Hz, or closest valid ODR
                        .commit();

                //Add route to log accelerometer data
                return accelerometer.acceleration().addRouteAsync(new RouteBuilder() {
                    @Override
                    public void configure(RouteComponent source) {
                        // For streaming, replace with:
                        // source.stream(new Subscriber() {
                        source.log(new Subscriber() {
                            @Override
                            public void apply(Data data, Object... env) {
                                long epoch = data.timestamp().getTimeInMillis();
                                Log.i(TAG, "Accelerometer: " + epoch + " " +data.value(Acceleration.class).toString());

                            }
                        });
                    }
                });
            }
        }).onSuccessTask(new Continuation<Route, Task<Route>>() {
            //Route to log Gyroscope data
            @Override
            public Task<Route> then(Task<Route> task) throws Exception {
                gyroscope = board.getModule(GyroBmi160.class);

                gyroscope.configure()
                        .odr(GyroBmi160.OutputDataRate.ODR_25_HZ)
                        .range(GyroBmi160.Range.FSR_2000)
                        .commit();

                Log.i(TAG, "Gryoscope Init: " + gyroscope.toString());


                return gyroscope.angularVelocity().addRouteAsync(new RouteBuilder() {
                    @Override
                    public void configure(RouteComponent source) {
                        source.log(new Subscriber() {
                            @Override
                            public void apply(Data data, Object... env) {
                                Log.i(TAG, "Gyroscope: " + data.value(AngularVelocity.class).toString());
                            }
                        });
                    }
                });
            }
        }).continueWith(new Continuation<Route, Object>() {
            //If any of the setup tasks fail, then print error here
            @Override
            public Void then(Task<Route> task) throws Exception {
                if(task.isFaulted()) {
                    Log.i("MobilityAI", "Failed to configure app", task.getError());
                    board.tearDown();
                } else {
                    Log.i("MobilityAI", "App configured");
                }

                return null;
            }
        });
    }
}
