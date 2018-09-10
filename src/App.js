import React, { Component } from 'react';
import './App.css';
import {auth, db} from "./firebase.js";
const settings = {timestampsInSnapshots: true};
db.settings(settings);

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
var today = new Date();
const docRef = db.collection("prompt-entry").doc(monthNames[today.getMonth()]+ " " + today.getDate());

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
    }
    this.updateEntry = this.updateEntry.bind(this);
  }

  componentDidMount() {
    this.setState({ month: monthNames[today.getMonth()]});
    this.setState({ date: today.getDate()});
    this.setState({ year: today.getFullYear()});

    docRef.get().then((doc) => {
      if (doc.exists) {
        var data = doc.data()
        console.log(data);
        this.setState({ prompt: data['prompt']});
        this.setState({ entries: data['entry']});
        this.setState({ currentEntry: data['entry'][0]});
        this.setState({ previousEntries: data['entry'].splice(1,data['entry'].length-1)});
      } else {
        console.log("no document found in firestore");
      }
    }).catch(function(error) {
      console.log("error getting doc:" + error);
    });

    // At least 5 previous entries
    for (var i = 0; i< 5; i++) {
      if(!this.state.previousEntries[i]) {
        this.state.previousEntries.push("You haven't logged up to here yet");
      }
    }
    console.log(this.state.previousEntries);
  }


/*
* Function Name: updateEntry()
* Function Description: Activated when Entry Save button clicked, saves data to firestore according to year
* Parameters: None
* Returns: None.
*/
  updateEntry() {
    var updatedEntries = this.state.entries;
    updatedEntries[0] = document.getElementById("entry").value;

    docRef.set({
      prompt: this.state.prompt,
      entry: updatedEntries,
    }).then(function() {
      console.log("entry updated!");
    }).catch(function(error) {
      console.error("Error writing doc to firebase:", error);
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
            <textarea className= "form-control entry-textarea" placeholder="Enter today's entry" value={this.state.entries[0]} id="entry" rows="3"></textarea>
          </div>
          <button onClick={this.updateEntry} type="button" className="btn btn-primary">Save</button>
        </form>


        <div className="accordion" id="accordion">
        
            {this.state.previousEntries.map(function(item, i){
              return 
              <div className="card" key={i}>
                <div className="card-header" id={"heading" + i}>
                  <h5 className="mb-0">
                    <button className="btn btn-link" type="button" data-toggle="collapse" data-target={"#collapse" + i} aria-expanded="true" aria-controls={"collapse" + i}>
                      {this.state.year - i}
                    </button>
                  </h5>
                </div>

                <div id={"collapse" + i} className="collapse show" aria-labelledby={"heading" + i} data-parent="#accordion">
                  <div className="card-body">
                    item
                  </div>
                </div>
              </div>
            })}
        </div>
      </div>
    );
  }
}

export default App;
