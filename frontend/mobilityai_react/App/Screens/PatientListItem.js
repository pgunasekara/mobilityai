import React, {Component} from 'react';

import {Text, View, Image, StyleSheet, TouchableHighlight} from 'react-native';

import {Avatar} from 'react-native-elements';

export default class PatientListItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: props.name,
            firstRow: props.firstRow,
            firstName: props.firstName,
            lastName: props.lastName,
        };
    }

    

    render() {
        const {navigate} = this.props.navigation;
        return (
            <View style={this.state.firstRow ?  styles.firstRow : styles.row}>
                <TouchableHighlight
                    onPress={() => {navigate('PatientData',
                            {
                                id: "someID",
                                firstName: this.state.firstName,
                                lastName: this.state.lastName
                            }
                    );}}
                >
                    <View style={this.state.rowContent}>
                        <Avatar
                            size="medium"
                            rounded
                            title={this.state.firstName[0] + this.state.lastName[0]}
                            onPress={() => console.log("Works!")}
                            activeOpacity={0.7}
                        />
                        <View style={styles.textContainer}>
                            <Text style={styles.text}>{this.state.firstName + " " + this.state.lastName}</Text>
                        </View>
                    </View>
                </TouchableHighlight>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    rowContent: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    row: {
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
        paddingBottom: 15,
        paddingTop: 15,
        paddingLeft: 5,
    },
    firstRow: {
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
        borderTopWidth: 1,
        borderTopColor: 'grey',
        paddingBottom: 15,
        paddingTop: 15,
        paddingLeft: 5,
    },
    image: {
        width: 50, 
        height: 50,
        borderRadius: 25,
        flex: 0,
        backgroundColor: 'red'
    },
    textContainer: {
        flex: 1,
        textAlign: "center",
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'green'
    },
    text: {
        // fontWeight: "bold",
        fontSize: 30,
    }
});