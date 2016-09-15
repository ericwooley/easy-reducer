export interface IReducer {
    reducer: Function;
}
export default function makeReducer<ISubState, T, V>(defaultState: ISubState, Actions?: T, AsyncActions?: V): (ID: string) => V & T & IReducer;
