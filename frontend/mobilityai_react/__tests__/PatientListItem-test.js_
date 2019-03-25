import React from 'react';
import PatientListItem from '../App/Screens/PatientListItem';

import renderer from 'react-test-renderer';

const fakeNavigation = {
    'navigate': function() {}
};

test('renders correctly', () => {
    const tree = renderer.create(
        <PatientListItem
            navigation = {fakeNavigation}
            firstName = "John"
            lastName = "Smith"
            firstRow = {false}
        />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});