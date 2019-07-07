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

    /*
        Sign up the the user and redirect to the Sign In page
     */
    submitForm() {
        if (this.state.terms) {
            let response = UserSignUp(this.state.email, this.state.firstName, this.state.lastName, this.state.password);
            this.props.navigation.navigate('SignIn', {});
        } else {
            Alert.alert("Please agree to the terms and conditions");
        }
    }


    /*
        Render sign up form with field for first name, last name, password and terms of condition check.

        There is also a submit button and a button to redirect to Sign In if you have an account.
     */
    render() {
        const { navigate } = this.props.navigation;
        const NameIcon = () => <Icon name='user-circle' size={24} type={'font-awesome'}/>

        return (
            <ScrollView>
                <View>
                    <Text style={[styles.titleText, styles.regText, styles.boldText]}>MobilityAI</Text>
                    <Text style={styles.regText}>Sign up below and create your account</Text>

                    <View style={styles.containerBorder}>
                        <View style={styles.container}>
                            <View style={[styles.formStyle, styles.formBorder]}>
                                <Text>First Name</Text>
                                <TextInput
                                    onChangeText={(firstName) => this.setState({ firstName })}
                                    value={this.state.firstName}
                                    placeholder='First Name'
                                    underlineColorAndroid="black"
                                    leftIcon={<NameIcon/>}
                                />
                                <Text>Last Name</Text>
                                <TextInput
                                    onChangeText={(lastName) => this.setState({ lastName })}
                                    value={this.state.lastName}
                                    placeholder='Last Name'
                                    underlineColorAndroid="black"
                                    leftIcon={<NameIcon/>}
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

                        <View style={[styles.container, styles.btn]}>
                            <Button
                                title='Sign Up'
                                onPress={() => this.submitForm()}
                                color="#5DACBD"
                            />
                        </View>

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
