import React, { Component } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { StackedBarChart, BarChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import { Text } from 'react-native-svg';

// displaying the bar graph for the movement of the activity 
export default class BarGraph extends Component {
    constructor(props) {
        super(props);

        this.state = {
            graphWidth: Math.max(this.props.data.length * 50, Dimensions.get('window').width)
        }
    }

    /**
     * @param  {Array<Json>} - Array of JSON data for the stacked bar view. Each JSON object has keys which are the
     *      values present in the stacked bar view and how much the value for it is for the current spot on the graph
     * @param  {Array<Date>} - Array of the same size as the data array with Hours. we assign all the times to the
     *      json data so when you render it, each stacked bar has a time associated. We use the field "month" as that
     *      is what is used in the demo for the library.
     */
    _mergeDataWithXLabels(data, labels){
        labels.forEach((label, idx) => {
            data[idx]['month'] = label;
        });
    }

    render() {
        const fill = this.props.color;
        const contentInset = { top: 30, bottom: 30 };
        let data = this.props.data;

        if (!this.props.singleBarView){
            this._mergeDataWithXLabels(data,this.props.xLabels);
        }

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
                    ____________________
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
                    style={styles.graphHeight}
                />
                <ScrollView horizontal={true} style={styles.bargraph}>
                    <View style={{ width: this.state.graphWidth }}>
                        {this.props.singleBarView 
                            ? <BarChart
                                style={styles.graphHeight}
                                data={this.props.data}
                                svg={{ fill }}
                                contentInset={{ top: 30, bottom: 30 }}
                                yMin={Math.min(...this.props.yLabels)}
                                yMax={Math.max(...this.props.yLabels)}
                            >
                                <Grid />
                                {this.props.requiresGoalLine == true &&
                                    <Labels />
                                }
                            </BarChart>
                            : <StackedBarChart
                                style={styles.graphHeight}
                                contentInset={ { top: 30, bottom: 30 } }
                                data={data}
                                keys={ this.props.keys }
                                colors={ this.props.color }
                                gridMin={Math.min(...this.props.yLabels)}
                                gridMax={Math.max(...this.props.yLabels)}
                            >
                            <Grid />
                            </StackedBarChart>}
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
    },
    graphHeight: {
        height: 200
    }
});
