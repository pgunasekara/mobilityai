import React, { Component } from 'react';
import { Text, View, ScrollView, TouchableHighlight, StyleSheet, ART } from 'react-native';

const { Group, Shape, Surface } = ART;

import * as d3 from 'd3'

import GetDate from './GetDate.js';
import Circle from './PatientCircles';
import BarGraph from './PatientBarGraphs';

import { GetPatientActivities, GetPatientAchievements, GetPatientData } from '../Lib/Api';
import moment from 'moment';

//TODO: Remove temporary data once we get proper data from the server
//TODO: Add better error logging if data cannot be found

const activityTypes = {
    sitting: 'sitting',
    standing: 'standing',
    walking: 'walking',
    lyingDown: 'lyingDown',
    unknown: 'unknown'
}

const arrayColours = {
    standing: '#3498DB',
    sitting: '#1ABC9C',
    lyingDown: '#9B59B6',
    walking: '#F1C40F',
    unknown: '#E74C3C',
};

const Tabs = {
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
            activityGoals: {
                'id': props.id,
                'steps': 0,
                'activeMinutes': 0,
                'walkingMinutes': 0,
                'standingMinutes': 0
            },
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            date: props.date,
            movementPercentages: { 'sitting': { total: 0, bar: new Array(13) }, 'standing': { total: 0, bar: new Array(13) }, 'lyingDown': { total: 0, bar: new Array(13) }, 'walking': { total: 0, bar: new Array(13) }, 'unknown': { total: 0, bar: new Array(13) } },
            steps: this.getRandomInt(300, 1500),
            activityType: activityTypes.sitting,
        }
    };

    _onPressButton(newActivityType, newData) {
        console.log(`Setting new activity type ${newActivityType}`);
        this.setState({ activityType: newActivityType });
        this.setState({ barColour: arrayColours[newActivityType] });
        this.setState({ data: newData });
    };

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getPatientData(startDate) {
        var endDate = new Date(startDate);

        switch (this.props.tabView) {
            case Tabs.daily:
                endDate = moment(endDate).add(1, 'days').toDate();
                break;
            case Tabs.weekly:
                endDate = moment(endDate).add(1, 'weeks').toDate();
                break;
            case Tabs.monthly:
                endDate = moment(endDate).add(1, 'months').toDate();
                break;

            //TODO: FIX TO GET OVERALL TIME OF THE PATIENT
            case Tabs.overall:
                endDate = moment(endDate).add(1, 'months').toDate();
                break;
            default:
                endDate = moment(endDate).add(1, 'days').toDate();
                break;

        }

        console.log("props: " + this.props.tabView + ", " + this.props.date);
        console.log('endDate: ' + endDate);

        GetPatientActivities(startDate.getTime(), endDate.getTime(), this.props.id).then((activitiesJson) => {
            if (activitiesJson === undefined) {
                this.setState({ error: 'Error retrieving patient activity data, please select a date' });
            } else {
                this.setState({ movementPercentages: activitiesJson });
                this.setState({ error: null });
            }
        });

        GetPatientAchievements(this.props.id).then((achievementsJson) => {
            this.setState({ activityGoals: achievementsJson });
        });

    }

    componentDidMount() {
        this.getPatientData(this.state.date);
    };

    setDate(rDate) {
        this.setState({ date: rDate });
        console.log(this.state.date);
        this.getPatientData(rDate);
    }

    render() {
        if (this.state.error) {
            return (
                // <ScrollView>
                // {/* <View style={[styles.center, styles.widthSize, {flexDirection: 'column'}]}> */}
                <ScrollView>
                    <View>
                        <Text style={styles.errorText}>{this.state.error}</Text>
                        <View style={[styles.center, styles.widthSize]}>
                            <GetDate
                                dateCallback={this.setDate.bind(this)}
                                date={this.state.date}
                            />
                        </View>
                    </View>
                </ScrollView>
                // </ScrollView>
            );
        }

        const width = 250;
        const height = 250;

        const userActivities = [
            {
                itemName: activityTypes.sitting,
                movement: this.state.movementPercentages.sitting.total,
            },
            {
                itemName: activityTypes.lyingDown,
                movement: this.state.movementPercentages.lyingDown.total,
            },
            {
                itemName: activityTypes.walking,
                movement: this.state.movementPercentages.walking.total,
            },
            {
                itemName: activityTypes.standing,
                movement: this.state.movementPercentages.standing.total,
            },
            {
                itemName: activityTypes.unknown,
                movement: this.state.movementPercentages.unknown.total,
            },

        ];

        const sectionAngles = d3.pie().value(d => d.movement)(userActivities.sort(function (a, b) { return (b.movement - a.movement); }));

        // Creating the pie chart
        const path = d3.arc()
            .outerRadius(100) //must be less than 1/2 the chart's height/width
            .padAngle(.05) //defines the amount of whitespace between sections
            .innerRadius(60); //the size of the inner 'donut' whitespace


        var requiresGoalLine = false;
        var goalLine = 0;
        if (this.state.activityType == activityTypes.standing || this.state.activityType == activityTypes.walking) {
            requiresGoalLine = true;
            switch (this.state.activityType) {
                case activityTypes.standing:
                    goalLine += this.state.activityGoals.standingMinutes;
                    break;
                default:
                    goalLine += this.state.activityGoals.walkingMinutes;
                    break;
            }
        }

        console.log(`Requires goal line: ${requiresGoalLine} goal line: ${goalLine}`);

        return (
            <ScrollView>
                <View>
                    <View style={styles.textInline}>
                        <Text style={[styles.flexDir, styles.tabInfo]}>
                            {this.props.tabTitle}
                        </Text>
                        <GetDate
                            dateCallback={this.setDate.bind(this)}
                            date={this.state.date}
                        />
                    </View>

                    {/* Displaying the pie chart of all the activities */}
                    <View style={styles.center}>
                        <View style={styles.stepsContainer}>
                            <Text style={styles.stepsText}>{this.state.steps}</Text>
                            <Text style={{textAlign: 'center'}}>Steps</Text>
                        </View>
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
                        <TouchableHighlight onPress={this._onPressButton.bind(this,activityTypes.standing, this.state.movementPercentages.standing.bar)} underlayColor="white">
                            <Circle activity='Standing' activityIcon='male' iconLib='font-awesome' color={arrayColours.standing} />
                        </TouchableHighlight>

                        <TouchableHighlight onPress={this._onPressButton.bind(this,activityTypes.sitting, this.state.movementPercentages.sitting.bar)} underlayColor="white">
                            <Circle activity='Sitting' activityIcon='airline-seat-recline-normal' iconLib='MaterialIcons' color={arrayColours.sitting} />
                        </TouchableHighlight>

                        <TouchableHighlight onPress={this._onPressButton.bind(this,activityTypes.lyingDown, this.state.movementPercentages.lyingDown.bar)} underlayColor="white">
                            <Circle activity='Lying Down' activityIcon='bed' iconLib='font-awesome' color={arrayColours.lyingDown} />
                        </TouchableHighlight>

                        <TouchableHighlight onPress={this._onPressButton.bind(this,activityTypes.walking, this.state.movementPercentages.walking.bar)} underlayColor="white">
                            <Circle activity='Walking' activityIcon='directions-walk' iconLib='MaterialIcons' color={arrayColours.walking} />
                        </TouchableHighlight>

                        <TouchableHighlight onPress={this._onPressButton.bind(this,activityTypes.unknown, this.state.movementPercentages.unknown.bar)} underlayColor="white">
                            <Circle activity='Miscellaneous' activityIcon='question' iconLib='font-awesome' color={arrayColours.unknown} />
                        </TouchableHighlight>
                    </View>
                        <View>
                            <BarGraph
                                color={this.state.barColour}
                                data={this.state.data}
                                goalLine={goalLine}
                                requiresGoalLine={requiresGoalLine}
                            />
                        </View>
                </View>
            </ScrollView>
        );
    }
}


const styles = StyleSheet.create({
    errorText: {
        fontWeight: 'bold',
        color: 'red',
        textAlign: 'center',
        marginBottom: 100,
    },
    stepsContainer: {
        position: 'absolute',
    },
    stepsText: {  
        fontSize: 30,
        fontWeight: 'bold',
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

    center2: {
        flex: 1,
        alignItems: 'stretch',
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
    },

    widthSize: {
        width: 200,
        marginTop: 150,
    },

    tabInfo: {
        color: 'black',
        fontSize: 15,
        marginLeft: 10,
        marginTop: 10,
    }

});