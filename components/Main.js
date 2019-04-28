import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import { createSwitchNavigator, withNavigation  } from 'react-navigation'


import FeedView from './views/FeedView';
import PostView from './views/PostView';
import ProfileView from './views/ProfileView';
import MapView from './views/MapView';
import SettingsView from './views/SettingsView';
import FocusView from './views/FocusView'
import CommentView from './views/CommentView'
import ReplyView from './views/ReplyView'

import Header from './Header';
import Controls from './Controls';

const win = Dimensions.get('window');

const ContentNav = createSwitchNavigator({
  routeFeed: { screen: FeedView },
  routePost: { screen: PostView },
  routeProfile: { screen: ProfileView },
  routeMap: { screen: MapView },
  routeSettings: { screen: SettingsView },
  routeFocus:{screen: FocusView},
  routeComment:{screen: CommentView},
  routeReply:{screen: ReplyView}
});

class Main extends React.Component {
  static router = ContentNav.router;
  render() {
    return (
      <View style={{position: 'absolute', width: '100%', top: 0, bottom: 0, left: 0, right: 0}}>
        <View style={{flexDirection: 'column'}}>
          <View style={{height: 50}}>
            <Header />
          </View>
          <View style={{height: win.height - 75, width: '100%', backgroundColor: '#ccc'}}>
            <ContentNav navigation={this.props.navigation} />
          </View>
          <View style={{height: 100}}>
            <Controls />
          </View>
        </View>
      </View>
    );
  }
}
export default withNavigation(Main);
