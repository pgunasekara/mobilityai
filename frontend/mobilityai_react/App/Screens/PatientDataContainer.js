import React, { Component } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';
import { Icon } from 'react-native-elements'

import PatientData from './PatientData';

export default class PatientDataContainer extends Component {
    constructor(props) {
        super(props);
    };

    static navigationOptions = ({ navigation }) => {
        var firstName = navigation.getParam('firstName');
        var lastName = navigation.getParam('lastName');
        return {
            title: navigation.getParam('firstName') + " " + navigation.getParam('lastName'),
            headerRight: (
                <View>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('PatientAchievements', {
                                firstName: firstName,
                                lastName: lastName,
                                navigation: navigation
                            })
                        }}>
                        <View style={[styles.center, styles.menu]}>
                            <Icon
                                name='calendar'
                                size={30}
                                type='font-awesome'
                                color='black'
                            />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate('PatientAchievements', {
                                firstName: firstName,
                                lastName: lastName,
                                navigation: navigation
                            })
                        }}>
                        <View style={[styles.center]}>
                            <Icon
                                name='trophy'
                                size={30}
                                type='font-awesome'
                                color='grey'
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            )
        };
    };

    render() {
        const navigation = this.props.navigation;
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

const styles = StyleSheet.create({
    center: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menu: {
        paddingRight: 50,
    },
    shift: {
        marginRight: 25,
    },
});