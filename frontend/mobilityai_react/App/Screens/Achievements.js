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
            id: props.navigation.getParam('id')
        }
    }

    componentDidMount() {
        GetPatientAchievements(this.state.id).then((achievementsJson) => {
            if (achievementsJson == null) {
                this.setState({ steps: 0 });
                this.setState({ standing: 0 });
                this.setState({ walking: 0 });
                this.setState({ activeTime: 0 });
            } else {
                console.log("WE GOT PATIENT ACHIEVEMENTS");
                console.log(achievementsJson);
                this.setState({ steps: achievementsJson.steps });
                // this.setState({ sitting: achievementsJson.sitting });
                this.setState({ standing: achievementsJson.standingMinutes });
                // this.setState({ lyingDown: achievementsJson.lyingDown });
                this.setState({ walking: achievementsJson.walkingMinutes });
                this.setState({ activeTime: achievementsJson.activeMinutes });
            }    
        });
    };

    saveAchievements() {
        let response = AddPatientAchievements(this.state.id, this.state.steps, this.state.activeTime, this.state.standing, this.state.walking);
        console.log(JSON.stringify(response));
    };

    render() {
        if (this.state.steps === undefined
            || this.state.standing === undefined
            || this.state.walking === undefined
            || this.state.activeTime === undefined) {
            // TODO: replace this with a loading screen
            return (
                <View>
                    <Text> Fetching patient's achievements </Text>
                </View>
            );
        }
        console.log(this.state);
        return (
            <View style={styles.container}>
                <View>
                    <Text style={styles.title}>Activity Goals</Text>
                </View>

                <View style={styles.container}>
                    <View style={{ paddingBottom: 10 }}>
                        <View style={styles.boxLayout2}>
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
                        <View style={styles.boxLayout2}>
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
                        onPress={() => {this.saveAchievements(); alert("Achievements saved")}}                    
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
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },

    boxLayout2: {
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
