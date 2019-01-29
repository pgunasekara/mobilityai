package com.ai.mobility.mobilityai;

public class MetaWearBoards {
    private static final MetaWearBoards m_instance = new MetaWearBoards();

    public static MetaWearBoards getInstance() {
        return m_instance;
    }

    private MetaWearBoards() {
    }
}
