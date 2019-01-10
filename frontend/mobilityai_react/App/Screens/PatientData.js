import React, {Component} from 'react';

import {Text, View, Image, StyleSheet, ART} from 'react-native';

const { Group, Shape, Surface } = ART;

import * as d3 from 'd3'


export default class PatientData extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id: props.id,
            firstName: props.firstName,
            lastName: props.lastName,
        }
    }

    render() {
        const { navigation } = this.props;
        const id = navigation.getParam('id');
        const firstName = navigation.getParam('firstName');
        const lastName = navigation.getParam('lastName');

        const width = 250;
        const height = 250;

        const userPurchases = [
            {
              itemName: 'Mountain Dew',
              price: 3
            },
            {
              itemName: 'Shoes',
              price: 50
            },
            {
              itemName: 'Kit Kat',
              price: 1
            },
            {
              itemName: 'Taxi',
              price: 24
            },
            {
              itemName: 'Watch',
              price: 100
            },
            {
              itemName: 'Headphones',
              price: 15
            },
            {
              itemName: 'Wine',
              price: 16
            }
        ];

        const sectionAngles = d3.pie().value(d => d.price)(userPurchases);

        const path = d3.arc()
            .outerRadius(100) //must be less than 1/2 the chart's height/width
            .padAngle(.05) //defines the amount of whitespace between sections
            .innerRadius(60); //the size of the inner 'donut' whitespace

        return(
            <View>
                <Text>{id}</Text>
                <Text>{firstName + " " + lastName}</Text>

                <Surface width={width} height={height}>
                    <Group x={width/2} y={height/2}>
                        {
                            sectionAngles.map(section => (
                                <Shape
                                    key={section.index}
                                    d={path(section)}
                                    stroke="#000"
                                    fill={`rgb(0,0,255)`}
                                    strokeWidth={1}
                                />
                            ))
                        }  
                    </Group>
                </Surface>
            </View>
        );
    }
}