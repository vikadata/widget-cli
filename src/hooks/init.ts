import axios from 'axios';
import { Hook } from '@oclif/config';
import * as chalk from 'chalk';

const hook: Hook<'init'> = async function() {
  axios.interceptors.request.use(config => {
    config.headers['X-Internal-Request'] = 'yes';
    return config;
  });
  axios.interceptors.response.use(function(response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    if (process.env.DEBUG) {
      console.log(chalk.redBright('Response Debug:'));
      console.log({
        config: response.config,
        responseData: response.data,
      });
    }
    return response;
  }, function(error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    console.log(chalk.redBright('Response Error:'));
    console.error({
      config: error.config,
      responseData: error.response?.data,
    });
    return Promise.reject(error);
  });

};

export default hook;
