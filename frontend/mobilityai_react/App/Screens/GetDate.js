import React, { Component } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import DatePicker from 'react-native-datepicker'


 // Getting the current date
 export default class GetDate extends Component {
    constructor(props) {
        super(props);

        const date = new Date().toLocaleDateString('en-CA');

        this.state = {
            date: date,
        };
    }

    render() {
        return (
            <DatePicker
                style={{width: 200}}
                date={this.state.date}
                mode="date"
                placeholder="select date"
                format="YYYY-MM-DD"
                minDate="2019-01-01"
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                customStyles={{
                    dateIcon: {
                        position: 'absolute',
                        left: 0,
                        top: 4,
                        marginLeft: 0
                    },
                    dateInput: {
                        marginLeft: 36
                    }
                }}
                onDateChange={(date) => {this.setState({date: date})}}
            />
        );
    }
}