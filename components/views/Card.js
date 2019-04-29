import React from 'react';
import { View, StyleSheet } from 'react-native';

const Card = (props) => {
    let shadowStyle = {
        shadowColor: 'gray',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: .5,
        shadowRadius: 12,
        elevation: 1,
    }
    if (props.noShadow) {
        shadowStyle = {}
    }
    return (
        <View style={[styles.containerStyle, props.style, shadowStyle]}>
            {props.children}
        </View>
    );
};


const styles = StyleSheet.create({
    containerStyle: {
        marginHorizontal: 10,
        backgroundColor: '#efefef',
        borderRadius: 8,
        marginBottom: 10,
        marginTop: 10,
        elevation: 5
    }
})

export { Card };