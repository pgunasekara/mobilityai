import React, { Component } from 'react';
import { ScrollView, StyleSheet, Text, View, Button, TextInput, FlatList } from 'react-native';
import { Icon } from 'react-native-elements';
import ActionButton from 'react-native-action-button';

import { GetSurveys } from '../Lib/Api';
import SurveyListItem from './SurveyListItem';

export default class SurveyList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            id: this.props.navigation.getParam('id'),
        }
    }

    componentDidMount() {
        GetSurveys(this.state.id).then((surveys) => {
            this.setState({ surveys });
        });
    }

    render() {
        if (this.state.surveys == undefined) {
            return (
                <Text>Fetching the latest survey data...</Text>
            );
        }
        console.log(this.state.surveys);
        return (
            <View style={{flex: 1}}>
                <ScrollView>
                    {this.state.surveys.length == 0 ? <Text>Looks like there aren't any surveys yet! Press the + button to create a new one.</Text>
                    :
                    <FlatList
                        data={this.state.surveys.map(s => JSON.parse(s.data))}
                        renderItem={({ item, index }) => (
                                <SurveyListItem
                                    id = {this.state.id}
                                    navigation = {this.props.navigation}
                                    surveyState = {item}
                                    firstRow={index == 0}
                                />
                            )
                        }
                    />
                    }
                </ScrollView>
                <ActionButton buttonColor="rgba(231,76,60,1)"
                    onPress={() => {
                        this.props.navigation.navigate('Survey', {
                            id: this.state.id,
                            navigation: this.props.navigation,
                        });
                    }}
                    degrees={0}>
                    <Icon name="md-create" style={styles.actionButtonIcon} />
                </ActionButton>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    actionButtonIcon: {
        fontSize: 20,
        height: 22,
        color: 'white',
    },
});