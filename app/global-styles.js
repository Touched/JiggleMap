import { injectGlobal } from 'styled-components';

import openSansLatin from './fonts/open-sans-latin.woff2';

/* eslint no-unused-expressions: 0 */
injectGlobal`
  @font-face {
    font-family: 'Open Sans';
    font-style: normal;
    font-weight: 400;
    src: local('Open Sans Regular'), local('OpenSans-Regular'), url(${openSansLatin}) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215;
  }

  html,
  body {
    height: 100%;
    width: 100%;
  }

  body {
    font-family: 'Open Sans', Helvetica, Arial, sans-serif;
    -webkit-user-select: none;
  }

  #app {
    background-color: #fafafa;
    min-height: 100%;
    min-width: 100%;
    display: flex;
    max-height: 100vh;
    overflow: hidden;
  }

  p,
  label {
    font-family: Georgia, Times, 'Times New Roman', serif;
    line-height: 1.5em;
  }
`;
