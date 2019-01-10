import React from 'react';
import {Platform, StyleSheet, Text, View, ScrollView, TextInput, Button} from 'react-native';

export default class PatientForm extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            firstName: "",
            lastName: "",
            healthCard: "",
            phoneNumber : ""
        }
    }

    submitForm(){
        console.log("TADA");
    }

    render() {
        const Field = (props) => {
            return <TextInput style={styles.field} 
                        {...props}
                    />;
        }

        return (
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollable}>
                    <Text style={styles.titleText}>Create New Patient</Text>
                    
                    <View style={{paddingBottom: 100}}>
                        <Field onChangeText={(firstName) => this.setState({firstName})}
                            value={this.state.firstName}
                            placeholder="Enter First Name..."
                            />
                        <Field onChangeText={(lastName) => this.setState({lastName})}
                            placeholder="Enter Last Name..."
                            value={this.state.lastName}/>
                        <Field onChangeText={(healthCard) => this.setState({healthCard})}
                            placeholder="Enter Health Card Number..."
                            value={this.state.healthCard}/>
                        <Field onChangeText={(phoneNumber) => this.setState({phoneNumber})}
                            placeholder="Enter Phone Number..."
                            value={this.state.phoneNumber}/>
                        <Button style={styles.submit} onPress={() => this.submitForm()} 
                            title="Submit"
                        />
                        </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container : {
        flex: 1,
        flexDirection: "row",
        alignItems : "center",
    },
    scrollable : {
        flex: 1,
        justifyContent: "space-evenly",
    },
    field : {
        height: 50,
        paddingLeft: 6,
        borderColor : 'gray',
        borderWidth: 1,
        margin : 15,
        borderRadius: 5
    },
    titleText : {
        fontSize : 35,
        fontWeight : 'bold',
        textAlign: 'center',
        color: '#555333',
        marginTop: 20
    },
    submit: {
        backgroundColor: "#68a0cf",
        overflow: "hidden",
        marginTop: 100
    }
  });