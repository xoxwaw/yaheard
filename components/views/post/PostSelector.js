import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Button, AsyncStorage, Platform, Image } from 'react-native';
import { withNavigation  } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'react-native-firebase';

export default class Create extends React.Component {
  render() {
    return (
      <View style={{ width: '100%', flex: 1}}>
        <View style={{ width: '100%', flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1, height: '100%', backgroundColor: 'whitesmoke' }}>
            <TouchableOpacity style={styles.touch} onPress={() => this.props.navigation.navigate('routePostText') }>
              <Icon
                style={{textAlign: "center"}}
                size={50}
                name='font'
                color='#4C9A2A'
              />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, height: '100%' }}>
            <TouchableOpacity style={styles.touch} onPress={() => this.props.navigation.navigate('routePostImage') }>
              <Icon
                style={{textAlign: "center"}}
                size={50}
                name='image'
                color='#4C9A2A'
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ width: '100%', flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1, height: '100%' }}></View>
          <View style={{ flex: 1, height: '100%', backgroundColor: 'whitesmoke' }}></View>
        </View>
        <View style={{ width: '100%', flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1, height: '100%', backgroundColor: 'whitesmoke' }}></View>
          <View style={{ flex: 1, height: '100%' }}></View>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  button : {
    marginLeft: 10,
    marginRight: 10,
  },
  header : {
    fontSize: 18,
    color: '#4C9A2A',
    marginLeft: 20,
    marginTop: 20,
    flex: 1,
  },
  container : {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    flex: 15,
  },
  textbox : {
    backgroundColor: '#ddd',
    borderColor: '#ccc',
    borderWidth: 2,
    width: '90%',
    marginBottom: 10,
    height: 200,
  }
});
