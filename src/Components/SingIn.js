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
import { Auth } from "aws-amplify";
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
class SingIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      name: "",
      back: false
    };
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  validateForm() {
    return this.state.name.length > 0 && this.state.password.length > 0;
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    if (this.state.back === true) {
      return <Redirect to="/" />;
    }

    console.log(this.props);
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
          <Paper style={{ margin: 10 }}>
            <Typography style={{ padding: 10 }} variant="h3" component="h3">
              Login
            </Typography>
            <div className="Login">
              <form onSubmit={this.handleSubmit}>
                <FormGroup controlId="username" bsSize="large">
                  <TextField
                    id="standard-name"
                    label="Username"
                    // className={classes.textField}
                    value={this.state.name}
                    onChange={this.handleChange("name")}
                    margin="normal"
                    variant="outlined"
                  />
                </FormGroup>
                <FormGroup controlId="password" bsSize="large">
                  <TextField
                    id="standard-name"
                    label="Password"
                    // className={classes.textField}
                    value={this.state.password}
                    onChange={this.handleChange("password")}
                    margin="normal"
                    variant="outlined"
                  />
                  <Button
                    style={{
                      marginTop: 10
                    }}
                    disabled={!this.validateForm()}
                    variant="contained"
                    color="primary"
                    // onClick={() => this.setState({ toRegister: true })}
                  >
                    Login
                  </Button>
                </FormGroup>
              </form>
            </div>
          </Paper>
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(SingIn);
