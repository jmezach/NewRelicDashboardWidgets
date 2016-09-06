/// <reference path="../../../../typings/index.d.ts" />
import {AppInsightsManager} from '../../../../src/services/app-insights-manager';

describe('the AppInsightsManager module', () => {
   var sut: AppInsightsManager;

   beforeEach(() => {
       let extensionContext = { extensionId: "test" };
       let webContext = { account: { id: "1234567890" }, collection: { id: "1234567890" } };

       sut = new AppInsightsManager();
       sut.init(<any>extensionContext, <any>webContext);
   })

   it ('can track a page view', () => {
       sut.trackPageView("AppStatusWidget");
   });

   it ('can track a page view with properties', () => {
       sut.trackPageView("AppStatusWidget", { "metricName": "cpu" });
   })

   it ('can track an event', () => {
       sut.trackEvent("AppStatusWidget.Refresh");
   })

   it ('can track an event with properties', () => {
       sut.trackEvent("AppStatusWidget.Refresh", { "healthStatus": "red" });
   })

   it ('can track an exception', () => {
       sut.trackException(new Error("Something went wrong"));
   });

   it ('can track long running events', () => {
       sut.startTrackEvent("AppStatusWidget.Refresh");
       sut.stopTrackEvent("AppStatusWidget.Refresh");
   });
});