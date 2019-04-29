import React, { Component } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { withNavigation } from 'react-navigation';

const styles = StyleSheet.create({
    control_button: {
        flex: 1,
        backgroundColor: '#efefef',
        paddingTop: 10,
        alignItems:"center"
    },
    touch : {
        width: '100%',
        height: '100%',
    },
});

class Controls extends React.Component {
    state = {
        color_1 : "#444",
        color_2 : '#4C9A2A',
        color_3 : "#444",
        color_4 : "#444",
        color_5 : "#444",
    }
    press1(){
        this.props.navigation.navigate('routePost');
        this.color_1 = '#4C9A2A';
        this.color_2 = this.color_3 = this.color_4 = this.color_5 = "#444";
    }
    press2(){
        this.props.navigation.navigate('routeFeed');
        this.color_2 = '#4C9A2A';
        this.color_1 = this.color_3 = this.color_4 = this.color_5 = "#444";
    }
    press3(){
        this.props.navigation.navigate('routeProfile');
        this.color_3 = '#4C9A2A';
        this.color_1 = this.color_2 = this.color_4 = this.color_5 = "#444";
    }
    press4(){
        this.props.navigation.navigate('routeMap');
        this.color_4 = '#4C9A2A';
        this.color_1 = this.color_2 = this.color_3 = this.color_5 = "#444";
    }
    press5(){
        this.props.navigation.navigate('routeSettings');
        this.color_5 = '#4C9A2A';
        this.color_1 = this.color_2 = this.color_3 = this.color_4 = "#444";
    }
    render(){
        return (
            <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={styles.control_button}>
                    <TouchableOpacity style={styles.touch} onPress={this.press1.bind(this)}>
                        <Icon
                            style={{textAlign: "center"}}
                            size={25}
                            name='pencil'
                            color={this.color_1}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.control_button}>
                    <TouchableOpacity style={styles.touch} onPress={this.press2.bind(this)}>
                        <Icon
                            style={{textAlign: "center"}}
                            size={25}
                            name='globe'
                            color={this.color_2}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.control_button}>
                    <TouchableOpacity style={styles.touch} onPress={this.press3.bind(this)}>
                        <Icon
                            style={{textAlign: "center"}}
                            size={25}
                            name='user'
                            color={this.color_3}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.control_button}>
                    <TouchableOpacity style={styles.touch} onPress={this.press5.bind(this)}>
                        <Icon
                            style={{textAlign: "center"}}
                            size={25}
                            name='cogs'
                            color={this.color_5}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
export default withNavigation(Controls);
