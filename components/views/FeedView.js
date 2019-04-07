import React, { Component } from 'react';
import {Image, View, ScrollView, Text, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import {Card, ListItem, Icon } from 'react-native-elements';
import firebase from 'react-native-firebase';

const styles = StyleSheet.create({
  content_container: {
    backgroundColor: '#68bb59',
    padding: 20,
  },
  content_item: {
    backgroundColor: 'whitesmoke',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  }
});

export default class Feed extends React.Component {

    constructor(){
        super();
        this.ref = firebase.firestore().collection('posts');
        this.state = {items: []};
    }
    componentDidMount() {
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate)
    }

    componentWillUnmount() {
        this.unsubscribe();
    }
    onCollectionUpdate = (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
            const {post, user, upvote, downvote} = doc.data();
            items.push({
                user: user,
                post: post,
                up: upvote,
                down: downvote
            });
        });
        this.setState({
        items
        });
    }
  render() {
    return (
        <ScrollView>
          <View containerStyle={{padding: 0}} >
          {
              this.state.items.map((u, i) => {
                  return (
                      <Card>
                      <ListItem
                      key={i}
                      title={u.post}
                      subtitle={u.user}
                      >
                      </ListItem>
                      </Card>
                  );
              })
          }
          </View>
        </ScrollView>
    );
  }
}
