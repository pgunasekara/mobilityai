import React from 'react';
import { ScrollView, Platform, TouchableHighlight, Button, StyleSheet, Text, View, FlatList } from 'react-native';

import t from 'tcomb-form-native';

const Form = t.form.Form;

const User = t.struct({
    email: t.String,
    password: t.String,
});

const options = {
    fields: {
        email: {
            error: 'Please enter valid email address',
        },

        password: {
            error: 'Please enter a valid password',
        },
    }
}


export default class SignIn extends React.Component {
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
                    <Text style={styles.regText}>Sign in below to access your account</Text>

                    <View style={styles.container}>
                        <View style={[styles.formStyle, styles.formBorder]}>
                            <Form ref={c => this._form = c}
                                  type={User}
                                  options={options} 
                            />
                        </View>
                    </View>

                    <View style={[styles.formBorder, styles.btn]}>
                        <Button
                            title='Sign In'
                            onPress={() => navigate('PatientList', {})}
                            color="#5DACBD"
                        />
                    </View>

                    <View >
                        <TouchableHighlight onPress={() => navigate('SignUp', {})}>
                            <View>
                                <Text style={styles.regText}>Don't have an account? <Text style={styles.boldText}>Sign up</Text></Text>
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
        textAlign: 'center',
        paddingBottom: 10,
    },

    boldText: {
        fontWeight: 'bold',
        color: '#5DACBD',
    },
});
