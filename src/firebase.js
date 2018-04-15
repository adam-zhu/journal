import firebase from 'firebase';
const config = {
  apiKey: 'AIzaSyAWZBrOgJf0jvzG5DaWZvLWrdnrixDGnW8',
  authDomain: 'goalsetter-project.firebaseapp.com',
  databaseURL: 'https://goalsetter-project.firebaseio.com',
  projectId: 'goalsetter-project',
  storageBucket: 'goalsetter-project.appspot.com',
  messagingSenderId: '356858607703'
};

firebase.initializeApp(config);

export default firebase;
export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();
