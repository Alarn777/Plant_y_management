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
  Toolbar,
  Typography,
  Button,
  IconButton,
  CardActionArea,
  CardMedia,
  CardContent
} from "@material-ui/core";
// import { Redirect } from "react-router-dom";
import { Redirect, BrowserRouter as Router, Route } from "react-router-dom";
import Amplify, { Auth } from "aws-amplify";
// import awsconfig from "../aws-exports";
//import { instanceOf } from "prop-types";
//import { Cookies } from "react-cookie";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import axios from "axios";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Link from "@material-ui/core/Link";
import LinearProgress from "@material-ui/core/LinearProgress";
import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile
} from "react-device-detect";
import CardActions from "@material-ui/core/CardActions";

class UserPage extends React.Component {
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
      planters: [],
      customerUsername: this.props.location.pathname.replace("/users/", ""),
      selectedPlanter: "",
      selectedPlanterUUID: ""
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
        // return Auth.changePassword(user, "oldPassword", "newPassword");

        this.setState({ user: user });
        this.props.addUser(user);
        this.loadPlanters()
          .then()
          .catch();
      })
      // .then(data => console.log(data))
      .catch(err => console.log(err));

    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  async loadPlanters() {
    // console.log('called reload plants');

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
        // console.log(response.data);
        this.dealWithPlantsData(response.data);
      })
      .catch(error => {
        console.log("error " + error);
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
          .then()
          .catch();
      })
      .catch(error => {
        console.log("error " + error);
      });
  }

  async removePlanter(planterName) {
    console.log("in remove planter");
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
        console.log(response);
        this.loadPlanters()
          .then()
          .catch();
      })
      .catch(error => {
        console.log("error " + error);
      });
  }

  renderPlanters = planter => {
    //

    return (
      <Card
        key={planter.name}
        style={{
          float: "left",
          margin: 10,
          maxWidth: 345,
          backgroundColor: "#e8f5e9"
          // root: { color: "#a5d6a7" }
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
            title="Contemplative Reptile"
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
    // if (!this.state.user) return <Redirect to="/login" />;

    if (this.state.toLogin === true) {
      return <Redirect to="/login" />;
    }
    // if (this.state.toRegister === true) {
    //   return <Redirect to="/register" />;
    // }
    // console.log(this.props.location);
    // console.log(this.props.location.pathname.replace("/user/", ""));
    let username = this.state.customerUsername;
    // console.log(this.state.planters);
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
                  // to="/dashboard"
                  // style={{ color: "#9e9e9e" }}
                  // onClick={handleClick}
                >
                  Dashboard
                </Link>
                {/*<Link*/}
                {/*  color="inherit"*/}
                {/*  href="/getting-started/installation/"*/}
                {/*  // onClick={handleClick}*/}
                {/*>*/}
                {/*  User*/}
                {/*</Link>*/}
                <Typography color="textPrimary">{username}</Typography>
              </Breadcrumbs>
              <div>
                <h1>{username}'s Planters</h1>
                <div>
                  {this.state.planters.map(one => this.renderPlanters(one))}
                </div>
              </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(UserPage);
