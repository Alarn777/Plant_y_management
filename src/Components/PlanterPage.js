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
//import Consts from "../ENV_VARS";
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
import { Redirect } from "react-router-dom";
import Amplify, { Auth, Storage } from "aws-amplify";
//import awsconfig from "../aws-exports";
import { instanceOf } from "prop-types";
import { Cookies } from "react-cookie";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import axios from "axios";
import PlantPage from "./PlantPage";
import Link from "@material-ui/core/Link";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import LinearProgress from "@material-ui/core/LinearProgress";
import CardActions from "@material-ui/core/CardActions";

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
      customerUsername: "",
      customerPlanter: ""
    };

    Amplify.configure(JSON.parse(process.env.REACT_APP_CONFIG_AWS));
    // if (awsconfig) {
    //   Amplify.configure(awsconfig);
    // } else {
    //   Amplify.configure(process.env.configParamsAWS);
    // }
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
    this.setState({ customerUsername: array[2], planterName: array[3] });

    Auth.currentAuthenticatedUser()
      .then(user => {
        // return Auth.changePassword(user, "oldPassword", "newPassword");
        this.setState({ user: user });
        this.props.addUser(user);
        this.loadPlants()
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
            status: one.status
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

  renderPlants = plant => {
    //
    // console.log(plant.pic);

    return (
      <Card
        onClick={() => {
          this.setState({ selectedPlanter: plant.name });
        }}
        key={plant.name}
        style={{
          float: "left",
          margin: 10,
          maxWidth: 345,
          backgroundColor: "#e8f5e9"
          // root: { color: "#a5d6a7" }
        }}
      >
        <CardActionArea>
          <CardMedia
            style={{
              height: 200,
              width: 200
            }}
            image={plant.pic}
            title="Contemplative Reptile"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {plant.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              Status:{plant.status}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button size="small" color="primary">
            Activate
          </Button>
          <Button size="small" color="primary">
            Deactivate
          </Button>
        </CardActions>
      </Card>
    );
  };

  render() {
    // if (!this.state.user) return <Redirect to="/login" />;
    if (this.state.plants === []) {
      return <LinearProgress style={{ width: "100%" }} />;
    }
    // if (!this.state.user) return <Redirect to="/login" />;

    if (this.state.toLogin === true) {
      return <Redirect to="/login" />;
    }

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
                  {" "}
                  {this.state.planterName}
                </Typography>
              </Breadcrumbs>
              <div>
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

export default connect(mapStateToProps, mapDispatchToProps)(PlanterPage);
