import React, { Component } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { SwitchNavigator } from 'react-navigation';
import firebase from 'react-native-firebase';

export default class Create extends React.Component {
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
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <Text>SETTINGS BANNER</Text>
          <Button
            style={{ margin: 10 }}
            onPress={this.logOut}
            title="Log Out"
            color="#4C9A2A"
            accessibilityLabel="Log out of YaHeard"
          />
      </View>
    );
  }
}
