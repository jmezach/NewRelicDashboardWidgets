/// <reference path="../typings/index.d.ts" />
import {Aurelia} from 'aurelia-framework';
import {AppInsightsManager} from './services/app-insights-manager';

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging();

  //Uncomment the line below to enable animation.
  //aurelia.use.plugin('aurelia-animator-css');

  //Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  //aurelia.use.splugin('aurelia-html-import-template-loader')

  let path = window.location.pathname;
  let page = path.split("/").pop();

  aurelia.start().then(() => {
      aurelia.setRoot('views/' + page.replace(".html", ""));
  });
}
