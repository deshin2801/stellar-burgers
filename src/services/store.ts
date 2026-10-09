import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer';
import { useDispatch, useSelector } from 'react-redux';

const store = configureStore({
  reducer: rootReducer
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector = <TSelected>(
  selector: (state: RootState) => TSelected
) => useSelector(selector);

export default store;