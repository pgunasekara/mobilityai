package com.ai.mobility.mobilityai;

import android.bluetooth.BluetoothClass;
import android.content.Context;
import android.content.Intent;
import android.support.annotation.NonNull;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.TextView;

import java.util.ArrayList;

public class MetaMotionDeviceAdapter extends RecyclerView.Adapter<MetaMotionDeviceAdapter.MetaMotionDeviceHolder> {

    public interface OnItemClickListener{
        void onItemClick(MetaMotionDevice device);
    }

    private Context m_context;
    private ArrayList<MetaMotionDevice> m_devices;
    private OnItemClickListener m_listener;

    public MetaMotionDeviceAdapter(Context context, ArrayList<MetaMotionDevice> devices, OnItemClickListener listener) {
        m_context = context;
        m_devices = devices;
        m_listener = listener;
    }

    @NonNull
    @Override
    public MetaMotionDeviceHolder onCreateViewHolder(@NonNull ViewGroup parent, int i) {
        View view = LayoutInflater.from(m_context).inflate(R.layout.device_row, parent, false);
        return new MetaMotionDeviceHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull MetaMotionDeviceHolder metaMotionDeviceHolder, int i) {
        MetaMotionDevice device = m_devices.get(i);
        metaMotionDeviceHolder.setDetails(device);
        metaMotionDeviceHolder.bind(m_devices.get(i), m_listener);
    }

    @Override
    public int getItemCount() {
        return m_devices.size();
    }

    public static class MetaMotionDeviceHolder extends RecyclerView.ViewHolder {
        private TextView devName, devAssignedUser, devMacAddr, devBattery, devLastSync, devSignalStrength;

        public MetaMotionDeviceHolder(View itemView) {
            super(itemView);
            devName = itemView.findViewById(R.id.devName);
            devAssignedUser = itemView.findViewById(R.id.devAssignedUser);
            devMacAddr = itemView.findViewById(R.id.devMacAddr);
            devBattery = itemView.findViewById(R.id.devBattery);
            devLastSync = itemView.findViewById(R.id.devLastSync);
            devSignalStrength = itemView.findViewById(R.id.devSignalStrength);

            itemView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    //Open DeviceInfoActivity using MAC Address
//                    Intent intent = new Intent(getBaseContext(), DeviceInfoActivity.class);
//                    intent.putExtra("EXTRA_MAC_ADDR", );
                }
            });
        }

        public void setDetails(MetaMotionDevice device) {
            String signalString = "Signal Strength: ",
                    macaddrString = "MAC Address: " + device.getMacAddr(),
                    lastSynced ="Last Synced: " + device.getLastSync(),
                    batteryLevel = String.format("Battery Level: %d", device.getBattery());
            int rssi = device.getRssi();

            //Signal Strength indicators - https://www.netspotapp.com/what-is-rssi-level.html
            if(rssi > -50)
                signalString += "Excellent";
            else if(rssi > -60 && rssi <= -50)
                signalString += "Good";
            else if(rssi <= -60 && rssi > -70)
                signalString += "Fair";
            else if(rssi <= -70)
                signalString += "Weak";
            else
                signalString += "Unknown";

            devName.setText(device.getName());
            devAssignedUser.setText(device.getAssignedUser());
            devMacAddr.setText(macaddrString);
            devBattery.setText(batteryLevel);
            devLastSync.setText(lastSynced);
            devSignalStrength.setText(signalString);
        }

        public void bind(MetaMotionDevice device, OnItemClickListener listener) {
            itemView.setOnClickListener(new View.OnClickListener() {

                @Override
                public void onClick(View v) {
                    listener.onItemClick(device);
                }
            });
        }
    }

    public void clear() {
        final int size = m_devices.size();
        m_devices.clear();
        notifyItemRangeRemoved(0, size);
    }

    public void update(MetaMotionDevice device) {
        int pos = getPosition(device);

        if(pos == -1) {
            MetaMotionDevice dev = exists(device);
            if(dev == null) {
                m_devices.add(device);
                notifyDataSetChanged();
            } else
            {
                //Update rssi
                dev.setRssi(device.getRssi());
            }
        }

        Log.i("MobilityAI", "Added device, size = "+m_devices.size());


        //TODO: Add RSSI stuff - https://github.com/mbientlab/BleToolbox/blob/master/scanner/src/main/java/com/mbientlab/bletoolbox/scanner/ScannedDeviceInfoAdapter.java

        //TODO: Order by strength
    }

    private int getPosition(MetaMotionDevice device) {
        return -1;
    }

    private MetaMotionDevice exists(MetaMotionDevice device) {
        for(MetaMotionDevice m : m_devices) {
            if(m.getMacAddr().equals(device.getMacAddr())) {
                return m;
            }
        }

        return null;
    }

}


