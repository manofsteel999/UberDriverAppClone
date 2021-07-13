import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, StyleSheet, Button} from 'react-native';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const AuthenticationScreen = () => {
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    const updateUserCar = async () => {
      const cuser = auth().currentUser;
      if (!cuser) {
        console.log('No Driver Logged in');
        return;
      }
      const uid = cuser.uid;
      console.log(uid);
      const carData = await firestore()
        .collection('car')
        .where('id', '==', uid)
        .get();
      //  console.log(carData);
      if (!carData.empty) {
        console.log('User already exists by this id');
        navigation.navigate('Home');
        return;
      }
      firestore()
        .collection('car')
        .add({
          heading: '',
          id: uid,
          latitude: '',
          longitude: '',
          type: 'UberX',
          isActive: '',
        })
        .then(() => {
          console.log('user Added');
          navigation.navigate('Home');
        });
    };
    updateUserCar();
  }, [user]);

  const [confirm, setConfirm] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const [code, setCode] = useState('');

  const [user, setUser] = useState();

  const navigation = useNavigation();

  function onAuthStateChanged(user) {
    setUser(user);
    // console.log(user);
    if (initializing) setInitializing(false);
  }

  async function signInWithPhoneNumber(phoneNumber) {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    setConfirm(confirmation);
  }

  async function confirmCode() {
    try {
      await confirm.confirm(code);
      //  navigation.navigate('Home');
    } catch (error) {
      console.log('Invalid code.');
    }
  }

  if (initializing) return null;

  return (
    <View style={styles.container}>
      <Text style={{fontSize: 25, fontWeight: 'bold', alignSelf: 'center'}}>
        Sign Up Here
      </Text>

      {/* Phone number sign in method */}

      <Button
        title="Phone Number Sign In"
        onPress={() => signInWithPhoneNumber('+91 9660277977')}
      />

      <TextInput value={code} onChangeText={text => setCode(text)} />
      <Button title="Confirm Code" onPress={() => confirmCode()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginTop: 30,
  },
  labelContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  label: {
    fontSize: 17,
  },
  input: {
    borderRadius: 5,
    fontSize: 16,
  },
});

export default AuthenticationScreen;
