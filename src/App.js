import React, { Component } from 'react';
import './App.css';
import {auth, db} from "./firebase.js";
const settings = {timestampsInSnapshots: true};
db.settings(settings);

// month names for javascript conversion to string
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// get today's date globally
var today = new Date();

// const for firestore access to appropriate document
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
    this.entryHasChanged = this.entryHasChanged.bind(this);
  }

  /*
  * Function Name: componentDidMount()
  * Function Description: called after component mounts, get today's state
  * Paramters: None.
  * Return: None.
  */
  componentDidMount() {
    // update today's state
    this.setState({ month: monthNames[today.getMonth()]});
    this.setState({ date: today.getDate()});
    this.setState({ year: today.getFullYear()});

    // disable the save button upon load
    document.getElementById("entrySaveButton").disabled = true;

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
    var updatedEntries = this.state.entries;
    updatedEntries[0] = document.getElementById("entry").value;

    // update the data for that date on firestore
    docRef.set({
      prompt: this.state.prompt,
      entry: updatedEntries,
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

  render() {
    return (
      <div className="App">
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

        <div id="entrySaveAlert" class="alert alert-success" role="alert">
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
    );
  }
}

export default App;
