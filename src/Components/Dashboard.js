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
import { BrowserView } from "react-device-detect";

class Dashboard extends React.Component {
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
      systemUsers: [],
      selectedUser: "none"
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
        this.loadAllData()
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

  render() {
    if (this.state.selectedUser !== "none") {
      return <Redirect to={`/users/${this.state.selectedUser}`} />;
    }

    if (this.state.toLogin === true) {
      return <Redirect to="/login" />;
    }

    if (this.state.systemUsers === []) {
      return <LinearProgress style={{ width: "100%" }} />;
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
              <h1 style={{ margin: 10 }}>All Users</h1>
              <div style={{ margin: 10 }}>
                {this.state.systemUsers.map(one => this.renderUsers(one))}
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

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
