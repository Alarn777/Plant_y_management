import React from "react";
import logo from "./logo.svg";
import ReactDOM from "react-dom";
// import { Provider } from 'react-redux';
// import { store } from './reducer';
// import { Container } from './container';

import "./App.css";
//redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addSocket, addUser, loadPlanters } from "./actions";
import Button from "@material-ui/core/Button";
import Routes from "./Routes";

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props);
    return <Routes />;
  }
}

const mapStateToProps = state => {
  const { plantyData } = state;

  return { plantyData };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      addUser,
      loadPlanters,
      addSocket
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(App);
