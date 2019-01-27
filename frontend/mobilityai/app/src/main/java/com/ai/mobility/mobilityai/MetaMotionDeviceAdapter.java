package com.ai.mobility.mobilityai;

import android.bluetooth.BluetoothClass;
import android.content.Context;
import android.content.Intent;
import android.content.res.TypedArray;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.support.annotation.NonNull;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ImageView;
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
        private TextView devName, devAssignedUser, devMacAddr, devBattery, devLastSync, devSignalStrength, devInitials;
        private ImageView devProfileImage;

        public MetaMotionDeviceHolder(View itemView) {
            super(itemView);
            devName = itemView.findViewById(R.id.devName);
            devAssignedUser = itemView.findViewById(R.id.devAssignedUser);
            devMacAddr = itemView.findViewById(R.id.devMacAddr);
            devBattery = itemView.findViewById(R.id.devBattery);
            devLastSync = itemView.findViewById(R.id.devLastSync);
            devSignalStrength = itemView.findViewById(R.id.devSignalStrength);
            devProfileImage = itemView.findViewById(R.id.userImage);
            devInitials = itemView.findViewById(R.id.initials);
        }

        public void setDetails(MetaMotionDevice device) {
            String signalString = "Signal Strength: ",
                    macaddrString = "MAC Address: " + device.getMacAddr(),
                    lastSynced ="Last Synced: " + device.getLastSync(),
                    batteryLevel = String.format("Battery Level: %d", device.getBattery());
            signalString += getRssiString(device.getRssi());

            devName.setText(device.getName());
            devAssignedUser.setText(device.getAssignedUser());
            devMacAddr.setText(macaddrString);
            if(device.getAssignedUser().equals("Unassigned")) {
                devMacAddr.setTextSize(15);
                devMacAddr.setPadding(1,1,1,1);
            } else {
                devMacAddr.setTextSize(0);
                devMacAddr.setPadding(0,0,0,0);
            }

            devBattery.setText(batteryLevel);
            devLastSync.setText(lastSynced);
            devSignalStrength.setText(signalString);
            devProfileImage.setColorFilter(device.getColour());
            devInitials.setText(device.getAssignedUser().substring(0, 1));
        }

        public void bind(MetaMotionDevice device, OnItemClickListener listener) {
            itemView.setOnClickListener(new View.OnClickListener() {

                @Override
                public void onClick(View v) {
                    listener.onItemClick(device);
                }
            });
        }

        private String getRssiString(int rssi) {
            String retVal;

            //Signal Strength indicators - https://www.netspotapp.com/what-is-rssi-level.html
            if(rssi > -50)
                retVal = "Excellent";
            else if(rssi > -60 && rssi <= -50)
                retVal = "Good";
            else if(rssi <= -60 && rssi > -70)
                retVal = "Fair";
            else if(rssi <= -70)
                retVal = "Weak";
            else
                retVal = "Unknown";

            return retVal;
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
                device.setColour(getRandomMaterialColour());
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

    private int getRandomMaterialColour() {
        int returnColour = Color.GRAY;
        int arrayId = m_context.getResources().getIdentifier("mdcolor_" + "400", "array", m_context.getPackageName());

        if (arrayId != 0)
        {
            TypedArray colors = m_context.getResources().obtainTypedArray(arrayId);
            int index = (int) (Math.random() * colors.length());
            returnColour = colors.getColor(index, Color.BLACK);
            colors.recycle();
        }

        return returnColour;
    }
}


