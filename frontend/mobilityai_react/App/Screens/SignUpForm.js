import React from 'react';
import { ScrollView, Platform, TouchableHighlight, Button, StyleSheet, Text, View, FlatList } from 'react-native';

import t from 'tcomb-form-native';

const Form = t.form.Form;

//creating the input fields for the sign up form
const User = t.struct({
    email: t.String,
    firstName: t.String,
    lastName: t.String,
    password: t.String,
    // password2: t.String,
});

//Adding error messages and password type to input fields
const options = {
    fields: {
        email: {
            error: 'Please enter valid email address',
        },

        firstName: {
            label: 'First Name',
            error: 'Please enter your first name'
        },

        lastName: {
            label: 'Last Name',
            error: 'Please enter your last name',
        },

        password: {
            error: 'Please enter a valid password',
            password: true,
            secureTextEntry: true,
        },

        password2: {
            label: 'Confirm Password',
            error: 'Ensure passwords are matching',
            password: true,
            secureTextEntry: true,
        },

    }
}


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

    //TODO: Have the web request post the data that is submitted
    submitForm = () => {
        console.log("TADA");

        const value = this._form.getValue();
        console.log('value: ', value);
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
                            <Form ref={c => this._form = c}
                                type={User}
                                options={options}
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
