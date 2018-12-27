package com.ai.mobility.mobilityai;

import android.bluetooth.BluetoothDevice;
import android.util.Log;

import com.mbientlab.metawear.Data;
import com.mbientlab.metawear.MetaWearBoard;
import com.mbientlab.metawear.Route;
import com.mbientlab.metawear.Subscriber;
import com.mbientlab.metawear.android.BtleService;
import com.mbientlab.metawear.builder.RouteBuilder;
import com.mbientlab.metawear.builder.RouteComponent;
import com.mbientlab.metawear.data.Acceleration;
import com.mbientlab.metawear.module.Accelerometer;
import com.mbientlab.metawear.module.GyroBmi160;
import com.mbientlab.metawear.module.Led;
import com.mbientlab.metawear.module.Logging;

import bolts.Continuation;
import bolts.Task;

public class MetaMotionService {
    //Metawear components
    private MetaWearBoard board;
    private BtleService.LocalBinder serviceBinder;
    private Led led;
    private Accelerometer accelerometer;
    private GyroBmi160 gyroscope;
    private Logging logging;

    //Testing
    private final String MW_MAC_ADDRESS= "D1:87:11:D8:F3:C0";
    private static final String TAG = "MobilityAI";

    public MetaMotionService() {
        //Connect to boards
    }

    //Connect
    //Disconnect
    //Copy Data + clear existing data
    //  helper - format data into csv/json
    //Start Sensor
    //Stop Sensor
    //Count footsteps


    public void connect(String macAddr, BluetoothDevice remoteDevice) {
        board.connectAsync().onSuccessTask(new Continuation<Void, Task<Route>>() {
            @Override
            public Task<Route> then(Task<Void> task) throws Exception {
                Log.i("MobilityAI", "Connected: "+MW_MAC_ADDRESS);

                //Retrieve Modules
                led = board.getModule(Led.class);
                accelerometer = board.getModule(Accelerometer.class);
                gyroscope = board.getModule(GyroBmi160.class);

                //Configure accelerometer to set sampling rate to 25Hz
                accelerometer.configure()
                        .odr(25f)       // Set sampling frequency to 25Hz, or closest valid ODR
                        .commit();

                //Add route to log accelerometer data
                return accelerometer.acceleration().addRouteAsync(new RouteBuilder() {
                    @Override
                    public void configure(RouteComponent source) {
                        source.stream(new Subscriber() {
                            @Override
                            public void apply(Data data, Object... env) {
                                Log.i(TAG, "Accelerometer: " + data.value(Acceleration.class).toString());
                            }
                        });
                    }
                });
            }
        }).continueWith(new Continuation<Route, Object>() {
            @Override
            public Void then(Task<Route> task) throws Exception {
                if(task.isFaulted()) {
                    Log.i("MobilityAI", "Failed to configure app", task.getError());
                } else {
                    Log.i("MobilityAI", "App configured");
                }

                return null;
            }
        });
    }




    //Getters for each module
    public MetaWearBoard getBoard() {
        return board;
    }

    public Led getLed() {
        return led;
    }

    public Accelerometer getAccelerometer() {
        return accelerometer;
    }

    public GyroBmi160 getGyroscope() {
        return gyroscope;
    }

    public Logging getLogging() {
        return logging;
    }

}
