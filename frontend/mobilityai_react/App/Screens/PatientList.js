import React from 'react';
import {Platform, StyleSheet, Text, View, FlatList} from 'react-native';

import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';

import PatientListItem from './PatientListItem';

export default class PatientList extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            patients : [
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
        }

    }



    render() {
        //TODO: API request to fetch data
        /*
        fetch(url)
        .then(response => response.json())
        .then(data => this.setState({patients: data}))
        */

        const {navigate} = this.props.navigation;
        return (
            <View style={{alignSelf: "stretch"}}>
                <FlatList
                    data = {this.state.patients}
                    renderItem = {({item, index}) => (
                        <PatientListItem
                            navigation = {this.props.navigation}
                            firstName = {item.firstName}
                            lastName = {item.lastName}
                            firstRow = {index == 0}
                        />
                    )}
                />
                <View style={{flex:1, backgroundColor: '#f3f3f3'}}>
                    {/* Rest of the app comes ABOVE the action button component !*/}
                    <ActionButton buttonColor="rgba(231,76,60,1)"
                        onPress={() => navigate('PatientForm', {}) }
                        degrees={0}>
                        <Icon name="md-create" style={styles.actionButtonIcon} />
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
