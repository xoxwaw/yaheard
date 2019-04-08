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
        this.storage = firebase.storage();
        this.state = {items: [], images: [], imgURL: {}};

    }
    componentDidMount() {
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
        this.loadImage("images/image.png");
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    loadImage(path) {
        setTimeout(() => {
        this.storage.ref(path).getDownloadURL()
          .then((url) => {
            console.log(url);
            this.setState({imgURL: {uri: url}});
          });
      }, 2000);
        // this.setState({imgURL: {uri: downloadURL}});

    }


    onCollectionUpdate = (querySnapshot) => {
        const items = [];
        // var pathRef = this.storage.ref('images/image.png');
        // pathRef.getDownloadURL().then(function(url) {
        //      _url = url;
        // }, function(error){
        //     alert(error);
        // });
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
        items:items
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
          <Card>
          <Image
            style={{width: 300, height: 200}}
            source={this.state.imgURL}
          />
          </Card>

        </ScrollView>
    );
  }
}
