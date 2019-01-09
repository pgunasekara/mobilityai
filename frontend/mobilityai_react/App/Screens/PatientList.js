import React from 'react';
import {Platform, StyleSheet, Text, View, FlatList} from 'react-native';

import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';

import PatientListItem from './PatientListItem';

export default class PatientList extends React.Component {
    
    render() {
        //TODO: API request to fetch data
        var patients = [
            {
                key: "1",
                firstName: "Joe",
                lastName: "Johnson",
                bandId: "",
            },
            {
                key: "2",
                firstName: "Ruth",
                lastName: "Reynolds",
                bandId: "",
            }
        ]
        return (
            <View style={{alignSelf: "stretch"}}>
                <FlatList
                    data = {patients}
                    renderItem = {({item, index}) => (
                        <PatientListItem
                            navigation = {this.props.navigation}
                            picture = {item.picture}
                            firstName = {item.firstName}
                            lastName = {item.lastName}
                            firstRow = {index == 0}
                        />
                    )}
                />
                <View style={{flex:1, backgroundColor: '#f3f3f3'}}>
                    {/* Rest of the app comes ABOVE the action button component !*/}
                    <ActionButton buttonColor="rgba(231,76,60,1)">
                        <ActionButton.Item buttonColor='#9b59b6' title="New Task" onPress={() => console.log("notes tapped!")}>
                            <Icon name="md-create" style={styles.actionButtonIcon} />
                        </ActionButton.Item>
                    </ActionButton>
                </View>
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