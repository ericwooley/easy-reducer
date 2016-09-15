import {merge} from 'lodash'
export interface IReducer {
  reducer: Function
}

export default function makeReducer
<ISubState, T, V>
(defaultState: ISubState, Actions?: T, AsyncActions?: V): (ID: string) => V & T & IReducer {
  return (ID: string) => {
    if (!ID || typeof ID === 'undefined') {
      throw new Error('Reducers must have an ID')
    }
    if (typeof defaultState === 'undefined') {
      throw new Error('Reducers must have a default state')
    }

    const newSyncActions: T & IReducer = merge(({} as IReducer), Actions)
    const newAsyncActions: V = merge({}, AsyncActions)

    // Actions are now functions that auto return types
    Object.keys(Actions).forEach((key) => {
      (newSyncActions[key]) = (...payload: any[]) => {
        return { type: `${ID}/${key}`, payload }
      }
    })

    if (AsyncActions) {
      // async actions have dispatch and the payload injected into them.
      Object.keys(AsyncActions).forEach((key) => {
        if (Actions[key]) {
          throw new Error('You cannot have a Action and Async Action with the same name: ' + key)
        }
        newAsyncActions[key] = (...payload: any[]) => {
          return (dispatch: Function, getState: Function) =>
            AsyncActions[key](...payload, newSyncActions, dispatch, getState)
        }
      })
    }
    const baseReducer = {
      reducer: (state: ISubState, action: {type: string, payload?: any}) => {
        state = state || defaultState
        /* tslint:disable */
        // Linting is disabled because there is no other way to do this
        const [ActionID, actionMethod] = action.type.split('/')
        if (ActionID === ID) {
          if (newSyncActions[actionMethod]) {
            return Actions[actionMethod](...action.payload, state)
          }
        }
        return state
        /* tslint:enable */
      }
    }
    return merge(baseReducer, newSyncActions, newAsyncActions)
  }
}
