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

    static navigationOptions = ({ navigation }) => {
        return {
            title: "Surveys"
        };
    }

    /*
        Load the surveys for the a specific user id and then set the state to contain the new data.
     */
    componentDidMount() {
        GetSurveys(this.state.id).then((surveys) => {
            this.setState({ surveys });
        });
    }

    /*
        Render the survey list if any items exist in the list, otherwise show a message saying there are no items in the list.

        Display a loading component while you are fetching data from the server.
     */
    render() {
        if (this.state.surveys == undefined) {
            return <LoadingComponent message="Fetching the latest survey data..."/>;
        }
        
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