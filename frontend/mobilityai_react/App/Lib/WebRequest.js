// function SignUpRequest(email, fName, lName, pw) {
//     fetch('http://40.117.231.58:5000/api/MobilityAI/SignUpUser', {
//         method: 'POST',
//         headers: {
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             email: email,
//             firstName: fName,
//             lastName: lName,
//             password: pw,
//         }),
//     });
// }

async function SignUpRequest(email, fName, lName, pw) {
    try {
        let response = await fetch(
            'http://40.117.231.58:5000/api/MobilityAI/SignUpUser',
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    firstName: fName,
                    lastName: lName,
                    password: pw,
                }),
            });
        // let responseJson = await response.json();
        if (Response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error(error);
    }
}