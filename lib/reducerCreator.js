"use strict";
var lodash_1 = require('lodash');
function makeReducer(defaultState, Actions, AsyncActions) {
    return function (ID) {
        if (!ID || typeof ID === 'undefined') {
            throw new Error('Reducers must have an ID');
        }
        if (typeof defaultState === 'undefined') {
            throw new Error('Reducers must have a default state');
        }
        var newSyncActions = lodash_1.merge({}, Actions);
        var newAsyncActions = lodash_1.merge({}, AsyncActions);
        var TYPES = {};
        // Actions are now functions that auto return types
        Object.keys(Actions).forEach(function (key) {
            (newSyncActions[key]) = function () {
                var payload = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    payload[_i - 0] = arguments[_i];
                }
                if (key === 'TYPES') {
                    throw new Error('You cannot have an action called `TYPES`');
                }
                var type = ID + "/" + key;
                TYPES[type] = type;
                return { type: type, payload: payload };
            };
        });
        if (AsyncActions) {
            // async actions have dispatch and the payload injected into them.
            Object.keys(AsyncActions).forEach(function (key) {
                if (Actions[key]) {
                    throw new Error('You cannot have a Action and Async Action with the same name: ' + key);
                }
                newAsyncActions[key] = function () {
                    var payload = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        payload[_i - 0] = arguments[_i];
                    }
                    return function (dispatch, getState) {
                        return AsyncActions[key].apply(AsyncActions, payload.concat([newSyncActions, dispatch, getState]));
                    };
                };
            });
        }
        var baseReducer = {
            reducer: function (state, action) {
                state = state || defaultState;
                /* tslint:disable */
                // Linting is disabled because there is no other way to do this
                var _a = action.type.split('/'), ActionID = _a[0], actionMethod = _a[1];
                if (ActionID === ID) {
                    if (newSyncActions[actionMethod]) {
                        return Actions[actionMethod].apply(Actions, action.payload.concat([state]));
                    }
                }
                return state;
                /* tslint:enable */
            }
        };
        return lodash_1.merge(baseReducer, newSyncActions, newAsyncActions, { TYPES: TYPES });
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeReducer;
//# sourceMappingURL=reducerCreator.js.map