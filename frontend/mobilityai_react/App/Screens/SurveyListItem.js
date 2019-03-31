import React, {Component} from 'react';

import {Text, View, Image, StyleSheet, TouchableHighlight} from 'react-native';

import moment from 'moment';

export default class SurveyListItem extends Component {

    // A single row in the Survey List.
    render() {
        const {navigate} = this.props.navigation;
        return (
            <TouchableHighlight
                    onPress={() => {navigate('Survey',
                            {
                                id: this.props.id,
                                navigation: navigate,
                                surveyState: this.props.surveyState
                            }
                    );}}
                    underlayColor="rgba(0, 0, 0, 0.1)"
            >
                <View style={this.props.firstRow ?  styles.firstRow : styles.row}>
                    <View style={styles.rowContent}>
                        <View style={styles.textContainer}>
                            <Text style={styles.text}>{"Created by: " + this.props.surveyState.completingSurveyName + " On: " + moment(this.props.surveyState.dateCompleted).format('lll')}</Text>
                        </View>
                    </View>
                </View>
            </TouchableHighlight>
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
    },
    textContainer: {
        flex: 1,
        textAlign: "center",
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        // fontWeight: "bold",
        fontSize: 15,
    }
});