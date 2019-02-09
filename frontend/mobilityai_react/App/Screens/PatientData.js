import React, { Component } from 'react';

import { Text, View, ScrollView, TouchableHighlight, StyleSheet, ART } from 'react-native';
const { Group, Shape, Surface } = ART;

import * as d3 from 'd3'
// import * as scale from 'd3-scale'

import GetDate from './GetDate.js';
import Circle from './PatientCircles';
import BarGraph from './PatientBarGraphs';

import { GetPatientActivities } from '../Lib/Api';

// const colours = ['#3498DB', '#1ABC9C', '#9B59B6', '#F1C40F', '#E74C3C'];
// const data = [50, 10, 40, 95, 4, 24, 0, 85, 34, 0, 35, 53, 53];
const data1 = [20, 35, 49, 24, 50, 20, 40, 19, 24, 50, 20, 40, 19];
const data2 = [30, 25, 29, 50, 60, 22, 60, 19, 45, 60, 40, 43, 39];

var arrayColours = {
    standing: '#3498DB',
    sitting: '#1ABC9C',
    lyingDown: '#9B59B6',
    walking: '#F1C40F',
    unknown: '#E74C3C',
};

export default class PatientData extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id: props.id,
            firstName: props.firstName,
            lastName: props.lastName,
            barColour: arrayColours['standing'],
            data: [0,0,0,0,0,0,0,0,0,0,0,0],
            movementPercentages: {'sitting': {total: 0, bar: new Array(13)}, 'standing': {total: 0, bar: new Array(13)}, 'lyingDown': {total: 0, bar: new Array(13)}, 'walking': {total: 0, bar: new Array(13)}, 'unknown': {total: 0, bar: new Array(13)}},
        }
        // this.onPress = this.onPress.bind(this);
        //this.props.navigate = props.navigate;
    };

    _onPressButton(activityColour, newData) {
        this.setState({ barColour: arrayColours[activityColour]});
        this.setState({ data: newData });
    };

    // TODO: Have Nav Header display patient name
    //  static navigationOptions = ({ this.props.navigate }) => ({
    //     title: firstName + " " + lastName,
    //      headerTitleStyle : {textAlign: 'center',alignSelf:'center'},
    //         headerStyle:{
    //             backgroundColor:'white',
    //         },
    //     });

    pieColour(i) {

    };

    componentDidMount(){
        // let startTime = new Date(Date.UTC(2018, 11, 11, 0, 0, 0, 0)).getTime();
        // let endTime = new Date(Date.UTC(2018, 11, 11, 23, 0, 0, 0)).getTime();

        let startTime = new Date(Date.UTC(2019, 1, 9, 0, 0, 0, 0)).getTime();
        let endTime = new Date(Date.UTC(2019, 1, 9, 23, 0, 0, 0)).getTime();

        const { navigation } = this.props;
        const id = navigation.getParam('id');

        GetPatientActivities(startTime, endTime, id).then((activitiesJson) => {
            console.log('\n\n' + activitiesJson);
            this.setState({movementPercentages: activitiesJson});
        })
    };

    render() {
        const { navigation } = this.props;
        const id = navigation.getParam('id');
        const firstName = navigation.getParam('firstName');
        const lastName = navigation.getParam('lastName');

        const width = 250;
        const height = 250;

        // let x = this.getCurrentData(id);

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