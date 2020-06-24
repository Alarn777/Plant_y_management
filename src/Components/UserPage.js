import React from "react";
import StickyFooter from "react-sticky-footer";

//redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addSocket, addUser, loadPlanters } from "../actions";
import AppBar from "@material-ui/core/AppBar";
import {
  Card,
  Paper,
  Toolbar,
  Typography,
  Button,
  IconButton,
  CardActionArea,
  CardMedia,
  CardContent
} from "@material-ui/core";
import { Redirect } from "react-router-dom";
import Amplify, { Auth } from "aws-amplify";

import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import axios from "axios";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Link from "@material-ui/core/Link";
import LinearProgress from "@material-ui/core/LinearProgress";
import { BrowserView, isMobile } from "react-device-detect";
import CardActions from "@material-ui/core/CardActions";
import Avatar from "@material-ui/core/Avatar";
import { Logger } from "../Logger";
import CircularProgress from "@material-ui/core/CircularProgress";

class UserPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: null,
      width: 0,
      height: 0,
      toLogin: false,
      toRegister: false,
      user: null,
      planters: [],
      customerUsername: this.props.location.pathname.replace("/users/", ""),
      selectedPlanter: "",
      selectedPlanterUUID: "",
      ws: null
    };
    Amplify.configure(JSON.parse(process.env.REACT_APP_CONFIG_AWS));
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
        this.loadPlanters()
          .then()
          .catch();
      })
      .catch(err => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          err.toString(),
          "didmount - userpage"
        );
        console.log(err);
      });

    this.connect();

    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  connect = () => {
    let ws = new WebSocket(
      JSON.parse(process.env.REACT_APP_API_LINKS).apigatewayWebSocket
    );
    let that = this; // cache the this
    let connectInterval;

    // websocket onopen event listener
    ws.onopen = () => {
      console.log("connected websocket main component");

      this.setState({ ws: ws });

      that.timeout = 250; // reset timer to 250 on open of websocket connection
      clearTimeout(connectInterval); // clear Interval on on open of websocket connection
    };

    // websocket onclose event listener
    ws.onclose = e => {
      console.log(
        `Socket is closed. Reconnect will be attempted in ${Math.min(
          10000 / 1000,
          (that.timeout + that.timeout) / 1000
        )} second.`,
        e.reason
      );

      that.timeout = that.timeout + that.timeout; //increment retry interval
      connectInterval = setTimeout(this.check, Math.min(10000, that.timeout)); //call check function after timeout
    };

    // websocket onerror event listener
    ws.onerror = err => {
      console.error(
        "Socket encountered error: ",
        err.message,
        "Closing socket"
      );
    };
  };

  sendMessage = () => {
    const { ws } = this.state; // websocket instance passed as props to the child component.

    try {
      ws.send(
        JSON.stringify({
          message: "FROM_WEB;none;UPDATE_STATE",
          action: "message"
        })
      ); //send data to the server
    } catch (error) {
      console.log(error); // catch error
    }
  };

  async loadPlanters() {
    let USER_TOKEN = "";

    USER_TOKEN = this.state.user.signInUserSession.idToken.jwtToken;
    this.state.USER_TOKEN = USER_TOKEN;

    const AuthStr = "Bearer ".concat(this.state.USER_TOKEN);
    await axios
      .post(
        Amplify.configure(JSON.parse(process.env.REACT_APP_API_LINKS))
          .apigatewayRoute + "/getuserplanters",
        {
          username: this.state.customerUsername
        },
        {
          headers: { Authorization: AuthStr }
        }
      )
      .then(response => {
        this.dealWithPlantsData(response.data);
      })
      .catch(err => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          err.toString(),
          "loadPlanters"
        );
        console.log(err);
      });
  }

  dealWithPlantsData = plants => {
    if (plants.Items) {
      this.setState({ planters: plants.Items });
    } else this.setState({ planters: [] });
  };

  async sendAction(action, UUID) {
    let USER_TOKEN = this.state.user.signInUserSession.idToken.jwtToken;
    const AuthStr = "Bearer ".concat(USER_TOKEN);

    await axios
      .post(
        JSON.parse(process.env.REACT_APP_API_LINKS).apigatewayRoute +
          "/changeStatusOfPlanter",
        {
          username: this.state.customerUsername,
          planterStatus: action,
          planterUUID: UUID
        },
        {
          headers: { Authorization: AuthStr }
        }
      )
      .then(response => {
        this.loadPlanters()
          .then(() => this.sendMessage())
          .catch();
      })
      .catch(err => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          err.toString(),
          "sendAction"
        );
        console.log(err);
      });
  }

  async removePlanter(planterName) {
    let USER_TOKEN = this.state.user.signInUserSession.idToken.jwtToken;
    const AuthStr = "Bearer ".concat(USER_TOKEN);

    await axios
      .post(
        JSON.parse(process.env.REACT_APP_API_LINKS).apigatewayRoute +
          "/removePlanter",
        {
          username: this.state.customerUsername,
          planterName: planterName
        },
        {
          headers: { Authorization: AuthStr }
        }
      )
      .then(response => {
        this.loadPlanters()
          .then(() => this.sendMessage())
          .catch();
      })
      .catch(err => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          err.toString(),
          "removePlanter"
        );
        console.log(err);
      });
  }

  renderPlanters = planter => {
    //
    let maxWidth = 250;
    if (isMobile) {
      maxWidth = this.state.width - 30;
    }
    return (
      <Card
        key={planter.name}
        style={{
          float: "left",
          margin: 10,
          width: maxWidth,
          backgroundColor: "#e8f5e9"
        }}
      >
        <CardActionArea
          onClick={() => {
            this.setState({
              selectedPlanter: planter.name,
              selectedPlanterUUID: planter.UUID
            });
          }}
        >
          <CardMedia
            style={{
              height: 200,
              width: 200,
              margin: "0 auto"
            }}
            image={require("../Images/greenhouse.png")}
            title={planter.name}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              Planter {planter.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              Status: {planter.planterStatus}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button
            onClick={() => this.sendAction("active", planter.UUID)}
            size="small"
            color="primary"
          >
            Activate
          </Button>
          <Button
            onClick={() => this.sendAction("inactive", planter.UUID)}
            size="small"
            color="primary"
          >
            Deactivate
          </Button>
          <Button
            onClick={() => this.removePlanter(planter.name)}
            size="small"
            color="primary"
          >
            Delete
          </Button>
        </CardActions>
      </Card>
    );
  };

  render() {
    if (this.state.selectedPlanter !== "") {
      return (
        <Redirect
          to={`/planters/${this.state.customerUsername}/${this.state.selectedPlanter}=${this.state.selectedPlanterUUID}`}
        />
      );
    }

    if (this.state.planters === []) {
      return <LinearProgress style={{ width: "100%" }} />;
    }
    if (this.state.toLogin === true) {
      return <Redirect to="/login" />;
    }
    let username = this.state.customerUsername;
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
                onClick={() => {
                  if (!this.state.user) this.setState({ toLogin: true });
                }}
                style={{ marginRight: 10 }}
                color="inherit"
                aria-label="menu"
              >
                {this.state.user ? (
                  <Avatar
                    variant="square"
                    alt="Remy Sharp"
                    style={{
                      backgroundColor: "white",
                      borderRadius: 5,
                      marginRight: 10
                    }}
                    src={require("../Images/logo.png")}
                  />
                ) : (
                  <ArrowBackIosIcon />
                )}
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
            <div style={{ margin: 10 }}>
              <Breadcrumbs aria-label="breadcrumb">
                <Link color="inherit" href="/dashboard">
                  Dashboard
                </Link>
                <Typography color="textPrimary">
                  {username === "Test" ? "Yukio" : username}
                </Typography>
              </Breadcrumbs>
              <Paper style={{ margin: 10 }}>
                <Typography style={{ padding: 10 }} variant="h5" component="h3">
                  {username === "Test" ? "Yukio" : username}'s Planters
                </Typography>
              </Paper>
              <div>
                <div>
                  {this.state.planters.length === 0 ? (
                    <CircularProgress
                      color="primary"
                      style={{
                        marginLeft: "47%",
                        root: { flex: 1 },
                        textAlign: "center"
                      }}
                    />
                  ) : (
                    this.state.planters.map(one => this.renderPlanters(one))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <h1>Please log in first</h1>
          )}
        </div>
        <BrowserView>
          <img
            style={{
              zIndex: -100,
              width: "100%",
              position: "absolute",
              bottom: -1
            }}
            src={require("../Images/grass.png")}
            alt="footer"
          />
          <StickyFooter
            bottomThreshold={20}
            normalStyles={{
              height: 20,
              padding: "10px"
            }}
            stickyStyles={{
              padding: "2rem"
            }}
          >
            <p style={{ color: "white", marginTop: -10 }}>
              © 2019 - 2020, Plant'y Inc. or its affiliates. All rights
              reserved.
            </p>
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

export default connect(mapStateToProps, mapDispatchToProps)(UserPage);
