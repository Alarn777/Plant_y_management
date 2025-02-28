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
import Link from "@material-ui/core/Link";
import Alert from "@material-ui/lab/Alert";
const plantyColor = "#6f9e04";

class SingIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      username: "",
      code: "",
      newPasswordString: "",
      back: false,
      showPassword: false,
      error: false,
      loading: false,
      width: 0,
      height: 0,
      forgotPassword: false,
      newPassword: false,
      delivery: null
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
    this.setState({ error: false });
    try {
      const user = await Auth.signIn(this.state.username, this.state.password);
      if (user) {
        // The user directly signs in
        this.props.addUser(user);
        //"token", user.signInUserSession.idToken.jwtToken,

        // this.props.cookies.set(
        //   "token",
        //   user.signInUserSession.idToken.jwtToken,
        //   {
        //     path: "/"
        //   }
        // );
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
  sendForgotPassword() {
    const username = this.state.username;
    if (!username) {
      return;
    }
    this.setState({ loading: false, forgotPassword: false, newPassword: true });

    Auth.forgotPassword(username)
      .then(data => {
        this.setState({ delivery: data.CodeDeliveryDetails });
        // console.log(data.CodeDeliveryDetails);
        this.setState({
          loading: false,
          forgotPassword: false,
          newPassword: true
        });
      })
      .catch(err => {
        console.log(err);
        // this.error(err)
      });
  }

  sendNewPassword = () => {
    if (this.state.code === "" || this.state.newPasswordString === "") {
      this.setState({ error: true });
      return;
    }

    if (
      this.state.newPasswordString.match(/\d/) &&
      this.state.newPasswordString.match(/[A-Z]/) &&
      this.state.newPasswordString.length >= 6
    ) {
      //passed Checks
      this.setState({ error: false });
      Auth.forgotPasswordSubmit(
        this.state.username,
        this.state.code,
        this.state.newPasswordString
      )
        .then(data => {
          this.setState({ loading: false });
          this.setState({ forgotPassword: false, newPassword: false });
        })
        .catch(err => {
          console.log(err);
          this.setState({ error: true });
        });
    } else {
      this.setState({ error: true, loading: false });
      return;
    }
  };

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

  renderError = () => {
    if (this.state.error) {
      return (
        <Alert
          style={{
            marginTop: 10
          }}
          severity="error"
        >
          Invalid data
        </Alert>
      );
    } else return <div />;
  };

  renderNeededForm = () => {
    if (this.state.newPassword) {
      return (
        <form onSubmit={this.handleSubmit}>
          <FormGroup style={{ margin: 10 }}>
            <img
              style={{ width: 300, margin: "0 auto" }}
              src={require("../Images/logo.png")}
              alt="logo"
            />
            <p
              style={{
                alignSelf: "center",
                fontSize: 20,
                color: plantyColor
              }}
            >
              Reset password
            </p>
            <InputLabel
              error={this.state.error}
              style={{ marginTop: 10 }}
              htmlFor="outlined-adornment-code"
            >
              Code *
            </InputLabel>
            <Input
              error={this.state.error}
              style={{ marginTop: 10 }}
              // variant="outlined"
              id="standard-adornment-code"
              type={"text"}
              value={this.state.code}
              onChange={this.handleChange("code")}
            />
            <InputLabel
              error={this.state.error}
              style={{ marginTop: 10 }}
              htmlFor="outlined-adornment-newPass"
            >
              New Password *
            </InputLabel>
            <Input
              error={this.state.error}
              style={{ marginTop: 10 }}
              variant="outlined"
              id="standard-adornment-newPass"
              type={this.state.showPassword ? "text" : "password"}
              value={this.state.newPasswordString}
              onChange={this.handleChange("newPasswordString")}
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
            <Alert
              style={{
                marginTop: 10
              }}
              severity="warning"
            >
              New password must be at least 6 characters long, contain one
              capital letter and one digit
            </Alert>
            {this.renderError()}
          </FormGroup>
          <FormGroup style={{ margin: 10 }}>
            <Button
              style={{
                marginTop: 20,
                width: "100%"
              }}
              variant="contained"
              color="primary"
              onClick={() => {
                this.setState({ loading: true });
                this.sendNewPassword();
              }}
            >
              {!this.state.loading ? (
                <p>Submit</p>
              ) : (
                <CircularProgress
                  color="secondary"
                  style={{ root: { flex: 1 } }}
                />
              )}
            </Button>
          </FormGroup>
        </form>
      );
    } else if (this.state.forgotPassword) {
      return (
        <form onSubmit={this.handleSubmit}>
          <FormGroup style={{ margin: 10 }}>
            <img
              style={{ width: 300, margin: "0 auto" }}
              src={require("../Images/logo.png")}
              alt="logo"
            />
            <p
              style={{
                alignSelf: "center",
                fontSize: 20,
                color: plantyColor
              }}
            >
              Forgot password
            </p>
            <InputLabel
              error={this.state.error}
              style={{ marginTop: 10 }}
              htmlFor="outlined-adornment-username"
            >
              Username *
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
          </FormGroup>
          <FormGroup style={{ margin: 10 }}>
            <Button
              style={{
                marginTop: 20,
                width: "100%"
              }}
              disabled={!this.validateForm()}
              variant="contained"
              color="primary"
              onClick={() => {
                this.setState({ loading: true });
                this.sendForgotPassword();
              }}
            >
              {!this.state.loading ? (
                <p>Send Email</p>
              ) : (
                <CircularProgress
                  color="secondary"
                  style={{ root: { flex: 1 } }}
                />
              )}
            </Button>
          </FormGroup>
        </form>
      );
    } else {
      return (
        <form onSubmit={this.handleSubmit}>
          <FormGroup style={{ margin: 10 }}>
            <img
              style={{ width: 300, margin: "0 auto" }}
              src={require("../Images/logo.png")}
              alt="logo"
            />
            <InputLabel
              error={this.state.error}
              style={{ marginTop: 10 }}
              htmlFor="outlined-adornment-username"
            >
              Username *
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
          </FormGroup>
          <FormGroup style={{ margin: 10 }}>
            <InputLabel
              error={this.state.error}
              style={{ marginTop: 10 }}
              htmlFor="outlined-adornment-password"
            >
              Password *
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
            <Link
              style={{ marginTop: 5, fontSize: 15, alignSelf: "start" }}
              href="#"
              component={"button"}
              onClick={() => {
                this.setState({ forgotPassword: true });
              }}
            >
              Forgot password
            </Link>
            {this.renderError()}
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
            </Button>
          </FormGroup>
        </form>
      );
    }
  };

  render() {
    if (this.state.dashboard === true) {
      return <Redirect to="/dashboard" />;
    } else if (this.state.back === true) {
      return <Redirect to="/" />;
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
              Login
            </Typography>
            <div className="Login">{this.renderNeededForm()}</div>
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
                // backgroundColor: "#999999",
                padding: "10px"
              }}
              stickyStyles={{
                // backgroundColor: "rgba(255,255,255,.8)",
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

export default connect(mapStateToProps, mapDispatchToProps)(SingIn);
