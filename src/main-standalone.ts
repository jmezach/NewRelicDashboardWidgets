/// <reference path="../typings/index.d.ts" />
import {Aurelia} from 'aurelia-framework';
import {WidgetCoordinator} from './standalone/widget-coordinator'
import {WidgetWrapper} from './services/widget-wrapper'
import {WidgetConfigurationWrapper} from './services/widget-configuration-wrapper'
import {StandaloneWidgetWrapper} from './standalone/standalone-widget-wrapper'
import {StandaloneWidgetConfigurationWrapper} from './standalone/standalone-widget-configuration-wrapper'
import {AppInsightsManager} from './services/app-insights-manager';

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging();

  //Uncomment the line below to enable animation.
  //aurelia.use.plugin('aurelia-animator-css');

  //Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  //aurelia.use.plugin('aurelia-html-import-template-loader')
  
  let coordinator = new WidgetCoordinator();
  aurelia.container.registerInstance(WidgetCoordinator, coordinator);

  aurelia.container.registerInstance(WidgetWrapper, new StandaloneWidgetWrapper(coordinator));
  aurelia.container.registerInstance(WidgetConfigurationWrapper, new StandaloneWidgetConfigurationWrapper(coordinator));

  let extensionContext = { extensionId: "new-relic-dashboard-widgets-private" };
  let webContext = { account: { id: "1234567890" }, collection: { id: "1234567890" } };
  let appInsightsManager = new AppInsightsManager();
  appInsightsManager.init(<any>extensionContext, <any>webContext);
  aurelia.container.registerInstance(AppInsightsManager, appInsightsManager);

  let path = window.location.pathname;
  let page = path.split("/").pop();

  aurelia.start().then(() => {
      aurelia.setRoot('standalone/standalone');
  });
}