import React from 'react';
import {Platform, StyleSheet, Text, View, FlatList} from 'react-native';

import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';

import PatientListItem from './PatientListItem';

import { GetPatients } from '../Lib/Api';

export default class PatientList extends React.Component {
    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount() {
        GetPatients().then((patientsJson) => {
            console.log(patientsJson);
            this.setState({patients: patientsJson});
        });
    }
    render() {
        const {navigate} = this.props.navigation;
        return (
            <View style={{flex: 1}}>
                <FlatList
                    data = {this.state.patients}
                    renderItem = {({item, index}) => (
                        <PatientListItem
                            navigation = {this.props.navigation}
                            firstName = {item.firstName}
                            lastName = {item.lastName}
                            firstRow = {index == 0}
                            id = {item.id}
                            deviceId = {item.deviceId}
                        />
                    )}
                />
                
                {/* Rest of the app comes ABOVE the action button component !*/}
                <ActionButton buttonColor="rgba(231,76,60,1)"
                    onPress={() => { navigate('PatientForm', {}) } }
                    degrees={0}>
                    <Icon name="md-create" style={styles.actionButtonIcon} />
                </ActionButton>
                
            </View>
        );
    }
}

const styles = StyleSheet.create({
    actionButtonIcon: {
      fontSize: 20,
      height: 22,
      color: 'white',
    },
  });
