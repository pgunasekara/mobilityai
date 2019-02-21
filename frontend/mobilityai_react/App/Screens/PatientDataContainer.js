import React, { Component } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';

import PatientData from './PatientData';


export default class PatientDataContainer extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
          title: navigation.getParam('firstName') + " " + navigation.getParam('lastName'),
        };
    };

    constructor(props) {
        super(props);
    };

    render() {
        const { navigation }= this.props;
        return (
            
            <Swiper>
                <View>
                    <PatientData
                        id={navigation.getParam('id')}
                        firstName={this.props.firstName}
                        lastName={this.props.lastName}
                        date={new Date()}
                        tabView={0}
                    />
                </View>
                <View>
                    <PatientData
                        id={navigation.getParam('id')}
                        firstName={this.props.firstName}
                        lastName={this.props.lastName}
                        date={new Date()}
                        tabView={1}
                    />               
                </View>
                <View>
                    <PatientData
                        id={navigation.getParam('id')}
                        firstName={this.props.firstName}
                        lastName={this.props.lastName}
                        date={new Date()}
                        tabView={2}
                    />                
                </View>
                <View>
                    <PatientData
                        id={navigation.getParam('id')}
                        firstName={this.props.firstName}
                        lastName={this.props.lastName}
                        date={new Date()}
                        tabView={3}
                    />                
                </View>
            </Swiper>
        );
    }
}