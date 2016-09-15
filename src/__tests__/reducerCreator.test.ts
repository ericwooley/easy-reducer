
import reducerCreator from '../reducerCreator'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'
import {merge} from 'lodash'

describe('reducerCreator', () => {
  it('should exist', () => {
    expect(reducerCreator).not.toBe(undefined)
  })
  it('should throw an error if there is no id', () => {
    expect(() => (reducerCreator as any)()()).toThrowError('Reducers must have an ID')
  })
  it('should throw an error if there is no default state', () => {
    expect(() => (reducerCreator as any)()('ID')).toThrowError('Reducers must have a default state')
  })
  describe('sync actions', () => {
    let testReducer
    let defaultState = {
      test: 'data'
    }
    let syncActions
    beforeEach(() => {
      syncActions = {
        testDataPlus1: jest.fn(),
        testDataPlusNumber: jest.fn(),
        testDataPlusManyNumbers: jest.fn()
      }
      testReducer = reducerCreator(defaultState, syncActions)('ID')
    })
    it('should auto create actions based on method names', () => {
      expect(testReducer.testDataPlus1).toBeTruthy()
      expect(testReducer.testDataPlus1()).toEqual({type: 'ID/testDataPlus1', payload: []})
      expect(testReducer.testDataPlusNumber()).toEqual({type: 'ID/testDataPlusNumber', payload: []})
    })
    it('should keep arguments as an array', () => {
      expect(testReducer.testDataPlusManyNumbers(1, 2, 3, 4))
        .toEqual({type: 'ID/testDataPlusManyNumbers', payload: [1, 2, 3, 4]})
    })
  })
  describe('reducing', () => {
    let testReducer
    let defaultState = {
      test: 'data'
    }
    let syncActions
    beforeEach(() => {
      syncActions = {
        testDataPlus1 (state) {
          return merge({}, state, {test: 'data1'})
        },
        testSpy: jest.fn(),
        testDataPlusANumber (num, state) {
          return merge({}, state, {test: state.test + num})
        }
      }
      testReducer = reducerCreator(defaultState, syncActions)('ID')
    })
    it('should have a reducer method', () => {
      expect(testReducer.reducer).toBeTruthy()
    })
    it('should call actions', () => {
      // the original funciton is replaced by an action
      testReducer.reducer(defaultState, testReducer.testSpy())
      expect(syncActions.testSpy).toBeCalled()
    })

    it('should pass state as the first argument when there are no arguments', () => {
      testReducer.reducer(defaultState, testReducer.testSpy())
      expect(syncActions.testSpy).toBeCalledWith(defaultState)
    })

    it('should pass in arugments before state', () => {
      testReducer.reducer(defaultState, testReducer.testSpy(1))
      expect(syncActions.testSpy).toBeCalledWith(1, defaultState)
      testReducer.reducer(defaultState, testReducer.testSpy(1, 2))
      expect(syncActions.testSpy).toBeCalledWith(1, 2, defaultState)
    })
    it('should not modify the state for actions it does not own', () => {
      let newState = testReducer.reducer(defaultState, {type: 'some other action'})
      expect(newState).toBe(defaultState)
    })
    it('should modify state', () => {
      let newState = testReducer.reducer(defaultState, testReducer.testDataPlus1())
      expect(newState).toEqual({test: 'data1'})
      expect(newState).not.toEqual(defaultState)
      let newState2 = testReducer.reducer(newState, testReducer.testDataPlusANumber(2))
      expect(newState2).toEqual({test: 'data12'})
    })
  })
  describe('async actions', () => {
    let testStore
    let testReducer
    let defaultState = {
      test: 'data'
    }
    let syncActions, asyncActions, spy

    beforeEach(() => {
      spy = jest.fn()
      asyncActions = {
        asyncTestSpy: jest.fn(),
        asyncTestSpyCaller (num, syncActions, dispatch, getState) {
          dispatch(syncActions.testSpy(num))
        },
        asyncStateModifyer (num, syncActions, dispatch, getState) {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(dispatch(syncActions.testDataPlusNum(num)))
            }, 20)
          })
        },
        asyncTimeoutTest (syncActions, dispatch, getState) {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(dispatch(syncActions.testSpy()))
            }, 20)
          })
        },
        asyncTestDataPlus1 (syncActions, dispatch, getState) {
          dispatch(syncActions.testSpy())
        }
      }
      syncActions = {
        testDataPlusNum (num, state) {
          return merge({}, state, {test: 'data' + num})
        },
        testSpy: (state) => spy() || merge({}, state),
      }
      testReducer = reducerCreator(defaultState, syncActions, asyncActions)('ID')
      testStore = createStore(combineReducers({testReducer: testReducer.reducer}), undefined, applyMiddleware(thunk))
    })
    it('should call the async spy', () => {
      testStore.dispatch(testReducer.asyncTestSpy())
      expect(asyncActions.asyncTestSpy).toBeCalled()
    })
    it('should call sync test spy', () => {
      testStore.dispatch(testReducer.asyncTestSpyCaller(1))
      expect(spy).toBeCalled()
    })
    it('it should work asynchronously', function () {
      return testStore.dispatch(testReducer.asyncTimeoutTest())
      .then(() => expect(spy).toBeCalled())

    })
    it('it should modify state asynchronously', function () {
      return testStore.dispatch(testReducer.asyncStateModifyer(1))
      .then(() => expect(testStore.getState()).toEqual({testReducer: {test: 'data1'}}))

    })
  })
})
