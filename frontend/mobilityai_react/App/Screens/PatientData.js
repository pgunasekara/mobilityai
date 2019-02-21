import React, { Component } from 'react';

import { Text, View, ScrollView, TouchableHighlight, StyleSheet, ART } from 'react-native';

const { Group, Shape, Surface } = ART;

import * as d3 from 'd3'

import GetDate from './GetDate.js';
import Circle from './PatientCircles';
import BarGraph from './PatientBarGraphs';

import { GetPatientActivities } from '../Lib/Api';

//TODO: Remove temporary data once we get proper data from the server
//TODO: Add better error logging if data cannot be found

var arrayColours = {
    standing: '#3498DB',
    sitting: '#1ABC9C',
    lyingDown: '#9B59B6',
    walking: '#F1C40F',
    unknown: '#E74C3C',
};

var Tabs = {
    daily: 0, 
    weekly: 1, 
    monthly: 2,
    overall: 3,
};

export default class PatientData extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id: props.id,
            firstName: props.firstName,
            lastName: props.lastName,
            barColour: arrayColours['unknown'],
            data: [0,0,0,0,0,0,0,0,0,0,0,0,0],
            date: props.date,
            movementPercentages: {'sitting': {total: 0, bar: new Array(13)}, 'standing': {total: 0, bar: new Array(13)}, 'lyingDown': {total: 0, bar: new Array(13)}, 'walking': {total: 0, bar: new Array(13)}, 'unknown': {total: 0, bar: new Array(13)}},
        }
    };

    _onPressButton(activityColour, newData) {
        this.setState({ barColour: arrayColours[activityColour]});
        this.setState({ data: newData });
    };

    getPatientData() {
        var startDate = this.state.date;
        var endDate = new Date(this.state.date);

        switch(this.props.tabView) {
            case Tabs.daily:
                endDate.setDate(endDate.getDate() + 1);
                break;
            case Tabs.weekly: 
                endDate.setDate(endDate.getDate() + 7);
                break;
            case Tabs.monthly:
                endDate.setDate(endDate.getDate() + 30);
                break;
            
            //TODO: FIX TO GET OVERALL TIME OF THE PATIENT
            case Tabs.overall:
                endDate.setDate(endDate.getDate() + 60);
                break;
            default:
                endDate.setDate(endDate.getDate() + 1);
                break;
            
        }

        console.log("props: " + this.props.tabView + ", " + this.props.date);
        
        GetPatientActivities(startDate.getTime(),endDate.getTime(), this.props.id).then((activitiesJson) => {
            if (activitiesJson === undefined) {
                this.setState({error: 'Error retrieving patient activity data'});
            } else {
                this.setState({movementPercentages: activitiesJson});
                this.setState({error: null});
            }            
        });
    }

    componentDidMount(){
        this.getPatientData();
    };

    setDate(rDate) {
        this.setState({date: rDate});
        console.log(this.state.date);
        this.getPatientData();
    }

    render() {
        if (this.state.error) {
            return (
                <ScrollView>
                    <View>
                        <Text style={styles.errorText}>{this.state.error}</Text>
                        <GetDate 
                            date={this.setDate.bind(this)}
                            newDate={this.state.date}/>
                    </View>
                </ScrollView>
            );
        }

        const width = 250;
        const height = 250;

        const userActivities = [
            {
                itemName: 'sitting',
                movement: this.state.movementPercentages.sitting.total,
            },
            {
                itemName: 'lyingDown',
                movement: this.state.movementPercentages.lyingDown.total,
            },
            {
                itemName: 'walking',
                movement: this.state.movementPercentages.walking.total,
            },
            {
                itemName: 'standing',
                movement: this.state.movementPercentages.standing.total,
            },
            {
                itemName: 'unknown',
                movement: this.state.movementPercentages.unknown.total,
            },

        ];

        const sectionAngles = d3.pie().value(d => d.movement)(userActivities.sort( function (a,b) { return (b.movement - a.movement); }));

        // Creating the pie chart
        const path = d3.arc()
            .outerRadius(100) //must be less than 1/2 the chart's height/width
            .padAngle(.05) //defines the amount of whitespace between sections
            .innerRadius(60); //the size of the inner 'donut' whitespace

        return (
            <ScrollView>
                <View>
                    <View style={styles.textInline}>
                        <Text style={styles.center}>Daily User Activity</Text> 
                        <GetDate 
                            date={this.setDate.bind(this)}
                            newDate={this.state.date}
                        />
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
                        <TouchableHighlight onPress={this._onPressButton.bind(this, 'standing', this.state.movementPercentages.standing.bar)} underlayColor="white">
                            <Circle activity='Standing' activityIcon='male' iconLib='font-awesome' color={arrayColours.standing} />
                        </TouchableHighlight>

                        <TouchableHighlight onPress={this._onPressButton.bind(this, 'sitting', this.state.movementPercentages.sitting.bar)} underlayColor="white">
                            <Circle activity='Sitting' activityIcon='airline-seat-recline-normal' iconLib='MaterialIcons' color={arrayColours.sitting} />
                        </TouchableHighlight>

                        <TouchableHighlight onPress={this._onPressButton.bind(this, 'lyingDown', this.state.movementPercentages.lyingDown.bar)} underlayColor="white">
                            <Circle activity='Lying Down' activityIcon='bed' iconLib='font-awesome' color={arrayColours.lyingDown} />
                        </TouchableHighlight>

                        <TouchableHighlight onPress={this._onPressButton.bind(this, 'walking', this.state.movementPercentages.walking.bar)} underlayColor="white">
                            <Circle activity='Walking' activityIcon='directions-walk' iconLib='MaterialIcons' color={arrayColours.walking} />
                        </TouchableHighlight>

                        <TouchableHighlight onPress={this._onPressButton.bind(this, 'unknown', this.state.movementPercentages.unknown.bar)} underlayColor="white">
                            <Circle activity='Miscellaneous' activityIcon='question' iconLib='font-awesome' color={arrayColours.unknown} />
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
    errorText: {
        fontWeight: 'bold',
        color: 'red'
    },
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