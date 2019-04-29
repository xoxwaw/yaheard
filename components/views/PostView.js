import React, { Component } from 'react';
import { View } from 'react-native';
import { createSwitchNavigator, withNavigation  } from 'react-navigation'

import ImagePost from './post/ImagePost';
import TextPost from './post/TextPost';
import PostSelector from './post/PostSelector';

const PostNav = createSwitchNavigator({
  routeSelector: { screen: PostSelector },
  routePostText: { screen: TextPost },
  routePostImage: { screen: ImagePost },
});

class PostView extends React.Component {
  static router = PostNav.router;
  render() {
    return (
      <PostNav navigation={this.props.navigation} />
    );
  }
}
export default withNavigation(PostView);
