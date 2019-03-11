import RNFetchBlob from 'rn-fetch-blob';
// import { SERVER_URL} from 'react-native-dotenv'
const SERVER_URL = "http://mobilityai.teovoinea.com/"

export function AddPatientData(patientData) {
    const route = "api/Patients?patientData=" + patientData;

    let url = encodeURI(SERVER_URL + route);
    console.log("CreatePatient: Make a post request to: " + url);
    return RNFetchBlob.config({
        trusty: true
    })
        .fetch('POST', url)
        .then((response) => console.log(JSON.stringify(response)))
        .catch((error) => console.log(JSON.stringify(error)));
};

export function GetPatients() {
    const route = "api/Patients";
    let url = encodeURI(SERVER_URL + route);
    console.log(SERVER_URL);
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

export function GetPatientActivities(start, end, patientId) {
    const route = "api/Patients/" + patientId + "/Activity?start=" + start + "&end=" + end;
    let url = encodeURI(SERVER_URL + route);
    console.log("GetPatientActivities: Make get request to: " + url);

    return RNFetchBlob.config({
        trusty: true
    })
        .fetch('GET', url)
        .then((response) => {
            console.log(JSON.stringify(response));
            return response.json();
        })
        .catch((error) => console.log(JSON.stringify(error)));
}

export function GetPatientAchievements(patientId) {
    const route = "api/Patients/" + patientId + "/Achievements";
    let url = encodeURI(SERVER_URL + route + patientId);
    console.log("GetPatientAchievements: Make get request to: " + url);

    return RNFetchBlob.config({
        trusty: true
    })
        .fetch('GET', url)
        .then((response) => {
            console.log(JSON.stringify(response));
            return response.json();
        })
        .catch((error) => console.log(JSON.stringify(error)));
}

export function AddPatientAchievements(patientId, steps, activityTime) {
    const route = "api/Patients/" + patientId + "/Achievements?steps=" + steps + "&activityTime=" + activityTime;

    let url = encodeURI(SERVER_URL + route);
    console.log("AddPatientAchievements: Make a post request to: " + url);
    return RNFetchBlob.config({
        trusty: true
    })
        .fetch('POST', url)
        .then((response) => console.log(JSON.stringify(response)))
        .catch((error) => console.log(JSON.stringify(error)));
};

export function PatientData(patientId) {
    const route = "api/Patients/" + patientId + "/PatientData";

    let url = encodeURI(SERVER_URL + route);
    console.log("GetPatientData: Make get request to: " + url);
    return RNFetchBlob.config({
        trusty: true
    })
        .fetch('GET', url)
        .then((response) => {
            console.log(JSON.stringify(response));
            return response.json();
        })
        .catch((error) => console.log(JSON.stringify(error)));
}

export function UserSignUp(email, firstName, lastName, password) {
    const route = "api/Users?email=" + email + "&firstName=" + firstName + "&lastName=" + lastName + "&password=" + password;

    let url = encodeURI(SERVER_URL + route);
    console.log("SignUp: Make post request to: " + url);

    return RNFetchBlob.config({
        trusty: true
    })
        .fetch('POST', url)
        .then((response) => console.log(JSON.stringify(response)))
        .catch((error) => console.log(JSON.stringify(error)));
}

export default { AddPatientData, GetPatients, GetPatientActivities, GetPatientAchievements, AddPatientAchievements, PatientData, UserSignUp }