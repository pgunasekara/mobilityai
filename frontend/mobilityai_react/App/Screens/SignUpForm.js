import React from 'react';
import { ScrollView, Platform, TouchableHighlight, Button, StyleSheet, Text, View, FlatList } from 'react-native';

import t from 'tcomb-form-native';

const Form = t.form.Form;

const User = t.struct({
    email: t.String,
    firstName: t.String,
    lastName: t.String,
    password: t.String,
    // password2: t.String,
});

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
        },

        password2: {
            label: 'Confirm Password',
            error: 'Ensure passwords are matching',
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

                    <View style={styles.container}>
                        <View style={[styles.formStyle, styles.formBorder]}>
                            <Form ref={c => this._form = c}
                                type={User}
                                options={options}
                            />
                        </View>
                    </View>
                    <View style={[styles.container, styles.btn]}>
                        <Button
                            title='Sign Up'
                            onPress={this.submitForm}
                            color="#5DACBD"
                        />
                    </View>

                    {/* </ScrollView> */}

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
