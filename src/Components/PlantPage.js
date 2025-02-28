import React from "react";
import StickyFooter from "react-sticky-footer";

//redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addSocket, addUser, loadPlanters } from "../actions";
import AppBar from "@material-ui/core/AppBar";
import MenuIcon from "@material-ui/icons/Menu";
import { Toolbar, Typography, IconButton } from "@material-ui/core";
import { Redirect } from "react-router-dom";
import { Auth } from "aws-amplify";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { BrowserView } from "react-device-detect";

class PlantPage extends React.Component {
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
        this.setState({ user: user });
        this.props.addUser(user);
        this.loadAllData();
      })
      .catch(err => {
        console.log(err);
      });

    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  async loadAllData() {
    let USER_TOKEN = "";
    USER_TOKEN = this.state.user.signInUserSession.idToken.jwtToken;
    this.state.USER_TOKEN = USER_TOKEN;
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
    if (this.state.toLogin === true) {
      return <Redirect to="/login" />;
    }
    return (
      <div>
        <div
          style={{
            height: this.state.height - 40,
            root: {
              flexGrow: 1
            }
          }}
        >
          <AppBar position="static">
            <Toolbar>
              <IconButton
                edge="start"
                style={{ marginRight: 10 }}
                color="inherit"
                aria-label="menu"
              >
                {this.state.user ? <MenuIcon /> : <ArrowBackIosIcon />}
              </IconButton>
              <Typography variant="h6" style={{ flexGrow: 1 }}>
                Plant'y
              </Typography>
              {this.state.user && (
                <div>
                  <Typography variant="h6" style={{ flexGrow: 1 }}>
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
        <BrowserView>
          <StickyFooter
            bottomThreshold={20}
            normalStyles={{
              height: 20,
              backgroundColor: "#999999",
              padding: "10px"
            }}
            stickyStyles={{
              backgroundColor: "rgba(255,255,255,.8)",
              padding: "2rem"
            }}
          >
            © 2019 - 2020, Plant'y Inc. or its affiliates. All rights reserved.
          </StickyFooter>
        </BrowserView>
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
