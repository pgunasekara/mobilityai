import RNFetchBlob from 'rn-fetch-blob';
import { SERVER_URL} from 'react-native-dotenv';

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
    const route = "api/Patients/";
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
    let url = encodeURI(SERVER_URL + route);
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

export function AddPatientAchievements(patientId, steps, activeMinutes, walkingMinutes, standingMinutes) {
    const route = "api/Patients/" + patientId + "/Achievements?steps=" + steps + "&activeMinutes=" + activeMinutes + "&walkingMinutes=" + walkingMinutes + "&standingMinutes=" + standingMinutes;

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
    const route = "api/Patients/" + patientId;

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

export function AddObservations(userId, patientId, comment) {
    const route = "api/Patients/" + patientId + "/Observations?userId=" + userId + "&comment=" + comment;

    let url = encodeURI(SERVER_URL + route);
    console.log("AddObservations: Make put request to: " + url);

    return RNFetchBlob.config({
        trusty: true
    })
        .fetch('PUT', url)
        .then((response) => console.log(JSON.stringify(response)))
        .catch((error) => console.log(JSON.stringify(error)));
}

export function GetObservations(patientId) {
    const route = "api/Patients/" + patientId + "/Observations";

    let url = encodeURI(SERVER_URL + route);
    console.log("GetObservations: Make get request to: " + url);

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

export function AddSurvey(patientId, survey) {
    const route = "api/Patients/" + patientId + "/Surveys?surveyData=" + survey;

    let url = encodeURI(SERVER_URL + route);
    console.log("Make put request to: " + url);

    return RNFetchBlob.config({
        trusty: true
    })
        .fetch('PUT', url)
        .then((response) => console.log(JSON.stringify(response)))
        .catch((error) => console.log(JSON.stringify(error)));
}

export function GetSurveys(patientId) {
    const route = "api/Patients/" + patientId + "/Surveys";

    let url = encodeURI(SERVER_URL + route);
    console.log("Make get request to: " + url);
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

export function GetSteps(patientId) {
    const route = "api/Patients/" + patientId + "/Steps";

    let url = encodeURI(SERVER_URL + route);
    console.log("GetObservations: Make get request to: " + url);

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

export default { AddPatientData, GetPatients, GetPatientActivities, GetPatientAchievements, AddPatientAchievements, PatientData, UserSignUp, AddObservations, GetObservations, GetSteps, GetSurveys, AddSurvey }
