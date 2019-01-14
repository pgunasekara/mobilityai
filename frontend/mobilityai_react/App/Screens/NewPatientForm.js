import React from 'react';
import {Platform, StyleSheet, Text, View, ScrollView, TextInput, Slider, Button} from 'react-native';

export default class PatientForm extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            firstName: "",
            lastName: "",
            baselineWalk: 4,
            baselineSit : 12,
            baselineLay : 8
        }
    }

    submitForm(){
        console.log("TADA");
    }

    render() {
        const Field = (props) => <TextInput style={styles.field} {...props}/>;
        const SliderField = (props) => {
            return <Slider style={styles.slider} 
                {...props}
                onAfterChange={() => this.props.update(this.state)}
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
                        <Text style={styles.sliderText}>Daily time spent walking: {this.state.baselineWalk} hours</Text>
                        <SliderField onChange={(baselineWalk) => this.setState({baselineWalk})}
                            onSlidingComplete={(baselineWalk) => this.setState({baselineWalk})}
                            maximumValue={24} 
                            step={0.25}
                            value={this.state.baselineWalk}
                        />
                        <Text style={styles.sliderText}>Daily time spent sitting: {this.state.baselineSit} hours</Text>
                        <SliderField onChange={(baselineSit) => this.setState({baselineSit})}
                            onSlidingComplete={(baselineSit) => this.setState({baselineSit})}
                            maximumValue={24} 
                            step={0.25}
                            value={this.state.baselineSit}
                        />
                        <Text style={styles.sliderText}>Daily time spent laying down: {this.state.baselineLay} hours</Text>
                        <SliderField onChange={(baselineLay) => this.setState({baselineLay})}
                            onSlidingComplete={(baselineLay) => this.setState({baselineLay})}
                            maximumValue={24} 
                            step={0.25}
                            value={this.state.baselineLay}
                        />
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
    },
    slider : {
        alignSelf : "center",
        width: 350
    },
    sliderText : {
        fontSize : 15,
        color: '#555333',
        fontWeight : '500',
        paddingLeft: 20
    }
  });