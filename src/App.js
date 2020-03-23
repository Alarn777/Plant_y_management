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

import AmplifyRouter from "amplify-react-router";
import { Router, navigate } from "@reach/router";
import { Route, Switch } from "react-router-dom";
import IndexPage from "./Components/IndexPage";
import SignIn from "./Components/SingIn";
import SignUp from "./Components/SignUp";
import Dashboard from "./Components/Dashboard";
import UserPage from "./Components/UserPage";
import PlanterPage from "./Components/PlanterPage";

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <Routes />;
  }

  // render() {
  //   return (
  //     <AmplifyRouter
  //       amplifyConfig={JSON.parse(process.env.REACT_APP_CONFIG_AWS)}
  //       homeRoute="/"
  //       navigate={navigate}
  //       // componentOverrides={[MySignIn]}
  //     >
  //       s
  //       <Router>
  //         <Switch>
  //           <Route path="/" exact component={IndexPage} />
  //           <Route path="/login" exact component={SignIn} />
  //           <Route path="/register" component={SignUp} />
  //           <Route path="/dashboard" component={Dashboard} />
  //           <Route path="/users/:id" component={UserPage} />
  //           <Route path="/planters/:id/:type" component={PlanterPage} />
  //
  //           {/*<Route path="/dashboard" component={Dashboard} isPrivate />*/}
  //           {/* redirect user to SignIn page if route does not exist and user is not authenticated */}
  //           <Route component={SignIn} />
  //         </Switch>
  //       </Router>
  //     </AmplifyRouter>
  //   );
  // }
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
