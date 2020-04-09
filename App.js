import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import firebase from 'react-native-firebase';
import { createSwitchNavigator } from 'react-navigation';

//DISABLE IN APP WARNINGS
console.disableYellowBox = true;
firebase.initializeApp(config);

import Main from './components/Main';
import Loading from './components/auth/Loading';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';


const AuthNav = createSwitchNavigator({
  routeLoading: Loading,
  routeSignUp: SignUp,
  routeLogin: Login,
  routeMain: Main,
});

export default class App extends React.Component {
  render() {
    return <AuthNav />;
  }
}
