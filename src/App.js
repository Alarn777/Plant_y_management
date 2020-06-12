import React from "react";
import "./App.css";
//redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addSocket, addUser, loadPlanters } from "./actions";
import { Route, Switch } from "react-router-dom";
import { BrowserRouter as Router } from "react-router-dom";
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
    return (
      <Router>
        <Switch>
          <Route path="/" exact component={IndexPage} />
          <Route path="/login" exact component={SignIn} />
          <Route path="/register" component={SignUp} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/users/:id" component={UserPage} />
          <Route
            exact
            path="/planters/:id/:type"
            render={props => <PlanterPage {...props} />}
          />
          <Route component={SignIn} />
        </Switch>
      </Router>
    );
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
