/*
 * AppConstants
 * Each action has a corresponding type, which the reducer knows and picks up on.
 * To avoid weird typos between the reducer and the actions, we save them as
 * constants here. We prefix them with 'yourproject/YourComponent' so we avoid
 * reducers accidentally picking up actions they shouldn't.
 *
 * Follow this format:
 * export const YOUR_ACTION_CONSTANT = 'yourproject/YourContainer/YOUR_ACTION_CONSTANT';
 */

export const DEFAULT_LOCALE = 'en';

export const LOAD_PROJECT = 'jigglemap/App/LOAD_PROJECT';
export const LOAD_PROJECT_SUCCESS = 'jigglemap/App/LOAD_PROJECT_SUCCESS';
export const LOAD_PROJECT_ERROR = 'jigglemap/App/LOAD_PROJECT_ERROR';

export const ADD_ENTITY = 'jigglemap/App/ADD_ENTITY';

export const SET_SIDEBAR_ITEM = 'jigglemap/App/SET_SIDEBAR_ITEM';
