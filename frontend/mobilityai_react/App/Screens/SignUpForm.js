import React from 'react';
import { TextInput, Alert, ScrollView, Platform, TouchableHighlight, Button, StyleSheet, Text, View, FlatList } from 'react-native';
import { Input, Icon, CheckBox } from 'react-native-elements'

import { UserSignUp } from '../Lib/Api';

export default class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            firstName: "",
            lastName: "",
            password: "",
            terms: false,
        };

    }

    submitForm() {
        if (this.state.terms) {
            let response = UserSignUp(this.state.email, this.state.firstName, this.state.lastName, this.state.password);
            console.log(JSON.stringify(response));
            //TODO: Navigate to the Sign In page 
            // this.props.navigation.navigate('SignUp', {});
        } else {
            alert("Please agree to the terms and conditions");
        }
    }


    render() {
        const { navigate } = this.props.navigation;
        return (
            <ScrollView>
                <View>
                    <Text style={[styles.titleText, styles.regText, styles.boldText]}>MobilityAI</Text>
                    <Text style={styles.regText}>Sign up below and create your account</Text>

                    {/* Generating the sign up form */}
                    <View style={styles.containerBorder}>
                        <View style={styles.container}>
                            <View style={[styles.formStyle, styles.formBorder]}>
                                <Text>Email</Text>
                                <TextInput
                                    onChangeText={(email) => this.setState({ email })}
                                    value={this.state.email}
                                    placeholder='Email'
                                    underlineColorAndroid="black"
                                    leftIcon={
                                        <Icon
                                            name='email'
                                            size={24}
                                        />
                                    }
                                />
                                <Text>First Name</Text>
                                <TextInput
                                    onChangeText={(firstName) => this.setState({ firstName })}
                                    value={this.state.firstName}
                                    placeholder='First Name'
                                    underlineColorAndroid="black"
                                    leftIcon={
                                        <Icon
                                            name='user-circle'
                                            size={24}
                                            type={'font-awesome'}
                                        />
                                    }
                                />
                                <Text>Last Name</Text>
                                <TextInput
                                    onChangeText={(lastName) => this.setState({ lastName })}
                                    value={this.state.lastName}
                                    placeholder='Last Name'
                                    underlineColorAndroid="black"
                                    leftIcon={
                                        <Icon
                                            name='user-circle'
                                            size={24}
                                            type={'font-awesome'}
                                        />
                                    }
                                />
                                <Text>Password</Text>
                                <TextInput
                                    onChangeText={(password) => this.setState({ password })}
                                    value={this.state.password}
                                    placeholder='Password'
                                    underlineColorAndroid="black"
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
                                <CheckBox
                                    title='I Agree to the Terms and Conditions'
                                    checked={this.state.terms}
                                    onPress={() => { 
                                        let terms = !this.state.terms;
                                        this.setState({ terms: terms});
                                    }}
                                />
                            </View>
                        </View>

                        {/* Button for users to submit their information */}
                        <View style={[styles.container, styles.btn]}>
                            <Button
                                title='Sign Up'
                                // onPress={() => this.submitForm()}
                                onPress={() => this.submitForm()}
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

    containerBorder: {
        borderColor: '#5DACBD',
        borderWidth: 4,
        borderRadius: 10,
        margin: 5,
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
