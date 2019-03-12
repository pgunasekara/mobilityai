import React, { Component } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { BarChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import { Text } from 'react-native-svg';

// displaying the bar graph for the movement of the activity 
export default class BarGraph extends Component {
    render() {
        const fill = this.props.color;
        const time = ['7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM'];

        const contentInset = { top: 30, bottom: 30 };

        const Labels = ({ x, y, bandwidth, data }) => (
            data.map((value, index) => (
                <Text
                    key={ index }
                    x={ x(index) + (bandwidth / 2) }
                    y={ 165 - this.props.goalLine * 2.2 }
                    fontSize={ 14 }
                    fill={ 'blue' }
                    alignmentBaseline={ 'bottom' }
                    textAnchor={ 'middle' }
                >
                    _______
                </Text>
            ))
        );

        return (
            <View style={styles.graphContainer}>
                <YAxis
                    data={[0, 10, 20, 30, 40, 50, 60]}
                    contentInset={contentInset}
                    svg={{
                        fill: 'grey',
                        fontSize: 10,
                    }}
                    numberOfTicks={6}
                    style={{ height: 200 }}
                />
                <ScrollView horizontal={true} style={styles.bargraph}>
                    <View style={{ width: 500 }}>
                        <BarChart
                            style={{ height: 200 }}
                            data={this.props.data}
                            svg={{ fill }}
                            contentInset={{ top: 30, bottom: 30 }}
                            yMin={0}
                            yMax={60}
                        >
                            <Grid />
                            {this.props.requiresGoalLine == true &&
                                <Labels />
                            }
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
            </View>
        );
    }
}

const styles = StyleSheet.create({ 
    graphContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    bargraph: {
        marginLeft: 10,
        marginRight: 10,
    },

    hr: {
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        bottom: 100,
    }
});
