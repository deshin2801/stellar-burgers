import { combineReducers } from '@reduxjs/toolkit';
import ingredients from './slices/ingredientsSlice';
import constructorSliceReducer from './slices/constructorSlice';
import userSliceReducer from './slices/userSlice';
import orderListAllUsersSliceReducer from './slices/feedSlice';
import orderCurrentSliceReducer from './slices/currentSlice';
import orderListAllUsersSlicereducer from './slices/listUserSlice';

export const rootReducer = combineReducers({
  ingredients,
  constructorItems: constructorSliceReducer,
  user: userSliceReducer,
  feeds: orderListAllUsersSliceReducer,
  order: orderCurrentSliceReducer,
  orders: orderListAllUsersSlicereducer,
});
