import React, { Component } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { BarChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import { Text } from 'react-native-svg';

// displaying the bar graph for the movement of the activity 
export default class BarGraph extends Component {
    constructor(props) {
        super(props);

        this.state = {
            graphWidth: Math.max(this.props.data.length * 28.3, Dimensions.get('window').width)
        }
    }

    render() {
        const fill = this.props.color;

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
                    data={this.props.yLabels}
                    contentInset={contentInset}
                    svg={{
                        fill: 'grey',
                        fontSize: 10,
                    }}
                    // numberOfTicks={this.props.yLabels.length}
                    style={{ height: 200 }}
                />
                <ScrollView horizontal={true} style={styles.bargraph}>
                    <View style={{ width: this.state.graphWidth}}>
                        <BarChart
                            style={{ height: 200 }}
                            data={this.props.data}
                            svg={{ fill }}
                            contentInset={{ top: 30, bottom: 30 }}
                            yMin={0}
                            yMax={this.props.yLabels.length}
                        >
                            <Grid />
                            {this.props.requiresGoalLine == true &&
                                <Labels />
                            }
                        </BarChart>
                        <XAxis
                            style={{ marginHorizontal: -10 }}
                            data={this.props.data}
                            formatLabel={(value, index) => this.props.xLabels[index]}
                            contentInset={{ left: 30, right: 30 }}
                            svg={{ fontSize: 10, fill: 'black' }}
                            alignmentBaseline={ 'middle' }
                            textAnchor={'middle'}
                            numberOfTicks={this.props.xLabels.length}
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
