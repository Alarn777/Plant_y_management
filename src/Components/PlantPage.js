import React from "react";
import StickyFooter from "react-sticky-footer";
import ReactDOM from "react-dom";

//redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addSocket, addUser, loadPlanters } from "../actions";
// import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
// import Toolbar from "@material-ui/core/Toolbar";
// import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/styles";
import Consts from "../ENV_VARS";
// import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import {
  Card,
  Paper,
  Toolbar,
  Typography,
  Button,
  IconButton
} from "@material-ui/core";
import { Redirect } from "react-router-dom";
import Amplify, { Auth } from "aws-amplify";
import awsconfig from "../aws-exports";
import { instanceOf } from "prop-types";
import { Cookies } from "react-cookie";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import axios from "axios";

class PlantPage extends React.Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      classes: null,
      width: 0,
      height: 0,
      toLogin: false,
      toRegister: false,
      user: null,
      systemUsers: []
    };
    Amplify.configure(awsconfig);
  }

  updateDimensions = () => {
    let w = window,
      d = document,
      documentElement = d.documentElement,
      body = d.getElementsByTagName("body")[0],
      width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
      height =
        w.innerHeight || documentElement.clientHeight || body.clientHeight;

    this.setState({ width: width, height: height });
  };
  componentWillMount() {
    this.updateDimensions();
  }

  componentDidMount() {
    Auth.currentAuthenticatedUser()
      .then(user => {
        // return Auth.changePassword(user, "oldPassword", "newPassword");
        console.log(user);
        this.setState({ user: user });
        this.props.addUser(user);
        this.loadAllData();
      })
      // .then(data => console.log(data))
      .catch(err => console.log(err));

    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  async loadAllData() {
    let USER_TOKEN = "";
    console.log(this.state.user);
    USER_TOKEN = this.state.user.signInUserSession.idToken.jwtToken;
    this.state.USER_TOKEN = USER_TOKEN;

    const AuthStr = "Bearer ".concat(this.state.USER_TOKEN);
    await axios
      .post(
        Consts.apigatewayRoute + "/getAllUsers",
        {},
        {
          headers: { Authorization: AuthStr }
        }
      )
      .then(response => {
        // console.log(response.data);
        this.dealWithUserData(response.data);
      })
      .catch(error => {
        console.log("error " + error);
      });
  }

  dealWithUserData(sentData) {
    let users = [];

    sentData.TableNames.map(one => {
      if (one.endsWith("_Planters")) {
        users.push(one.replace("_Planters", ""));
      }
    });

    this.setState({ systemUsers: users });
  }

  render() {
    console.log(this.state);
    // if (!this.state.user) return <Redirect to="/login" />;

    if (this.state.toLogin === true) {
      return <Redirect to="/login" />;
    }
    // if (this.state.toRegister === true) {
    //   return <Redirect to="/register" />;
    // }
    return (
      <div>
        <div
          style={{
            height: this.state.height - 74,
            root: {
              flexGrow: 1
            }
          }}
        >
          <AppBar position="static">
            <Toolbar>
              <IconButton
                edge="start"
                // className={styles.menuButton}
                style={{ marginRight: 10 }}
                color="inherit"
                aria-label="menu"
              >
                {this.state.user ? <MenuIcon /> : <ArrowBackIosIcon />}
              </IconButton>
              <Typography
                variant="h6"
                // className={styles.title}
                style={{ flexGrow: 1 }}
              >
                Plant'y
              </Typography>
              {this.state.user && (
                <div>
                  <Typography
                    variant="h6"
                    // className={styles.title}
                    style={{ flexGrow: 1 }}
                  >
                    Hello {this.state.user.username}
                  </Typography>
                </div>
              )}
            </Toolbar>
          </AppBar>
          {this.state.user ? (
            <div>
              <h1>Hello</h1>
            </div>
          ) : (
            <h1>Please log in first</h1>
          )}
        </div>
        <StickyFooter
          bottomThreshold={20}
          normalStyles={{
            height: 10,
            backgroundColor: "#999999",
            padding: "2rem"
          }}
          stickyStyles={{
            backgroundColor: "rgba(255,255,255,.8)",
            padding: "2rem"
          }}
        >
          © 2019 - 2020, Plant'y Inc. or its affiliates. All rights reserved.
        </StickyFooter>
      </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(PlantPage);
