import React from "react";
import { Switch, Route, BrowserRouter as Router } from "react-router-dom";
import SignIn from "./Components/SingIn";
import SignUp from "./Components/SignUp";
import Dashboard from "./Components/Dashboard";
import IndexPage from "./Components/IndexPage";
import UserPage from "./Components/UserPage";
import PlanterPage from "./Components/PlanterPage";
export default function Routes() {
  return (
    <Router>
      <Switch>
        <Route path="/login" exact component={IndexPage} />
        <Route path="/" exact component={SignIn} />
        <Route path="/register" component={SignUp} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/users/:id" component={UserPage} />
        <Route path="/planters/:id/:type" component={PlanterPage} />
        <Route component={SignIn} />
      </Switch>
    </Router>
  );
}
