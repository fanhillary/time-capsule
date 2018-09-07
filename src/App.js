import React, { Component } from 'react';
import './App.css';

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
    }
    
  }

  componentDidMount() {
    var today = new Date();
    this.setState({ month: monthNames[today.getMonth()]});
    this.setState({ date: today.getDate()});
    this.setState({ year: today.getFullYear()});
  }

  render() {
    return (
      <div className="App">
        <div className="today-date"> 
          <h2 className = "display-date" >{this.state.month} {this.state.date} {this.state.year} </h2>
          <h2> {this.state.prompt} </h2>
        </div>
        <form>
        <div class="form-group">
          <textarea className= "form-control entry-textarea" id="exampleFormControlTextarea1" rows="3"></textarea>
        </div>
          <button type="button" className="btn btn-primary">Save</button>
        </form>
      </div>
    );
  }
}

export default App;
