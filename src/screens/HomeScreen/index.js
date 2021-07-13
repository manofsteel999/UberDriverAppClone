import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  PermissionsAndroid,
  Image,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NewOrderPopup from '../../components/NewOrderPopup';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
const origin = {latitude: 26.463587, longitude: 80.322149}; // for testing puttedto Kanpur coords
const destination = {latitude: 25.138672, longitude: 75.844508};
const GOOGLE_MAPS_APIKEY = 'AIzaSyAT081Nu8sH4jiCy3A6tICeER1K6rfWjMI';
import Geolocation from 'react-native-geolocation-service';

const HomeScreen = () => {
  const [initializing, setInitializing] = useState(true);
  const [car, setCar] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [myPosition, setMyPosition] = useState(null);

  const [order, setOrder] = useState(null);

  const [newOrder, setNewOrder] = useState({
    id: '1', // document id in our database of a partivular order
    type: 'UberX',
    originLatitude: 26.463586,
    originLongitude: 80.322148,
    destLatitude: 25.138663,
    destLongitude: 75.844532,
    user: {
      rating: 5.0,
      name: 'Avinesh',
    },
  });

  const [currentLoc, setCurrentLoc] = useState({
    latitude: 0,
    longitude: 0,
  });

  const fetchCar = async () => {
    try {
      const user = auth().currentUser;
      const uid = user.uid;
      const carData = await firestore()
        .collection('car')
        .where('id', '==', uid)
        .get();
      console.log(carData.docs[0].data());
      setCar(carData.docs[0]); // append .data() for extracting the data field
      if (initializing) {
        setInitializing(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCar();
  }, []);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        //  console.log(position);
        setCurrentLoc({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }, [order]);

  const onDecline = () => {
    setNewOrder(null);
  };

  const onAccept = newOrder => {
    setOrder(newOrder);
    setNewOrder(null);
  };

  const onGoPress = async () => {
    setIsOnline(!isOnline);
    // update the related car here and set the isActive field to true or false
    try {
      const user = auth().currentUser;
      const uid = user.uid;
      const ranVal = car.data().isActive;
      await firestore().collection('car').doc(car.id).update({
        isActive: !ranVal,
      });
      const carData = await firestore()
        .collection('car')
        .where('id', '==', uid)
        .get();
      console.log(carData.docs[0]);
      setCar(carData.docs[0]);
    } catch (e) {
      console.error(e);
    }
  };

  const renderBottomTitle = () => {
    {
      if (order && order.isFinished) {
        return (
          <View style={{alignItems: 'center'}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{paddingRight: 15}}>
                {order.duration ? order.duration.toFixed(1) : '...'} min
              </Text>

              <Image
                style={styles.userImage}
                source={require('../../assets/images/AvineshUber.jpg')}
              />

              <Text>
                {order.distance ? order.distance.toFixed(1) : '...'} Km
              </Text>
            </View>
            <Text style={styles.bottomText}>COMPLETE {order.type}</Text>
          </View>
        );
      }
    }

    if (order) {
      return (
        <View style={{alignItems: 'center'}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{paddingRight: 15}}>
              {order.duration ? order.duration.toFixed(1) : '...'} min
            </Text>

            <Image
              style={styles.userImage}
              source={require('../../assets/images/AvineshUber.jpg')}
            />

            <Text>{order.distance ? order.distance.toFixed(1) : '...'} Km</Text>
          </View>
          <Text style={styles.bottomText}>
            {order.pickedUp ? 'Dropping Off' : 'Picking Up'} {order.user.name}
          </Text>
        </View>
      );
    }

    if (car.data().isActive) {
      return <Text style={styles.bottomText}>You're Online</Text>;
    }
    return <Text style={styles.bottomText}>You're Offline</Text>;
  };

  const onUserLocationChange = event => {
    setMyPosition(event.nativeEvent.coordinate);
  };

  // VVVIp Function to find if uber has reached the user and then updating the destination coords
  const onDirectionFound = event => {
    if (order) {
      setOrder({
        ...order,
        distance: event.distance,
        duration: event.duration,
        pickedUp: order.pickedUp || event.distance < 0.2,
        isFinished: order.pickedUp && event.distance < 0.2,
      });
    }
  };

  const getDestination = () => {
    if (order && order.pickedUp) {
      return {
        latitude: order.destLatitude,
        longitude: order.destLongitude,
      };
    }
    return {
      latitude: order.originLatitude,
      longitude: order.originLongitude,
    };
  };

  if (initializing) return null;

  return (
    <View>
      <MapView
        onMapReady={() => {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
        }}
        style={{width: '100%', height: Dimensions.get('window').height - 45}}
        provider={PROVIDER_GOOGLE}
        showUserLocation={true}
        onUserLocationChange={onUserLocationChange}
        region={{
          latitude: currentLoc.latitude,
          longitude: currentLoc.longitude,
          latitudeDelta: 0.0222,
          longitudeDelta: 0.0121,
        }}>
        {order && (
          <MapViewDirections
            origin={currentLoc} // write origin to test if the user has been picked up or not functionality
            onReady={onDirectionFound}
            destination={getDestination()}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={5}
            strokeColor="black"
          />
        )}
      </MapView>

      <Pressable
        onPress={() => console.warn('Balance')}
        style={styles.balanceButton}>
        <Text style={styles.balanceText}>
          <Text style={{color: 'green'}}>$</Text>
          {''}
          0.00
        </Text>
      </Pressable>

      <Pressable
        onPress={() => console.warn('Hello')}
        style={[styles.roundButton, {top: 10, left: 10}]}>
        <Entypo name={'menu'} size={24} color="#4a4a4a" />
      </Pressable>

      <Pressable
        onPress={() => console.warn('Hello')}
        style={[styles.roundButton, {top: 10, right: 10}]}>
        <Ionicons name={'search-sharp'} size={24} color="#4a4a4a" />
      </Pressable>

      <Pressable
        onPress={() => console.warn('Hello')}
        style={[styles.roundButton, {bottom: 110, left: 10}]}>
        <Entypo name={'menu'} size={24} color="#4a4a4a" />
      </Pressable>

      <Pressable
        onPress={() => console.warn('Hello')}
        style={[styles.roundButton, {bottom: 110, right: 10}]}>
        <Entypo name={'menu'} size={24} color="#4a4a4a" />
      </Pressable>

      <Pressable onPress={onGoPress} style={styles.goButton}>
        <Text style={styles.goText}>{car.data().isActive ? 'END' : 'GO'}</Text>
      </Pressable>

      <View style={styles.bottomContainer}>
        <Ionicons name={'options'} size={30} color="#4a4a4a" />
        {renderBottomTitle()}

        <Entypo name={'menu'} size={30} color="#4a4a4a" />
      </View>

      {newOrder ? (
        <NewOrderPopup
          newOrder={newOrder}
          onDecline={onDecline}
          onAccept={() => onAccept(newOrder)}
          duration={4}
          distance={0.5}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    height: 100,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  bottomText: {
    fontSize: 22,
    color: '#4a4a4a',
    paddingBottom: 15,
  },
  roundButton: {
    position: 'absolute',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 25,
  },
  goButton: {
    position: 'absolute',
    backgroundColor: '#1495ff',
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',

    borderRadius: 50,
    bottom: 110,
    left: Dimensions.get('window').width / 2 - 37,
  },
  goText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  balanceText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  balanceButton: {
    position: 'absolute',
    backgroundColor: '#1c1c1c',
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    top: 10,
    left: Dimensions.get('window').width / 2 - 50,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 10,
    resizeMode: 'cover',
  },
});

export default HomeScreen;
