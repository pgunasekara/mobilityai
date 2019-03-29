import React, { Component } from 'react';
import { Text, View, ScrollView, TouchableHighlight, StyleSheet, ART } from 'react-native';

const { Group, Shape, Surface } = ART;

import * as d3 from 'd3'

import DatePicker from '../Lib/DatePicker.js';
import Circle from './PatientCircles';
import BarGraph from './PatientBarGraphs';

import { GetPatientActivities, GetPatientAchievements, GetPatientData, GetSteps } from '../Lib/Api';
import moment from 'moment';
import { _ } from 'lodash';
import { LoadingComponent } from '../Lib/GenericComponents.js';

const activityTypes = {
    sitting: 'sitting',
    standing: 'standing',
    walking: 'walking',
    lyingDown: 'lyingDown',
    unknown: 'unknown',
    active : 'active',
    sedentary : 'sedentary',
    stacked : 'stacked'
}

const arrayColours = {
    standing: '#3498DB',
    sitting: '#1ABC9C',
    lyingDown: '#9B59B6',
    walking: '#F1C40F',
    unknown: '#E74C3C',
    stacked : '#8B4513',
    active : '#93AE75',
    sedentary : '#5B8BA9',
    toggle: '#000000',
};

const Tabs = {
    daily: 0,
    weekly: 1,
    monthly: 2,
    overall: 3,
};

const hourlyYLabels = [0, 10, 20, 30, 40, 50, 60];
const dailyYLabels = [0, 4, 8, 12, 16, 20, 24];

export default class PatientData extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id: props.id,
            firstName: props.firstName,
            lastName: props.lastName,
            date: props.date,
            activityType: activityTypes.standing,
            barColour: arrayColours[activityTypes.standing],
            singleBarView : true,
            stackedViewKeys : null
        }
    };

    _onPressButton(newActivityType, newData) {
        this.setState({ 
            activityType: newActivityType, 
            singleBarView: true,
            barColour: arrayColours[newActivityType],
            data: newData
        });
    };

    extractDataForStackView(keys){
        let bars = [];

        for (let i = 0; i < this.state.xLabels.length; i++){
            bars.push({});
            keys.forEach((key) => {
                bars[i][key] = this.state.movementPercentages[key].bar[i];
            });
        }

        return bars;
    }

    _onPressStackedButton(newActivityType){
        this.setState({ activityType: newActivityType });
        const activeKeys = ['standing', 'walking'];
        const sedentaryKeys = ['sitting','lyingDown'];
        const stackedKeys = [...activeKeys, ...sedentaryKeys];

        const colorExtractor = (k) => arrayColours[k];
        let stateKeys = null;

        switch (newActivityType){
            case activityTypes.active:
                stateKeys = activeKeys;
                break;
            case activityTypes.sedentary:
                stateKeys = sedentaryKeys;
                break;
            case activityTypes.stacked:
                stateKeys = stackedKeys;
                break;
        }

        this.setState({
            data: this.extractDataForStackView(stateKeys),
            barColour: stateKeys.map(colorExtractor),
            stackedViewKeys : stateKeys,
            singleBarView: false
        });
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getPatientData(startDate) {
        var endDate = moment(startDate);
        var xLabels = [];
        var yLabels = [];
        switch (this.props.tabView) {
            case Tabs.daily:
                endDate = moment(endDate).add(1, 'days');
                var numHours = endDate.diff(startDate, 'hours');
                for (var i = 0; i < numHours; i++) {
                    xLabels.push(moment(startDate).add(i, 'hours').format('hA'));
                }
                yLabels = hourlyYLabels;
                break;
            case Tabs.weekly:
                endDate = moment(endDate).add(1, 'weeks');
                var numDays = endDate.diff(startDate, 'days');
                for (var i = 0; i < numDays; i++) {
                    xLabels.push(moment(startDate).add(i, 'days').format('Do'));
                }
                yLabels = dailyYLabels;
                break;
            case Tabs.monthly:
                endDate = moment(endDate).add(1, 'months');
                var numDays = endDate.diff(startDate, 'days');
                for (var i = 0; i < numDays; i++) {
                    xLabels.push(moment(startDate).add(i, 'days').format('Do'));
                }
                yLabels = dailyYLabels;
                break;

            //TODO: FIX TO GET OVERALL TIME OF THE PATIENT
            case Tabs.overall:
                endDate = moment(endDate).add(1, 'months');
                break;
            default:
                endDate = moment(endDate).add(1, 'days');
                break;

        }

        this.setState({
            xLabels: xLabels, 
            yLabels: yLabels
        });

        GetPatientActivities(startDate.utc().valueOf(), endDate.utc().valueOf(), this.props.id).then((activitiesJson) => {
            if (activitiesJson === undefined) {
                this.setState({ error: 'Error retrieving patient activity data, please select a date' });
            } else {
                if (this.props.tabView != Tabs.daily) {
                    activitiesJson.sitting.bar = this.hourlyIntoDays(activitiesJson.sitting.bar)
                    activitiesJson.lyingDown.bar = this.hourlyIntoDays(activitiesJson.lyingDown.bar)
                    activitiesJson.walking.bar = this.hourlyIntoDays(activitiesJson.walking.bar)
                    activitiesJson.standing.bar = this.hourlyIntoDays(activitiesJson.standing.bar);
                    activitiesJson.unknown.bar = this.hourlyIntoDays(activitiesJson.unknown.bar);
                }
                this.setState({ 
                    movementPercentages: activitiesJson,
                    data: activitiesJson.sitting.bar,
                    error: null
                });
            }
        });

        GetPatientAchievements(this.props.id).then((achievementsJson) => {
            this.setState({ activityGoals: achievementsJson });
        });

        GetSteps(this.props.id, startDate.utc().valueOf(), endDate.utc().valueOf()).then((stepsArray) => {
            this.setState({ steps: stepsArray });
        });

    }

    hourlyIntoDays(data) {
        return _.chunk(data, 24).map((c) => { return _.sum(c) / 60; });
    }

    componentDidMount() {
        this.getPatientData(this.state.date);
    };

    setDate(rDate) {
        this.setState({ date: moment(rDate) });
        this.getPatientData(moment(rDate));
    }

    render() {
        if (this.state.error) {
            return (
                <ScrollView>
                    <View>
                        <Text style={styles.errorText}>{this.state.error}</Text>
                        <View style={[styles.center, styles.widthSize]}>
                            <DatePicker
                                dateCallback={this.setDate.bind(this)}
                                date={this.state.date.toDate()}
                            />
                        </View>
                    </View>
                </ScrollView>
            );
        }

        if (!this.state.data) {
            return <LoadingComponent message="Still downloading patient data..."/>
        }

        const width = 250;
        const height = 250;
        const sedentaryTotal = this.state.movementPercentages.lyingDown.total + this.state.movementPercentages.sitting.total;
        const activeTotal = this.state.movementPercentages.walking.total + this.state.movementPercentages.standing.total;

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
        if ((this.state.activityType == activityTypes.standing
            || this.state.activityType == activityTypes.walking)
            && this.state.activityGoals !== undefined) {
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

        return (
            <ScrollView>
                <View>
                    <View style={styles.textInline}>
                        <Text style={[styles.flexDir, styles.tabInfo]}>
                            {this.props.tabTitle}
                        </Text>
                        <DatePicker
                            dateCallback={this.setDate.bind(this)}
                            date={this.state.date.toDate()}
                        />
                    </View>

                    <View style={styles.center}>
                        <View style={styles.stepsContainer}>
                            <Text style={styles.stepsText}>{this.state.steps.length}</Text>
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
                        {this.state.singleBarView 
                            ? <TouchableHighlight onPress={this._onPressButton.bind(this,activityTypes.standing, this.state.movementPercentages.standing.bar)} underlayColor="white">
                                <Circle activity='Standing' activityIcon='male' iconLib='font-awesome' color={arrayColours.standing} />
                                </TouchableHighlight>
                            : null
                        }

                        {this.state.singleBarView 
                            ? <TouchableHighlight onPress={this._onPressButton.bind(this,activityTypes.sitting, this.state.movementPercentages.sitting.bar)} underlayColor="white">
                                <Circle activity='Sitting' activityIcon='airline-seat-recline-normal' iconLib='MaterialIcons' color={arrayColours.sitting} />
                            </TouchableHighlight>
                            : null
                        }

                        {this.state.singleBarView 
                            ? <TouchableHighlight onPress={this._onPressButton.bind(this,activityTypes.lyingDown, this.state.movementPercentages.lyingDown.bar)} underlayColor="white">
                                <Circle activity='Lying Down' activityIcon='bed' iconLib='font-awesome' color={arrayColours.lyingDown} />
                            </TouchableHighlight>
                            : null
                        }

                        {this.state.singleBarView 
                            ? <TouchableHighlight onPress={this._onPressButton.bind(this,activityTypes.unknown, this.state.movementPercentages.unknown.bar)} underlayColor="white">
                            <Circle activity='Miscellaneous' activityIcon='question' iconLib='font-awesome' color={arrayColours.unknown} />
                        </TouchableHighlight>
                            : null
                        }


                        {this.state.singleBarView 
                            ? <TouchableHighlight onPress={this._onPressButton.bind(this,activityTypes.walking, this.state.movementPercentages.walking.bar)} underlayColor="white">
                                <Circle activity='Walking' activityIcon='directions-walk' iconLib='MaterialIcons' color={arrayColours.walking} />
                            </TouchableHighlight>
                            : null
                        }

                        {!this.state.singleBarView 
                            ? <TouchableHighlight onPress={this._onPressStackedButton.bind(this,activityTypes.stacked)} underlayColor="white">
                                <Circle activity='Stacked View' activityIcon='chart-bar-stacked' iconLib='material-community' color={arrayColours.stacked} />
                            </TouchableHighlight>
                            : null
                        }

                        {!this.state.singleBarView 
                            ? <TouchableHighlight onPress={this._onPressStackedButton.bind(this,activityTypes.active)} underlayColor="white">
                                <Circle activity='Active' activityIcon='fitness-center' iconLib='MaterialIcons' color={arrayColours.active} />
                            </TouchableHighlight>
                            : null
                        }

                        {!this.state.singleBarView 
                            ? <TouchableHighlight onPress={this._onPressStackedButton.bind(this,activityTypes.sedentary)} underlayColor="white">
                                <Circle activity='Sedentary' activityIcon='sofa' iconLib='material-community' color={arrayColours.sedentary} />
                            </TouchableHighlight>
                            : null
                        }

                        <TouchableHighlight onPress={() => {
                            if (this.state.singleBarView){
                                this._onPressStackedButton(activityTypes.stacked)
                            }else{
                                this._onPressButton(activityTypes.walking, this.state.movementPercentages.walking.bar);
                            }
                        }} underlayColor="white">
                            <Circle 
                                activity={this.state.singleBarView ? "Stacked Views" : "Single View"} 
                                activityIcon='swap' 
                                iconLib='entypo' 
                                color={arrayColours.toggle} 
                            />
                        </TouchableHighlight>
                    </View>
                        <View>
                            <BarGraph
                                color={this.state.barColour}
                                data={this.state.data}
                                goalLine={goalLine}
                                requiresGoalLine={requiresGoalLine}
                                xLabels={this.state.xLabels}
                                yLabels={this.state.yLabels}
                                singleBarView={this.state.singleBarView}
                                keys={this.state.stackedViewKeys}
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
        textAlign: 'center',
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
        justifyContent: 'space-around',
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
        alignItems: 'center',
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
    },
});