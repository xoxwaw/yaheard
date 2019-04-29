import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';

export default class Create extends React.Component {
    render() {
        return (
            <View style={{ width: '100%', height: '100%'}}>
                <View style={{ width: '100%', flex: 1, flexDirection: 'column' }}>
                    <View style={{ flex: 1, height: '100%', backgroundColor: 'whitesmoke' }}>
                        <TouchableOpacity style={{ width: '100%', height: '100%' }} onPress={() => this.props.navigation.navigate('routePostText') }>
                        <ImageBackground
                            source={{uri: 'https://cdn-images-1.medium.com/max/1600/0*pxVbW7V5iXP4VBfU.jpg'}}
                            style={{ opacity: 0.2, width: '100%', height: '100%' }}
                            resizeMode='cover'
                        />
                        <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={{ position: 'absolute', fontFamily: 'Pacifico-Bold', fontSize: 50, width: '100%', textAlign: 'center' }}>Post Text</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, height: '100%' }}>
                    <TouchableOpacity style={{ width: '100%', height: '100%' }} onPress={() => this.props.navigation.navigate('routePostImage') }>
                            <ImageBackground
                                source={{uri: 'https://propane.com/wp-content/uploads/2018/10/Propane-Uses-Landscape-And-Turf-Management-Marquee-1800x1200-Mower-Vista.jpg'}}
                                style={{ opacity: 0.2, width: '100%', height: '100%' }}
                                resizeMode='cover'
                            />
                            <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'}}>
                                <Text style={{ position: 'absolute', fontFamily: 'Pacifico-Bold', fontSize: 50, width: '100%', textAlign: 'center' }}>Post Image</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
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
