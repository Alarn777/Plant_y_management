import React from "react";
import { Switch, Route, BrowserRouter as Router } from "react-router-dom";
import SignIn from "./Components/SingIn";
import SignUp from "./Components/SignUp";
import Dashboard from "./Components/Dashboard";
import IndexPage from "./Components/IndexPage";
export default function Routes() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={IndexPage} />
        <Route path="/login" exact component={SignIn} />
        <Route path="/register" component={SignUp} />
        <Route path="/dashboard" component={Dashboard} />
        {/*<Route path="/dashboard" component={Dashboard} isPrivate />*/}
        {/* redirect user to SignIn page if route does not exist and user is not authenticated */}
        <Route component={SignIn} />
      </Switch>
    </Router>
  );
}
