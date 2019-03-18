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
        String url = SingletonRequestQueue.getUrl() + "SensorData/" + patientId;
        String accelerometerFile = path + "/" + aFile;
        String gyroscopeFile = path + "/" + gFile;

        Log.i(TAG, url);
        Log.i(TAG, accelerometerFile);
        Log.i(TAG, gyroscopeFile);

        SimpleMultiPartRequest smr = getSMRObject(context, url);

        smr.addFile("accelerometerFile", accelerometerFile);
        smr.addFile("gyroscopeFile", gyroscopeFile);

        return smr;
    }

    public SimpleMultiPartRequest uploadStepCount(Context context, int patientId, String path, String sFile) {
        String url = SingletonRequestQueue.getUrl() + "SensorData/" + patientId + "/AddSteps";
        String stepFile = path + "/" + sFile;

        Log.i(TAG, url);
        Log.i(TAG, stepFile);

        SimpleMultiPartRequest smr = getSMRObject(context, url);

        smr.addFile("steps", stepFile);

        return smr;
    }

    public CStringRequest getDeviceInfo(Context context, Response.Listener<String> listener, Response.ErrorListener eListener, String macAddr) {
        String url = SingletonRequestQueue.getUrl() + "Devices/" + macAddr;
        Log.i("MobilityAI", url);

        CStringRequest retVal = getCStringRequest(Request.Method.GET, url, listener, eListener);
        retVal.setShouldCache(false);

        return retVal;
    }

    public CStringRequest assignNewPatient(Context context, Response.Listener<String> listener, Response.ErrorListener eListener, String macAddr, int patientId) {
        String url = SingletonRequestQueue.getUrl() + "Devices/" + macAddr + "?name=MetaWear&patientId=" + patientId + "&lastSync=null";

        CStringRequest retVal = getCStringRequest(Request.Method.PUT, url, listener, eListener);
        retVal.setShouldCache(false);

        return retVal;
    }

    private CStringRequest getCStringRequest(int method, String url, Response.Listener<String> listener, Response.ErrorListener elistener) {
        CStringRequest req = new CStringRequest(method, url, listener, elistener);

        req.setRetryPolicy(new RetryPolicy() {
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

        return req;
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
