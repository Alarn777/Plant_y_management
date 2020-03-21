import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import Reducer from "./reducers";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import {
  createMuiTheme,
  makeStyles,
  ThemeProvider
} from "@material-ui/core/styles";
import { orange } from "@material-ui/core/colors";

// const useStyles = makeStyles(theme => ({
//     root: {
//         color: theme.status.danger,
//         '&$checked': {
//             color: theme.status.danger,
//         },
//     },
//     checked: {},
// }));

const plantyColor = "#6f9e04";

const store = createStore(Reducer);

const theme = createMuiTheme({
  // status: {
  //   danger: orange[500]
  // },
  palette: {
    primary: { 500: plantyColor }
  }
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
