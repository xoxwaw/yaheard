import React, { Component } from 'react';
import { Image, View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { withNavigation } from 'react-navigation';

const styles = StyleSheet.create({
  control_button: {
    flex: 1,
    backgroundColor: '#efefef',
    paddingTop: 10,
    borderWidth: 0.5,
    borderColor: '#ACDF87',
    alignItems:"center"
  },
  touch : {
    width: '100%',
    height: '100%',
  },
});

class Controls extends React.Component {
  render(){
    return (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={styles.control_button}>
            <TouchableOpacity style={styles.touch} onPress={() => this.props.navigation.navigate('routePost') }>
              <Icon
                size={25}
                name='edit'
                type='feather'
                color='#4C9A2A'
              />
            </TouchableOpacity>
          </View>
          <View style={styles.control_button}>
            <TouchableOpacity style={styles.touch} onPress={() => this.props.navigation.navigate('routeFeed') }>
              <Icon
                size={25}
                name='home'
                type='feather'
                color='#4C9A2A'
              />
            </TouchableOpacity>
          </View>
          <View style={styles.control_button}>
            <TouchableOpacity style={styles.touch} onPress={() => this.props.navigation.navigate('routeProfile') }>
              <Icon
                size={25}
                name='user'
                type='feather'
                color='#4C9A2A'
              />
            </TouchableOpacity>
          </View>
          <View style={styles.control_button}>
            <TouchableOpacity style={styles.touch} onPress={() => this.props.navigation.navigate('routeMap') }>
              <Icon
                size={25}
                name='map'
                type='feather'
                color='#4C9A2A'
              />
            </TouchableOpacity>
          </View>
          <View style={styles.control_button}>
            <TouchableOpacity style={styles.touch} onPress={() => this.props.navigation.navigate('routeSettings') }>
              <Icon
                size={25}
                name='settings'
                type='feather'
                color='#4C9A2A'
              />
            </TouchableOpacity>
          </View>
        </View>
    );
  }
}
export default withNavigation(Controls);
