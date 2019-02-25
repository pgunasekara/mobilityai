import React from 'react';
import SignIn from '../App/Screens/SignInForm';

import renderer from 'react-test-renderer';

const fakeNavigation = {
    'navigate': function() {}
};

test('renders correctly', () => {
    const tree = renderer.create(
        <SignIn
            navigation = {fakeNavigation}
        />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});