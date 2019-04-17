import React, { Component } from 'react';
import { View, Text, StyleSheet, AsyncStorage } from 'react-native';
import { SwitchNavigator } from 'react-navigation'
import firebase from 'react-native-firebase';

export default class Profile extends React.Component {
    constructor(){
        super();
        this.ref = firebase.firestore().collection('users');
        this.storage = firebase.storage();
        this._retrieveData()
        this.state = {username: "", karma: 1, recent_posts : []};
    }
    _retrieveData = async () => {
          try {
              const value = await AsyncStorage.getItem('user');
              if (value !== null) {
                  // We have data!!
                  var query = this.ref.where("email", "==", value);
                  query.onSnapshot((snapshot) =>{
                      snapshot.forEach(child => {
                          const {email, karma, username} = child.data()
                          this.setState({username: username, karma: karma});
                      })
                  })

              }
          } catch (error) {
              alert(error);
              // Error retrieving data
          }
    };

  render() {
    return (
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <Text>PROFILE</Text>
        <Text>Hello, {this.state.username}</Text>
        <Text>Karma: {this.state.karma}</Text>
      </View>
    );
  }
}
