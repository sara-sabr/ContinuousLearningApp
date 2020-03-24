import thunkMiddleware from "redux-thunk";
import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducers";



const store = createStore(
    rootReducer,
    composeWithDevTools(
        applyMiddleware(
            thunkMiddleware
        ),
    )
)


export default store