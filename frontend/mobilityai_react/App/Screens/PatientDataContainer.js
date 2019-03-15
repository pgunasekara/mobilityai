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
        var id = navigation.getParam('id');
        var firstName = navigation.getParam('firstName');
        var lastName = navigation.getParam('lastName');
        return {
            title: firstName + ' ' + lastName,
            headerRight: (
                <View style={styles.center}>
                    <View style={styles.shift}>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate('PatientObservations', {
                                    id: id,
                                    firstName: firstName,
                                    lastName: lastName,
                                    navigation: navigation,
                                    userId: 1, //HARDCODED FOR NOW
                                })
                            }}
                        >
                            <Icon
                                name='comments'
                                size={30}
                                type='font-awesome'
                                color='black'
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.shift}>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate('PatientForm', {
                                    id: id,
                                    firstName: firstName,
                                    lastName: lastName,
                                    navigation: navigation,
                                    update: true,
                                })
                            }}
                        >
                            <Icon
                                name='info-circle'
                                size={30}
                                type='font-awesome'
                                color='black'
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingRight: 10 }}>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate('PatientAchievements', {
                                    id: id,
                                    firstName: firstName,
                                    lastName: lastName,
                                    navigation: navigation
                                })
                            }}
                        >
                            <Icon
                                name='trophy'
                                size={30}
                                type='font-awesome'
                                color='black'
                            />
                        </TouchableOpacity>
                    </View>
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
                        tabTitle='Daily Patient Activity'
                    />
                </View>
                <View>
                    <PatientData
                        id={navigation.getParam('id')}
                        firstName={this.props.firstName}
                        lastName={this.props.lastName}
                        date={new Date()}
                        tabView={1}
                        tabTitle='Weekly Patient Activity'
                    />
                </View>
                <View>
                    <PatientData
                        id={navigation.getParam('id')}
                        firstName={this.props.firstName}
                        lastName={this.props.lastName}
                        date={new Date()}
                        tabView={2}
                        tabTitle='Monthly Patient Activity'
                    />
                </View>
                <View>
                    <PatientData
                        id={navigation.getParam('id')}
                        firstName={this.props.firstName}
                        lastName={this.props.lastName}
                        date={new Date()}
                        tabView={3}
                        tabTitle='Overall Patient Activity'
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
    shift: {
        marginRight: 20,
    },
});
