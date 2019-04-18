import React, { Component } from "react";
import { StyleSheet, Text, TextInput, View, Button, AsyncStorage } from 'react-native';
import firebase from 'react-native-firebase';
import styles from '../styles/authStyle'

export default class Login extends Component {
  state = { email: '', password: '', errorMessage: null }
 handleLogin = () => {
     this._storeData();
   firebase
     .auth()
     .signInWithEmailAndPassword(this.state.email, this.state.password)
     .then(() => this.props.navigation.navigate('routeMain'))
     .catch(error => this.setState({ errorMessage: error.message }))
 }

 _storeData = async () => {
  try {
    await AsyncStorage.setItem('user', this.state.email);
  } catch (error) {
    // Error saving data
  }
};
  render() {
    return (
      <View style={styles.container}>
        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }} >
          <Text style={{fontSize: 50, fontFamily: 'Pacifico-Bold', color: '#4C9A2A', width: '100%', textAlign: 'center'}}>YaHeard</Text>
        </View>
        <Text style={{color:'#4C9A2A', fontSize: 30}}>Login</Text>
        {this.state.errorMessage &&
          <Text style={{ color: 'red' }}>
            {this.state.errorMessage}
          </Text>}
        <TextInput style={styles.textInput}
          autoCapitalize='none'
          placeholder='Email'
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <TextInput
          secureTextEntry
          style={styles.textInput}
          autoCapitalize="none"
          placeholder="Password"
          onChangeText={password => this.setState({ password })}
          value={this.state.password}
        />
        <View style={{ width: "90%", marginBottom: 20}}>
          <Button style={{width: 50}} title="Login" color="#4C9A2A" onPress={this.handleLogin} />
        </View>
        <View>
        <Text> Don't have an account? <Text onPress={() => this.props.navigation.navigate('routeSignUp')} style={{color:'#4C9A2A', fontSize: 18}}> Sign Up </Text></Text>
        </View>
      </View>
    )
  }
}
