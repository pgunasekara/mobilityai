package com.ai.mobility.mobilityai;

import com.mbientlab.metawear.MetaWearBoard;

import java.util.HashMap;
import java.util.SortedSet;
import java.util.TreeSet;

public class MetaWearBoards {
    private static final MetaWearBoards m_instance = new MetaWearBoards();

    public static MetaWearBoards getInstance() { return m_instance; }

    private HashMap<String, MetaMotionService> m_boards = new HashMap<String, MetaMotionService>();
    private SortedSet<Integer> indices = new TreeSet<>();

    private MetaWearBoards() {
        for(Integer i = 0; i < 10; i++)
            indices.add(i);

    }

    public void enrollNewBoard(String macAddr, MetaWearBoard board) { m_boards.put(macAddr, new MetaMotionService(board)); }
    public MetaMotionService getBoard(String macAddr) { return m_boards.get(macAddr); }
    public void removeBoard(String macAddr) { m_boards.remove(macAddr); }
}
