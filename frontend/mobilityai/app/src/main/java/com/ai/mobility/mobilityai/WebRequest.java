package com.ai.mobility.mobilityai;

import android.content.Context;
import android.util.Log;
import android.widget.Toast;

import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.RetryPolicy;
import com.android.volley.error.VolleyError;
import com.android.volley.request.JsonObjectRequest;
import com.android.volley.request.JsonRequest;
import com.android.volley.request.SimpleMultiPartRequest;

import org.json.JSONObject;

class WebRequest {
    private static final WebRequest ourInstance = new WebRequest();
    private static final String TAG = "MobilityAI";

    static WebRequest getInstance() {
        return ourInstance;
    }

    private WebRequest() { }

    public SimpleMultiPartRequest uploadSensorData(Context context, int patientId, String path, String aFile, String gFile) {
        String url = SingletonRequestQueue.getUrl() + "SensorData/" + patientId + "/AddSensorData";
        String accelerometerFile = path + "/" + aFile;
        String gyroscopeFile = path + "/" + gFile;

        SimpleMultiPartRequest smr = getSMRObject(context, url);

        smr.addFile("accelerometerFile", accelerometerFile);
        smr.addFile("gyroscopeFile", gyroscopeFile);

        return smr;
    }

    public SimpleMultiPartRequest uploadStepCount(Context context, int patientId, String path, String sFile) {
        String url = SingletonRequestQueue.getUrl() + "SensorData/" + patientId + "/AddSteps";
        String stepFile = path + "/" + sFile;

        SimpleMultiPartRequest smr = getSMRObject(context, url);

        smr.addFile("accelerometerFile", stepFile);

        return smr;
    }

    public JsonObjectRequest getDeviceInfo(Context context, Response.Listener<JSONObject> listener, Response.ErrorListener eListener, String macAddr) {
        String url = SingletonRequestQueue.getUrl() + "Devices/" + macAddr;
        Log.i("MobilityAI", url);
        return new JsonObjectRequest(Request.Method.GET, url, null, listener, eListener);
    }

    private SimpleMultiPartRequest getSMRObject(Context context, String url) {
        SimpleMultiPartRequest smr = new SimpleMultiPartRequest(
                Request.Method.POST,
                url,
                new Response.Listener<String>() {
                    @Override
                    public void onResponse(String response) {
                        Log.i(TAG, "Response: " + response);
                        Toast.makeText(context, "Request Complete!", Toast.LENGTH_SHORT).show();
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.i(TAG, "Error.response " + error);
                        Toast.makeText(context, ("Volley Error: " + error), Toast.LENGTH_SHORT).show();
                    }
                }
        ) {
            @Override
            protected Response<String> parseNetworkResponse(NetworkResponse response) {
                int mStatusCode = response.statusCode;
                Log.i(TAG, "Response code: " + mStatusCode);
                return super.parseNetworkResponse(response);
            }
        };

        smr.setRetryPolicy(new RetryPolicy() {
            @Override
            public int getCurrentTimeout() {
                return 100000;
            }

            @Override
            public int getCurrentRetryCount() {
                return 100000;
            }

            @Override
            public void retry(VolleyError error) throws VolleyError { }
        });

        return smr;
    }
}
