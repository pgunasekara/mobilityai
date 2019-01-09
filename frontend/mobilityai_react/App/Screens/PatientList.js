import React from 'react';
import {Platform, StyleSheet, Text, View, FlatList} from 'react-native';

import PatientListItem from './PatientListItem';

export default class PatientList extends React.Component {
    
    render() {
        //TODO: API request to fetch data
        var patients = [
            {
                key: "1",
                picture: "https://previews.123rf.com/images/starush/starush1110/starush111000003/10793777-senior-funny-bald-man-in-yellow-t-shirt-is-shows-gestures-and-grimaces.jpg",
                name: "Joe",
                bandId: ""
            },
            {
                key: "2",
                picture: "https://awomansview.typepad.com/.a/6a00e5537b38b6883301b7c6f4ac35970b-600wi",
                name: "Ruth",
                bandId: ""
            }
        ]
        return (
            <View style={{alignSelf: "stretch"}}>
                <FlatList
                    data = {patients}
                    renderItem = {({item, index}) => (
                        <PatientListItem
                            picture = {item.picture}
                            name = {item.name}
                            first = {index == 0}
                        />
                    )}
                />
            </View>
        );
    }
}