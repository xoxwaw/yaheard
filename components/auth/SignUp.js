import React from 'react'
import { StyleSheet, Text, TextInput, View, Button, TouchableOpacity  } from 'react-native'
import styles from '../styles/authStyle'

export default class signUp extends React.Component {
  state = { email: '', password: '', errorMessage: null }
  handleSignUp = () => {
    // TODO: For Firebase athu
    console.log('handleSignUp')
  }

render() {
    return (
      <View style={styles.container}>
      <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }} >
        <Text style={{fontSize: 50, fontFamily: 'Pacifico-Bold', color: '#4C9A2A', width: 140, justifyContent: 'center', alignItems: 'center' }}>YaHeard</Text>
      </View>
      <Text style={{color:'#4C9A2A', fontSize: 30}}>Sign Up</Text>
        {this.state.errorMessage &&
          <Text style={{ color: 'red' }}>
            {this.state.errorMessage}
          </Text>}
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <TextInput
          secureTextEntry
          placeholder="Password"
          autoCapitalize="none"
          style={styles.textInput}
          onChangeText={password => this.setState({ password })}
          value={this.state.password}
        />
        <View style={{ width: "90%", marginBottom: 20}}>
          <Button title="Sign Up" color="#4C9A2A" onPress={this.handleSignUp}/>
        </View>
        <View>
        <Text> Already have an account? <Text onPress={() => this.props.navigation.navigate('routeLogin')} style={{color:'#4C9A2A', fontSize: 18}}> Login </Text></Text>
        </View>
      </View>
    )
  }
}
