import React from "react";
import StickyFooter from "react-sticky-footer";

//redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addSocket, addUser, loadPlanters } from "../actions";
import AppBar from "@material-ui/core/AppBar";
import "../Styles/Signin.css";
import { Paper, Toolbar, Typography, Button } from "@material-ui/core";
import { Redirect } from "react-router-dom";
import Avatar from "@material-ui/core/Avatar";
import { BrowserView } from "react-device-detect";
import FormGroup from "@material-ui/core/FormGroup";

const plantyColor = "#6f9e04";
const errorColor = "#ee3e34";

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
  componentDidMount() {}

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  render() {
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
            height: this.state.height - 40,
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
              <Typography variant="h6" style={{ flexGrow: 1 }}>
                Plant'y
              </Typography>
            </Toolbar>
          </AppBar>
          <Paper style={{ margin: 10, textAlign: "center" }}>
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
          <div className="logo">
            <form onSubmit={this.handleSubmit}>
              <FormGroup>
                <img
                  style={{ width: 300, margin: "0 auto" }}
                  src={require("../Images/logo.png")}
                  alt="logo"
                />
              </FormGroup>
            </form>
          </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
