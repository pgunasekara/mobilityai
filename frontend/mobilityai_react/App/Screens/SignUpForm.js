import React from 'react';
import { Alert, ScrollView, Platform, TouchableHighlight, Button, StyleSheet, Text, View, FlatList } from 'react-native';
import { Input, Icon } from 'react-native-elements'

export default class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            patients: [
                {
                    key: "1",
                    firstName: "Joe",
                    lastName: "Johnson",
                    bandId: "",
                },
                {
                    key: "2",
                    firstName: "Ruth",
                    lastName: "Reynolds",
                    bandId: "",
                }
            ]
        }

    }

    // //TODO: Have the web request post the data that is submitted
    // submitForm = () => {
    //     console.log("TADA");

    //     // const value = this._form.getValue();
    //     // console.log('value: ', value);
    // }

    submitForm() {
        console.log('work pls');
    }

    render() {
        const { navigate } = this.props.navigation;
        return (
            <ScrollView>
                <View>
                    <Text style={[styles.titleText, styles.regText, styles.boldText]}>MobilityAI</Text>
                    <Text style={styles.regText}>Sign up below and create your account</Text>

                    {/* Generating the sign up form */}
                    <View style={styles.container}>
                        <View style={[styles.formStyle, styles.formBorder]}>
                            <Input
                                onChangeText={(email) => this.setState({ email })}
                                value={this.state.email}
                                placeholder='Email'
                                leftIcon={
                                    <Icon
                                        name='email'
                                        size={24}
                                    />
                                }
                            />
                            <Input
                                onChangeText={(fname) => this.setState({ fname })}
                                value={this.state.fname}
                                placeholder='First Name'
                                leftIcon={
                                    <Icon
                                        name='user-circle'
                                        size={24}
                                        type={'font-awesome'}
                                    />
                                }
                            />
                            <Input
                                onChangeText={(lname) => this.setState({ lname })}
                                value={this.state.lname}
                                placeholder='Last Name'
                                leftIcon={
                                    <Icon
                                        name='user-circle'
                                        size={24}
                                        type={'font-awesome'}
                                    />
                                }
                            />
                            <Input
                                onChangeText={(password) => this.setState({ password })}
                                value={this.state.password}
                                placeholder='Password'
                                leftIcon={
                                    <Icon

                                        name='lock'
                                        size={24}
                                        type={'font-awesome'}
                                    />
                                }
                                password={true}
                                secureTextEntry={true}
                            />
                        </View>
                    </View>
                    {/* Button for users to submit their information */}
                    <View style={[styles.container, styles.btn]}>
                        <Button
                            title='Sign Up'
                            onPress={this.submitForm}
                            color="#5DACBD"
                        />
                    </View>

                    {/* Redirecting to users to sign in page, if they already have an existing account */}
                    <View >
                        <TouchableHighlight onPress={() => navigate('SignIn', {})}>
                            <View>
                                <Text style={styles.regText}>Already have an account? <Text style={styles.boldText}>Sign in</Text></Text>
                            </View>
                        </TouchableHighlight>
                    </View>

                </View>
            </ScrollView>
        );
    }


}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    formStyle: {
        width: 340,
        margin: 2,
    },

    formBorder: {
        borderColor: 'transparent',
        borderWidth: 5,
        borderRadius: 10,
        padding: 8,
    },

    inputBox: {
        borderColor: 'grey',
        borderWidth: 2,
        borderRadius: 15,
    },

    btn: {
        alignItems: 'stretch',
        margin: 12,
        padding: 8,
    },

    titleText: {
        fontSize: 40,
    },

    regText: {
        textAlign: 'center'
    },

    boldText: {
        fontWeight: 'bold',
        color: '#5DACBD',
    },
});
