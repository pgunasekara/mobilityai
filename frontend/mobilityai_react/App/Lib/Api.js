import RNFetchBlob from 'rn-fetch-blob';
import { SERVER_URL} from 'react-native-dotenv'
// const SERVER_URL = "https://mobilityai.teovoinea.com/";

export function AddPatientData(patientData) {
    const route = "api/MobilityAI/AddPatientData?PatientData=";

    let url = encodeURI(SERVER_URL + route + patientData);
    console.log("AddPatientData: Make a post request to: " + url);
    return RNFetchBlob.config({
        trusty: true
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

export function GetPatientActivities(start, end, patientId) {
    const route = "api/MobilityAI/GetActivityData?start=" + start + "&end=" + end + "&patientId=" + patientId;
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


/* Ignore, work in progress */
/*
export function UserSignUp(email, firstName, lastName, password) {
    const route = "api/MobilityAI/SignUpUser";// ?email=" + email + "&firstName=" + firstName + "&lastName=" + lastName + "&password=" + password;
    let url = encodeURI(SERVER_URL + route);
    // console.log("SignUpUser: Make post reqest to: " + url);

    return RNFetchBlob.config({
        trusty: true
    })
        //     .fetch('POST', url)
        //     .then((response) => console.log(JSON.stringify(response)))
        //     .catch((error) => console.log(JSON.stringify(error)));
        .fetch(url, {
            method: 'POST',
            // body: JSON.stringify({
            //     email: email,
            //     firstName: firstName,
            //     lastName: lastName,
            //     password: password,
            // }),
            body: "email=email&firstName=firstName&lastName=lastName&password=password",
            headers: new Headers({
                // Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'//'application/json'
            })
        }).then((response) => console.log(response.text()))
        // .then((responseText) => {
        //     alert(responseText);
        // })
        .catch((error) => {
            console.error(error);
        });//.then (res => res.json())
    //   .then(response => console.log('Success: ', JSON.stringify(response)))
    //   .catch(error => console.log('Error: ', JSON.stringify(error)));
}
*/
export default { AddPatientData, GetPatients, GetPatientActivities }