import React, {Component} from 'react';

import {Text, View, Image, StyleSheet} from 'react-native';

export default class PatientData extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id: props.id,
            firstName: props.firstName,
            lastName: props.lastName,
        }
    }

    render() {
        const { navigation } = this.props;
        const id = navigation.getParam('id');
        const firstName = navigation.getParam('firstName');
        const lastName = navigation.getParam('lastName');
        return(
            <View>
                <Text>{id}</Text>
                <Text>{firstName + " " + lastName}</Text>
            </View>
        );
    }
}