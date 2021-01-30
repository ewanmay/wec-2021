import { createContext, Dispatch, useReducer } from 'react';
import {reducer} from './reducer';
import {initialState} from './state';
import {State} from './types';

export const AppContext = createContext({} as [State, Dispatch<Record<string, any>>]);

export const AppContextProvider = (props: Record<string, any>) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider
      value={[state, dispatch]}>
      {props.children}
    </AppContext.Provider>
  );
};

