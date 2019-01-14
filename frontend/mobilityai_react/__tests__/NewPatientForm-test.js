import React from 'react';
import PatientForm from '../App/Screens/NewPatientForm';

import renderer from 'react-test-renderer';

test('renders correctly', () => {
    const tree = renderer.create(
        <PatientForm/>
    ).toJSON();

    expect(tree).toMatchSnapshot();
});