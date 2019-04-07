import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SwitchNavigator } from 'react-navigation'

import styles from '../styles/postStyle' //for testing templates
import { Icon } from 'react-native-elements'; //for testing templates

export default class Create extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, flexDirection: 'column' }}>

        <Text>MAP VIEW</Text>

        <View style={styles.type_a_container}>
          <View style={styles.type_a_content}>
            <Text>"This is a quote"</Text>
          </View>
          <View>
            <View style={styles.type_a_info}>
              <View style={{ flex: 2 }}>
                <Icon size={15} name='clock' type='feather' color='#000'/>
              </View>
              <View style={{ flex: 5 }}>
                <Text style={styles.type_a_text}>3 hours ago</Text>
              </View>
              <View style={{ flex: 2 }}>
                <Icon size={15} name='map-pin' type='feather' color='#000'/>
              </View>
              <View style={{ flex: 12 }}>
                <Text style={styles.type_a_text}>Near Earlham</Text>
              </View>
            </View>
          </View>
        </View>

      </View>
    );
  }
}
