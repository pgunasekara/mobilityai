import React from 'react';
import PatientData from '../App/Screens/PatientData';

import renderer from 'react-test-renderer';

const fakeNavigation = {
    navigation: {
        id: 'SomeId',
        firstName: "Pasindu",
        lastName: "Gunasekara",
        getParam: function(param) {
            return this[param];
        }
    }
};

test('renders correctly', () => {
    const tree = renderer.create(
        <PatientData
            navigation = {fakeNavigation}
            id= "someID"
            firstName = "Pasindu"
            lastName = "Gunasekara"
        />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});