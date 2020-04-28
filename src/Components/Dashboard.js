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
// import Consts from "../ENV_VARS";
// import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import {
  Card,
  Paper,
  CardActionArea,
  CardContent,
  CardMedia,
  Toolbar,
  Typography,
  Button,
  IconButton
} from "@material-ui/core";
import { Redirect } from "react-router-dom";
import Amplify, { Auth, Storage } from "aws-amplify";
// import awsconfig from "../aws-exports";
//import { instanceOf } from "prop-types";
//import { Cookies } from "react-cookie";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import axios from "axios";
import CardActions from "@material-ui/core/CardActions";
import LinearProgress from "@material-ui/core/LinearProgress";
import UserPage from "./UserPage";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Link from "@material-ui/core/Link";
import Avatar from "@material-ui/core/Avatar";
import { BrowserView, isMobile } from "react-device-detect";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
// import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Slider from "@material-ui/core/Slider";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormGroup from "@material-ui/core/FormGroup";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const plantyColor = "#6f9e04";
const errorColor = "#ee3e34";

class Dashboard extends React.Component {
  // static propTypes = {
  //   cookies: instanceOf(Cookies).isRequired
  // };

  constructor(props) {
    super(props);
    this.state = {
      growthPlans: [],
      classes: null,
      width: 0,
      height: 0,
      toLogin: false,
      toRegister: false,
      user: null,
      systemUsers: [],
      selectedUser: "none",
      growthPlanActive: false,
      growthPlan: {},
      expanded: "",
      innerExpanded: "",
      errorInName: false,
      isExpanded: false,
      selectedGrowthPlan: "",
      growthPlanName: "",
      savingPlan: false,
      errorText: ""
    };
    Amplify.configure(JSON.parse(process.env.REACT_APP_CONFIG_AWS));
  }

  valueTempText(value) {
    return `${value}°C`;
  }

  valueHumidText(value) {
    return `${value}%`;
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
        this.setState({ user: user });
        this.props.addUser(user);
        this.loadAllData()
          .then()
          .catch();
      })
      .catch(err => console.log(err));

    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  async loadAllData() {
    let USER_TOKEN = "";
    USER_TOKEN = this.state.user.signInUserSession.idToken.jwtToken;
    this.state.USER_TOKEN = USER_TOKEN;

    const AuthStr = "Bearer ".concat(this.state.USER_TOKEN);
    await axios
      .post(
        JSON.parse(process.env.REACT_APP_API_LINKS).apigatewayRoute +
          "/getAllUsers",
        {},
        {
          headers: { Authorization: AuthStr }
        }
      )
      .then(response => {
        // console.log(response);
        this.dealWithUserData(response.data);
      })
      .catch(error => {
        console.log("error " + error);
      });

    await axios
      .post(
        JSON.parse(process.env.REACT_APP_API_LINKS).apigatewayRoute +
          "/growthPlans",
        {},
        {
          headers: { Authorization: AuthStr }
        }
      )
      .then(response => {
        console.log(response.data.Items);
        this.setState({
          growthPlans: response.data.Items,
          growthPlan: this.state.growthPlans[0]
        });
        // this.dealWithUserData(response.data);
      })
      .catch(error => {
        console.log("error " + error);
      });
  }

  dealWithUserData(sentData) {
    let users = [];

    sentData.TableNames.map(one => {
      if (one.endsWith("_Planters")) {
        let userAvatarKey =
          "user_avatars/" + one.replace("_Planters", "") + "_avatar.jpeg";
        Storage.get(userAvatarKey, {
          level: "public",
          type: "image/jpg"
          // bucket: 'plant-pictures-planty',
          // region: 'eu',
        })
          .then(data => {
            let newOne = {
              name: one.replace("_Planters", ""),
              pic: data
            };
            users.push(newOne);
            // console.log(data);
          })
          .then(() => this.setState({ systemUsers: users }))
          .catch(error => console.log(error));
      }
    });
  }

  async deleteGrowthPlan() {
    const AuthStr = "Bearer ".concat(this.state.USER_TOKEN);
    await axios
      .post(
        JSON.parse(process.env.REACT_APP_API_LINKS).apigatewayRoute +
          "/manageGrowthPlans",
        {
          action: "deleteGrowthPlan",
          // growthPlanGroup: this.state.growthPlan.growthPlanGroup,
          // phases: this.state.growthPlan.phases,
          UUID: this.state.growthPlan.UUID
        },
        {
          headers: { Authorization: AuthStr }
        }
      )
      .then(response => {
        this.setState({ savingPlan: false });
        console.log(response.data);
        this.loadAllData()
          .then()
          .catch();
      })
      .catch(error => {
        console.log("error " + error);
        this.setState({ growthPlan: {}, savingPlan: false });
      });
  }

  async saveGrowthPlan() {
    this.setState({ savingPlan: true, errorText: "" });

    // let USER_TOKEN = this.props.plantyData.myCognitoUser.signInUserSession
    //   .idToken.jwtToken;
    const AuthStr = "Bearer ".concat(this.state.USER_TOKEN);

    if (this.state.growthPlan.UUID === "none") {
      console.log(this.state.growthPlan.phases);
      console.log(this.state.growthPlan.UUID);
      console.log(this.state.growthPlan.growthPlanGroup);
      await axios
        .post(
          JSON.parse(process.env.REACT_APP_API_LINKS).apigatewayRoute +
            "/manageGrowthPlans",
          {
            action: "addGrowthPlan",
            growthPlanGroup: this.state.growthPlan.growthPlanGroup,
            phases: this.state.growthPlan.phases,
            UUID: this.state.growthPlan.UUID
          },
          {
            headers: { Authorization: AuthStr }
          }
        )
        .then(response => {
          this.setState({ savingPlan: false });
          console.log(response.data);
          this.loadAllData()
            .then()
            .catch();
        })
        .catch(error => {
          console.log("error " + error);
          this.setState({ growthPlan: {}, savingPlan: false });
        });
    } else {
      //validations
      // this.setState({ savingPlan: false });
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

      console.log(this.state.growthPlan.phases);
      console.log(this.state.growthPlan.UUID);
      console.log(this.state.growthPlan.growthPlanGroup);
      await axios
        .post(
          JSON.parse(process.env.REACT_APP_API_LINKS).apigatewayRoute +
            "/manageGrowthPlans",
          {
            action: "saveGrowthPlan",
            growthPlanGroup: this.state.growthPlan.growthPlanGroup,
            phases: this.state.growthPlan.phases,
            UUID: this.state.growthPlan.UUID
          },
          {
            headers: { Authorization: AuthStr }
          }
        )
        .then(response => {
          this.setState({ savingPlan: false });
          console.log(response.data);
          this.setState({
            // growthPlans: response.data.Items,
            // growthPlan: this.state.growthPlans[0]
          });
          // this.dealWithUserData(response.data);
        })
        .catch(error => {
          console.log("error " + error);
          this.setState({ growthPlan: {}, savingPlan: false });
        });
    }
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
      fromDay = currentWeeks[currentWeeks.length - 1].toDay;
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

  newGrowthPlan = () => {
    this.setState({
      growthPlan: {
        growthPlanGroup: "New Plan",
        phases: [],
        UUID: "none"
      }
    });
  };

  renderUsers = user => {
    //

    return (
      <Card
        onClick={() => {
          this.setState({ selectedUser: user.name });
        }}
        key={user.name}
        style={{ float: "left", margin: 10, maxWidth: 345 }}
      >
        <CardActionArea>
          <CardMedia
            style={{
              height: 140
            }}
            image={user.pic}
            title="Contemplative Reptile"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {user.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              One cool user
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  renderGrowthPlan(one) {
    if (!one) {
      return <div />;
    }

    return (
      <Card
        onClick={() => {
          this.setState({ growthPlan: one });
          this.setState({ growthPlanActive: true });
        }}
        key={one.UUID}
        style={{ float: "left", margin: 10, maxWidth: 345 }}
      >
        <CardActionArea>
          <CardMedia
            style={{
              height: 250
            }}
            image={require("../Images/good-growth-plan.png")}
            // title="Contemplative Reptile"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {one.growthPlanGroup}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              One cool growth plan lasting {one.phases.length} weeks
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    );
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
          <Typography style={{ flexBasis: "33.33%", flexShrink: 0 }}>
            Week {number}
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
                    15
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
                    35
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
                    0
                    <Slider
                      style={{ width: "60%", marginLeft: 25, marginRight: 25 }}
                      value={[
                        oneWeek.subPhases[0].uvIntensity.min,
                        oneWeek.subPhases[0].uvIntensity.max
                      ]}
                      // onChange={this.handleSliderChange}
                      onChange={(event, newValue) => {
                        // console.log(event);

                        oneWeek.subPhases[0].uvIntensity.min = newValue[0];
                        // this.forceUpdate();
                        oneWeek.subPhases[0].uvIntensity.max = newValue[1];
                        this.forceUpdate();
                      }}
                      valueLabelDisplay="auto"
                      aria-labelledby="range-slider"
                      min={0}
                      max={30}
                      // getAriaValueText={this.valueTempText}
                    />
                    30
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
                    0
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
                    100
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
                    15
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
                    35
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
                    0
                    <Slider
                      style={{ width: "60%", marginLeft: 25, marginRight: 25 }}
                      value={[
                        oneWeek.subPhases[1].uvIntensity.min,
                        oneWeek.subPhases[1].uvIntensity.max
                      ]}
                      // onChange={this.handleSliderChange}
                      onChange={(event, newValue) => {
                        // console.log(event);

                        oneWeek.subPhases[1].uvIntensity.min = newValue[0];
                        // this.forceUpdate();
                        oneWeek.subPhases[1].uvIntensity.max = newValue[1];
                        this.forceUpdate();
                      }}
                      valueLabelDisplay="auto"
                      aria-labelledby="range-slider"
                      min={0}
                      max={30}
                      // getAriaValueText={this.valueTempText}
                    />
                    30
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
                    0
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
                    100
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
                    15
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
                    35
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
                    0
                    <Slider
                      style={{ width: "60%", marginLeft: 25, marginRight: 25 }}
                      value={[
                        oneWeek.subPhases[2].uvIntensity.min,
                        oneWeek.subPhases[2].uvIntensity.max
                      ]}
                      // onChange={this.handleSliderChange}
                      onChange={(event, newValue) => {
                        // console.log(event);

                        oneWeek.subPhases[2].uvIntensity.min = newValue[0];
                        // this.forceUpdate();
                        oneWeek.subPhases[2].uvIntensity.max = newValue[1];
                        this.forceUpdate();
                      }}
                      valueLabelDisplay="auto"
                      aria-labelledby="range-slider"
                      min={0}
                      max={30}
                      // getAriaValueText={this.valueTempText}
                    />
                    30
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
                    0
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
                    100
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
                    15
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
                    35
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
                    0
                    <Slider
                      style={{ width: "60%", marginLeft: 25, marginRight: 25 }}
                      value={[
                        oneWeek.subPhases[3].uvIntensity.min,
                        oneWeek.subPhases[3].uvIntensity.max
                      ]}
                      // onChange={this.handleSliderChange}
                      onChange={(event, newValue) => {
                        // console.log(event);

                        oneWeek.subPhases[3].uvIntensity.min = newValue[0];
                        // this.forceUpdate();
                        oneWeek.subPhases[3].uvIntensity.max = newValue[1];
                        this.forceUpdate();
                      }}
                      valueLabelDisplay="auto"
                      aria-labelledby="range-slider"
                      min={0}
                      max={30}
                      // getAriaValueText={this.valueTempText}
                    />
                    30
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
                    0
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
                    100
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

  render() {
    // return <div />;

    if (this.state.selectedUser !== "none") {
      return <Redirect to={`/users/${this.state.selectedUser}`} />;
    }

    if (this.state.toLogin === true) {
      return <Redirect to="/login" />;
    }

    if (this.state.systemUsers === [] || this.state.growthPlan === {}) {
      return <LinearProgress style={{ width: "100%" }} />;
    }

    let growthPlanName = "";

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
                    <Button
                      variant="outlined"
                      style={{ marginLeft: 20 }}
                      color="inherit"
                      onClick={() => {
                        console.log("aaaaa");
                        Auth.signOut()
                          .then(data => console.log(data))
                          .catch(err => console.log(err));

                        this.setState({ user: null, toLogin: true });
                      }}
                    >
                      Log Out
                    </Button>
                  </Typography>
                </div>
              )}
            </Toolbar>
          </AppBar>
          {this.state.user ? (
            <div>
              <Breadcrumbs style={{ margin: 10 }} aria-label="breadcrumb">
                <Link
                  color="inherit"
                  href="/dashboard"
                  // onClick={handleClick}
                >
                  Dashboard
                </Link>
                {/*<Link*/}
                {/*  color="inherit"*/}
                {/*  href="/getting-started/installation/"*/}
                {/*  // onClick={handleClick}*/}
                {/*>*/}
                {/*  Core*/}
                {/*</Link>*/}
                {/*<Typography color="textPrimary">Breadcrumb</Typography>*/}
              </Breadcrumbs>
              {!this.state.growthPlanActive ? (
                <div>
                  <h1 style={{ margin: 10 }}>All Users</h1>
                  <div style={{ margin: 10 }}>
                    {this.state.systemUsers.map(one => this.renderUsers(one))}
                  </div>
                  <div style={{ clear: "both" }} />
                  <h1 style={{ margin: 10 }}>All growth plans</h1>
                  <Button
                    variant="outlined"
                    style={{ color: plantyColor, margin: 10 }}
                    onClick={() => {
                      this.setState({ dialogOpen: true });

                      this.newGrowthPlan();
                      // this.setState({ growthPlanActive: true });  onClose={() => this.setState({dialogOpen:false})}
                    }}
                  >
                    Create new growth plan
                  </Button>

                  <Dialog
                    open={this.state.dialogOpen}
                    aria-labelledby="form-dialog-title"
                  >
                    <DialogTitle id="form-dialog-title">
                      New growth plan
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText>
                        Please enter a name for your growth plan
                      </DialogContentText>
                      <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Dialog Name"
                        type="text"
                        fullWidth
                        // value={"asdasd"}
                        value={this.state.growthPlanName}
                        // onChange={event => console.log(event.target.value)}
                        onChange={event => {
                          this.setState({
                            growthPlanName: event.target.value
                          });
                          this.forceUpdate();
                        }}
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={() => this.setState({ dialogOpen: false })}
                        color="primary"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          this.setState({ dialogOpen: false });
                          // console.log(this.state.growthPlanName);
                          // console.log(this.state.growthPlan);
                          this.state.growthPlan.growthPlanGroup = this.state.growthPlanName;
                          // console.log(this.state.growthPlan);

                          this.saveGrowthPlan()
                            .then()
                            .catch();
                        }}
                        color="primary"
                      >
                        Create
                      </Button>
                    </DialogActions>
                  </Dialog>
                  <div style={{ margin: 10 }}>
                    {this.state.growthPlans.map(one =>
                      this.renderGrowthPlan(one)
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h1 style={{ margin: 10 }}>Managing a growth plan</h1>
                  <div style={{ margin: 10, width: "100%" }}>
                    <Button
                      variant="outlined"
                      style={{
                        color: "white",
                        margin: 10,
                        backgroundColor: plantyColor
                      }}
                      onClick={() => this.setState({ growthPlanActive: false })}
                    >
                      Back to Dashboard
                    </Button>
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
                        color: "white",
                        margin: 10,
                        backgroundColor: errorColor
                      }}
                      variant="outlined"
                      onClick={() => {
                        this.deleteGrowthPlan()
                          .then()
                          .catch();
                        this.setState({ growthPlanActive: false });
                      }}
                    >
                      Delete growth plan
                    </Button>
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
                        marginLeft: 5,
                        marginTop: 20,
                        marginBottom: 20,
                        width: "97%"
                      }}
                      required
                      id="growthPlanName"
                      label="Plan name"
                      value={
                        Object.keys(this.state.growthPlan).length === 0 &&
                        this.state.growthPlan.constructor === Object
                          ? this.state.growthPlanName
                          : this.state.growthPlan.growthPlanGroup
                      }
                      // onChange={event => console.log(event.target.value)}
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
                    <p style={{ marginTop: 5, color: errorColor }}>
                      {this.state.errorText}
                    </p>
                    <br />
                    {/*{this.renderWeeks()}*/}
                    {this.state.growthPlan.phases.map(one =>
                      this.renderWeeks(one)
                    )}
                  </div>
                </div>
              )}
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

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
