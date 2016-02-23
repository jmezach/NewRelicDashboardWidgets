#New Relic Dashboard Widgets#
This extensions contains a collection of dashboard widgets that can be added to a dashboard in order to
display various metrics from New Relic.

## Supported widgets
The following widgets are currently supported:

* Server Status Widget

### Server Status Widget
This widget displays the current health status of a specific New Relic server, as well as a (configurable) key metric of that server.

![](img/preview.png)

The following configuration options are available:

![](img/configuration.png)

* **Name** - Name of the widget as it is displayed on the dashboard.
* **API Key** - A New Relic API key that can be used to access the [New Relic API](https://docs.newrelic.com/docs/apis/rest-api-v2/requirements/new-relic-rest-api-v2-getting-started).
* **Server** - After entering a New Relic API key this list will be populated with the available servers in your account. Then choose the server you want to see.
* **Metric** - Finally choose the metric you want displayed on the widget. The following options are available:
    * CPU
    * Disk I/O
    * Memory
    * Fullest Disk