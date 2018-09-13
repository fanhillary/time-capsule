import React, { Component } from 'react';
import './App.css';
import {auth, db} from "./firebase.js";
import {dates, prompts} from "./prompts.js";


const settings = {timestampsInSnapshots: true};
db.settings(settings);

// month names for javascript conversion to string
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const daysInYear = 366;
// get today's date globally
var today = new Date();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      month: "",
      date: 0,
      year: 0,
      prompt: "",
      previousEntries: [],
      currentEntry: "",
      entries: [],
      user: null,
      email: "",
      password: "",
      confirm_password: "",
      login_email: "",
      login_password: "",
      warning: "",
    }
    this.updateEntry = this.updateEntry.bind(this);
    this.entryHasChanged = this.entryHasChanged.bind(this);
    this.registerUser = this.registerUser.bind(this);
    this.logOut = this.logOut.bind(this);
    this.getData = this.getData.bind(this);
  }

  /*
  * Function Name: componentWillMount()
  * Function Description: Set up firebase listener to check if user logs in at anytime.
  *                       If so, set state user appropriately.
  * Parameters: none.
  * Return: none.
  */
  componentWillMount() {
    // check for user logged in or not
    this.fireBaseListener = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("logged in - app.js");
        this.setState({ user: user });
        this.getData();

      } else {
        this.setState({ user: null });
        console.log("not logged in -app.js");
      }
    });
  }

  /*
  * Function Name: componentWillUnmount()
  * Function Description: firebaseListener must be safely unmounted.
  * Parameters: none.
  * Return: none.
  */
  componentWillUnmount() {
    this.fireBaseListener();
  }

  /*
  * Function Name: componentDidMount()
  * Function Description: called after component mounts, get today's state
  * Paramters: None.
  * Return: None.
  */
  componentDidMount() {
    console.log(prompts.length);
    // update today's state
    this.setState({ month: monthNames[today.getMonth()]});
    this.setState({ date: today.getDate()});
    this.setState({ year: today.getFullYear()});

    // disable the save button upon load
    if (document.getElementById("entrySaveButton")) {
      document.getElementById("entrySaveButton").disabled = true;
    }
  }

  getData() {
    // const for firestore access to appropriate document
    var user = auth.currentUser;

    var docRef = db.collection(user.uid).doc(monthNames[today.getMonth()]+ " " + today.getDate());

    // get today's prompt and previous entries
    docRef.get().then((doc) => {
      if (doc.exists) {
        var data = doc.data()
        console.log(data);
        this.setState({ prompt: data['prompt']});
        this.setState({ entries: data['entry']});
        this.setState({ currentEntry: data['entry'][0]});

        // convert to at least 5 previous entries
        var prevEntries5Years = data['entry'].splice(1,data['entry'].length-1);
        for (var i = 0; i< 5; i++) {
          if(!prevEntries5Years[i]) {
            prevEntries5Years.push("You haven't logged up to here yet");
          }
        }
        this.setState({ previousEntries: prevEntries5Years});
        console.log(this.state.previousEntries);
      } else {
        console.log("no document found in firestore");
      }
    }).catch(function(error) {
      console.log("error getting doc:" + error);
    });
  }

/*
* Function Name: updateEntry()
* Function Description: Activated when Entry Save button clicked, saves data to firestore according to year
* Parameters: None
* Returns: None.
*/
  updateEntry() {

    var newEntry = this.state.entries;
    newEntry[0] = document.getElementById("entry").value;
    var user = auth.currentUser;

    var docRef = db.collection(user.uid).doc(monthNames[today.getMonth()]+ " " + today.getDate());

    // update the data for that date on firestore
    docRef.set({
      prompt: this.state.prompt,
      entry: newEntry,
    }).then(function() {
      console.log("entry updated!");
    }).catch(function(error) {
      console.error("Error writing doc to firebase:", error);
    });

    // success alert fades in upon save
    document.getElementById("entrySaveAlert").style.opacity = "1";
    
    // alert fade out after 2 seconds
    setTimeout(function(){ document.getElementById("entrySaveAlert").style.opacity = "0";
  }, 2000);

    // save button disables
    document.getElementById("entrySaveButton").disabled = true;
  }

  /*
  * Function Name: entryHasChanged(e)
  * Function Description: Called whenever user types in entry textarea to update state 
  * and enable save button
  * Parameters: e - onChange event
  * Returns: None.
  */
  entryHasChanged(e) {
    // update current entry state
    this.setState({ currentEntry: e.value});

    // save button enables
    document.getElementById("entrySaveButton").disabled = false;
  }

  /*
  * Function Name: registerUser(e)
  * Function Description: Upon register button click, create user if password is confirmed.
  *                       Generate new firestore collection for user based on prompts.
  * Parameters: e - onSubmit event for preventing default.
  * Return: none.
  */
  registerUser(e) {
    e.preventDefault();
    // password must be confirmed
    if (this.state.password !== this.state.confirm_password) {
      this.setState({ warning: "Your password is not matching" });
      
    } else {
      // create firebase user with email and password
      auth.createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {

        // create default 365 documents for each user with 365 predefined questions
          var user = auth.currentUser;

          for (var i = 0; i < daysInYear; i++) { 
            db.collection(user.uid).doc(dates[i]).set({
              prompt: prompts[i],
              entry: [""],
          })
          .catch(function(error) {
              console.error("Error writing document: ", error);
          });
          };

          this.getData();
      }
      ).catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log(errorCode);
          console.log(errorMessage);
      });
    }
  }

  /*
  * Function Name: logOut()
  * Function Description: Upon log out button click, function is called to sign user out of firebase
  * Parameters: none.
  * Return: none.
  */
  logOut() {
    // sign out the user
    auth.signOut().then(function() {
      this.setState({user: null});
    }).catch(function(error) {
      console.log(error)
    });
  }

  render() {
    return (
      <div className="App">
      {this.state.user? 
        <div>
          <button type="button" className="btn btn-dark calendar">Calendar</button>
          <button type="button" onClick={this.logOut} className="btn btn-dark logOut">Log Out</button>

          <div className="today-date"> 
            <h3 className = "display-date" >{this.state.month} {this.state.date}, {this.state.year} </h3>
            <h2 className = "display-prompt"> {this.state.prompt} </h2>
          </div>
          <form>
            <div className="form-group">
              <textarea className= "form-control entry-textarea" placeholder="Enter today's entry" value={this.state.currentEntry} onChange={e => this.entryHasChanged(e)} id="entry" rows="3"></textarea>
            </div>
            <button id="entrySaveButton" onClick={this.updateEntry} type="button" className="btn btn-primary">Save</button>
          </form>

          <div id="entrySaveAlert" className="alert alert-success" role="alert">
            Entry successfully saved!        
          </div>


          <div className="accordion" id="accordion">
          
              {this.state.previousEntries.map((item,i) => {
                return <div className="card" key={i}>
                  <div className="card-header" id={"heading" + i}>
                    <h5 className="mb-0">
                      <button className="btn btn-link" type="button" data-toggle="collapse" data-target={"#collapse" + i} aria-expanded="true" aria-controls={"collapse" + i}>
                        {this.state.year - (i+1)}
                      </button>
                    </h5>
                  </div>

                  <div id={"collapse" + i} className="collapse show" aria-labelledby={"heading" + i} data-parent="#accordion">
                    <div className="card-body">
                      {item}
                    </div>
                  </div>
                </div>
              })}
            </div>
        </div>
        :
        <div className = "registerContainer"> 
          {this.state.warning==""? null :
            <div class="alert alert-warning" role="alert">
            {this.state.warning}     
          </div> 
          }
          <div className="card registerComponent">
            <div className="card-body">
                <div className="card-contents">
                    <form onSubmit={this.loginUser}>
                        <h5 className="card-title">Login Here!</h5> 
                        <input type="email" className="form-control register-input" placeholder="Email Address" aria-label="Email Address" value={this.state.login_email} onChange = {(event) => this.setState({login_email: event.target.value})} aria-describedby="basic-addon1"></input>
                        <input type="password" className="form-control register-input" placeholder="Password" aria-label="Password" value={this.state.login_password} onChange = {(event) => this.setState({login_password: event.target.value})} aria-describedby="basic-addon1"></input>
                        <button type="submit" className="btn btn-primary">Login</button>
                    </form>
                </div>
            </div>
          </div>
          <div className="card registerComponent">
            <div className="card-body">
                <div className="card-contents">
                    <form onSubmit={e => this.registerUser(e)}>
                        <h5 className="card-title">Register Here!</h5>
                        <input type="email" className="form-control register-input" placeholder="Email Address" aria-label="Email Address" value={this.state.email} onChange = {(event) => this.setState({email: event.target.value})} aria-describedby="basic-addon1"></input>
                        <input type="password" className="form-control register-input" placeholder="Password" aria-label="Password" value={this.state.password} onChange = {(event) => this.setState({password: event.target.value})} aria-describedby="basic-addon1"></input>
                        <input type="password" className="form-control register-input" placeholder="Password" aria-label="Password" value={this.state.confirm_password} onChange = {(event) => this.setState({confirm_password: event.target.value})} aria-describedby="basic-addon1"></input>
                        <button type="submit" className="btn btn-primary">Register</button>
                    </form>
                </div>
            </div>
          </div>
        </div>
      }
    </div>
    );
  }
}

export default App;
