import React, { Component } from 'react';

import { Text, View, ScrollView, TouchableHighlight, StyleSheet, ART } from 'react-native';
const { Group, Shape, Surface } = ART;

import * as d3 from 'd3'
import * as scale from 'd3-scale'


import GetDate from './GetDate.js';
import Circle from './PatientCircles';
import BarGraph from './PatientBarGraphs';

// const colours = ['#3498DB', '#1ABC9C', '#9B59B6', '#F1C40F', '#E74C3C'];
const data = [50, 10, 40, 95, 4, 24, 0, 85, 34, 0, 35, 53, 53];
const data1 = [20, 35, 49, 24, 50, 20, 40, 19, 24, 50, 20, 40, 19];
const data2 = [30, 25, 29, 50, 60, 22, 60, 19, 45, 60, 40, 43, 39];

var arrayColours = {
    standing: '#3498DB',
    sitting: '#1ABC9C',
    lyingDown: '#9B59B6',
    walking: '#F1C40F',
    misc: '#E74C3C',
};

export default class PatientData extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id: props.id,
            firstName: props.firstName,
            lastName: props.lastName,
            barColour: arrayColours['standing'],
            data: data,
        }
        // this.onPress = this.onPress.bind(this);
        //this.props.navigate = props.navigate;
    } 

    _onPressButton(activityColour, newData) {
        this.setState({ barColour: arrayColours[activityColour]});
        this.setState({ data: newData });
    }

    // TODO: Have Nav Header display patient name
    //  static navigationOptions = ({ this.props.navigate }) => ({
    //     title: firstName + " " + lastName,
    //      headerTitleStyle : {textAlign: 'center',alignSelf:'center'},
    //         headerStyle:{
    //             backgroundColor:'white',
    //         },
    //     });

    pieColour(i) {

    }



    render() {
        const { navigation } = this.props;
        const id = navigation.getParam('id');
        const firstName = navigation.getParam('firstName');
        const lastName = navigation.getParam('lastName');

        const {navigate} = this.props.navigation;

        const width = 250;
        const height = 250;

        const userActivities = [
            {
                itemName: 'standing',
                movement: 30,
            },
            {
                itemName: 'sitting',
                movement: 100,
            },
            {
                itemName: 'lyingDown',
                movement: 150,
            },
            {
                itemName: 'walking',
                movement: 20,
            },
            {
                itemName: 'misc',
                movement: 50,
            },

        ];

        const sectionAngles = d3.pie().value(d => d.movement)(userActivities);

        // Creating the pie chart
        const path = d3.arc()
            .outerRadius(100) //must be less than 1/2 the chart's height/width
            .padAngle(.05) //defines the amount of whitespace between sections
            .innerRadius(60); //the size of the inner 'donut' whitespace

        return (
            <ScrollView>
                <View>
                    <Text style={styles.titleFont}>{firstName + " " + lastName}</Text>

                    <View style={styles.textInline}>
                        <Text style={styles.center}>Daily User Activity</Text> 
                        <GetDate />
                    </View>

                    {/* Displaying the pie chart of all the activities */}
                    <View style={styles.center}>
                        <Surface width={width} height={height}>
                            <Group x={width / 2} y={height / 2}>
                                {
                                    sectionAngles.map(section => (
                                        <Shape
                                            key={section.index}
                                            d={path(section)}
                                            stroke="#000"
                                            fill={arrayColours[userActivities[section.index].itemName]}
                                            strokeWidth={1}
                                        />
                                    ))
                                }
                            </Group>
                        </Surface>
                    </View>

                    {/* Displaying the circle buttons for each activity */}
                    <View style={styles.flexDir}>
                        <TouchableHighlight onPress={this._onPressButton.bind(this, 'standing', data)} underlayColor="white">
                            <Circle activity='Standing' activityIcon='male' iconLib='font-awesome' color={arrayColours.standing} />
                        </TouchableHighlight>

                        <TouchableHighlight onPress={this._onPressButton.bind(this, 'sitting', data1)} underlayColor="white">
                            <Circle activity='Sitting' activityIcon='airline-seat-recline-normal' iconLib='MaterialIcons' color={arrayColours.sitting} />
                        </TouchableHighlight>

                        <TouchableHighlight onPress={this._onPressButton.bind(this, 'lyingDown', data2)} underlayColor="white">
                            <Circle activity='Lying Down' activityIcon='bed' iconLib='font-awesome' color={arrayColours.lyingDown} />
                        </TouchableHighlight>

                        <TouchableHighlight onPress={this._onPressButton.bind(this, 'walking', data)} underlayColor="white">
                            <Circle activity='Walking' activityIcon='directions-walk' iconLib='MaterialIcons' color={arrayColours.walking} />
                        </TouchableHighlight>

                        <TouchableHighlight onPress={this._onPressButton.bind(this, 'misc', data2)} underlayColor="white">
                            <Circle activity='Miscellaneous' activityIcon='question' iconLib='font-awesome' color={arrayColours.misc} />
                        </TouchableHighlight>
                    </View>

                    <View>
                        <BarGraph color={this.state.barColour} data={this.state.data} />
                    </View>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    circle: {
        width: 60,
        height: 60,
        borderRadius: 100 / 2,
        borderWidth: 8,
        borderColor: "red",
    },

    flexDir: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },

    center: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    titleFont: {
        fontSize: 35,
        textAlign: 'center',
    },

    textInline: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }

});