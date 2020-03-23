import React from "react";

import ReactDOM from "react-dom";
// import { Provider } from 'react-redux';
// import { store } from './reducer';
// import { Container } from './container';

//redux
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { addSocket, addUser, loadPlanters } from "../actions";
import Button from "@material-ui/core/Button";
import Amplify, { Auth } from "aws-amplify";
// import awsconfig from "../aws-exports";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import "../Styles/Signin.css";
import TextField from "@material-ui/core/TextField";
import AppBar from "@material-ui/core/AppBar";
import { IconButton, Paper, Toolbar, Typography, Fab } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import StickyFooter from "react-sticky-footer";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { Redirect } from "react-router-dom";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import { Image, Visibility, VisibilityOff } from "@material-ui/icons";
import InputLabel from "@material-ui/core/InputLabel";
import CircularProgress from "@material-ui/core/CircularProgress";
import { instanceOf } from "prop-types";
import { useCookies } from "react-cookie";
import { withCookies, Cookies } from "react-cookie";

class SingIn extends React.Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      password: "",
      username: "",
      back: false,
      showPassword: false,
      error: false,
      loading: false,
      width: 0,
      height: 0
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

  async SignIn() {
    try {
      const user = await Auth.signIn(this.state.username, this.state.password);
      if (user) {
        // The user directly signs in
        console.log(user);
        this.props.addUser(user);
        //"token", user.signInUserSession.idToken.jwtToken,

        this.props.cookies.set(
          "token",
          user.signInUserSession.idToken.jwtToken,
          {
            path: "/"
          }
        );
        this.setState({ dashboard: true });
      }
    } catch (err) {
      this.setState({ error: true, loading: false });
      if (err.code === "UserNotConfirmedException") {
        // The error happens if the user didn't finish the confirmation step when signing up
        // In this case you need to resend the code and confirm the user
        // About how to resend the code and confirm the user, please check the signUp part
      } else if (err.code === "PasswordResetRequiredException") {
        // The error happens when the password is reset in the Cognito console
        // In this case you need to call forgotPassword to reset the password
        // Please check the Forgot Password part.
      } else if (err.code === "NotAuthorizedException") {
        // The error happens when the incorrect password is provided
      } else if (err.code === "UserNotFoundException") {
        // The error happens when the supplied username/email does not exist in the Cognito user pool
      } else {
        console.log(err);
      }
    }
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  validateForm() {
    return this.state.username.length > 0 && this.state.password.length > 0;
  }

  handleSubmit(event) {
    event.preventDefault();
  }
  handleClickShowPassword = () => {
    this.setState({ showPassword: !this.state.showPassword });
  };

  render() {
    if (this.state.dashboard === true) {
      return <Redirect to="/dashboard" />;
    } else if (this.state.back === true) {
      return <Redirect to="/" />;
    } else {
      return (
        // const [email, setEmail] = useState("");
        // const [password, setPassword] = useState("");

        // return

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
            {/*<Paper style={{ margin: 10 }}>*/}
            <Typography style={{ padding: 10 }} variant="h3" component="h3">
              Login
            </Typography>
            <div className="Login">
              <form onSubmit={this.handleSubmit}>
                <FormGroup>
                  <img
                    style={{ width: 300 }}
                    src={require("../Images/logo.png")}
                    alt="logo"
                  />
                  {/*<TextField*/}
                  {/*  id="standard-name"*/}
                  {/*  label="Username"*/}
                  {/*  // className={classes.textField}*/}
                  {/*  value={this.state.name}*/}
                  {/*  onChange={this.handleChange("name")}*/}
                  {/*  margin="normal"*/}
                  {/*  variant="outlined"*/}
                  {/*/>*/}
                  <InputLabel
                    error={this.state.error}
                    style={{ marginTop: 10 }}
                    htmlFor="outlined-adornment-password"
                  >
                    Username
                  </InputLabel>
                  <Input
                    error={this.state.error}
                    style={{ marginTop: 10 }}
                    // variant="outlined"
                    id="standard-adornment-password"
                    type={"text"}
                    value={this.state.username}
                    onChange={this.handleChange("username")}
                  />
                </FormGroup>
                <FormGroup>
                  {/*<TextField*/}
                  {/*  id="standard-name"*/}
                  {/*  label="Password"*/}
                  {/*  hidden={true}*/}
                  {/*  // className={classes.textField}*/}
                  {/*  value={this.state.password}*/}
                  {/*  onChange={this.handleChange("password")}*/}
                  {/*  margin="normal"*/}
                  {/*  variant="outlined"*/}
                  {/*/>*/}
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
                  <Button
                    style={{
                      marginTop: 20
                    }}
                    disabled={!this.validateForm()}
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      this.setState({ loading: true });
                      this.SignIn()
                        .then()
                        .catch();
                    }}
                  >
                    {!this.state.loading ? (
                      <p>Login</p>
                    ) : (
                      <CircularProgress
                        color="secondary"
                        style={{ root: { flex: 1 } }}
                      />
                    )}
                    {/*Login*/}
                  </Button>
                </FormGroup>
              </form>
            </div>
            {/*</Paper>*/}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withCookies(SingIn));
