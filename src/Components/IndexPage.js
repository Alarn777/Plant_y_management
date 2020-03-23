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
import Avatar from "@material-ui/core/Avatar";

class IndexPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: null,
      width: 0,
      height: 0,
      toLogin: false,
      toRegister: false
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
    // console.log(process.env);

    // let a = JSON.parse(JSON.stringify(process.env.REACT_APP_CONFIG_AWS));
    let a = JSON.parse(process.env.REACT_APP_CONFIG_AWS);

    console.log(a);

    let b = JSON.parse(process.env.REACT_APP_API_LINKS);

    console.log(b);

    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  render() {
    // console.log(process.env.REACT_APP_CONFIG_AWS);

    if (this.state.toLogin === true) {
      return <Redirect to="/login" />;
    }
    if (this.state.toRegister === true) {
      return <Redirect to="/register" />;
    }

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
              {/*<IconButton*/}
              {/*  edge="start"*/}
              {/*  // className={styles.menuButton}*/}
              {/*  style={{ marginRight: 10 }}*/}
              {/*  color="inherit"*/}
              {/*  aria-label="menu"*/}
              {/*>*/}
              {/*  <Avatar*/}
              {/*    variant="square"*/}
              {/*    alt="Remy Sharp"*/}
              {/*    style={{*/}
              {/*      backgroundColor: "white",*/}
              {/*      borderRadius: 5,*/}
              {/*      marginRight: 10*/}
              {/*    }}*/}
              {/*    src={require("../Images/logo.png")}*/}
              {/*  />*/}
              {/*</IconButton>*/}
              <Typography
                variant="h6"
                // className={styles.title}
                style={{ flexGrow: 1 }}
              >
                Plant'y
              </Typography>
            </Toolbar>
          </AppBar>
          <Paper style={{ margin: 10 }}>
            <Typography style={{ padding: 10 }} variant="h3" component="h3">
              Welcome to Plant'y administration
            </Typography>
            <div
              style={{
                margin: 10,
                root: {
                  "& > *": {
                    margin: 10
                  }
                }
              }}
            >
              <Button
                style={{
                  margin: 10
                }}
                variant="contained"
                color="primary"
                onClick={() => this.setState({ toLogin: true })}
              >
                Login
              </Button>
              <Button
                style={{
                  margin: 10
                }}
                variant="contained"
                color="primary"
                onClick={() => this.setState({ toRegister: true })}
              >
                Register
              </Button>
            </div>
          </Paper>
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
    // <Provider store={store}>
    //   <Container />
    // </Provider>)
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

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
