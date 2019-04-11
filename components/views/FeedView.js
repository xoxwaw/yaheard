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
function degreesToRadians(degrees) {
    return (degrees * Math.PI)/180;
}
function wrapLongitude(longitude) {
  if (longitude <= 180 && longitude >= -180) {
    return longitude;
  }
  const adjusted = longitude + 180;
  if (adjusted > 0) {
    return (adjusted % 360) - 180;
  }
  return 180 - (-adjusted % 360);
}

function metersToLongitudeDegrees(distance, latitude) {
  const EARTH_EQ_RADIUS = 6378137.0;
  const E2 = 0.00669447819799;
  const EPSILON = 1e-12;
  const radians = degreesToRadians(latitude);
  const num = Math.cos(radians) * EARTH_EQ_RADIUS * Math.PI / 180;
  const denom = 1 / Math.sqrt(1 - E2 * Math.sin(radians) * Math.sin(radians));
  const deltaDeg = num * denom;
  if (deltaDeg < EPSILON) {
    return distance > 0 ? 360 : 0;
  }
  // else
  return Math.min(360, distance / deltaDeg);
}

function boundingBoxCoordinates(center, radius) {
  const KM_PER_DEGREE_LATITUDE = 110.574;
  const latDegrees = radius / KM_PER_DEGREE_LATITUDE;
  const latitudeNorth = Math.min(90, center.latitude + latDegrees);
  const latitudeSouth = Math.max(-90, center.latitude - latDegrees);
  // calculate longitude based on current latitude
  const longDegsNorth = metersToLongitudeDegrees(radius, latitudeNorth);
  const longDegsSouth = metersToLongitudeDegrees(radius, latitudeSouth);
  const longDegs = Math.max(longDegsNorth, longDegsSouth);
  return {
    swCorner: { // bottom-left (SW corner)
      latitude: latitudeSouth,
      longitude: wrapLongitude(center.longitude - longDegs),
    },
    neCorner: { // top-right (NE corner)
      latitude: latitudeNorth,
      longitude: wrapLongitude(center.longitude + longDegs),
    },
  };
}

function distance(location1, location2) {
  const radius = 6371; // Earth's radius in kilometers
  const latDelta = degreesToRadians(location2.latitude - location1.latitude);
  const lonDelta = degreesToRadians(location2.longitude - location1.longitude);

  const a = (Math.sin(latDelta / 2) * Math.sin(latDelta / 2)) +
          (Math.cos(degreesToRadians(location1.latitude)) * Math.cos(degreesToRadians(location2.latitude)) *
          Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2));

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radius * c;
}

const getDocumentNearBy = (area) => {
    let box = boundingBoxCoordinates(area.center, area.radius);
    const lesserGeopoint = new GeoPoint(box.swCorner.latitude, box.swCorner.longitude);
    const greaterGeopoint = new GeoPoint(box.neCorner.latitude, box.neCorner.longitude);

    let docRef = firebase.firestore().collection("posts");
    let query = docRef.whereField("location", '>', lesserGeopoint).whereField("location", '<', greaterGeopoint);
    return query.get()
    .then((snapshot) => {
        const allLocs = []; // used to hold all the loc data
        snapshot.forEach((loc) => {
            // get the data
            const data = loc.data();
            // calculate a distance from the center
            data.distanceFromCenter = distance(area.center, data.location);
            // add to the array
            allLocs.push(data);
        });
        return allLocs;
    }).catch((err) => {
        return new Error('Error while retrieving events');
    });
}

export default class Feed extends React.Component {

    constructor(){
        super();
        this.ref = firebase.firestore().collection('posts');
        this.storage = firebase.storage();
        this.state = {items: [], images: [], imgURL: {}, location: null};

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
            this.setState({imgURL: {uri: url}});
          });
      }, 2000);
    }


    onCollectionUpdate = (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
            const {body, isText, location, time, user, vote} = doc.data();
            items.push({
                user: user,
                post: body.content,
                up: vote.upvote,
                isText: isText,
                location: location,
                down: vote.downvote
            });
        });
        this.setState({
        items:items
        });
    }

    findCoordinates = () => {
        navigator.geolocation.getCurrentPosition(
            position => {
                const location = JSON.stringify(position);

                this.setState({ location: location });
            },
            error => Alert.alert(error.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    }

  render() {
    return (
        <ScrollView>
          <View containerStyle={{padding: 0}} >
          {
              this.state.items.map((u, i) => {
                  if (u.isText == true){
                      return (
                          <Card>
                          <Text>{u.post}</Text>
                          </Card>
                      );
                  }else{
                      return (
                          <Card>
                          <Image
                            style={{width: 300, height: 200}}
                            source={{uri: u.post}}
                          />
                          </Card>
                      )
                  }

              })
          }
          </View>

        </ScrollView>
    );
  }
}
