import React, { Component } from 'react';

import { Alert, Text, View, ScrollView, Button, TouchableHighlight, Image, StyleSheet, ART } from 'react-native';
import { BarChart, Grid, XAxis, YAxis } from 'react-native-svg-charts'
const { Group, Shape, Surface } = ART;

import * as d3 from 'd3'
import * as scale from 'd3-scale'
import { Icon } from 'react-native-elements'
import FontAwesome5 from 'react-native-vector-icons'
// import Icon from 'react-native-vector-icons/FontAwesome5';

const colours = ['#3498DB', '#1ABC9C', '#9B59B6', '#F1C40F', '#E74C3C'];
const data = [50, 10, 40, 95, 4, 24, 0, 85, 34, 0, 35, 53, 53];
const data1 = [20, 35, 49, 24, 50, 20, 40, 19, 24, 50, 20, 40, 19];
const data2 = [30, 25, 29, 50, 60, 22, 60, 19, 45, 60, 40, 43, 39];


export default class PatientData extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id: props.id,
            firstName: props.firstName,
            lastName: props.lastName,
            barColour: colours[0],
            data: data,
        }
        // this.onPress = this.onPress.bind(this);
        //this.props.navigate = props.navigate;
    } 

    _onPressButton(i, newData) {
        this.setState({ barColour: colours[i] });
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
                itemName: 'Standing',
                movement: 30,
            },
            {
                itemName: 'Sitting',
                movement: 100,
            },
            {
                itemName: 'Lying Down',
                movement: 150,
            },
            {
                itemName: 'Walking',
                movement: 20,
            },
            {
                itemName: 'Miscellaneous',
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
                                            fill={colours[section.index]}
                                            strokeWidth={1}
                                        />
                                    ))
                                }
                            </Group>
                        </Surface>
                    </View>

                    {/* Displaying the circle buttons for each activity */}
                    <View style={styles.flexDir}>
                        <TouchableHighlight onPress={this._onPressButton.bind(this, 0, data)} underlayColor="white">
                            <Circle activity='Standing' activityIcon='male' iconLib='font-awesome' color={colours[0]} />
                        </TouchableHighlight>

                        <TouchableHighlight onPress={this._onPressButton.bind(this, 1, data1)} underlayColor="white">
                            <Circle activity='Sitting' activityIcon='airline-seat-recline-normal' iconLib='MaterialIcons' color={colours[1]} />
                        </TouchableHighlight>

                        <TouchableHighlight onPress={this._onPressButton.bind(this, 2, data2)} underlayColor="white">
                            <Circle activity='Lying Down' activityIcon='bed' iconLib='font-awesome' color={colours[2]} />
                        </TouchableHighlight>

                        <TouchableHighlight onPress={this._onPressButton.bind(this, 3, data)} underlayColor="white">
                            <Circle activity='Walking' activityIcon='directions-walk' iconLib='MaterialIcons' color={colours[3]} />
                        </TouchableHighlight>

                        <TouchableHighlight onPress={this._onPressButton.bind(this, 4, data2)} underlayColor="white">
                            <Circle activity='Miscellaneous' activityIcon='question' iconLib='font-awesome' color={colours[4]} />
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

// displaying the bar graph for the movement of the activity 
class BarGraph extends Component {
    render() {
        const fill = this.props.color;
        const time = ['7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM'];

        const contentInset = { top: 30, bottom: 30 }

        return (
            <ScrollView horizontal={true} style={styles.bargraph}>
                <View style={{ width: 500 }}>
                    {/* TODO: Display Y Axis
                        <YAxis
                        data={data}
                        contentInset={contentInset}
                        svg={{
                            fill: 'grey',
                            fontSize: 10,
                        }}
                        numberOfTicks={13}
                        formatLabel={value => `${value}ºC`}
                    /> */}
                    <BarChart
                        style={{ height: 200 }}
                        data={this.props.data}
                        svg={{ fill }}
                        contentInset={{ top: 30, bottom: 30 }}
                    >
                        <Grid />
                    </BarChart>
                    <XAxis
                        style={{ marginHorizontal: -10 }}
                        data={this.props.data}
                        formatLabel={(value, index) => time[index]}
                        contentInset={{ left: 30, right: 30 }}
                        svg={{ fontSize: 10, fill: 'black' }}
                    />
                </View>
            </ScrollView>

        )
    }
}

// Creating the circle buttons for the activity
class Circle extends Component {
    render() {
        return (
            <View>
                <View style={[styles.center,  { color: this.props.color }]}>
                    {/* Displaying corresponding icons with the activity */}
                    <Icon
                        raised
                        reverse
                        name={this.props.activityIcon}
                        type={this.props.iconLib}
                        color={this.props.color}
                        size={28}
                    />
                </View>
                <Text style={styles.textFont}>{this.props.activity}</Text>
            </View>
        )
    }
}

// Getting the current date
class GetDate extends Component {
    render() {
        const date = new Date().getDate().toString();
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        return (
            <View style={[styles.textInline, styles.dateButton]}>
                <Button style={[styles.dateButton]} title={date + '/' + month + '/' + year} />
            </View>
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

    bargraph: {
        marginLeft: 10,
        marginRight: 10,
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

    textFont: {
        fontSize: 10,
        textAlign: 'center',
        flex: 1,
        justifyContent: 'space-between'
    },

    dateButton: {
        justifyContent: 'flex-end',
    },

    textInline: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }

});