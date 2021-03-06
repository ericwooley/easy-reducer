# easy-reducer 
[![Build Status](https://travis-ci.org/ericwooley/easy-reducer.svg?branch=master)](https://travis-ci.org/ericwooley/easy-reducer)
[![Code Climate](https://codeclimate.com/github/ericwooley/easy-reducer/badges/gpa.svg)](https://codeclimate.com/github/ericwooley/easy-reducer)
[![Test Coverage](https://codeclimate.com/github/ericwooley/easy-reducer/badges/coverage.svg)](https://codeclimate.com/github/ericwooley/easy-reducer/coverage)
[![Issue Count](https://codeclimate.com/github/ericwooley/easy-reducer/badges/issue_count.svg)](https://codeclimate.com/github/ericwooley/easy-reducer)

Easier reducers with less boilerplate.

Easy reducers generates action creators and types, and makes your reducers reusable.

# Installing

`npm install --save easy-reducer`

[![NPM](https://nodei.co/npm/easy-reducer.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/easy-reducer/)

# Using easy reducers

```js
import easyReducerCreator from 'easy-reducer'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'

const defaultState = {
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

const testReducerCreator = easyReducerCreator(defaultState, syncActions, asyncActions)
// testReducer1 now has all the action creators you would use for your methods, with the types TR1/methodName
export const testReducer1 = testReducerCreator('TR1')

// generated types as constants for reference with RXJS epics or whatever
// EG: {testDataPlusNum: 'TR1/testDataPlusNum', testDataPlusTwoNum: 'TR1/testDataPlusTwoNum'}
console.log(testReducer1.TYPES) 

// Reducers are reusable with different ID's
export const testReducer2 = testReducerCreator('TR2')

export const store = createStore(combineReducers({
  // a reducer property is attached, which serves as the actual reducer.
  testReducer1: testReducer1.reducer,
  testReducer2: testReducer2.reducer
}), undefined, applyMiddleware(thunk))

store.dispatch(testReducer1.testDataPlusNum(1))
store.dispatch(testReducer1.asyncStateModifyer(2))
.then(() => store.dispatch(testReducer2.testDataPlusTwoNum(3, 4)))
```
