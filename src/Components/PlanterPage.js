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
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";
import MenuIcon from "@material-ui/icons/Menu";
import ArrowBack from "@material-ui/icons/ArrowBackIos";
import ArrowForward from "@material-ui/icons/ArrowForwardIos";
import Reload from "@material-ui/icons/Autorenew";
import LeftHard from "@material-ui/icons/LastPage";
import RightHard from "@material-ui/icons/FirstPage";

import ReactPlayer from "react-player";
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
import Amplify, { Auth, Storage } from "aws-amplify";
//import awsconfig from "../aws-exports";
//import { instanceOf } from "prop-types";
//import { Cookies } from "react-cookie";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import axios from "axios";
import PlantPage from "./PlantPage";
import Link from "@material-ui/core/Link";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import LinearProgress from "@material-ui/core/LinearProgress";
import CardActions from "@material-ui/core/CardActions";
import { BrowserView, isMobile } from "react-device-detect";
import WS from "../websocket";
import CircularProgress from "@material-ui/core/CircularProgress";
import Fab from "@material-ui/core/Fab";

const plantyColor = "#6f9e04";
const errorColor = "#ee3e34";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

class PlanterPage extends React.Component {
  // static propTypes = {
  //   cookies: instanceOf(Cookies).isRequired
  // };

  constructor(props) {
    super(props);
    this.state = {
      classes: null,
      width: 0,
      height: 0,
      toLogin: false,
      toRegister: false,
      user: null,
      plants: [],
      planterUUID: "",
      customerUsername: "",
      customerPlanter: "",
      entries: {
        currTemperature: "0",
        currUV: "0",
        currHumidity: "0"
      },
      waterTurnedOn: false,
      lightTurnedOn: false,
      loadingLightTurnedOn: false,
      waterAdded: false,
      loadingAddingWater: false,
      loadingActions: false,
      streamUrl: ""
    };
    if (!WS.ws) WS.init();

    Amplify.configure(JSON.parse(process.env.REACT_APP_CONFIG_AWS));
    WS.onMessage(data => {
      console.log("GOT in planter screen", data.data);

      let instructions = data.data.split(";");
      if (instructions.length > 2)
        switch (instructions[2]) {
          case "WATER_ADDED":
            this.setState({ waterAdded: true, loadingAddingWater: false });
            break;
          case "UV_LAMP_IS_ON":
            this.setState({ lightTurnedOn: true, loadingLightTurnedOn: false });
            break;
          case "UV_LAMP_IS_OFF":
            this.setState({
              lightTurnedOn: false,
              loadingLightTurnedOn: false
            });
            break;
          case "FAILED":
            console.log("Failed to communicate with server");
            // this.forceUpdate();
            break;
          case "MEASUREMENTS":
            if (this.state.planterUUID === instructions[1]) {
              this.setState({
                entries: {
                  currTemperature: Math.floor(
                    parseFloat(instructions[3].split(":")[1])
                  ),
                  currUV: instructions[4].split(":")[1],
                  currHumidity: Math.floor(
                    parseFloat(instructions[5].split(":")[1]) * 100
                  )
                }
              });
              let temp = instructions[3].split(":")[1];
              temp = Math.floor(parseFloat(temp));

              this.setState({
                currTemperature: temp,
                currUV: instructions[4].split(":")[1],
                currHumidity: Math.floor(
                  parseFloat(instructions[5].split(":")[1]) * 100
                )
              });
            }

            break;
          default:
            break;
        }
    });
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
    let array = this.props.location.pathname.split("/");
    let uuid = array[3].split("=")[1];
    this.setState({
      planterUUID: uuid,
      customerUsername: array[2],
      planterName: array[3].split("=")[0]
    });

    Auth.currentAuthenticatedUser()
      .then(user => {
        // return Auth.changePassword(user, "oldPassword", "newPassword");
        this.setState({ user: user });
        this.props.addUser(user);
        this.loadPlants()
          .then()
          .catch();
        this.loadStreamUrl();
      })
      // .then(data => console.log(data))
      .catch(err => console.log(err));

    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  async loadPlants() {
    let USER_TOKEN = this.state.user.signInUserSession.idToken.jwtToken;
    const AuthStr = "Bearer ".concat(USER_TOKEN);
    await axios
      .post(
        JSON.parse(process.env.REACT_APP_API_LINKS).apigatewayRoute +
          "/getPlantsInPlanter",
        {
          username: this.state.customerUsername,
          planterName: this.state.planterName
        },
        {
          headers: { Authorization: AuthStr }
        }
      )
      .then(response => {
        this.dealWithPlantsData(response.data);
      })
      .catch(error => {
        console.log("error " + error);
      });
  }

  dealWithPlantsData = plants => {
    // console.log(plants);
    let newPlants = [];
    plants.map(one => {
      Storage.get(one.name.toLowerCase() + "_img.jpg", {
        level: "public",
        type: "image/jpg"
        // bucket: 'plant-pictures-planty',
        // region: 'eu',
      })
        .then(data => {
          let newOne = {
            name: one.name,
            description: one.description,
            soil: one.soil,
            pic: data,
            UUID: one.UUID,
            plantStatus: one.plantStatus
          };
          newPlants.push(newOne);
          // console.log(data);
        })
        .then(() => this.setState({ plants: newPlants }))
        .catch(error => console.log(error));
    });

    // if (plants) {
    //   this.setState({ plants: plants });
    // } else this.setState({ plants: [] });
    // this.setState({ loading: false });
  };

  async sendAction(action, plantUUID) {
    let USER_TOKEN = this.state.user.signInUserSession.idToken.jwtToken;
    const AuthStr = "Bearer ".concat(USER_TOKEN);
    await axios
      .post(
        JSON.parse(process.env.REACT_APP_API_LINKS).apigatewayRoute +
          "/changeStatusOfPlant",
        {
          username: this.state.customerUsername,
          planterName: this.state.planterName,
          plantStatus: action,
          planterUUID: this.state.planterUUID,
          plantUUID: plantUUID
        },
        {
          headers: { Authorization: AuthStr }
        }
      )
      .then(response => {
        this.loadPlants()
          .then()
          .catch();
      })
      .catch(error => {
        console.log("error " + error);
      });
  }

  async deletePlant(plantUUID) {
    let USER_TOKEN = this.state.user.signInUserSession.idToken.jwtToken;
    const AuthStr = "Bearer ".concat(USER_TOKEN);
    await axios
      .post(
        JSON.parse(process.env.REACT_APP_API_LINKS).apigatewayRoute +
          "/removePlantFromPlanter",
        {
          username: this.state.customerUsername,
          planterName: this.state.planterName,
          planterUUID: this.state.planterUUID,
          plantUUID: plantUUID
        },
        {
          headers: { Authorization: AuthStr }
        }
      )
      .then(response => {
        this.loadPlants()
          .then()
          .catch();
      })
      .catch(error => {
        console.log("error " + error);
      });
  }

  async loadStreamUrl() {
    let USER_TOKEN = this.state.user.signInUserSession.idToken.jwtToken;
    const AuthStr = "Bearer ".concat(USER_TOKEN);

    if (this.state.streamUrl === undefined || this.state.streamUrl === null) {
    }

    await axios
      .post(
        JSON.parse(process.env.REACT_APP_API_LINKS).apigatewayRoute +
          "/loadStreamUrlManager",
        {
          streamName: "Planty"
        },
        {
          headers: { Authorization: AuthStr }
        }
      )
      .then(response => {
        if (response.data) {
          if (
            this.state.streamUrl === undefined ||
            this.state.streamUrl === null
          ) {
            console.log("SETTING URL");
            console.log(response.data);
            if (response.data.errorMessage) {
              return;
            }
            // this.addUrl(response.data.HLSStreamingSessionURL);
            this.setState({ streamUrl: response.data.HLSStreamingSessionURL });
          } else {
            console.log(response.data);
            console.log("NOT SETTING URL");
            // this.setState({streamUrl: this.props.plantyData.streamUrl});
          }
        } else {
          // console.log(response.data);
          console.log("No stream data URL");
          console.log(response);
        }
      })
      .catch(error => {
        console.log("error " + error);
      });
  }

  renderPlants = plant => {
    let maxWidth = 345;
    if (isMobile) {
      maxWidth = "100%";
    }

    return (
      <Card
        onClick={() => {
          this.setState({ selectedPlanter: plant.name });
        }}
        key={plant.name}
        style={{
          float: "left",
          margin: 10,
          maxWidth: maxWidth,
          backgroundColor: "#e8f5e9"
          // root: { color: "#a5d6a7" }
        }}
      >
        <CardActionArea>
          <CardMedia
            style={{
              height: 200,
              width: 200,
              margin: "0 auto"
            }}
            image={plant.pic}
            title="Contemplative Reptile"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {plant.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              Status: {plant.plantStatus}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button
            onClick={() => this.sendAction("active", plant.UUID)}
            size="small"
            color="primary"
          >
            Activate
          </Button>
          <Button
            onClick={() => this.sendAction("inactive", plant.UUID)}
            size="small"
            color="primary"
          >
            Deactivate
          </Button>
          <Button
            onClick={() => this.deletePlant(plant.UUID)}
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
    if (this.state.plants === []) {
      return <LinearProgress style={{ width: "100%" }} />;
    }

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
                onClick={() => {
                  if (!this.state.user) this.setState({ toLogin: true });
                }}
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
            <div style={{ margin: 10 }}>
              <Breadcrumbs aria-label="breadcrumb">
                <Link
                  color="inherit"
                  href="/dashboard"
                  // onClick={handleClick}
                >
                  Dashboard
                </Link>
                <Link
                  color="inherit"
                  href={"/users/" + this.state.customerUsername}
                  // onClick={handleClick}
                >
                  {this.state.customerUsername}
                </Link>
                {/*<Link*/}
                {/*  color="inherit"*/}
                {/*  href="/getting-started/installation/"*/}
                {/*  // onClick={handleClick}*/}
                {/*>*/}
                {/*  User*/}
                {/*</Link>*/}
                <Typography color="textPrimary">
                  {this.state.planterName}
                </Typography>
              </Breadcrumbs>
              <div>
                <h1>Video for {this.state.planterName}</h1>
                <div>
                  <div className="player-wrapper">
                    <ReactPlayer
                      style={{ width: this.state.width - 100, height: 100 }}
                      url={this.state.streamUrl}
                      width="100%"
                      height={800}
                    />
                  </div>
                  <Fab
                    size="small"
                    color="primary"
                    style={{ margin: 5 }}
                    onClick={() => {
                      this.setState({ streamUrl: undefined });
                      this.loadStreamUrl();
                    }}
                  >
                    <Reload />
                  </Fab>

                  <div
                    style={{
                      textAlign: "center",
                      margin: "0 auto",
                      flexDirection: "row"
                      // flexWrap: "wrap",
                      // justifyContent: "space-between",
                      // padding: 8
                    }}
                  >
                    <h3>Camera Controllers</h3>
                    <Fab
                      color="primary"
                      // icon={
                      //   this.state.loadingActions
                      //     ? "reload"
                      //     : require("../Images/icons/arrowhead-right-outline.png")
                      // }
                      // icon={this.state.loadingActions ? 'reload' : 'arrow-right'}
                      // color={plantyColor}
                      // size={40}
                      style={{ margin: 10 }}
                      disabled={
                        this.state.loadingActions || !this.state.streamUrl
                      }
                      onClick={() => {
                        WS.sendMessage(
                          "FROM_WEB;" +
                            this.state.planterUUID +
                            ";MOVE_CAMERA_LEFT_LONG"
                        );
                      }}
                    >
                      {this.state.loadingActions ? <Reload /> : <RightHard />}
                    </Fab>
                    <Fab
                      style={{ margin: 10 }}
                      color="primary"
                      // icon={
                      //   this.state.loadingActions
                      //     ? "reload"
                      //     : require("../Images/icons/arrowhead-right-outline.png")
                      // }
                      // icon={this.state.loadingActions ? 'reload' : 'arrow-right'}
                      // color={plantyColor}
                      // size={40}
                      disabled={
                        this.state.loadingActions || !this.state.streamUrl
                      }
                      onClick={() => {
                        WS.sendMessage(
                          "FROM_WEB;" +
                            this.state.planterUUID +
                            ";MOVE_CAMERA_LEFT"
                        );
                      }}
                    >
                      {this.state.loadingActions ? <Reload /> : <ArrowBack />}
                    </Fab>
                    <Fab
                      style={{ margin: 10 }}
                      color="primary"
                      // icon={
                      //   this.state.loadingActions
                      //     ? "reload"
                      //     : require("../Images/icons/arrowhead-right-outline.png")
                      // }
                      // icon={this.state.loadingActions ? 'reload' : 'arrow-right'}
                      // color={plantyColor}
                      // size={40}
                      disabled={
                        this.state.loadingActions || !this.state.streamUrl
                      }
                      onClick={() => {
                        WS.sendMessage(
                          "FROM_WEB;" +
                            this.state.planterUUID +
                            ";MOVE_CAMERA_RIGHT"
                        );
                      }}
                    >
                      {this.state.loadingActions ? (
                        <Reload />
                      ) : (
                        <ArrowForward />
                      )}
                    </Fab>
                    <Fab
                      style={{ margin: 10 }}
                      color="primary"
                      // icon={
                      //   this.state.loadingActions
                      //     ? "reload"
                      //     : require("../Images/icons/arrowhead-right-outline.png")
                      // }
                      // icon={this.state.loadingActions ? 'reload' : 'arrow-right'}
                      // color={plantyColor}
                      // size={40}
                      disabled={
                        this.state.loadingActions || !this.state.streamUrl
                      }
                      onClick={() => {
                        WS.sendMessage(
                          "FROM_WEB;" +
                            this.state.planterUUID +
                            ";MOVE_CAMERA_RIGHT_LONG"
                        );
                      }}
                    >
                      {this.state.loadingActions ? <Reload /> : <LeftHard />}
                    </Fab>
                  </div>
                </div>

                <h1>Controllers for {this.state.planterName}</h1>
                <div>
                  <div style={{ margin: 10, width: "100%" }}>
                    <Button
                      style={{
                        margin: 10,
                        width: 180,
                        padding: -10
                      }}
                      // disabled={!this.validateForm()}
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        this.setState({ loadingAddingWater: true });
                        WS.sendMessage(
                          "FROM_WEB;" + this.state.planterUUID + ";ADD_WATER"
                        );
                      }}
                    >
                      {!this.state.loadingAddingWater ? (
                        "Add Water"
                      ) : (
                        <CircularProgress
                          size={24}
                          color="secondary"
                          style={{ root: { flex: 1 } }}
                        />
                      )}
                    </Button>
                    <Dialog
                      open={this.state.waterAdded}
                      TransitionComponent={Transition}
                      keepMounted
                      onClose={() => this.setState({ waterAdded: false })}
                      aria-labelledby="alert-dialog-slide-title"
                      aria-describedby="alert-dialog-slide-description"
                    >
                      <DialogTitle id="alert-dialog-slide-title">
                        {"Water was added to the planter"}
                      </DialogTitle>
                      <DialogActions>
                        <Button
                          onClick={() => this.setState({ waterAdded: false })}
                          color="primary"
                        >
                          OK
                        </Button>
                      </DialogActions>
                    </Dialog>
                    <Button
                      style={{
                        margin: 10,
                        width: 180,
                        padding: -10
                      }}
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        this.setState({ loadingLightTurnedOn: true });
                        let action = !this.state.lightTurnedOn ? "on" : "off";
                        WS.sendMessage(
                          "FROM_WEB;" +
                            this.state.planterUUID +
                            ";UV_LAMP_" +
                            action.toUpperCase()
                        );
                      }}
                    >
                      {!this.state.loadingLightTurnedOn ? (
                        "Toggle light"
                      ) : (
                        <CircularProgress
                          size={24}
                          color="secondary"
                          style={{ root: { flex: 1 } }}
                        />
                      )}
                    </Button>
                  </div>
                </div>
                <h1>Current state for {this.state.planterName}</h1>
                <div>
                  <h3>Temperature: {this.state.entries.currTemperature} C</h3>
                  <h3>UV: {this.state.entries.currUV}</h3>
                  <h3>Humidity: {this.state.entries.currHumidity}%</h3>
                </div>

                <h1>Plants in {this.state.planterName}</h1>
                <div>
                  {this.state.plants.map(one => this.renderPlants(one))}
                </div>
              </div>
            </div>
          ) : (
            <h1>Please log in first</h1>
          )}
        </div>
        <BrowserView>
          {/*<StickyFooter*/}
          {/*  bottomThreshold={20}*/}
          {/*  normalStyles={{*/}
          {/*    height: 20,*/}
          {/*    backgroundColor: "#999999",*/}
          {/*    padding: "10px"*/}
          {/*  }}*/}
          {/*  stickyStyles={{*/}
          {/*    backgroundColor: "rgba(255,255,255,.8)",*/}
          {/*    padding: "2rem"*/}
          {/*  }}*/}
          {/*>*/}
          {/*  © 2019 - 2020, Plant'y Inc. or its affiliates. All rights reserved.*/}
          {/*</StickyFooter>*/}
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

export default connect(mapStateToProps, mapDispatchToProps)(PlanterPage);
