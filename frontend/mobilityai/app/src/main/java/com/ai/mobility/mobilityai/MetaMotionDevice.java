package com.ai.mobility.mobilityai;

public class MetaMotionDevice {
    private String name;
    private String firstName;
    private String lastName;
    private String assignedUser;
    private String macAddr;
    private Integer battery;
    private String lastSync;
    private int rssi;
    private int colour;
    private MetaMotionService service;

    public MetaMotionDevice(String name, String assignedUser, String macAddr, Integer battery, String lastSync, int rssi) {
        this.setName(name);
        this.setAssignedUser(assignedUser);
        this.setMacAddr(macAddr);
        this.setBattery(battery);
        this.setLastSync(lastSync);
        this.setRssi(rssi);
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAssignedUser() {
        return assignedUser;
    }

    public void setAssignedUser(String assignedUser) {
        this.assignedUser = assignedUser;
    }

    public String getMacAddr() {
        return macAddr;
    }

    public void setMacAddr(String macAddr) {
        this.macAddr = macAddr;
    }

    public Integer getBattery() {
        return battery;
    }

    public void setBattery(Integer battery) {
        this.battery = battery;
    }

    public String getLastSync() {
        return lastSync;
    }

    public void setLastSync(String lastSync) {
        this.lastSync = lastSync;
    }

    public int getRssi() {
        return rssi;
    }

    public void setRssi(int rssi) {
        this.rssi = rssi;
    }

    public int getColour() { return colour; }

    public void setColour(int colour) { this.colour = colour; }

    public MetaMotionService getService() {
        return service;
    }

    public void setService(MetaMotionService service) {
        this.service = service;
    }
}
