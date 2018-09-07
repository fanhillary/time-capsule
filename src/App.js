import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      month: "",
      date: 0,
    }
    
  }
  render() {
    return (
      <div className="App">
        {this.state.month} {this.state.date}
      </div>
    );
  }
}

export default App;
