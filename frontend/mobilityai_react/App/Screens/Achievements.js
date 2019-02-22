import React from 'react';
import { Button, ScrollView, StyleSheet, Text, View, TextInput } from 'react-native';
import { Input, Icon } from 'react-native-elements'

export default class SignIn extends React.Component {
    static navigationOptions = ({ navigation }) => {
        var fname = navigation.getParam('firstName');
        var lname = navigation.getParam('lastName');
        var t = fname + " " + lname + '\'';

        if(lname.substring(lname.length - 1) != 's') { t += 's'}
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
        }
    }

    render() {
        // const { navigation } = this.props;
        // navigation.getParam('firstName') + " " + navigation.getParam('lastName');

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
                                onChangeText={(steps) => this.setState({ steps })}
                                value={this.state.steps}
                                placeholder='Steps'
                            />
                        </View>
                        <View>
                            <Text>Active Time</Text>
                            <TextInput
                                style={styles.inputBox}
                                keyboardType='numeric'
                                onChangeText={(activeTime) => this.setState({ activeTime })}
                                value={this.state.activeTime}
                                placeholder='Active Time'
                            />
                        </View>
                    </View>
                </View>
                <View style={styles.saveBtn}>
                    <Button
                        title='Save'
                        onPress={() => alert('saved')}
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
