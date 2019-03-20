import React, { Component } from 'react';
import { ScrollView, StyleSheet, Text, View, Button, TextInput } from 'react-native';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';

import { AddSurvey, GetObservations } from '../Lib/Api';

const Field = (props) => <TextInput style={styles.field} {...props} />;

export default class Survey extends Component {
    constructor(props) {
        super(props);

        var existingState = this.props.navigation.getParam('surveyState');

        if (existingState) {
            this.state = {...existingState, usesExisting: true};
        }
        else {
            this.state = {
                id: this.props.navigation.getParam("id"),
                sensorAccuracy: "Neutral",
                consciousActivity: "Neutral",
                meetingGoals: "Neutral",
                completingSurveyName: "",
                usesExisting: false,
            }
        }
    }

    submitForm() {
        AddSurvey(this.state.id, JSON.stringify({ ...this.state, dateCompleted: new Date()}));
    }

    radioValueToInt(value) {
        switch (value) {
            case "Strongly Disagree": return 0;
            case "Disagree": return 1;
            case "Neutral": return 2;
            case "Agree": return 3;
            case "Strongly Agree": return 4;
            default: return -1;
        }
    }

    render() {
        const radio_props = [
            { label: "Strongly Disagree", value: "Strongly Disagree" },
            { label: "Disagree", value: "Disagree" },
            { label: "Neutral", value: "Neutral" },
            { label: "Agree", value: "Agree" },
            { label: "Strongly Agree", value: "Strongly Agree" },
        ];
        return (
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollable}>
                    <Text style={styles.titleText}>Please answer the following questions to the best of your ability</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.sliderText}>The sensor band accurately tracks my activity</Text>
                        <RadioForm
                            radio_props={radio_props}
                            formHorizontal={false}
                            initial={this.state.usesExisting ? this.radioValueToInt(this.state.sensorAccuracy) : 2}
                            onPress={(value) => { this.setState({ sensorAccuracy: value }) }}
                            style={styles.radioFormStyle}
                            accessible={false}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.sliderText}>I am more conscious about my activity while wearing the seonsor band</Text>
                        <RadioForm
                            radio_props={radio_props}
                            formHorizontal={false}
                            initial={this.state.usesExisting ? this.radioValueToInt(this.state.consciousActivity) : 2}
                            onPress={(value) => { this.setState({ consciousActivity: value }) }}
                            style={styles.radioFormStyle}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.sliderText}>I am meeting my activity goals</Text>
                        <RadioForm
                            radio_props={radio_props}
                            formHorizontal={false}
                            initial={this.state.usesExisting ? this.radioValueToInt(this.state.meetingGoals) : 2}
                            onPress={(value) => { this.setState({ meetingGoals: value }) }}
                            style={styles.radioFormStyle}
                        />
                    </View>
                    <Text style={styles.sliderText}>Name of the person completing this survey:</Text>
                    <Field onChangeText={(completingSurveyName) => this.setState({ completingSurveyName })}
                        value={this.state.completingSurveyName}
                        placeholder="Enter Name..."
                    />
                    {this.state.usesExisting ? null : 
                        <Button style={styles.submit} onPress={() => this.submitForm()}
                            title="Submit"
                        />
                    }
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    scrollable: {
        flexGrow: 1,
        justifyContent: "space-between",
    },
    field: {
        height: 50,
        paddingLeft: 6,
        borderColor: 'gray',
        borderWidth: 1,
        margin: 15,
        borderRadius: 5
    },
    submit: {
        backgroundColor: "#68a0cf",
        overflow: "hidden",
        marginTop: 100
    },
    sliderText: {
        fontSize: 20,
        color: '#555333',
        fontWeight: '500',
        paddingLeft: 20
    },
    titleText: {
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#555333',
        marginTop: 20
    },
    inputGroup: {
        paddingTop: 10,
    },
    radioFormStyle: {
        justifyContent: 'space-evenly',
        paddingLeft: 30,
    }
});