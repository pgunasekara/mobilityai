package com.ai.mobility.mobilityai;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.Context;
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

import java.util.HashMap;

import bolts.Continuation;
import bolts.Task;

public class MetaMotionService {

    private static final MetaMotionService m_instance = new MetaMotionService();
    public static MetaMotionService getInstance() {
        return m_instance;
    }
    private final String TAG = "MobilityAI";

    //Set of connected boards mapped to their mac addresses
    private HashMap<String, MetaWearBoard> m_boards = new HashMap<String, MetaWearBoard>();

    private MetaMotionService() {}

    //Connects and adds a new board to the list of connected boards
    public Task<Void> connectAndAdd(String macAddr, MetaWearBoard board) {
        //Add to list of boards
        m_boards.put(macAddr, board);

        //Check if board can be deserialized

        //Connect to board
        return m_boards.get(macAddr).connectAsync().continueWithTask(task -> {
            if(task.isFaulted()) {
                Log.i(TAG, "Failed to configure app", task.getError());
            } else {
                Log.i(TAG, "App Configured, connected: " + macAddr);

                //Deserialize board
            }
            return null;
        });
    }

    //Disconnect and clear all boards



    //Metawear components
    private MetaWearBoard board;
    private BtleService.LocalBinder serviceBinder;
    private Led led;
    private Accelerometer accelerometer;
    private GyroBmi160 gyroscope;
    private Logging logging;
    private String macAddr;

    //Testing
    private final String MW_MAC_ADDRESS= "D1:87:11:D8:F3:C0";

    public MetaMotionService(BtleService.LocalBinder serviceBinder) {
        //Connect to boards
        this.serviceBinder = serviceBinder;
    }

    //Connect
    //Disconnect
    //Copy Data + clear existing data
    //  helper - format data into csv/json
    //Start Sensor
    //Stop Sensor
    //Count footsteps


    /**
     * Connect to board and populate sensor component variables
     * @param macAddr MAC address of device to connect
     * @param remoteDevice BluetoothDevice to connect
     */
    public void connect(String macAddr, BluetoothDevice remoteDevice) {
        board = serviceBinder.getMetaWearBoard(remoteDevice);
        this.macAddr = macAddr;

        board.connectAsync().continueWithTask(task -> {
            if (task.isFaulted()) {
                Log.i("MobilityAI", "Failed to configure app", task.getError());
            } else {

                Log.i("MobilityAI", "App Configured, connected: " + this.macAddr);

                //Retrieve Modules
                led = board.getModule(Led.class);
                accelerometer = board.getModule(Accelerometer.class);
                gyroscope = board.getModule(GyroBmi160.class);
            }

            return null;
        });

//            @Override
//            public Void then(Task<Void> task) throws Exception {
//
//
////                    //Configure accelerometer to set sampling rate to 25Hz
////                    accelerometer.configure()
////                            .odr(25f)       // Set sampling frequency to 25Hz, or closest valid ODR
////                            .commit();
////
////                    //Add route to log accelerometer data
////                    return accelerometer.acceleration().addRouteAsync(new RouteBuilder() {
////                        @Override
////                        public void configure(RouteComponent source) {
////                            source.stream(new Subscriber() {
////                                @Override
////                                public void apply(Data data, Object... env) {
////                                    Log.i(TAG, "Accelerometer: " + data.value(Acceleration.class).toString());
////                                }
////                            });
////                        }
////                    });
//
//                }
//            }
//        });
    }

    public void disconnect() {

    }

    public void setBatteryLevel(int id) {

    }

    private void retrieveBoard() {
        //TODO: FIX THIS
        /*final BluetoothManager btManager=
                (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);*/
        final BluetoothDevice remoteDevice; //=
                //btManager.getAdapter().getRemoteDevice(MW_MAC_ADDRESS);

        // Create a MetaWear board object for the Bluetooth Device
        board = null; //serviceBinder.getMetaWearBoard(remoteDevice);

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
                    Log.i(TAG, "MAC Address: "+board.getMacAddress());
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
