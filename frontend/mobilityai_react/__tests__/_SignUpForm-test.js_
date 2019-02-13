import React from 'react';
import SignUp from '../App/Screens/SignUpForm';

import renderer from 'react-test-renderer';

const fakeNavigation = {
    'navigate': function() {}
};

test('renders correctly', () => {
    const tree = renderer.create(
        <SignUp
            navigation = {fakeNavigation}
        />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});