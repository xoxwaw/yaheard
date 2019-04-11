import React, { Component } from 'react';
import { Image, View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { withNavigation } from 'react-navigation';

const styles = StyleSheet.create({
  control_button: {
    flex: 1,
    backgroundColor: '#efefef',
    paddingTop: 10,
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
                style={{textAlign: "center"}}
                size={25}
                name='pencil'
                color='#4C9A2A'
              />
            </TouchableOpacity>
          </View>
          <View style={styles.control_button}>
            <TouchableOpacity style={styles.touch} onPress={() => this.props.navigation.navigate('routeFeed') }>
              <Icon
                style={{textAlign: "center"}}
                size={25}
                name='globe'
                color='#4C9A2A'
              />
            </TouchableOpacity>
          </View>
          <View style={styles.control_button}>
            <TouchableOpacity style={styles.touch} onPress={() => this.props.navigation.navigate('routeProfile') }>
              <Icon
                style={{textAlign: "center"}}
                size={25}
                name='user'
                color='#4C9A2A'
              />
            </TouchableOpacity>
          </View>
          <View style={styles.control_button}>
            <TouchableOpacity style={styles.touch} onPress={() => this.props.navigation.navigate('routeMap') }>
              <Icon
                style={{textAlign: "center"}}
                size={25}
                name='comment'
                color='#4C9A2A'
              />
            </TouchableOpacity>
          </View>
          <View style={styles.control_button}>
            <TouchableOpacity style={styles.touch} onPress={() => this.props.navigation.navigate('routeSettings') }>
              <Icon
                style={{textAlign: "center"}}
                size={25}
                name='cogs'
                color='#4C9A2A'
              />
            </TouchableOpacity>
          </View>
        </View>
    );
  }
}
export default withNavigation(Controls);
