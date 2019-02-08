import React, { Component } from 'react';
import { View, Button, StyleSheet } from 'react-native';


 // Getting the current date
 export default class GetDate extends Component {
    render() {
        const date = new Date().getDate().toString();
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        return (
            <View style={[styles.textInline, styles.dateButton]}>
                <Button style={[styles.dateButton]} title={date + '/' + month + '/' + year} onPress={() => {}} />
            </View>
        );

    }
}

const styles = StyleSheet.create({ 
    dateButton: {
        justifyContent: 'flex-end',
    },

    textInline: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
});
