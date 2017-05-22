import fs from 'fs';
import Promise from 'bluebird';

export default Promise.promisifyAll(fs);
