(() => {
  'use strict';
  // 初期化設定（Firebaseコンソールからコピペする）
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
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

  // firestoreのインスタンスを取得
  const db = firebase.firestore();
  // messagesコレクションのインスタンスを取得
  const collection = db.collection('messages');

  // 認証用オブジェクトのインスタンス
  const auth = firebase.auth();
  // ユーザID格納用変数
  let me = null;

  // 各html要素の取得
  const message = document.getElementById('message');
  const form = document.querySelector('form');
  const messages = document.getElementById('messages');
  const login = document.getElementById('login');
  const logout = document.getElementById('logout');

  // ログイン・ログアウト処理
  login.addEventListener('click', () => {
    auth.signInAnonymously();
  });
  logout.addEventListener('click', () => {
    auth.signOut();
  });

  // ログイン状態の監視
  auth.onAuthStateChanged(user => {
    // ログインしていればuserに何らかの値が入る
    if (user) {
      me = user;
      
      // messages下のli要素をクリア
      while (messages.firstChild) {
        messages.removeChild(messages.firstChild);
      }
      // 投稿の表示（投稿日時順）
      // onSnapshotを使うとcollectionの変更を監視できる
      collection.orderBy('created').onSnapshot(snapshot => {
        // 取得した投稿データを順番に表示
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            // 投稿をli要素としてmessagesに追加
            const li = document.createElement('li');
            const d = change.doc.data();
            li.textContent = d.uid.substr(0, 8) + ': ' + d.message;
            messages.appendChild(li);
          }
        });
      }, error => {});
      console.log(`Logged in as: ${user.uid}`);
      // ログインボタンを非表示にする
      login.classList.add('hidden');
      // ログアウトボタン、投稿フォーム、投稿一覧を表示する
      [logout, form, messages].forEach(el => {
        el.classList.remove('hidden');
      });
      message.focus();
      return;
    }
    // ログアウト状態時の処理
    me = null;
    console.log('Nobody is logged in');
    // ログインボタンを表示する
    login.classList.remove('hidden');
    // ログアウトボタン、投稿フォーム、投稿一覧を非表示にする
    [logout, form, messages].forEach(el => {
      el.classList.add('hidden');
    });
  });

  // 投稿時処理
  form.addEventListener('submit', e => {
    e.preventDefault();

    const val = message.value.trim();
    // 投稿フォームが空の場合は何もしない
    if(val === "") {
      return;
    }
    // 投稿フォームをクリアしてフォーカスをあてる
    message.value = '';
    message.focus();
    
    // データの保存（addメソッドでコレクションにデータが追加されユニークなIDが振られる）
    collection.add({
      // key: value
      message: val,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      uid: me ? me.uid : 'nobody'
    })
    .then(doc => {
      // 成功時（ログにidを表示）
      console.log(`${doc.id} added!`);
    })
    .catch(error => {
      // エラー時（エラーの内容をログに表示）
      console.log('document add error!');
      console.log(error);
    });
  });
})();