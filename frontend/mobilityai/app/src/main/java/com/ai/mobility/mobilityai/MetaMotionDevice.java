package com.ai.mobility.mobilityai;

public class MetaMotionDevice {
    private String firstName;
    private String lastName;
    private String macAddr;
    private Integer battery;
    private String lastSync;
    private int rssi;
    private int colour;
    private MetaMotionService service;

    public MetaMotionDevice(String firstName, String lastName, String macAddr, Integer battery, String lastSync, int rssi) {
        this.setFirstName(firstName);
        this.setLastName(lastName);
        this.setMacAddr(macAddr);
        this.setBattery(battery);
        this.setLastSync(lastSync);
        this.setRssi(rssi);
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

    public String getFirstName() { return firstName; }

    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }

    public void setLastName(String lastName) { this.lastName = lastName; }
}
