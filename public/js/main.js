(() => {
  'use strict';
  const firebaseConfig = {
    apiKey: "AIzaSyCVB41ynmHhYWTtQib2uVrxMjocUnIRawA",
    authDomain: "chat-app-proto-38861.firebaseapp.com",
    databaseURL: "https://chat-app-proto-38861.firebaseio.com",
    projectId: "chat-app-proto-38861",
    storageBucket: "chat-app-proto-38861.appspot.com",
    messagingSenderId: "403906593801",
    appId: "1:403906593801:web:747b047e5d929161a624d8",
    measurementId: "G-GX1GYS56G6"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

  const db = firebase.firestore();
  const collection = db.collection('messages');

  const auth = firebase.auth();
  let me = null;

  const message = document.getElementById('message');
  const form = document.querySelector('form');
  const messages = document.getElementById('messages');
  const login = document.getElementById('login');
  const logout = document.getElementById('logout');


  login.addEventListener('click', () => {
    auth.signInAnonymously();
  });

  logout.addEventListener('click', () => {
    auth.signOut();
  });

  auth.onAuthStateChanged(user => {
    if (user) {
      me = user;

      while (messages.firstChild) {
        messages.removeChild(messages.firstChild);
      }

      collection.orderBy('created').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const li = document.createElement('li');
            const d = change.doc.data();
            li.textContent = d.uid.substr(0, 8) + ': ' + d.message;
            messages.appendChild(li);
          }
        });
      }, error => {});
      console.log(`Logged in as: ${user.uid}`);
      login.classList.add('hidden');
      [logout, form, messages].forEach(el => {
        el.classList.remove('hidden');
      });
      message.focus();
      return;
    }
    me = null;
    console.log('Nobody is logged in');
    login.classList.remove('hidden');
    //form.classList.remove('hidden');
    [logout, form, messages].forEach(el => {
      el.classList.add('hidden');
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const val = message.value.trim();
    if(val === "") {
      return;
    }
    
    message.value = '';
    message.focus();
    
    collection.add({
      message: val,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      uid: me ? me.uid : 'nobody'
    })
    .then(doc => {
      console.log(`${doc.id} added!`);
    })
    .catch(error => {
      console.log('document add error!');
      console.log(error);
    });
  });
})();