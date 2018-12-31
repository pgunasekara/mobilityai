package com.ai.mobility.mobilityai;

import android.content.Context;
import android.support.annotation.NonNull;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import java.util.ArrayList;

public class MetaMotionDeviceAdapter extends RecyclerView.Adapter<MetaMotionDeviceAdapter.MetaMotionDeviceHolder> {

    private Context m_context;
    private ArrayList<MetaMotionDevice> m_devices;

    public MetaMotionDeviceAdapter(Context context, ArrayList<MetaMotionDevice> devices) {
        m_context = context;
        m_devices = devices;
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
    }

    @Override
    public int getItemCount() {
        return m_devices.size();
    }

    public static class MetaMotionDeviceHolder extends RecyclerView.ViewHolder {
        private TextView devName, devAssignedUser, devMacAddr, devBattery, devLastSync;

        public MetaMotionDeviceHolder(View itemView) {
            super(itemView);
            devName = itemView.findViewById(R.id.devName);
            devAssignedUser = itemView.findViewById(R.id.devAssignedUser);
            devMacAddr = itemView.findViewById(R.id.devMacAddr);
            devBattery = itemView.findViewById(R.id.devBattery);
            devLastSync = itemView.findViewById(R.id.devLastSync);
        }

        public void setDetails(MetaMotionDevice device) {
            devName.setText(device.getName());
            devAssignedUser.setText(device.getAssignedUser());
            devMacAddr.setText(device.getMacAddr());
            devBattery.setText(device.getBattery().toString());
            devLastSync.setText(device.getLastSync());
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
            if(!exists(device)) {
                m_devices.add(device);
                notifyDataSetChanged();
            }
        }

        Log.i("MobilityAI", "Added device, size = "+m_devices.size());


        //TODO: Add RSSI stuff - https://github.com/mbientlab/BleToolbox/blob/master/scanner/src/main/java/com/mbientlab/bletoolbox/scanner/ScannedDeviceInfoAdapter.java

        //TODO: Order by strength
    }

    private int getPosition(MetaMotionDevice device) {
        return -1;
    }

    private boolean exists(MetaMotionDevice device) {
        for(MetaMotionDevice m : m_devices) {
            if(m.getMacAddr().equals(device.getMacAddr())) {
                return true;
            }
        }

        return false;
    }

}


