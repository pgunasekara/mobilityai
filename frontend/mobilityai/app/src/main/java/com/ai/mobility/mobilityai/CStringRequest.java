package com.ai.mobility.mobilityai;

import com.android.volley.NetworkResponse;
import com.android.volley.Response;
import com.android.volley.request.StringRequest;

import org.json.JSONObject;

public class CStringRequest extends StringRequest {

    private int m_statusCode;
    private String m_response;

    public CStringRequest(int method, String url, Response.Listener<String> listener, Response.ErrorListener errorListener) {
        super(method, url, listener, errorListener);
        m_statusCode = 0;
        m_response = null;
    }

    public CStringRequest(String url, Response.Listener<String> listener, Response.ErrorListener errorListener) {
        super(url, listener, errorListener);
        m_statusCode = 0;
        m_response = null;
    }

    public int getStatusCode() { return m_statusCode; }
    public String getResponse() { return m_response; }

    @Override
    protected Response<String> parseNetworkResponse(NetworkResponse response) {
        m_statusCode = response.statusCode;
        m_response = response.data.toString();
        return super.parseNetworkResponse(response);
    }

}
