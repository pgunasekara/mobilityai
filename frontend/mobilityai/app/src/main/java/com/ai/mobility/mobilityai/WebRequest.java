package com.ai.mobility.mobilityai;

import android.content.Context;
import android.util.Log;
import android.widget.Toast;

import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.RetryPolicy;
import com.android.volley.error.VolleyError;
import com.android.volley.request.SimpleMultiPartRequest;

class WebRequest {
    private static final WebRequest ourInstance = new WebRequest();
    private static final String TAG = "MobilityAI";

    static WebRequest getInstance() {
        return ourInstance;
    }

    private WebRequest() { }

    public SimpleMultiPartRequest uploadSensorData(Context context, int patientId, String path, String aFile, String gFile) {
        String url = SingletonRequestQueue.getUrl() + "SensorData/AddSensorData";
        String accelerometerFile = path + "/" + aFile;
        String gyroscopeFile = path + "/" + gFile;

        SimpleMultiPartRequest smr = getSMRObject(context, url);

        smr.addStringParam("patientId", "25");
        smr.addFile("accelerometerFile", accelerometerFile);
        smr.addFile("gyroscopeFile", gyroscopeFile);

        return smr;
    }

    public SimpleMultiPartRequest uploadStepCount(Context context, int patientId, int steps, String date) {
        String url = SingletonRequestQueue.getUrl() + "SensorData/AddStepCount";

        SimpleMultiPartRequest smr = getSMRObject(context, url);

        smr.addStringParam("patientId", "25");
        smr.addStringParam("steps", Integer.toString(steps));
        smr.addStringParam("date", date);

        return smr;
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
