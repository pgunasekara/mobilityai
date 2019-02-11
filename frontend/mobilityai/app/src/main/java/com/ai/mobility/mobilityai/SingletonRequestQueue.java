package com.ai.mobility.mobilityai;

import android.content.Context;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.Volley;

class SingletonRequestQueue {
    private static SingletonRequestQueue m_instance;
    private RequestQueue m_requestQueue;
    private static Context m_ctx;

    private SingletonRequestQueue(Context ctx) {
        m_ctx = ctx;
        m_requestQueue = getRequestQueue();
    }

    public RequestQueue getRequestQueue() {
        if(m_requestQueue == null) {
            m_requestQueue = Volley.newRequestQueue(m_ctx.getApplicationContext());
        }
        return m_requestQueue;
    }

    public static synchronized SingletonRequestQueue getInstance(Context context) {
        if (m_instance == null) {
            m_instance = new SingletonRequestQueue(context);
        }
        return m_instance;
    }

    public <T> void addToRequestQueue(Request<T> req) {
        getRequestQueue().add(req);
    }
}
