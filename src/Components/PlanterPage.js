import React from "react";

//redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addSocket, addUser, loadPlanters } from "../actions";
import AppBar from "@material-ui/core/AppBar";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";
import NoVideoIcon from "@material-ui/icons/VideocamOff";
import ArrowBack from "@material-ui/icons/NavigateBefore";
import ArrowForward from "@material-ui/icons/NavigateNext";
import Reload from "@material-ui/icons/Autorenew";
import LeftHard from "@material-ui/icons/LastPage";
import RightHard from "@material-ui/icons/FirstPage";
import {
  Legend,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area
} from "recharts";
import ReactPlayer from "react-player";
import {
  Card,
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
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import axios from "axios";
import Link from "@material-ui/core/Link";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import LinearProgress from "@material-ui/core/LinearProgress";
import CardActions from "@material-ui/core/CardActions";
import { isMobile } from "react-device-detect";
import WS from "../websocket";
import CircularProgress from "@material-ui/core/CircularProgress";
import Fab from "@material-ui/core/Fab";
import Paper from "@material-ui/core/Paper";
import Alert from "@material-ui/lab/Alert";
import Avatar from "@material-ui/core/Avatar";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Slider from "@material-ui/core/Slider";
import TextField from "@material-ui/core/TextField";
import { Logger } from "../Logger";

const plantyColor = "#6f9e04";
const errorColor = "#ee3e34";

function isMacintosh() {
  return navigator.platform.indexOf("Mac") > -1;
}

function isWindows() {
  return navigator.platform.indexOf("Win") > -1;
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const data = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000
  },
  {
    name: "Page E",
    uv: 1890,
    pv: 4800,
    amt: 2181
  },
  {
    name: "Page F",
    uv: 2390,
    pv: 3800,
    amt: 2500
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 4300,
    amt: 2100
  }
];

class PlanterPage extends React.Component {
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
      loadingLightTurnedOff: false,

      heaterTurnedOn: false,
      loadingHeaterTurnedOn: false,
      loadingHeaterTurnedOff: false,

      fanTurnedOn: false,
      loadingFanTurnedOn: false,
      loadingFanTurnedOff: false,
      planter: {
        askedToSend: "none",
        sendDetails: {
          address: "",
          instructions: "",
          name: "",
          phoneNumber: "",
          username: ""
        }
      },
      waterAdded: false,
      loadingAddingWater: false,
      loadingActions: false,
      streamUrl: "",
      dataForGraph: [],
      loadingStreamTurnedOff: false,
      loadingStreamTurnedOn: false,
      streamTurnedOn: false,
      streamError: "",
      growthPlan: { phases: [] },
      savingPlan: false,
      growthPlanDescription: "",
      growthPlanGroup: "",
      currentWeek: 0,
      loadingSendingPlanter: false
    };
    if (!WS.ws) WS.init();
    Amplify.configure(JSON.parse(process.env.REACT_APP_CONFIG_AWS));
    WS.onMessage(data => {
      // console.log("GOT in planter screen", data.data);

      let instructions = data.data.split(";");
      if (instructions.length > 2)
        switch (instructions[2]) {
          case "WATER_ADDED":
            this.setState({ waterAdded: true, loadingAddingWater: false });
            break;
          case "STREAM_STARTED":
            this.loadStreamUrl()
              .then()
              .catch(e => console.log(e));
            this.setState({
              loadingStreamTurnedOn: false,
              streamTurnedOn: true
            });
            break;
          case "STREAM_STOPPED":
            this.setState({
              loadingStreamTurnedOff: false,
              streamTurnedOn: false
            });
            break;
          case "UV_LAMP_IS_ON":
            this.setState({ lightTurnedOn: true, loadingLightTurnedOn: false });
            break;
          case "LAMP_IS_OFF":
            this.setState({ lightTurnedOn: false });
            break;

          case "HEATER_IS_ON":
            this.setState({
              heaterTurnedOn: true,
              loadingHeaterTurnedOn: false
            });
            break;
          case "HEATER_IS_OFF":
            this.setState({ heaterTurnedOn: false });
            break;

          case "FAN_IS_ON":
            this.setState({ fanTurnedOn: true, loadingFanTurnedOn: false });
            break;
          case "FAN_IS_OFF":
            this.setState({ fanTurnedOn: false });
            break;

          case "STREAM_ON":
            this.setState({
              streamTurnedOn: true
            });
            break;
          case "STREAM_OFF":
            this.setState({
              streamTurnedOn: false
            });
            break;
          case "LAMP_IS_ON":
            this.setState({ lightTurnedOn: true });
            break;

          case "UV_LAMP_IS_OFF":
            this.setState({
              lightTurnedOn: false,
              loadingLightTurnedOff: false
            });
            break;
          case "FAILED":
            console.log("Failed to communicate with server");
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

  checkLight = () => {
    if (WS.ws)
      WS.sendMessage("FROM_WEB;" + this.state.planterUUID + ";UV_LAMP_STATUS");
  };

  checkHeater = () => {
    if (WS.ws)
      WS.sendMessage("FROM_WEB;" + this.state.planterUUID + ";HEATER_STATUS");
  };

  checkFan = () => {
    if (WS.ws)
      WS.sendMessage("FROM_WEB;" + this.state.planterUUID + ";FAN_STATUS");
  };

  checkStream = () => {
    if (WS.ws)
      WS.sendMessage(
        "FROM_WEB;" + this.state.planterUUID + ";VIDEO_STREAM_STATUS"
      );
  };

  getMeasurments = () => {
    if (WS.ws)
      WS.sendMessage(
        "FROM_WEB;" + this.state.planterUUID + ";GET_MEASUREMENTS"
      );
  };

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
        this.setState({ user: user });
        this.props.addUser(user);
        this.loadPlants()
          .then()
          .catch();
        this.loadStreamUrl();

        this.loadPlanter()
          .then()
          .catch();
      })
      .catch(err => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          err.toString(),
          "didmount - planterPage"
        );
        console.log(err);
      });

    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  parceData(plots) {
    let dataArray = [];
    for (
      let i = 0;
      i < plots.daily.ambientTemperatureCelsius.labels.length;
      i++
    ) {
      let object = {
        name: plots.daily.ambientTemperatureCelsius.labels[i],
        temperature: plots.daily.ambientTemperatureCelsius.datasets[0].data[i]
      };
      dataArray.push(object);
    }

    this.setState({ dataForGraph: dataArray });
    dataArray = [];

    for (let i = 0; i < plots.daily.uvIntensity.labels.length; i++) {
      let object = {
        name: plots.daily.uvIntensity.labels[i],
        uv: plots.daily.uvIntensity.datasets[0].data[i]
      };
      dataArray.push(object);
    }

    this.setState({ dataForGraphUV: dataArray });
    dataArray = [];

    for (let i = 0; i < plots.daily.soilHumidity.labels.length; i++) {
      let object = {
        name: plots.daily.soilHumidity.labels[i],
        humidity: Math.floor(
          parseFloat(plots.daily.soilHumidity.datasets[0].data[i]) * 100
        )
      };
      dataArray.push(object);
    }
    this.setState({ dataForGraphHumidity: dataArray });

    //parsing weekly data

    dataArray = [];
    dataArray = Array(Object.keys(plots.weekly).length);
    let index = 0;
    for (let i = 0; i < Object.keys(plots.weekly).length; i++) {
      index = this.WeekdayToInt(Object.keys(plots.weekly)[i]);
      dataArray[index] = {
        min: Math.floor(
          plots.weekly[Object.keys(plots.weekly)[i]].uvIntensity.min
        ),
        avg: Math.floor(
          plots.weekly[Object.keys(plots.weekly)[i]].uvIntensity.avg
        ),
        max: Math.floor(
          plots.weekly[Object.keys(plots.weekly)[i]].uvIntensity.max
        ),
        label: Object.keys(plots.weekly)[i]
      };
    }
    this.setState({ dataForUvIntensityWeekly: dataArray });

    dataArray = [];
    dataArray = Array(Object.keys(plots.weekly).length);
    index = 0;
    for (let i = 0; i < Object.keys(plots.weekly).length; i++) {
      index = this.WeekdayToInt(Object.keys(plots.weekly)[i]);
      dataArray[index] = {
        min: Math.floor(
          plots.weekly[Object.keys(plots.weekly)[i]].ambientTemperatureCelsius
            .min
        ),
        avg: Math.floor(
          plots.weekly[Object.keys(plots.weekly)[i]].ambientTemperatureCelsius
            .avg
        ),
        max: Math.floor(
          plots.weekly[Object.keys(plots.weekly)[i]].ambientTemperatureCelsius
            .max
        ),
        label: Object.keys(plots.weekly)[i]
      };
    }

    this.setState({ dataForTempWeekly: dataArray });

    dataArray = [];
    dataArray = Array(Object.keys(plots.weekly).length);
    index = 0;
    for (let i = 0; i < Object.keys(plots.weekly).length; i++) {
      index = this.WeekdayToInt(Object.keys(plots.weekly)[i]);
      dataArray[index] = {
        min: Math.floor(
          plots.weekly[Object.keys(plots.weekly)[i]].soilHumidity.min * 100
        ),
        avg: Math.floor(
          plots.weekly[Object.keys(plots.weekly)[i]].soilHumidity.avg * 100
        ),
        max: Math.floor(
          plots.weekly[Object.keys(plots.weekly)[i]].soilHumidity.max * 100
        ),
        label: Object.keys(plots.weekly)[i]
      };
    }
    this.setState({ dataForSoilHumidityWeekly: dataArray });

    this.forceUpdate();
  }

  WeekdayToInt(weekday) {
    if (weekday === "Mon") return 0;
    if (weekday === "Tue") return 1;
    if (weekday === "Wed") return 2;
    if (weekday === "Thu") return 3;
    if (weekday === "Fri") return 4;
    if (weekday === "Sat") return 5;
    if (weekday === "Sun") return 6;
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
      .catch(err => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          err.toString(),
          "loadPlants"
        );
        console.log(err);
      });

    this.checkLight();
    this.checkStream();
    this.checkFan();
    this.checkHeater();
    this.getMeasurments();
  }

  async loadPlanter() {
    let USER_TOKEN = this.state.user.signInUserSession.idToken.jwtToken;
    const AuthStr = "Bearer ".concat(USER_TOKEN);
    await axios
      .post(
        JSON.parse(process.env.REACT_APP_API_LINKS).apigatewayRoute +
          "/getplanter",
        {
          username: this.state.customerUsername,
          UUID: this.state.planterUUID
        },
        {
          headers: { Authorization: AuthStr }
        }
      )
      .then(response => {
        let currentTime = new Date().getTime() / 1000;
        let activatedTime = response.data.TimeActivated;
        let currentWeek = parseInt((currentTime - activatedTime) / 86400);
        currentWeek = parseInt(currentWeek / 7);

        this.setState({ currentWeek: currentWeek + 1 });

        this.setState({ planter: response.data });

        this.setState({ growthPlan: response.data.activeGrowthPlan });

        this.parceData(response.data.plots);
      })
      .catch(err => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          err.toString(),
          "loadPlanter"
        );
        console.log(err);
      });
  }

  dealWithPlantsData = plants => {
    let newPlants = [];
    plants.map(one => {
      Storage.get(one.name.toLowerCase() + "_img.jpg", {
        level: "public",
        type: "image/jpg"
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
        })
        .then(() => this.setState({ plants: newPlants }))
        .catch(err => {
          Logger.saveLogs(
            this.props.plantyData.myCognitoUser.username,
            err.toString(),
            "loadPlantsImg"
          );
          console.log(err);
        });
    });
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
      .catch(err => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          err.toString(),
          "sendAction"
        );
        console.log(err);
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
      .catch(err => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          err.toString(),
          "deletePlant"
        );
        console.log(err);
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
            if (response.data.errorMessage) {
              this.setState({ streamError: response.data.errorMessage });
              console.log("error: ", response.data.errorMessage);
              return;
            }
            this.setState({ streamUrl: response.data.HLSStreamingSessionURL });
          } else {
          }
        } else {
        }
      })
      .catch(err => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          err.toString(),
          "loadStreamUrl"
        );
        console.log(err);
      });
  }

  renderPlants = plant => {
    let maxWidth = 250;
    if (isMobile) {
      maxWidth = this.state.width - 60;
    }

    return (
      <Card
        onClick={() => {
          this.setState({ selectedPlanter: plant.name });
        }}
        key={plant.name + Math.random().toString()}
        style={{
          float: "left",
          margin: 10,
          width: maxWidth,
          backgroundColor: "#e8f5e9"
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
    let playerHeight = 0;
    let float = "left";
    let videoWidth = this.state.width - 100;

    let maxWidth = 0;

    if (isMacintosh()) {
      maxWidth = this.state.width / 3 - 50;
    } else {
      maxWidth = this.state.width / 3 - 50;
    }

    if (this.state.streamUrl) {
      playerHeight = 800;
    }

    if (isMobile) {
      playerHeight = 300;
      float = "none";
      videoWidth = this.state.width - 20;
      maxWidth = this.state.width - 30;
    }

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
                <Link
                  color="inherit"
                  href={"/users/" + this.state.customerUsername}
                >
                  {this.state.customerUsername === "Test"
                    ? "Yukio"
                    : this.state.username}
                </Link>
                <Typography color="textPrimary">
                  {this.state.planterName}
                </Typography>
              </Breadcrumbs>
              {this.renderSendPlanter()}

              <Paper style={{ margin: 10 }}>
                <Typography style={{ padding: 10 }} variant="h5" component="h3">
                  Video for {this.state.planterName}
                </Typography>
                <div>
                  {this.state.streamUrl ? (
                    <div>
                      <ReactPlayer
                        playing
                        url={this.state.streamUrl}
                        width={videoWidth - 20}
                        height={playerHeight}
                        file={"forceHLS"}
                        config={{
                          file: {}
                        }}
                      />
                      <Fab
                        size="small"
                        color="primary"
                        variant="extended"
                        style={{ margin: 5, float: "left" }}
                        onClick={() => {
                          this.setState({
                            streamUrl: undefined,
                            streamError: ""
                          });
                          this.loadStreamUrl();
                        }}
                      >
                        <Reload />
                        Reload Video
                      </Fab>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <NoVideoIcon
                        style={{ height: 40, width: 40, marginLeft: -150 }}
                      />
                      <Fab
                        size="small"
                        color="primary"
                        variant="extended"
                        style={{ margin: 5, float: "left" }}
                        onClick={() => {
                          this.setState({
                            streamUrl: undefined,
                            streamError: ""
                          });
                          this.loadStreamUrl();
                        }}
                      >
                        <Reload />
                        Reload Video
                      </Fab>
                    </div>
                  )}

                  <div style={{ clear: "both" }} />
                  {this.state.streamError === "" ? (
                    <div />
                  ) : (
                    <Alert style={{ margin: 5 }} severity="error">
                      {this.state.streamError +
                        ", Enable stream to fix this error"}
                    </Alert>
                  )}

                  <div
                    style={{
                      textAlign: "center",
                      margin: "0 auto",
                      flexDirection: "row"
                    }}
                  >
                    <h3>Camera Controllers</h3>
                    <Fab
                      color="primary"
                      style={{ margin: 10 }}
                      disabled={this.state.loadingActions}
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
                      disabled={this.state.loadingActions}
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
                      disabled={this.state.loadingActions}
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
                      disabled={this.state.loadingActions}
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
              </Paper>
              <Paper style={{ margin: 10 }}>
                <Typography style={{ padding: 10 }} variant="h5" component="h3">
                  Controllers for {this.state.planterName}
                </Typography>
                <div style={{ margin: 10, width: "100%", textAlign: "center" }}>
                  <Button
                    style={{
                      margin: 10,
                      width: 180,
                      padding: -10
                    }}
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
                    disabled={this.state.lightTurnedOn}
                    onClick={() => {
                      this.setState({ loadingLightTurnedOn: true });
                      WS.sendMessage(
                        "FROM_WEB;" + this.state.planterUUID + ";UV_LAMP_ON"
                      );
                    }}
                  >
                    {!this.state.loadingLightTurnedOn ? (
                      "Turn light on"
                    ) : (
                      <CircularProgress
                        size={24}
                        color="secondary"
                        style={{ root: { flex: 1 } }}
                      />
                    )}
                  </Button>
                  <Button
                    style={{
                      margin: 10,
                      width: 180,
                      padding: -10
                    }}
                    variant="contained"
                    color="primary"
                    disabled={!this.state.lightTurnedOn}
                    onClick={() => {
                      this.setState({ loadingLightTurnedOff: true });
                      WS.sendMessage(
                        "FROM_WEB;" + this.state.planterUUID + ";UV_LAMP_OFF"
                      );
                    }}
                  >
                    {!this.state.loadingLightTurnedOff ? (
                      "Turn light off"
                    ) : (
                      <CircularProgress
                        size={24}
                        color="secondary"
                        style={{ root: { flex: 1 } }}
                      />
                    )}
                  </Button>

                  <Button
                    style={{
                      margin: 10,
                      width: 180,
                      padding: -10
                    }}
                    variant="contained"
                    color="primary"
                    disabled={this.state.heaterTurnedOn}
                    onClick={() => {
                      this.setState({ loadingHeaterTurnedOn: true });
                      WS.sendMessage(
                        "FROM_WEB;" + this.state.planterUUID + ";HEATER_ON"
                      );
                    }}
                  >
                    {!this.state.loadingHeaterTurnedOn ? (
                      "Turn heater on"
                    ) : (
                      <CircularProgress
                        size={24}
                        color="secondary"
                        style={{ root: { flex: 1 } }}
                      />
                    )}
                  </Button>
                  <Button
                    style={{
                      margin: 10,
                      width: 180,
                      padding: -10
                    }}
                    variant="contained"
                    color="primary"
                    disabled={!this.state.heaterTurnedOn}
                    onClick={() => {
                      this.setState({ loadingHeaterTurnedOff: true });
                      WS.sendMessage(
                        "FROM_WEB;" + this.state.planterUUID + ";HEATER_OFF"
                      );
                    }}
                  >
                    {!this.state.loadingHeaterTurnedOff ? (
                      "Turn heater off"
                    ) : (
                      <CircularProgress
                        size={24}
                        color="secondary"
                        style={{ root: { flex: 1 } }}
                      />
                    )}
                  </Button>
                  <Button
                    style={{
                      margin: 10,
                      width: 180,
                      padding: -10
                    }}
                    variant="contained"
                    color="primary"
                    disabled={this.state.fanTurnedOn}
                    onClick={() => {
                      this.setState({ loadingFanTurnedOn: true });
                      WS.sendMessage(
                        "FROM_WEB;" + this.state.planterUUID + ";FAN_ON"
                      );
                    }}
                  >
                    {!this.state.loadingFanTurnedOn ? (
                      "Turn fan on"
                    ) : (
                      <CircularProgress
                        size={24}
                        color="secondary"
                        style={{ root: { flex: 1 } }}
                      />
                    )}
                  </Button>
                  <Button
                    style={{
                      margin: 10,
                      width: 180,
                      padding: -10
                    }}
                    variant="contained"
                    color="primary"
                    disabled={!this.state.fanTurnedOn}
                    onClick={() => {
                      this.setState({ loadingFanTurnedOff: true });
                      WS.sendMessage(
                        "FROM_WEB;" + this.state.planterUUID + ";FAN_OFF"
                      );
                    }}
                  >
                    {!this.state.loadingHeaterTurnedOff ? (
                      "Turn fan off"
                    ) : (
                      <CircularProgress
                        size={24}
                        color="secondary"
                        style={{ root: { flex: 1 } }}
                      />
                    )}
                  </Button>

                  <Button
                    style={{
                      margin: 10,
                      width: 180,
                      padding: -10
                    }}
                    variant="contained"
                    color="primary"
                    disabled={this.state.streamTurnedOn}
                    onClick={() => {
                      this.setState({ loadingStreamTurnedOn: true });
                      WS.sendMessage(
                        "FROM_WEB;" +
                          this.state.planterUUID +
                          ";VIDEO_STREAM_ON"
                      );
                    }}
                  >
                    {!this.state.loadingStreamTurnedOn ? (
                      "Enable stream"
                    ) : (
                      <CircularProgress
                        size={24}
                        color="secondary"
                        style={{ root: { flex: 1 } }}
                      />
                    )}
                  </Button>
                  <Button
                    style={{
                      margin: 10,
                      width: 180,
                      padding: -10
                    }}
                    variant="contained"
                    color="primary"
                    disabled={!this.state.streamTurnedOn}
                    onClick={() => {
                      this.setState({ loadingStreamTurnedOff: true });
                      WS.sendMessage(
                        "FROM_WEB;" +
                          this.state.planterUUID +
                          ";VIDEO_STREAM_OFF"
                      );
                    }}
                  >
                    {!this.state.loadingStreamTurnedOff ? (
                      "Disable stream"
                    ) : (
                      <CircularProgress
                        size={24}
                        color="secondary"
                        style={{ root: { flex: 1 } }}
                      />
                    )}
                  </Button>
                </div>
              </Paper>
              <Paper style={{ margin: 10 }}>
                <Typography
                  style={{ paddingLeft: 10 }}
                  variant="h5"
                  component="h3"
                >
                  Current state for {this.state.planterName}
                </Typography>
                <Typography
                  style={{
                    padding: 10,
                    textAlign: "left",
                    alignSelf: "stretch"
                  }}
                  component="p"
                >
                  Temperature:<b> {this.state.entries.currTemperature}C</b>
                  <br />
                  UV: <b>{this.state.entries.currUV}</b> <br />
                  Humidity: <b>{this.state.entries.currHumidity}% </b>
                </Typography>
              </Paper>
              <Paper style={{ margin: 10 }}>
                <Typography style={{ padding: 10 }} variant="h5" component="h3">
                  Plants in {this.state.planterName}
                </Typography>
                {/*{this.state.plants.map(one => this.renderPlants(one))}*/}
              </Paper>
              {this.state.plants.length === 0 ? (
                <CircularProgress
                  color="primary"
                  style={{
                    marginLeft: "47%",
                    root: { flex: 1 },
                    textAlign: "center"
                  }}
                />
              ) : (
                this.state.plants.map(one => this.renderPlants(one))
              )}
              <div style={{ clear: "both" }} />
              <Paper style={{ margin: 10 }}>
                <Typography style={{ padding: 10 }} variant="h5" component="h3">
                  Data for {this.state.planterName}
                </Typography>
              </Paper>
              <Paper
                style={{
                  margin: 10,
                  width: maxWidth,
                  float: float
                }}
              >
                <Typography style={{ padding: 10 }} variant="p" component="h3">
                  Temperature over this day
                </Typography>

                <AreaChart
                  width={maxWidth}
                  height={300}
                  data={this.state.dataForGraph}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="10%"
                        stopColor={plantyColor}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={plantyColor}
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={plantyColor}
                        stopOpacity={0.8}
                      />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis label="Hours" dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    stopColor={plantyColor}
                    fillOpacity={1}
                    fill="url(#colorUv)"
                  />
                </AreaChart>
              </Paper>
              <Paper
                style={{
                  margin: 10,
                  width: maxWidth,
                  float: float
                }}
              >
                <Typography style={{ padding: 10 }} variant="p" component="h3">
                  UV over this day
                </Typography>

                <AreaChart
                  width={maxWidth}
                  height={300}
                  data={this.state.dataForGraphUV}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="10%"
                        stopColor={plantyColor}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={plantyColor}
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={plantyColor}
                        stopOpacity={0.8}
                      />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis label="Hours" dataKey="name" />
                  <YAxis label="" />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="uv"
                    stopColor={plantyColor}
                    fillOpacity={1}
                    fill="url(#colorUv)"
                  />
                </AreaChart>
              </Paper>
              <Paper
                style={{
                  margin: 10,
                  width: maxWidth,
                  float: float
                }}
              >
                <Typography style={{ padding: 10 }} variant="p" component="h3">
                  Humidity over this day
                </Typography>

                <AreaChart
                  width={maxWidth}
                  height={300}
                  data={this.state.dataForGraphHumidity}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="10%"
                        stopColor={plantyColor}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={plantyColor}
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={plantyColor}
                        stopOpacity={0.8}
                      />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis label="Hours" dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="humidity"
                    stopColor={plantyColor}
                    fillOpacity={1}
                    fill="url(#colorUv)"
                  />
                </AreaChart>
              </Paper>
              {this.renderWeekGraphs()}
              <div style={{ clear: "both" }} />
              <Paper style={{ margin: 10 }}>
                <Typography style={{ padding: 10 }} variant="h5" component="h3">
                  Growth plan for {this.state.planterName}
                </Typography>
                <div style={{ margin: 10, width: "100%", textAlign: "center" }}>
                  <Button
                    variant="outlined"
                    style={{ color: plantyColor, margin: 10 }}
                    onClick={() => this.addWeek()}
                  >
                    Add one week
                  </Button>
                  <Button
                    variant="outlined"
                    style={{ color: plantyColor, margin: 10 }}
                    onClick={() => this.removeLastWeek()}
                  >
                    Remove last week
                  </Button>
                  <Button
                    style={{
                      margin: 10,
                      width: 180,
                      padding: -10
                    }}
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      this.setState({ savingPlan: true });
                      this.saveGrowthPlan()
                        .then()
                        .catch();
                    }}
                  >
                    {!this.state.savingPlan ? (
                      "Save growth plan"
                    ) : (
                      <CircularProgress
                        size={24}
                        color="secondary"
                        style={{ root: { flex: 1 } }}
                      />
                    )}
                  </Button>
                  <TextField
                    error={this.state.errorInName}
                    style={{
                      // marginLeft: 5,
                      marginTop: 20,
                      marginBottom: 20,
                      width: "97%"
                    }}
                    required
                    defaultValue=" "
                    id="growthPlanName"
                    label="Plan name"
                    value={
                      Object.keys(this.state.growthPlan).length === 0 &&
                      this.state.growthPlan.constructor === Object
                        ? this.state.growthPlanName
                        : this.state.growthPlan.growthPlanGroup
                    }
                    onChange={event => {
                      Object.keys(this.state.growthPlan).length === 0 &&
                      this.state.growthPlan.constructor === Object
                        ? this.setState({
                            growthPlanName: event.target.value
                          })
                        : (this.state.growthPlan.growthPlanGroup =
                            event.target.value);
                      this.forceUpdate();
                    }}
                  />
                  <TextField
                    style={{
                      marginLeft: 5,
                      marginTop: 20,
                      marginBottom: 20,
                      width: "97%"
                    }}
                    multiline={true}
                    required
                    defaultValue=" "
                    id="growthPlanDescription"
                    label="Plan description"
                    value={
                      Object.keys(this.state.growthPlan).length === 0 &&
                      this.state.growthPlan.constructor === Object
                        ? this.state.growthPlanDescription
                        : this.state.growthPlan.growthPlanDescription
                    }
                    onChange={event => {
                      Object.keys(this.state.growthPlan).length === 0 &&
                      this.state.growthPlan.constructor === Object
                        ? this.setState({
                            growthPlanDescription: event.target.value
                          })
                        : (this.state.growthPlan.growthPlanDescription =
                            event.target.value);
                      this.forceUpdate();
                    }}
                  />

                  <p style={{ marginTop: 5, color: errorColor }}>
                    {this.state.errorText}
                  </p>
                  <br />
                  <div style={{ marginRight: 5 }}>
                    {this.state.growthPlan.phases.length === 0 ? (
                      <CircularProgress
                        color="primary"
                        style={{
                          marginLeft: "0%",
                          root: { flex: 1 },
                          textAlign: "center"
                        }}
                      />
                    ) : (
                      this.state.growthPlan.phases.map(one =>
                        this.renderWeeks(one)
                      )
                    )}
                  </div>
                </div>
              </Paper>
            </div>
          ) : (
            <div style={{ margin: 10 }}>
              <h1>Please log in first</h1>

              <Button
                variant="outlined"
                style={{ color: plantyColor, width: maxWidth }}
                onClick={() => {
                  this.setState({ toLogin: true });
                }}
              >
                Back to login
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  setExpanded = value => {
    this.setState({
      expanded: value
    });
  };

  handleChange = panel => (event, isExpanded) => {
    this.setExpanded(isExpanded ? panel : false);
  };

  setInnerExpanded = value => {
    this.setState({
      innerExpanded: value
    });
  };

  handleInnerChange = panel => (event, isExpanded) => {
    this.setInnerExpanded(isExpanded ? panel : false);
  };

  addWeek() {
    let currentWeeks;

    if (
      Object.keys(this.state.growthPlan).length === 0 &&
      this.state.growthPlan.constructor === Object
    ) {
      currentWeeks = [];
    } else {
      currentWeeks = this.state.growthPlan.phases;
    }

    // let currentWeeks;
    // console.log(currentWeeks);

    let newWeekNum = currentWeeks.length + 1;
    let fromDay = 0;

    if (currentWeeks.length === 0) {
      newWeekNum = 1;
      fromDay = 1;
    } else {
      fromDay = currentWeeks[currentWeeks.length - 1].toDay + 1;
    }

    let newWeek = {
      fromDay: fromDay,
      phaseName: "Week " + newWeekNum.toString(),
      subPhases: [
        {
          fromHour: 5,
          name: "Morning",
          soilHumidity: {
            max: 0.256,
            min: 0.1311
          },
          temperature: {
            max: 24,
            min: 18
          },
          toHour: 9,
          uvIntensity: {
            max: 10.2,
            min: 5.5
          }
        },
        {
          fromHour: 9,
          name: "Day",
          soilHumidity: {
            max: 0.356,
            min: 0.311
          },
          temperature: {
            max: 30,
            min: 18
          },
          toHour: 16,
          uvIntensity: {
            max: 27.2,
            min: 10.5
          }
        },
        {
          fromHour: 16,
          name: "Evening",
          soilHumidity: {
            max: 0.356,
            min: 0.311
          },
          temperature: {
            max: 13,
            min: 51
          },
          toHour: 24,
          uvIntensity: {
            max: 10.2,
            min: 4.5
          }
        },
        {
          fromHour: 24,
          name: "Night",
          soilHumidity: {
            max: 0.356,
            min: 0.311
          },
          temperature: {
            max: 24,
            min: 18
          },
          toHour: 5,
          uvIntensity: {
            max: 4.2,
            min: 3.5
          }
        }
      ],
      toDay: fromDay + 6
    };

    if (
      Object.keys(this.state.growthPlan).length === 0 &&
      this.state.growthPlan.constructor === Object
    ) {
      this.state.growthPlan = {
        growthPlanGroup: "NewPlan",
        phases: [],
        UUID: "none"
      };
      this.state.growthPlan.phases.push(newWeek);
    } else {
      this.state.growthPlan.phases.push(newWeek);
    }

    this.forceUpdate();
  }

  removeLastWeek = () => {
    this.state.growthPlan.phases.pop();

    this.forceUpdate();
  };

  async loadGrowthPlan() {
    this.setState({ growthPlan: { phases: [] } });

    let USER_TOKEN = this.state.user.signInUserSession.idToken.jwtToken;
    const AuthStr = "Bearer ".concat(USER_TOKEN);

    await axios
      .post(
        JSON.parse(process.env.REACT_APP_API_LINKS).apigatewayRoute +
          "/manageGrowthPlan",
        {
          planterName: this.state.planterName,
          username: this.state.customerUsername,
          action: "loadGrowthPlan"
        },
        {
          headers: { Authorization: AuthStr }
        }
      )
      .then(response => {
        // console.log(response.data);
        this.setState({ growthPlan: response.data });
      })
      .catch(error => {
        this.setState({ growthPlan: { phases: [] } });
        console.log("error " + error);

        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          error.toString(),
          "loadGrowthPlan"
        );
      });
  }

  async saveGrowthPlan() {
    //validations

    this.setState({ savingPlan: true, errorText: "" });

    if (Object.keys(this.state.growthPlan).length === 0) {
      //if no growthPlan
      if (this.state.growthPlanName === "") {
        this.setState({
          errorInName: true,
          errorText: "Name must not be empty"
        });
      } else {
        this.setState({ errorText: "Plan must have at least one week" });
      }

      return;
    } else {
      if (this.state.growthPlan.growthPlanGroup === "") {
        this.setState({
          errorInName: true,
          errorText: "Name must not be empty"
        });
        return;
      }
      if (this.state.growthPlan.phases.length === 0) {
        this.setState({ errorText: "Plan must have at least one week" });
        return;
      }
    }

    let USER_TOKEN = this.state.user.signInUserSession.idToken.jwtToken;
    const AuthStr = "Bearer ".concat(USER_TOKEN);

    await axios
      .post(
        JSON.parse(process.env.REACT_APP_API_LINKS).apigatewayRoute +
          "/manageGrowthPlan",
        {
          planterName: this.state.planterName,
          username: this.state.customerUsername,
          action: "updateGrowthPlan",
          newPlan: this.state.growthPlan
        },
        {
          headers: { Authorization: AuthStr }
        }
      )
      .then(response => {
        this.setState({ savingPlan: false });
        this.loadGrowthPlan();
        WS.sendMessage(
          "FROM_WEB;" + this.state.planterUUID + ";RELOAD_GROWTH_PLAN"
        );
      })
      .catch(error => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          error.toString(),
          "saveGrowthPlan"
        );
        this.setState({ growthPlan: { phases: [] }, savingPlan: false });
      });
  }

  renderWeeks(oneWeek) {
    let weekColor = "inherit";
    let dayColor = "#e8f5e9";

    let number = oneWeek.phaseName.replace("Week ", "");

    let panel = "panel" + number;

    if (this.state.expanded === panel) {
      weekColor = "#a5d6a7";
    }
    return (
      <ExpansionPanel
        style={{ width: "97%", backgroundColor: weekColor }}
        expanded={this.state.expanded === panel}
        onChange={this.handleChange(panel)}
        key={oneWeek.phaseName}
        // style={styles.week}
        // title={oneWeek.phaseName}
      >
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id={"week" + number}
        >
          <Typography
            style={{ flexBasis: "33.33%", flexShrink: 0 }}
            style={
              parseInt(oneWeek.phaseName.replace("Week ", "")) ===
              this.state.currentWeek
                ? { flexBasis: "33.33%", flexShrink: 0, color: plantyColor }
                : { flexBasis: "33.33%", flexShrink: 0 }
            }
          >
            {parseInt(oneWeek.phaseName.replace("Week ", "")) ===
            this.state.currentWeek
              ? oneWeek.phaseName + " - Current"
              : oneWeek.phaseName}
          </Typography>
          <Typography style={{ color: "gray" }}>
            From day {oneWeek.fromDay} to day {oneWeek.toDay}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails style={{}}>
          <div style={{ width: "100%", display: "inline-block" }}>
            <ExpansionPanel
              style={{ width: "100%" }}
              expanded={this.state.innerExpanded === "morning"}
              onChange={this.handleInnerChange("morning")}
            >
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id={"morning" + number}
              >
                <Typography style={{ flexBasis: "33.33%", flexShrink: 0 }}>
                  Morning
                </Typography>
                <Typography style={{ color: "gray" }}>
                  From {oneWeek.subPhases[0].fromHour} to{" "}
                  {oneWeek.subPhases[0].toHour}
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <div
                  style={{
                    width: "100%",
                    display: "inline-block",
                    // borderRight: "1px solid black",
                    // backgroundColor: "yellow",
                    margin: "5px"
                  }}
                >
                  <h4 style={{ margin: 15, marginTop: -3 }}>Temperature:</h4>
                  <br />
                  <div
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      display: "inline"
                    }}
                  >
                    {isMobile ? "" : 15}
                    <Slider
                      style={{ width: "50%", marginLeft: 25, marginRight: 25 }}
                      value={[
                        oneWeek.subPhases[0].temperature.min,
                        oneWeek.subPhases[0].temperature.max
                      ]}
                      // onChange={this.handleSliderChange}
                      onChange={(event, newValue) => {
                        // console.log(event);

                        oneWeek.subPhases[0].temperature.min = newValue[0];
                        // this.forceUpdate();
                        oneWeek.subPhases[0].temperature.max = newValue[1];
                        this.forceUpdate();
                      }}
                      valueLabelDisplay="auto"
                      aria-labelledby="range-slider"
                      min={15}
                      max={35}
                      getAriaValueText={this.valueTempText}
                    />
                    {isMobile ? "" : 35}
                  </div>
                </div>
                <div style={{ width: "100%" }}>
                  <h4 style={{ margin: 15, marginTop: -3 }}>UV:</h4>
                  <br />
                  <div
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      display: "inline"
                    }}
                  >
                    {isMobile ? "" : 0}
                    <Slider
                      style={{ width: "60%", marginLeft: 25, marginRight: 25 }}
                      // value={[
                      //   oneWeek.subPhases[0].uvIntensity.min,
                      //   oneWeek.subPhases[0].uvIntensity.max
                      // ]}
                      value={[
                        oneWeek.subPhases[0].uvIntensity.min
                        // oneWeek.subPhases[0].uvIntensity.max
                      ]}
                      onChange={(event, newValue) => {
                        oneWeek.subPhases[0].uvIntensity.min = newValue[0];
                        this.forceUpdate();
                      }}
                      valueLabelDisplay="auto"
                      aria-labelledby="range-slider"
                      min={0}
                      max={400}
                      step={10}
                      // getAriaValueText={this.valueTempText}
                    />
                    {isMobile ? "" : 400}
                    {/*<p style={{ marginTop: 20 }}>35</p>*/}
                  </div>
                </div>
                <div
                  style={{
                    width: "100%",
                    display: "inline-block",
                    // borderLeft: "1px solid black",
                    // backgroundColor: "yellow",
                    padding: "5px"
                  }}
                >
                  <h4 style={{ margin: 15, marginTop: -3 }}>Humidity:</h4>
                  <br />
                  <div
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      display: "inline"
                    }}
                  >
                    {isMobile ? "" : 0}
                    <Slider
                      style={{ width: "60%", marginLeft: 25, marginRight: 25 }}
                      value={[
                        oneWeek.subPhases[0].soilHumidity.min * 100,
                        oneWeek.subPhases[0].soilHumidity.max * 100
                      ]}
                      // onChange={this.handleSliderChange}
                      onChange={(event, newValue) => {
                        // console.log(event);

                        oneWeek.subPhases[0].soilHumidity.min =
                          newValue[0] / 100;
                        // this.forceUpdate();
                        oneWeek.subPhases[0].soilHumidity.max =
                          newValue[1] / 100;
                        this.forceUpdate();
                      }}
                      valueLabelDisplay="auto"
                      aria-labelledby="range-slider"
                      min={0}
                      max={100}
                      getAriaValueText={this.valueHumidText}
                    />
                    {isMobile ? "" : 100}
                    {/*<p style={{ marginTop: 20 }}>35</p>*/}
                  </div>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <div style={{ clear: "both" }} />
            <ExpansionPanel
              style={{ width: "100%" }}
              expanded={this.state.innerExpanded === "day"}
              onChange={this.handleInnerChange("day")}
            >
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id={"day" + number}
              >
                <Typography style={{ flexBasis: "33.33%", flexShrink: 0 }}>
                  Day
                </Typography>
                <Typography style={{ color: "gray" }}>
                  From {oneWeek.subPhases[1].fromHour} to{" "}
                  {oneWeek.subPhases[1].toHour}
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <div
                  style={{
                    width: "100%",
                    display: "inline-block",
                    // borderRight: "1px solid black",
                    // backgroundColor: "yellow",
                    margin: "5px"
                  }}
                >
                  <h4 style={{ margin: 15, marginTop: -3 }}>Temperature:</h4>
                  <br />
                  <div
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      display: "inline"
                    }}
                  >
                    {isMobile ? "" : 15}
                    <Slider
                      style={{ width: "60%", marginLeft: 25, marginRight: 25 }}
                      value={[
                        oneWeek.subPhases[1].temperature.min,
                        oneWeek.subPhases[1].temperature.max
                      ]}
                      // onChange={this.handleSliderChange}
                      onChange={(event, newValue) => {
                        // console.log(event);

                        oneWeek.subPhases[1].temperature.min = newValue[0];
                        // this.forceUpdate();
                        oneWeek.subPhases[1].temperature.max = newValue[1];
                        this.forceUpdate();
                      }}
                      valueLabelDisplay="auto"
                      aria-labelledby="range-slider"
                      min={15}
                      max={35}
                      getAriaValueText={this.valueTempText}
                    />
                    {isMobile ? "" : 35}
                    {/*<p style={{ marginTop: 20 }}>35</p>*/}
                  </div>
                </div>
                <div style={{ width: "100%" }}>
                  <h4 style={{ margin: 15, marginTop: -3 }}>UV:</h4>
                  <br />
                  <div
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      display: "inline"
                    }}
                  >
                    {isMobile ? "" : 0}
                    <Slider
                      style={{ width: "60%", marginLeft: 25, marginRight: 25 }}
                      value={[
                        oneWeek.subPhases[1].uvIntensity.min
                        // oneWeek.subPhases[1].uvIntensity.max
                      ]}
                      // onChange={this.handleSliderChange}
                      onChange={(event, newValue) => {
                        // console.log(event);

                        oneWeek.subPhases[1].uvIntensity.min = newValue[0];
                        // this.forceUpdate();
                        // oneWeek.subPhases[1].uvIntensity.max = newValue[1];
                        this.forceUpdate();
                      }}
                      valueLabelDisplay="auto"
                      aria-labelledby="range-slider"
                      min={0}
                      max={400}
                      step={10}
                      // getAriaValueText={this.valueTempText}
                    />
                    {isMobile ? "" : 400}
                    {/*<p style={{ marginTop: 20 }}>35</p>*/}
                  </div>
                </div>
                <div
                  style={{
                    width: "100%",
                    display: "inline-block",
                    // borderLeft: "1px solid black",
                    // backgroundColor: "yellow",
                    padding: "5px"
                  }}
                >
                  <h4 style={{ margin: 15, marginTop: -3 }}>Humidity:</h4>
                  <br />
                  <div
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      display: "inline"
                    }}
                  >
                    {isMobile ? "" : 0}
                    <Slider
                      style={{ width: "60%", marginLeft: 25, marginRight: 25 }}
                      value={[
                        oneWeek.subPhases[1].soilHumidity.min * 100,
                        oneWeek.subPhases[1].soilHumidity.max * 100
                      ]}
                      // onChange={this.handleSliderChange}
                      onChange={(event, newValue) => {
                        // console.log(event);

                        oneWeek.subPhases[1].soilHumidity.min =
                          newValue[0] / 100;
                        // this.forceUpdate();
                        oneWeek.subPhases[1].soilHumidity.max =
                          newValue[1] / 100;
                        this.forceUpdate();
                      }}
                      valueLabelDisplay="auto"
                      aria-labelledby="range-slider"
                      min={0}
                      max={100}
                      getAriaValueText={this.valueHumidText}
                    />
                    {isMobile ? "" : 100}
                    {/*<p style={{ marginTop: 20 }}>35</p>*/}
                  </div>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
              style={{ width: "100%" }}
              expanded={this.state.innerExpanded === "evening"}
              onChange={this.handleInnerChange("evening")}

              // key={oneWeek.name}
              // style={styles.week}
              // title={oneWeek.phaseName}
            >
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id={"evening" + number}
              >
                <Typography style={{ flexBasis: "33.33%", flexShrink: 0 }}>
                  Evening
                </Typography>
                <Typography style={{ color: "gray" }}>
                  From {oneWeek.subPhases[2].fromHour} to{" "}
                  {oneWeek.subPhases[2].toHour}
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <div
                  style={{
                    width: "100%",
                    display: "inline-block",
                    // borderRight: "1px solid black",
                    // backgroundColor: "yellow",
                    margin: "5px"
                  }}
                >
                  <h4 style={{ margin: 15, marginTop: -3 }}>Temperature:</h4>
                  <br />
                  <div
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      display: "inline"
                    }}
                  >
                    {isMobile ? "" : 15}
                    <Slider
                      style={{ width: "60%", marginLeft: 25, marginRight: 25 }}
                      value={[
                        oneWeek.subPhases[2].temperature.min,
                        oneWeek.subPhases[2].temperature.max
                      ]}
                      // onChange={this.handleSliderChange}
                      onChange={(event, newValue) => {
                        // console.log(event);

                        oneWeek.subPhases[2].temperature.min = newValue[0];
                        // this.forceUpdate();
                        oneWeek.subPhases[2].temperature.max = newValue[1];
                        this.forceUpdate();
                      }}
                      valueLabelDisplay="auto"
                      aria-labelledby="range-slider"
                      min={15}
                      max={35}
                      getAriaValueText={this.valueTempText}
                    />
                    {isMobile ? "" : 35}
                    {/*<p style={{ marginTop: 20 }}>35</p>*/}
                  </div>
                </div>
                <div style={{ width: "100%" }}>
                  <h4 style={{ margin: 15, marginTop: -3 }}>UV:</h4>
                  <br />
                  <div
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      display: "inline"
                    }}
                  >
                    {isMobile ? "" : 0}
                    <Slider
                      style={{ width: "60%", marginLeft: 25, marginRight: 25 }}
                      value={[
                        oneWeek.subPhases[2].uvIntensity.min
                        // oneWeek.subPhases[2].uvIntensity.max
                      ]}
                      // onChange={this.handleSliderChange}
                      onChange={(event, newValue) => {
                        // console.log(event);

                        oneWeek.subPhases[2].uvIntensity.min = newValue[0];
                        // this.forceUpdate();
                        // oneWeek.subPhases[2].uvIntensity.max = newValue[1];
                        this.forceUpdate();
                      }}
                      valueLabelDisplay="auto"
                      aria-labelledby="range-slider"
                      min={0}
                      max={400}
                      step={10}
                      // getAriaValueText={this.valueTempText}
                    />
                    {isMobile ? "" : 400}
                    {/*<p style={{ marginTop: 20 }}>35</p>*/}
                  </div>
                </div>
                <div
                  style={{
                    width: "100%",
                    display: "inline-block",
                    // borderLeft: "1px solid black",
                    // backgroundColor: "yellow",
                    padding: "5px"
                  }}
                >
                  <h4 style={{ margin: 15, marginTop: -3 }}>Humidity:</h4>
                  <br />
                  <div
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      display: "inline"
                    }}
                  >
                    {isMobile ? "" : 0}
                    <Slider
                      style={{ width: "60%", marginLeft: 25, marginRight: 25 }}
                      value={[
                        oneWeek.subPhases[2].soilHumidity.min * 100,
                        oneWeek.subPhases[2].soilHumidity.max * 100
                      ]}
                      // onChange={this.handleSliderChange}
                      onChange={(event, newValue) => {
                        // console.log(event);

                        oneWeek.subPhases[2].soilHumidity.min =
                          newValue[0] / 100;
                        // this.forceUpdate();
                        oneWeek.subPhases[2].soilHumidity.max =
                          newValue[1] / 100;
                        this.forceUpdate();
                      }}
                      valueLabelDisplay="auto"
                      aria-labelledby="range-slider"
                      min={0}
                      max={100}
                      getAriaValueText={this.valueHumidText}
                    />
                    {isMobile ? "" : 100}
                    {/*<p style={{ marginTop: 20 }}>35</p>*/}
                  </div>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
              style={{ width: "100%" }}
              expanded={this.state.innerExpanded === "night"}
              onChange={this.handleInnerChange("night")}
            >
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id={"night" + number}
              >
                <Typography style={{ flexBasis: "33.33%", flexShrink: 0 }}>
                  Night
                </Typography>
                <Typography style={{ color: "gray" }}>
                  From {oneWeek.subPhases[3].fromHour} to{" "}
                  {oneWeek.subPhases[3].toHour}
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <div
                  style={{
                    width: "100%",
                    display: "inline-block",
                    // borderRight: "1px solid black",
                    // backgroundColor: "yellow",
                    margin: "5px"
                  }}
                >
                  <h4 style={{ margin: 15, marginTop: -3 }}>Temperature:</h4>
                  <br />
                  <div
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      display: "inline"
                    }}
                  >
                    {isMobile ? "" : 15}
                    <Slider
                      style={{ width: "60%", marginLeft: 25, marginRight: 25 }}
                      value={[
                        oneWeek.subPhases[3].temperature.min,
                        oneWeek.subPhases[3].temperature.max
                      ]}
                      // onChange={this.handleSliderChange}
                      onChange={(event, newValue) => {
                        // console.log(event);

                        oneWeek.subPhases[3].temperature.min = newValue[0];
                        // this.forceUpdate();
                        oneWeek.subPhases[3].temperature.max = newValue[1];
                        this.forceUpdate();
                      }}
                      valueLabelDisplay="auto"
                      aria-labelledby="range-slider"
                      min={15}
                      max={35}
                      getAriaValueText={this.valueTempText}
                    />
                    {isMobile ? "" : 35}
                    {/*<p style={{ marginTop: 20 }}>35</p>*/}
                  </div>
                </div>
                <div style={{ width: "100%" }}>
                  <h4 style={{ margin: 15, marginTop: -3 }}>UV:</h4>
                  <br />
                  <div
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      display: "inline"
                    }}
                  >
                    {isMobile ? "" : 0}
                    <Slider
                      style={{ width: "60%", marginLeft: 25, marginRight: 25 }}
                      value={[
                        oneWeek.subPhases[3].uvIntensity.min
                        // oneWeek.subPhases[3].uvIntensity.max
                      ]}
                      // onChange={this.handleSliderChange}
                      onChange={(event, newValue) => {
                        // console.log(event);

                        oneWeek.subPhases[3].uvIntensity.min = newValue[0];
                        // this.forceUpdate();
                        // oneWeek.subPhases[3].uvIntensity.max = newValue[1];
                        this.forceUpdate();
                      }}
                      valueLabelDisplay="auto"
                      aria-labelledby="range-slider"
                      min={0}
                      max={400}
                      step={10}
                      // getAriaValueText={this.valueTempText}
                    />
                    {isMobile ? "" : 400}
                    {/*<p style={{ marginTop: 20 }}>35</p>*/}
                  </div>
                </div>
                <div
                  style={{
                    width: "100%",
                    display: "inline-block",
                    // borderLeft: "1px solid black",
                    // backgroundColor: "yellow",
                    padding: "5px"
                  }}
                >
                  <h4 style={{ margin: 15, marginTop: -3 }}>Humidity:</h4>
                  <br />
                  <div
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "100%",
                      display: "inline"
                    }}
                  >
                    {isMobile ? "" : 0}
                    <Slider
                      style={{ width: "60%", marginLeft: 25, marginRight: 25 }}
                      value={[
                        oneWeek.subPhases[3].soilHumidity.min * 100,
                        oneWeek.subPhases[3].soilHumidity.max * 100
                      ]}
                      // onChange={this.handleSliderChange}
                      onChange={(event, newValue) => {
                        // console.log(event);

                        oneWeek.subPhases[3].soilHumidity.min =
                          newValue[0] / 100;
                        // this.forceUpdate();
                        oneWeek.subPhases[3].soilHumidity.max =
                          newValue[1] / 100;
                        this.forceUpdate();
                      }}
                      valueLabelDisplay="auto"
                      aria-labelledby="range-slider"
                      min={0}
                      max={100}
                      getAriaValueText={this.valueHumidText}
                    />
                    {isMobile ? "" : 100}
                    {/*<p style={{ marginTop: 20 }}>35</p>*/}
                  </div>
                </div>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }

  renderWeekGraphs = () => {
    let playerHeight = 800;
    let float = "left";
    let videoWidth = this.state.width - 100;
    // console.log(isMacintosh());

    let maxWidth = 0;

    if (isMacintosh()) {
      maxWidth = this.state.width / 3 - 50;
    } else {
      //console.log("windows");
      maxWidth = this.state.width / 3 - 50;
    }

    if (isMobile) {
      playerHeight = 300;
      float = "none";
      videoWidth = this.state.width - 20;
      maxWidth = this.state.width - 30;
    }

    return (
      <div>
        <Paper
          style={{
            margin: 10,
            width: maxWidth,
            float: float
          }}
        >
          <Typography style={{ padding: 10 }} variant="p" component="h3">
            Temperature over this week
          </Typography>

          <AreaChart
            width={maxWidth}
            height={300}
            data={this.state.dataForTempWeekly}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor={plantyColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={plantyColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={plantyColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis label="" dataKey="label" />
            <YAxis label="" />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="min"
              stopColor={plantyColor}
              fillOpacity={1}
              stroke={plantyColor}
              fill="url(#colorUv)"
            />
            <Area
              type="monotone"
              dataKey="avg"
              stroke="#81c784"
              fillOpacity={0.5}
              fill="#81c784"
            />
            <Area
              type="monotone"
              dataKey="max"
              fillOpacity={0.5}
              stroke="#c8e6c9"
              fill="#c8e6c9"
            />
          </AreaChart>
          {/*</Card>*/}
        </Paper>
        <Paper
          style={{
            margin: 10,
            width: maxWidth,
            float: float
          }}
        >
          <Typography style={{ padding: 10 }} variant="p" component="h3">
            UV over this week
          </Typography>

          <AreaChart
            width={maxWidth}
            height={300}
            data={this.state.dataForUvIntensityWeekly}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor={plantyColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={plantyColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={plantyColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis label="" dataKey="label" />
            <YAxis label="" />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="min"
              stopColor={plantyColor}
              fillOpacity={1}
              stroke={plantyColor}
              fill="url(#colorUv)"
            />
            <Area
              type="monotone"
              dataKey="avg"
              stroke="#81c784"
              fillOpacity={0.5}
              fill="#81c784"
            />
            <Area
              type="monotone"
              dataKey="max"
              fillOpacity={0.5}
              stroke="#c8e6c9"
              fill="#c8e6c9"
            />
          </AreaChart>
        </Paper>
        <Paper
          style={{
            margin: 10,
            width: maxWidth,
            float: float
          }}
        >
          <Typography style={{ padding: 10 }} variant="p" component="h3">
            Humidity over this week
          </Typography>

          <AreaChart
            width={maxWidth}
            height={300}
            data={this.state.dataForSoilHumidityWeekly}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor={plantyColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor={plantyColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={plantyColor} stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis label="" dataKey="label" />
            <YAxis label="" />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="min"
              stopColor={plantyColor}
              fillOpacity={1}
              stroke={plantyColor}
              fill="url(#colorUv)"
            />
            <Area
              type="monotone"
              dataKey="avg"
              stroke="#81c784"
              fillOpacity={0.5}
              fill="#81c784"
            />
            <Area
              type="monotone"
              dataKey="max"
              fillOpacity={0.5}
              stroke="#c8e6c9"
              fill="#c8e6c9"
            />
          </AreaChart>
        </Paper>
      </div>
    );
  };

  async acknowledgeShipment() {
    let USER_TOKEN = this.state.user.signInUserSession.idToken.jwtToken;
    const AuthStr = "Bearer ".concat(USER_TOKEN);

    await axios
      .post(
        JSON.parse(process.env.REACT_APP_API_LINKS).apigatewayRoute +
          "/sendingPlanter",
        {
          UUID: this.state.planterUUID,
          action: "sent",
          username: this.state.customerUsername
        },
        {
          headers: { Authorization: AuthStr }
        }
      )
      .then(response => {
        this.setState({ loadingSendingPlanter: false });
        this.loadPlanter()
          .then()
          .catch();
      })
      .catch(error => {
        console.log("error " + error);
        this.setState({ loadingSendingPlanter: false });
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          error.toString(),
          "loadPlanter"
        );
      });
  }

  renderSendPlanter() {
    if (this.state.planter.askedToSend === "requested") {
      return (
        <Paper style={{ margin: 10 }}>
          <Alert severity="warning">User requested to ship this planter</Alert>
          <div style={{ margin: 10 }}>
            <h5>Shipment Details:</h5>
            <p style={{ marginTop: 10 }}>
              Name: {<b>{this.state.planter.sendDetails.name}</b>}
            </p>
            <p style={{ marginTop: 10 }}>
              Phone: {<b>{this.state.planter.sendDetails.phoneNumber}</b>}
            </p>
            <p style={{ marginTop: 10 }}>
              Address: {<b>{this.state.planter.sendDetails.address}</b>}
            </p>
            <p style={{ marginTop: 10 }}>
              Instructions:{" "}
              {<b>{this.state.planter.sendDetails.instructions}</b>}
            </p>
            <Button
              style={{
                margin: 10,
                width: 300,
                padding: -10
              }}
              variant="contained"
              color="primary"
              disabled={this.state.heaterTurnedOn}
              onClick={() => {
                this.setState({ loadingSendingPlanter: true });
                this.acknowledgeShipment()
                  .then()
                  .catch();
              }}
            >
              {!this.state.loadingSendingPlanter ? (
                "Acknowledge shipment"
              ) : (
                <CircularProgress
                  size={24}
                  color="secondary"
                  style={{ root: { flex: 1 } }}
                />
              )}
            </Button>
          </div>
        </Paper>
      );
    } else if (this.state.planter.askedToSend === "sent") {
      return <Alert severity="warning">This planter was shipped to user</Alert>;
    } else return <div />;
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
