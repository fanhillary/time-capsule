import React, { Component } from 'react';
import './App.css';
import {auth, db} from "./firebase.js";
const settings = {timestampsInSnapshots: true};
db.settings(settings);

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      month: "",
      date: 0,
      year: 0,
      prompt: "",
      previousEntries: [],
    }
    
  }

  componentDidMount() {
    var today = new Date();
    this.setState({ month: monthNames[today.getMonth()]});
    this.setState({ date: today.getDate()});
    this.setState({ year: today.getFullYear()});

    var docRef = db.collection("prompt-entry").doc(monthNames[today.getMonth()]+ " " + today.getDate());
    docRef.get().then((doc) => {
      if (doc.exists) {
        var data = doc.data()
        console.log(data);
        this.setState({ prompt: data['prompt']});
        this.setState({ previousEntries: data['entry']});
      } else {
        console.log("no document found in firestore");
      }
    }).catch(function(error) {
      console.log("error getting doc:" + error);
    });
  }

  render() {
    return (
      <div className="App">
        <div className="today-date"> 
          <h3 className = "display-date" >{this.state.month} {this.state.date}, {this.state.year} </h3>
          <h2> {this.state.prompt} </h2>
        </div>
        <form>
        <div className="form-group">
          <textarea className= "form-control entry-textarea" id="exampleFormControlTextarea1" rows="3"></textarea>
        </div>
          <button type="button" className="btn btn-primary">Save</button>
        </form>
      </div>
    );
  }
}

export default App;
