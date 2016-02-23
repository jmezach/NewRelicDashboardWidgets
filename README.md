#New Relic Dashboard Widgets#
This repository contains a collection of [Visual Studio Team Services (VSTS)](https://www.visualstudio.com/en-us/products/visual-studio-team-services-vs.aspx)
or [Team Foundation Server (TFS)](https://www.visualstudio.com/en-us/products/tfs-overview-vs.aspx)
dashboard widgets that can be used to pull in metrics from New Relic right into your VSTS/TFS dashboard.

## Supported widgets
The following widgets are currently supported:

* Server Status Widget

### Server Status Widget
This widget displays the current health status of a specific New Relic server, as well as a (configurable) key metric of that server.

![](NewRelicDashboardWidgets/img/preview.png)

The following configuration options are available:

![](NewRelicDashboardWidgets/img/configuration.png)

* **Name** - Name of the widget as it is displayed on the dashboard.
* **API Key** - A New Relic API key that can be used to access the [New Relic API](https://docs.newrelic.com/docs/apis/rest-api-v2/requirements/new-relic-rest-api-v2-getting-started).
* **Server** - After entering a New Relic API key this list will be populated with the available servers in your account. Then choose the server you want to see.
* **Metric** - Finally choose the metric you want displayed on the widget. The following options are available:
    * CPU
    * Disk I/O
    * Memory
    * Fullest Disk