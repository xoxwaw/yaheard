import React, { Component } from 'react';
import { Image, View, Text, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import firebase from 'react-native-firebase';
import Icon from 'react-native-vector-icons/FontAwesome';

const styles = StyleSheet.create({
  head_view: {
    height: 50,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#efefef',
    borderColor: '#68BB59',
  },
  head_text: {
    fontSize: 25,
    fontFamily: 'Pacifico-Bold',
    marginLeft: 20,
    marginTop: 5,
    color: '#4C9A2A',
  },
  button_view: {
    flex: 0.1,
    padding: 5,
    borderColor: 'white',
    borderLeftWidth: 2,
  }

});

export default class Header extends Component {
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
      <View style={styles.head_view}>
        <View style={{flex: 0.9}}>
          <Text style={styles.head_text}>YaHeard</Text>
        </View>

        <View style={styles.button_view}>
          <TouchableOpacity style={{ padding: 5 }} onPress={this.logOut}>
            <Icon
              size={25}
              name='sign-out'
              color='#4C9A2A'
            />
          </TouchableOpacity>
        </View>

      </View>
    );
  }
}
