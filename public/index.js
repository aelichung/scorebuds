// Authentication initialization

var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      console.log(authResult);
      firebaseAuthStateChanged(authResult.user);
      return false;
    }
  },
  signInSuccessUrl: '/',
  signInFlow: "popup",
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    {
      provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      scopes: [
        'public_profile',
        'email'
      ]
    }
  ],
  // Terms of service url.
  tosUrl: '/#tos'
};

var firebaseUI = new firebaseui.auth.AuthUI(firebase.auth());

function firebaseAuthStateChanged(user) {
  console.log("firebaseAuthStateChanged");
  if (user) {
    $("#user-welcome-message").text("Hello, " + user.displayName + "!");
    $("#user-welcome").show();
  } else {
    // Initialize the FirebaseUI Widget using Firebase.
    // The start method will wait until the DOM is loaded.
    $("#user-welcome").hide();
    firebaseUI.start('#firebaseui-auth-container', uiConfig);
  }
}

$(function() {
  // Initialize Cloud Firestore through Firebase
  var db = firebase.firestore();

  firebase.auth().onAuthStateChanged(firebaseAuthStateChanged);

  $("#sign-out").click(function() {
    firebase.auth().signOut();
  });

  let artClubUserObjects = [
    {
      name: 'CARRIE',
      score: 0
    },
    {
      name: 'ERIC',
      score: 0
    },
    {
      name: 'MICHELLE',
      score: 0
    },
    {
      name: 'NAT',
      score: 0
    },
    {
      name: 'ANNE-ELISE',
      score: 0
    }
  ];

  function scoreSetUp(userObjects) {
    for (let i = 0; i < userObjects.length; i++) {
      db
        .collection('scores')
        .doc(userObjects[i].name)
        .set(userObjects[i])
        .then(function(docRef) {
          console.log('Document written with ID: ', docRef.id);
        })
        .catch(function(error) {
          console.error('Error adding document: ', error);
        });
    }
  }

  // TAKES AN OBJECT WHICH HAS NAME AND SCORE AND ADDS IT TO DATABASE

  function saveScore(scoreObj) {
    db
      .collection('scores')
      .doc(scoreObj.name)
      .set(scoreObj)
      .then(function() {
        console.log('Document successfully written!');
      })
      .catch(function(error) {
        console.error('Error adding document: ', error);
      });
  }

  // LOAD FUNCTION WILL BE CALLED AS PAGE IS LOADED. LOAD FUNCTION LOADS OBJECT 'DOCS' FROM DATABASE AND USES RENDER FUNCTION TO INSERT OBJECT PROPERTIES INTO PAGE

  // let userAnne = db.collection('scores').doc(userObjects[i].name);
  function load() {
    db
      .collection('scores')
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          console.log(`${doc.id} => ${doc.data()}`);
        });
        let usersFromDataBaseArr = [];
        querySnapshot.forEach(function(doc) {
          usersFromDataBaseArr.push(doc.data());
        });
        console.log(usersFromDataBaseArr);
        render(usersFromDataBaseArr);
      });
  }

  // RENDER FUNCTION CREATES HTML TEMPLATE FOR A SCOREBLOCK AND TAKES OBJECT INFO TO MAKE EACH BLOCK. HTML TEMPLATE INCLUDES ON CLICK FUNCTIONALITY FOR BUTTON.
  // ON CLICK FUNCTIONALITY INCLUDES ADDING STAR TO STARS CONTAINER IN HTML AND IN THE JS OBJECT. CLICKING ALSO CALLS THE SAVESCORE FUNCTION WHICH WILL WRITE
  function render(userScores) {
    let scoresBlocks = userScores.map(function(scoreObj) {
      const scoreBlock = $('<div/>', {class: 'score-container'});
      const nameContainer = $('<div/>', {class: 'name-container'});
      nameContainer.appendTo(scoreBlock);
      const name = $('<h2></h2>', {class: 'name'});
      name.appendTo(nameContainer);
      name.text(scoreObj.name);
      const starsContainer = $('<div/>', {class: 'stars-container'});
      starsContainer.appendTo(scoreBlock);
      for (let i = 0; i < scoreObj.score; i++) {
        const star = $('<img/>', {
          class: 'star',
          alt: 'star',
          src: 'assets/star.png'
        });
        star.appendTo(starsContainer);
      }
      const buttonContainer = $('<div/>', {class: 'button-container'});
      buttonContainer.appendTo(scoreBlock);
      const button = $('<button></button>', {class: 'button'});
      button.text('YES!');
      button.appendTo(buttonContainer);

      button.click(function() {
        const star = $('<img/>', {
          class: 'star',
          alt: 'star',
          src: 'assets/star.png'
        });

        star.appendTo(starsContainer);
        scoreObj.score += 1;
        saveScore(scoreObj);
      });

      const undoButton = $('<button></button>', {class: 'undo-button'});
      undoButton.appendTo(buttonContainer);
      const undoIcon = $('<i></i>', {class: 'fas fa-undo-alt fa-lg undo-icon'});
      undoIcon.appendTo(undoButton);
      undoButton.click(function() {
        starsContainer.find('.star')
          .first()
          .remove();
        scoreObj.score -= 1;
        saveScore(scoreObj);
      });

      return scoreBlock;
    });
    console.log(scoresBlocks);
    $('.user-scores').append(scoresBlocks);
  }
  // scoreSetUp(artClubUserObjects);
  load();
});
