/**
 Hello World!
 */
import React, { Component } from 'react';
import { AppRegistry, Image } from 'react-native';

export default class Bananas extends Component {
  render() {
    let pic = {
      uri: 'https://i.imgur.com/sohWhy9.png'
    };
    return (
        <Image source={pic} style={{width: 193, height: 150}}/>
    );
  }
}

// skip this line if using Create React Native App
AppRegistry.registerComponent('AwesomeProject', () => Bananas);

