import React from 'react';
import {View, Text, StyleSheet, Image, Pressable} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const NewOrderPopup = ({newOrder, onAccept, onDecline, duration, distance}) => {
  return (
    <View style={styles.root}>
      <Pressable onPress={onDecline} style={styles.declineButton}>
        <Text style={styles.declineText}>Decline</Text>
      </Pressable>

      <Pressable onPress={onAccept} style={styles.popupContainer}>
        <View style={styles.row}>
          <Text style={styles.uberType}>{newOrder.type}</Text>
          <Image
            style={styles.userImage}
            source={require('../../assets/images/AvineshUber.jpg')}
          />
          <Text style={styles.uberType}>
            <AntDesign name={'star'} size={18} />
            {newOrder.user.rating}
          </Text>
        </View>
        <Text style={styles.minutes}>{duration} min</Text>
        <Text style={styles.distance}>{distance} mi</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    height: '100%',
    justifyContent: 'space-between',
    backgroundColor: '#00000099',
  },
  popupContainer: {
    backgroundColor: 'black',

    height: 250,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  minutes: {
    color: 'lightgrey',
    fontSize: 30,
  },
  distance: {
    color: 'lightgrey',
    fontSize: 26,
  },
  uberType: {
    color: 'lightgrey',
    fontSize: 20,
    marginHorizontal: 10,
    paddingTop: 13,
  },
  row: {
    flexDirection: 'row',
  },
  userImage: {
    width: 60,
    height: 57,
    borderRadius: 50,
    marginRight: 10,
    resizeMode: 'cover',
  },
  declineButton: {
    backgroundColor: 'black',
    borderRadius: 50,
    padding: 15,
    width: 100,
    alignItems: 'center',
  },
  declineText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NewOrderPopup;
