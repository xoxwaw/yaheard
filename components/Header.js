import React, { Component } from 'react';
import { View, Text, StyleSheet} from 'react-native';

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
  render() {
    return (
      <View style={styles.head_view}>
        <View style={{flex: 0.9}}>
          <Text style={styles.head_text}>YaHeard</Text>
        </View>
      </View>
    );
  }
}
