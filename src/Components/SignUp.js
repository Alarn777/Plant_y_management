import React from "react";
//redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addSocket, addUser, loadPlanters } from "../actions";
import Button from "@material-ui/core/Button";
import Amplify, { Auth } from "aws-amplify";
import FormGroup from "@material-ui/core/FormGroup";
import "../Styles/Signin.css";
import AppBar from "@material-ui/core/AppBar";
import { IconButton, Toolbar, Typography } from "@material-ui/core";
import StickyFooter from "react-sticky-footer";

import ArrowBackIosIcon from "@material-ui/icons/NavigateBefore";

import { Redirect } from "react-router-dom";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import InputLabel from "@material-ui/core/InputLabel";
import CircularProgress from "@material-ui/core/CircularProgress";
import { BrowserView } from "react-device-detect";
import Alert from "@material-ui/lab/Alert";

const plantyColor = "#6f9e04";
const errorColor = "#ee3e34";

class SingUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      password2: "",
      username: "",
      userEmail: "",
      back: false,
      showPassword: false,
      error: false,
      loading: false,
      width: 0,
      height: 0,
      register: true,
      confirmCode: "",
      userConfirmed: false,
      codeMessage: "",
      dashboard: false
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
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  async signUp() {
    let username = this.state.username,
      password = this.state.password,
      email = this.state.userEmail;

    Auth.signUp({
      username,
      password,
      attributes: {
        email // optional
        // other custom attributes
      },
      validationData: [] //optional
    })
      .then(data => {
        this.setState({ register: false });
      })
      .catch(err => {
        console.log(err);

        this.setState({ error: true });
      });

    // After retrieving the confirmation code from the user
  }

  async confirmSignUp() {
    let username = this.state.username,
      code = this.state.confirmCode;

    Auth.confirmSignUp(username, code, {
      // Optional. Force user confirmation irrespective of existing alias. By default set to True.
      forceAliasCreation: true
    })
      .then(data => {
        this.setState({ userConfirmed: true });
      })
      .catch(err => {
        console.log(err);
        this.setState({ error: true });
      });
  }

  async resendCode() {
    let username = this.state.username;

    Auth.resendSignUp(username)
      .then(() => {
        this.setState({ codeMessage: "Code resent successfully" });
      })
      .catch(e => {
        console.log(e);
      });
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  validateForm() {
    if (this.state.password2 === this.state.password) {
      return (
        this.state.username.length > 0 &&
        this.state.password.length > 0 &&
        this.state.password2.length > 0 &&
        this.state.userEmail.length > 0
      );
    } else return false;
  }

  handleClickShowPassword = () => {
    this.setState({ showPassword: !this.state.showPassword });
  };

  render() {
    if (this.state.back === true) {
      return <Redirect to="/" />;
    } else if (this.state.userConfirmed) {
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
                  onClick={() => this.setState({ back: true })}
                  edge="start"
                  style={{ marginRight: 10 }}
                  color="inherit"
                  aria-label="back"
                >
                  <ArrowBackIosIcon />
                </IconButton>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                  Plant'y
                </Typography>
              </Toolbar>
            </AppBar>
            <Typography style={{ padding: 10 }} variant="h3" component="h3">
              User registered successfully
            </Typography>
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
    } else {
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
                  onClick={() => this.setState({ back: true })}
                  edge="start"
                  // className={styles.menuButton}
                  style={{ marginRight: 10 }}
                  color="inherit"
                  aria-label="back"
                >
                  <ArrowBackIosIcon />
                </IconButton>
                <Typography
                  variant="h6"
                  // className={styles.title}
                  style={{ flexGrow: 1 }}
                >
                  Plant'y
                </Typography>
              </Toolbar>
            </AppBar>
            <Typography style={{ padding: 10 }} variant="h3" component="h3">
              Register
            </Typography>
            <div className="Login">
              <form>
                {this.state.register ? (
                  <div>
                    <FormGroup style={{ margin: 10 }}>
                      <img
                        style={{ width: 300, margin: "0 auto" }}
                        src={require("../Images/logo.png")}
                        alt="logo"
                      />
                      <Alert
                        style={{
                          marginTop: 10
                        }}
                        severity="warning"
                      >
                        Please contact admin to register
                      </Alert>

                      <InputLabel
                        error={this.state.error}
                        style={{ marginTop: 10 }}
                        htmlFor="outlined-adornment-username"
                      >
                        Username
                      </InputLabel>
                      <Input
                        error={this.state.error}
                        style={{ marginTop: 10 }}
                        // variant="outlined"
                        id="standard-adornment-username"
                        type={"text"}
                        value={this.state.username}
                        onChange={this.handleChange("username")}
                      />
                      <InputLabel
                        error={this.state.error}
                        style={{ marginTop: 10 }}
                        htmlFor="outlined-adornment-password"
                      >
                        Email
                      </InputLabel>
                      <Input
                        error={this.state.error}
                        style={{ marginTop: 10 }}
                        // variant="outlined"
                        id="standard-adornment-userEmail"
                        type={"text"}
                        value={this.state.userEmail}
                        onChange={this.handleChange("userEmail")}
                      />
                    </FormGroup>
                    <FormGroup style={{ margin: 10 }}>
                      <InputLabel
                        error={this.state.error}
                        style={{ marginTop: 10 }}
                        htmlFor="outlined-adornment-password"
                      >
                        Password
                      </InputLabel>

                      <Input
                        error={this.state.error}
                        style={{ marginTop: 10 }}
                        variant="outlined"
                        id="standard-adornment-password"
                        type={this.state.showPassword ? "text" : "password"}
                        value={this.state.password}
                        onChange={this.handleChange("password")}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={this.handleClickShowPassword}
                            >
                              {this.state.showPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                      <InputLabel
                        error={this.state.error}
                        style={{ marginTop: 10 }}
                        htmlFor="outlined-adornment-password"
                      >
                        Repeat Password
                      </InputLabel>
                      <Input
                        error={this.state.error}
                        style={{ marginTop: 10 }}
                        variant="outlined"
                        id="standard-adornment-password2"
                        type={this.state.showPassword ? "text" : "password"}
                        value={this.state.password2}
                        onChange={this.handleChange("password2")}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={this.handleClickShowPassword}
                            >
                              {this.state.showPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                      <Typography
                        variant="body2"
                        // className={styles.title}
                        style={{ color: "gray", marginTop: 5, flexGrow: 1 }}
                      >
                        Password must contain at least 1 upper case letter
                      </Typography>

                      <Button
                        style={{
                          marginTop: 20
                        }}
                        disabled={!this.validateForm()}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          this.setState({ loading: true });
                          this.signUp()
                            .then(() => this.setState({ loading: false }))
                            .catch(error => this.setState({ error: true }));
                        }}
                      >
                        {!this.state.loading ? (
                          <p>Register</p>
                        ) : (
                          <CircularProgress
                            color="secondary"
                            style={{ root: { flex: 1 } }}
                          />
                        )}
                      </Button>
                    </FormGroup>
                  </div>
                ) : (
                  <div>
                    <FormGroup>
                      <img
                        style={{ width: 300 }}
                        src={require("../Images/logo.png")}
                      />
                      <InputLabel
                        error={this.state.error}
                        style={{ marginTop: 10 }}
                        htmlFor="outlined-adornment-password"
                      >
                        Enter the <b>Confirmation Code</b> from the email sent
                        to you
                      </InputLabel>
                      <Input
                        error={this.state.error}
                        style={{ marginTop: 10 }}
                        // variant="outlined"
                        id="standard-adornment-confirmCode"
                        type={"text"}
                        value={this.state.confirmCode}
                        onChange={this.handleChange("confirmCode")}
                      />
                      <Typography
                        variant="p"
                        // className={styles.title}
                        style={{ color: "gray", marginTop: 5, flexGrow: 1 }}
                      >
                        {this.state.codeMessage}
                      </Typography>
                      <Button
                        style={{
                          marginTop: 20
                        }}
                        // disabled={!this.validateForm()}
                        variant="contained"
                        color="primary"
                        onClick={() => this.resendCode()}
                      >
                        Resend code
                      </Button>
                      <Button
                        style={{
                          marginTop: 20
                        }}
                        disabled={this.state.confirmCode === ""}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          this.setState({ loading: true });
                          this.confirmSignUp()
                            .then()
                            .catch();
                        }}
                      >
                        {!this.state.loading ? (
                          <p>Confirm</p>
                        ) : (
                          <CircularProgress
                            color="secondary"
                            style={{ root: { flex: 1 } }}
                          />
                        )}
                      </Button>
                    </FormGroup>
                  </div>
                )}
              </form>
            </div>
            {/*</Paper>*/}
          </div>
          <BrowserView>
            {/*<img*/}
            {/*  style={{*/}
            {/*    zIndex: -100,*/}
            {/*    width: "100%",*/}
            {/*    position: "absolute",*/}
            {/*    bottom: -1*/}
            {/*  }}*/}
            {/*  src={require("../Images/grass.png")}*/}
            {/*  alt="footer"*/}
            {/*/>*/}
            {/*<StickyFooter*/}
            {/*  bottomThreshold={20}*/}
            {/*  normalStyles={{*/}
            {/*    height: 20,*/}
            {/*    // backgroundColor: "#999999",*/}
            {/*    padding: "10px"*/}
            {/*  }}*/}
            {/*  stickyStyles={{*/}
            {/*    // backgroundColor: "rgba(255,255,255,.8)",*/}
            {/*    padding: "2rem"*/}
            {/*  }}*/}
            {/*>*/}
            {/*  <p style={{ color: "white", marginTop: -10 }}>*/}
            {/*    © 2019 - 2020, Plant'y Inc. or its affiliates. All rights*/}
            {/*    reserved.*/}
            {/*  </p>*/}
            {/*</StickyFooter>*/}
          </BrowserView>
        </div>
      );
    }
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

export default connect(mapStateToProps, mapDispatchToProps)(SingUp);
