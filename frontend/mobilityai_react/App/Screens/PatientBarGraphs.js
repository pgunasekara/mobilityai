import React, { Component } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { BarChart, Grid, XAxis, YAxis } from 'react-native-svg-charts'

// displaying the bar graph for the movement of the activity 
export default class BarGraph extends Component {
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

const styles = StyleSheet.create({ 
    bargraph: {
        marginLeft: 10,
        marginRight: 10,
    },
});
