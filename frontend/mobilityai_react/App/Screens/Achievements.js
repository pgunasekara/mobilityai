import React from 'react';
import { TouchableOpacity, Button, ScrollView, StyleSheet, Text, View, TextInput } from 'react-native';
import { Input, Icon } from 'react-native-elements'
import { GetPatientAchievements, AddPatientAchievements } from '../Lib/Api';

export default class PatientAchievements extends React.Component {
    static navigationOptions = ({ navigation }) => {
        var fname = navigation.getParam('firstName');
        var lname = navigation.getParam('lastName');
        var t = fname + " " + lname + '\'';

        if (lname.substring(lname.length - 1) != 's') {
            t += 's'
        }
        t += ' Profile'

        return {
            title: t,
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            firstName: props.firstName,
            lastName: props.lastName,
            steps: 0,
            activeTime: 0,
        }
    }

    componentDidMount() {
        GetPatientAchievements(this.props.id).then((achievementsJson) => {
            this.setState({ steps: achievementsJson.steps });
            this.setState({ activityGoal: achievementsJson.activityTime });
        });
    };

    saveAchievements() {
        // AddPatientAchievements(this.props.id, this.state.steps, this.state.activityGoal);
        alert("Saved");
    }

    render() {
        return (
            // <ScrollView>
            <View style={styles.container}>
                <View>
                    <Text style={styles.title}>Activity Goals</Text>
                </View>

                <View style={styles.container}>
                    <View style={styles.boxLayout}>
                        <View>
                            <Text>Steps</Text>
                            <TextInput
                                style={styles.inputBox}
                                keyboardType='numeric'
                                onChangeText={(steps) => this.setState({ steps: steps })}
                                defaultValue={this.state.steps.toString()}
                                placeholder='Steps'
                            />

                        </View>
                        <View>
                            <Text>Active Time/Hour</Text>
                            <TextInput
                                style={styles.inputBox}
                                keyboardType='numeric'
                                onChangeText={(activeTime) => this.setState({ activeTime: activeTime })}
                                defaultValue={this.state.activeTime.toString()}
                                placeholder='Active Time'
                            />
                        </View>
                    </View>
                </View>
                <View style={styles.saveBtn}>
                    <Button
                        title='Save'
                        // onPress={() => saveAchievements.bind(this)}
                        onPress={() => alert('Saved!!')}
                        color="#5DACBD"
                    />
                </View>


            </View>
            // </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
    },

    boxLayout: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },

    inputBox: {
        width: 100,
        borderColor: 'black',
        borderWidth: 2,
        borderRadius: 10,
        textAlign: 'center',
    },

    saveBtn: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        borderRadius: 100,
    },

    title: {
        textAlign: 'left',
        fontSize: 20,
        padding: 10,
        color: "#5DACBD",
    },
});
