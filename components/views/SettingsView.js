import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, AsyncStorage } from 'react-native';
import { SwitchNavigator } from 'react-navigation';
import firebase from 'react-native-firebase';

const client = require('./Backend/Client');

export default class Create extends React.Component {
    state = {sort: ['gray','gray','gray'], inc: ['gray','gray']}


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
  textStyle = function(ind, group){
    var color = '';
    if (group == 'inc')
    {
        color = this.state.inc[ind];
    }
    else{
        color = this.state.sort[ind];
    }
    if (color == '#4C9A2A'){
        return {
            width: '100%',
            height: 30,
            textAlign: 'center',
            fontFamily: 'Pacifico-Bold',
            fontSize: 20,
            color: color,
            textShadowColor: '#4C9A2A',
            textShadowOffset: {width: -1, height: 1},
            textShadowRadius: 10
        }
    }
    else{
        return {
            width: '100%',
            height: 30,
            textAlign: 'center',
            fontFamily: 'Pacifico-Bold',
            fontSize: 20,
            color: color,
        }
    }

  }
  sortDay = () => {
      AsyncStorage.setItem('sortTime', 'day').then(res=> console.log())
    this.setState({ sort: ['#4C9A2A','gray','gray'] })
    // sort to day
  }
  sortMonth = () => {
      AsyncStorage.setItem('sortTime', 'month').then(res=> console.log())
    this.setState({ sort: ['gray','#4C9A2A','gray'] })
    // sort to month
  }
  sortYear = () => {
      AsyncStorage.setItem('sortTime', 'year').then(res=> console.log())
    this.setState({ sort: ['gray','gray','#4C9A2A'] })
    // sort to year
  }
  sortNew = () => {
      AsyncStorage.setItem('sortType', 'new').then(res=> console.log())
    this.setState({ inc: ['#4C9A2A','gray'] })
    // sort to NEW
  }
  sortPop = () => {
      AsyncStorage.setItem('sortType', 'popular').then(res=> console.log())
    this.setState({ inc: ['gray','#4C9A2A'] })
    // sort to POPULAR
  }
  render() {
    return (
        <View style={{ flex: 1, flexDirection: 'column'}}>
            <Text style={{ fontFamily: 'Pacifico-Bold', fontSize: 22, color: 'black', textAlign: 'center', width: '100%', backgroundColor: '#ccc', height: 40 }}>Settings</Text>

            <Text style={{ fontSize: 16, width: '100%', backgroundColor: '#ccc', marginLeft: 20, color: 'gray' }}>See posts from the last:</Text>
            <View style={{ padding: 10, margin: 10, flex: 1}}>
                <View style={{ flexDirection: 'row', elevation: 5 }}>
                    <TouchableOpacity onPress={this.sortDay} style={{ flex: 1, padding: 10, backgroundColor:'#eee', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderColor: '#4C9A2A', borderWidth: 0.5 }}>
                        <Text color={this.state.sort[0]} style={this.textStyle(0, 'sort')}>
                            Day
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.sortMonth} style={{ flex: 1, padding: 10, backgroundColor:'#eee', borderColor: '#4C9A2A', borderWidth: 0.5 }}>
                        <Text color={this.state.sort[1]} style={this.textStyle(1, 'sort')}>
                            Month
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.sortYear} style={{ flex: 1, padding: 10, backgroundColor:'#eee', borderTopRightRadius: 8, borderBottomRightRadius: 8, borderColor: '#4C9A2A', borderWidth: 0.5 }}>
                        <Text color={this.state.sort[2]} style={this.textStyle(2, 'sort')}>
                            Year
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={{ fontSize: 16, width: '100%', backgroundColor: '#ccc', marginLeft: 20, color: 'gray' }}>Sort posts by:</Text>
            <View style={{ padding: 10, margin: 10, flex: 1}}>
                <View style={{ flexDirection: 'row', elevation: 5 }}>
                    <TouchableOpacity onPress={this.sortNew} style={{ flex: 1, padding: 10, backgroundColor:'#eee', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderColor: '#4C9A2A', borderWidth: 0.5 }}>
                        <Text color={this.state.sort[0]} style={this.textStyle(0, 'inc')}>
                            Popular
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.sortPop} style={{ flex: 1, padding: 10, backgroundColor:'#eee', borderTopRightRadius: 8, borderBottomRightRadius: 8, borderColor: '#4C9A2A', borderWidth: 0.5 }}>
                        <Text color={this.state.sort[0]} style={this.textStyle(1, 'inc')}>
                            Recent
                        </Text>
                    </TouchableOpacity>
                </View>
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
            <View style={{ flex: 5 }}>

            </View>

            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 100}}>
                <Text style={{fontSize: 10, color: '#BBB'}}>YaHeard 2019</Text>
                <Text style={{fontSize: 10, color: '#BBB'}}>Created by Porter L, Ethan R, Phi N, Neil N, and Dan S for CS365</Text>
            </View>

        </View>
    );
  }
}
