import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import firebase from 'react-native-firebase';
import { createSwitchNavigator } from 'react-navigation';

//DISABLE IN APP WARNINGS
console.disableYellowBox = true;

var config = {
    apiKey: "AIzaSyBdkAdmQ4vQ1MlhQu2q7N6mvX6xV50yeNI",
    authDomain: "socialnetwork-fda05.firebaseapp.com",
    databaseURL: "https://socialnetwork-fda05.firebaseio.com",
    projectId: "socialnetwork-fda05",
    storageBucket: "socialnetwork-fda05.appspot.com",
    messagingSenderId: "1051210703087"
};
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
