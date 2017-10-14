import { getToolById } from '../utils';

const makeSelectCameraPosition = () => (state) => state.editing.camera;
const makeSelectViewportSize = () => (state) => state.editing.viewportSize;
const makeSelectToolState = () => (state) => state.editing.toolState[state.editing.activeTool] || {};
const makeSelectActiveLayer = () => (state) => state.editing.activeLayer;
const makeSelectActiveTool = () => (state) => getToolById(state.editing.activeTool);
const makeSelectToolMeta = () => (state) => ({
  zoomLevel: state.editing.camera.z,
});

export {
  makeSelectCameraPosition,
  makeSelectViewportSize,
  makeSelectToolState,
  makeSelectActiveLayer,
  makeSelectActiveTool,
  makeSelectToolMeta,
};
