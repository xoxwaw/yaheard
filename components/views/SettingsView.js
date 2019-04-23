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
      <View style={{ flex: 1, flexDirection: 'column'}}>
        <Text style={{ fontFamily: 'Pacifico-Bold', fontSize: 22, color: 'black', textAlign: 'center', width: '100%', backgroundColor: '#ccc', height: 40 }}>Settings</Text>
          <View style={{ padding: 10 }}>
            <Button
                style={{ margin: 10 }}
                onPress={this.logOut}
                title="Log Out"
                color="#4C9A2A"
                accessibilityLabel="Log out of YaHeard"
            />
        </View>
        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 100}}>
            <Text style={{fontSize: 10, color: '#BBB'}}>YaHeard 2019</Text>
            <Text style={{fontSize: 10, color: '#BBB'}}>Created by Porter L, Ethan R, Phi N, Neil N, and Dan S for CS365</Text>
        </View>
      </View>
    );
  }
}
