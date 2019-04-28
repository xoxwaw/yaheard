import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, Picker } from 'react-native';
import { SwitchNavigator } from 'react-navigation';
import firebase from 'react-native-firebase';

const client = require('./Backend/Client');

export default class Create extends React.Component {
    state = {sort: '', inc: ''}

    updateSort = (sort) => {
      this.setState({ sort: sort })
      if (this.state.sort == 'popular'){
            // if feed should be sorted by popular
            client.sortByPopular()
      }
      else{
            // if feed should be sorted by new
      }
    }
    updateInc = (inc) => {
        this.setState({ inc: inc })
        if (this.state.inc == 'day'){
            // if feed should be constrained to day
        }
        else if(this.state.inc == 'month'){
            // if feed should be constrained to month
        }
        else if (this.state.inc == 'year'){
            // if feed should be constrained to year
        }
        else{
            // if feed is not constrained
        }
      }
  logOut = () => {
    firebase.auth().signOut().then(function() {
      Alert.alert(
        'Logged Out',
        'You have been logged out of YaHeard',
        [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ],
        { cancelable: false }
      )
    }, function(error) {
      alert('error');
    });
  }
  render() {
    return (
        <View style={{ flex: 1, flexDirection: 'column'}}>
            <Text style={{ fontFamily: 'Pacifico-Bold', fontSize: 22, color: 'black', textAlign: 'center', width: '100%', backgroundColor: '#ccc', height: 40 }}>Settings</Text>
                

                <View style={{ padding: 10, margin: 10, flex: 1, backgroundColor: '#ddd', borderRadius: 8, marginTop: 40}}>
                    <Picker selectedValue = {this.state.sort} onValueChange = {this.updateSort}>
                        <Picker.Item label = "Most Popular" value = "popular" />
                        <Picker.Item label = "Most Recent" value = "new" />
                    </Picker>
                </View>

                <View style={{ padding: 10, margin: 10, flex: 1, backgroundColor: '#ddd', borderRadius: 8, marginTop: 40}}>
                    <Picker selectedValue = {this.state.inc} onValueChange = {this.updateInc}>
                        <Picker.Item label = "Last day" value = "day" />
                        <Picker.Item label = "Last Month" value = "month" />
                        <Picker.Item label = "Last Year" value = "year" />
                        <Picker.Item label = "All Time" value = "all" />
                    </Picker>
                </View>


            <View style={{ padding: 10, flex: 1 }}>
                <Button
                    style={{ margin: 10 }}
                    onPress={this.logOut}
                    title="Log Out"
                    color="#4C9A2A"
                    accessibilityLabel="Log out of YaHeard"
                />
            </View>
            <View style={{ flex: 1 }}>
                
            </View>

            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 100}}>
                <Text style={{fontSize: 10, color: '#BBB'}}>YaHeard 2019</Text>
                <Text style={{fontSize: 10, color: '#BBB'}}>Created by Porter L, Ethan R, Phi N, Neil N, and Dan S for CS365</Text>
            </View>

        </View>
    );
  }
}
