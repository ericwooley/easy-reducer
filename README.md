# easy-reducer
Easier reducers with less boilerplate.

# Using easy reducers

```js
import easyReducerCreator from '../reducerCreator'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'

const defaultState {
  test: 'data'
}
const syncActions = {
   // previous state is always the last argument.
  testDataPlusNum (num, state) {
    return {...state, test: 'data' + num}
  },
  testDataPlusTwoNum (num1, num2, state) {
    return {...state, test: 'data' + num1 + '' + num2}
  }
}

// async actions are handled differently, and are meant to be used with redux-thunk
const asyncActions = {
  // syncActions, dispatch, getState (from thunk), are always the last arguments.
  asyncStateModifyer (num, syncActions, dispatch, getState) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dispatch(syncActions.testDataPlusNum(num)))
      }, 20)
    })
  },
}

// Test reducer now has all the action creators you would use for your methods, with the types TR1/methodName
export const testReducer1 = reducerCreator(defaultState, syncActions, asyncActions)('TR1')
// Reducers are reusable with different ID's
export const testReducer2 = reducerCreator(defaultState, syncActions, asyncActions)('TR2')

export const store = createStore(combineReducers({
  // a reducer property is attached, which serves as the actual reducer.
  testReducer1: testReducer1.reducer,
  testReducer2: testReducer2.reducer
}), undefined, applyMiddleware(thunk))

store.dispatch(testReducer1.testDataPlusNum(1))
store.dispatch(testReducer1.asyncStateModifyer(2))
.then(() => store.dispatch(testReducer2.testDataPlusTwoNum(3, 4)))

```
