import React, { Component } from 'react';
import { Text, View, Button, StyleSheet, TouchableOpacity } from 'react-native';

import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';


// Getting the current date
export default class DatePicker extends Component {

    _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });
    _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });
    _handleDatePicked = (date) => {
        this.props.dateCallback(date);
        this.setState({
            isDateTimePickerVisible : false,
            date: date,
            formattedDate: moment(this.state.date).format('MMMM Do YYYY')
        });
    };

    constructor(props) {
        super(props);
        const dateFormat = "MMMM Do YYYY";
        this.state = {
            date: props.date,
            formattedDate: moment(props.date).format(dateFormat),
            formatString : dateFormat
        };
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <Button 
                    onPress={this._showDateTimePicker} 
                    title={moment(this.state.date).format(this.state.formatString)}
                    color="#5DACBD"    
                >
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