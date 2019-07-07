import React from 'react';
import { Alert, TouchableOpacity, Button, ScrollView, StyleSheet, Text, View, TextInput } from 'react-native';
import { Input, Icon } from 'react-native-elements'
import { GetPatientAchievements, AddPatientAchievements } from '../Lib/Api';
import { LoadingComponent} from '../Lib/GenericComponents';

export default class PatientAchievements extends React.Component {
    
    /*
        Put "Patient's Achievements" as title with the patient's first name and last name
        taking the place of Patient.
     */
    static navigationOptions = ({ navigation }) => {
        const fname = navigation.getParam('firstName');
        const lname = navigation.getParam('lastName');
        let t = `${fname} ${lname}'`;

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
            id: props.navigation.getParam('id')
        }
    }

    /*
        Attempt to load the Patients achievements. if you get a result, set the patient's achievements
        to be the loaded result. Otherwise, Set the achievements to 0.
     */
    componentDidMount() {
        GetPatientAchievements(this.state.id).then((achievementsJson) => {
            if (achievementsJson == null) {
                this.setState({
                    steps: 0,
                    standing: 0,
                    walking: 0,
                    activeTime: 0,
                    dataLoaded: true
                });
            } else {
                this.setState({
                    steps: achievementsJson.steps,
                    standing: achievementsJson.standingMinutes,
                    walking: achievementsJson.walkingMinutes,
                    activeTime: achievementsJson.activeMinutes,
                    dataLoaded: true
                });
            }    
        });
    };

    /*
        Save the Patient's Achievements and create an alert saying that you have saved the achievements.
     */
    saveAchievements() {
        AddPatientAchievements(this.state);
        Alert.alert("Achievements saved");
    };

    render() {
        if (!this.state.dataLoaded) {
            return <LoadingComponent message="Fetching patient's achievements"/>
        }

        return (
            <View style={styles.container}>
                <View>
                    <Text style={styles.title}>Activity Goals</Text>
                </View>

                <View style={styles.container}>
                    <View style={{ paddingBottom: 10 }}>
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
                        <View style={styles.boxLayout}>
                            <View>
                                <Text>Standing</Text>
                                <TextInput
                                    style={styles.inputBox}
                                    keyboardType='numeric'
                                    onChangeText={(standing) => this.setState({ standing: standing })}
                                    defaultValue={this.state.standing.toString()}
                                    placeholder='Standing'
                                />
                            </View>
                            <View>
                                <Text>Walking</Text>
                                <TextInput
                                    style={styles.inputBox}
                                    keyboardType='numeric'
                                    onChangeText={(walking) => this.setState({ walking: walking })}
                                    defaultValue={this.state.walking.toString()}
                                    placeholder='Walking'
                                />
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.saveBtn}>
                    <Button
                        title='Save'
                        onPress={() => {this.saveAchievements()}}                    
                        color="#5DACBD"
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'stretch',
    },

    boxLayout: {
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
        bottom: 40,
        right: 20,
        borderRadius: 100,
        width: 150,
    },

    title: {
        textAlign: 'left',
        fontSize: 20,
        padding: 10,
        color: "#5DACBD",
    },
});
