import React, { Component } from 'react';
import { Text, View, Button, StyleSheet, TouchableOpacity } from 'react-native';

import DateTimePicker from 'react-native-modal-datetime-picker';


// Getting the current date
export default class GetDate extends Component {
    state = {
        isDateTimePickerVisible: false,
    };

    _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });
    _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });
    _handleDatePicked = (date) => {
        console.log('A date has been picked: ', date);
        this._hideDateTimePicker();
        this.props.date(date);
        this.setState({date: date});
        var fDate = this.getFormattedDate(this.state.date);
        this.setState({formattedDate: fDate});
    };

    getFormattedDate(date) {
        var weekdays = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
        var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec" ];
       
        let weekday = date.getDay();
        let month = date.getMonth();
        let day = date.getDate();
        let year = date.getFullYear();
       
        return(weekdays[weekday] + ' ' + monthNames[month] + ' ' + day + ', ' + year);
    }

    constructor(props) {
        super(props);
        const date = new Date(props.newDate);
        var fDate = this.getFormattedDate(date);
        this.state = {
            date: date,
            formattedDate: fDate,
        };
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <Button onPress={this._showDateTimePicker} title={this.state.formattedDate}>
                </Button>
                <DateTimePicker
                    isVisible={this.state.isDateTimePickerVisible}
                    onConfirm={this._handleDatePicked.bind(this)}
                    onCancel={this._hideDateTimePicker}
                    date={this.state.date}
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
                />
            </View>
        );
    }
}