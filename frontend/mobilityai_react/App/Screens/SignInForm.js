import React from 'react';
import { TextInput, ScrollView, Platform, TouchableHighlight, Button, StyleSheet, Text, View } from 'react-native';
import { Input, Icon } from 'react-native-elements'

export default class SignIn extends React.Component {
    constructor(props) {
        super(props);
    }

    /*
        Render the Sign in form, with an email and password fields, as well as a sign in button
        and a button to redirect to sign up if you don't have an account.
     */
    render() {
        const { navigate } = this.props.navigation;
        return (
            <ScrollView>
                <View>
                    <Text style={[styles.titleText, styles.regText, styles.boldText]}>MobilityAI</Text>
                    <Text style={styles.regText}>Sign in below to access your account</Text>

                    <View style={styles.containerBorder}>
                        <View style={styles.container}>
                            <View style={[styles.formStyle, styles.formBorder]}>
                                <Text>Email</Text>
                                <TextInput
                                    onChangeText={(email) => this.setState({ email })}
                                    value={this.state.email}
                                    placeholder='Email'
                                    underlineColorAndroid = "black"
                                    leftIcon={
                                        <Icon
                                            name='email'
                                            size={24}
                                        />
                                    }
                                />
                                <Text>Password</Text>
                                <TextInput
                                    onChangeText={(password) => this.setState({ password })}
                                    value={this.state.password}
                                    placeholder='Password'
                                    underlineColorAndroid = "black"
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
