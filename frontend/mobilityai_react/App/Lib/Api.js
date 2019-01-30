import RNFetchBlob from 'rn-fetch-blob';

const SERVER_URL = "https://localhost:5001/";

export function AddPatientData(patientData) {
    const route = "api/MobilityAI/AddPatientData?PatientData=";
    let url = encodeURI(SERVER_URL + route + patientData);
    console.log("AddPatientData: Make a post request to: " + url);
    return RNFetchBlob.config({
            trusty : true
        })
        .fetch('POST', url)
        .then((response) => console.log(JSON.stringify(response)))
        .catch((error) => console.log(JSON.stringify(error)));
};

export function GetPatients() {
    const route = "api/MobilityAI/GetPatients";
    let url = encodeURI(SERVER_URL + route);
    console.log("GetPatients: Make get request to: " + url);
    return RNFetchBlob.config({
            trusty: true
        })
        .fetch('GET', url)
        .then((response) => {
            console.log(JSON.stringify(response));
            return response.json();
        })
        .catch((error) => console.log(JSON.stringify(error)));
};

export default {AddPatientData, GetPatients}