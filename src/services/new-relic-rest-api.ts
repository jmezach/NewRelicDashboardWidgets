/// <reference path="../../typings/index.d.ts" />
import 'fetch';
import {autoinject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {AppInsightsManager} from './app-insights-manager';

export interface INewRelicRestApi {
    setApiKey(apiKey: string) : void;
    retrieveApplicationStatus(applicationId: string) : Promise<INewRelicApplication>;
    retrieveApplications(): Promise<INewRelicApplication[]>;
    retrieveServerStatus(serverId: string) : Promise<INewRelicServer>;
    retrieveServers() : Promise<INewRelicServer[]>;
}

export interface INewRelicApplication {
    id: number;
    name: string;
    language: string;
    health_status: string;
    reporting: boolean;
    last_reported_at: string;
    application_summary: INewRelicApplicationSummary;
}

export interface INewRelicApplicationSummary {
    response_time: number;
    throughput: number;
    error_rate: number;
    apdex_target: number;
    apdex_score: number;
    host_count: number;
    instance_count: number;
    concurrent_instance_count: number;
}

export interface INewRelicServer {
    id: string;
    account_id: number;
    name: string;
    host: string;
    health_status: string;
    reporting: boolean;
    last_reported_at: string;
    summary: INewRelicServerSummary;
}

export interface INewRelicServerSummary {
    cpu: number;
    cpu_stolen: number;
    disk_io: number;
    memory: number;
    memory_used: number;
    memory_total: number;
    fullest_disk: number;
    fullest_disk_free: number;
}

@autoinject()
export class NewRelicRestApi implements INewRelicRestApi {

    constructor(private client: HttpClient, private appInsightsManager: AppInsightsManager) {
    }

    setApiKey(newRelicApiKey: string) : void {
        this.client.configure(config => {
            config
                .withBaseUrl("https://api.newrelic.com/v2/")
                .withDefaults({
                    credentials: 'same-origin',
                    headers: {
                        'Accept': 'application/json',
                        'X-Api-Key': newRelicApiKey
                    }
                })
                .withInterceptor({
                    request(request) {
                        console.log(`Requesting ${request.method} ${request.url}`);
                        return request;
                    },
                    response(response) {
                        console.log(`Received ${response.status} ${response.url}`);
                        return response;
                    }
                })
        });
    }

    async retrieveApplicationStatus(applicationId: string) : Promise<INewRelicApplication> {
        let url = "applications.json?filter[ids]=" + applicationId;
        let applications = await this.retrieveApplicationData(url, "RetrieveApplicationStatus");
        return applications[0];
    }

    async retrieveApplications(): Promise<INewRelicApplication[]> {
        return this.retrieveApplicationData("applications.json", "RetrieveApplications");
    }

    private async retrieveApplicationData(url: string, eventName: string) : Promise<INewRelicApplication[]> {
        var response: Response = null;
        try {
            this.appInsightsManager.startTrackEvent(eventName);
            response = await this.client.fetch(url);
            this.appInsightsManager.stopTrackEvent(eventName, {
                "ok": response.ok.toString(),
                "status": response.status.toString(),
                "statusText": response.status.toString()
            });
        } catch (exception) {
            this.appInsightsManager.stopTrackEvent(eventName);
            this.appInsightsManager.trackException(exception);
            throw new Error(NewRelicErrorScenario[NewRelicErrorScenario.ErrorRetrievingData]);
        }

        if (response.ok) {
            let data = await response.json();
            if (data.applications !== undefined) {
                return data.applications;
            }
        } else if (response.status == 401) {
            throw new Error(NewRelicErrorScenario[NewRelicErrorScenario.InvalidAPIKey]);
        } else if (response.status == 403) {
            throw new Error(NewRelicErrorScenario[NewRelicErrorScenario.APIAccessDisabled]);
        } else {
            throw new Error(NewRelicErrorScenario[NewRelicErrorScenario.ErrorRetrievingData]);
        } 
    }

    async retrieveServerStatus(serverId: string) : Promise<INewRelicServer> {
        let url = "servers.json?filter[ids]=" + serverId;
        let servers = await this.retrieveServerData(url, "RetrieveServerStatus");
        return servers[0];
    }

    async retrieveServers() : Promise<INewRelicServer[]> {
        return this.retrieveServerData("servers.json", "RetrieveServers");
    }

    private async retrieveServerData(url: string, eventName: string) : Promise<INewRelicServer[]> {
        var response: Response = null;
        try {
            this.appInsightsManager.startTrackEvent(eventName);
            response = await this.client.fetch(url);
            this.appInsightsManager.stopTrackEvent(eventName, {
                "ok": response.ok.toString(),
                "status": response.status.toString(),
                "statusText": response.statusText.toString()
            });
        } catch (exception) {
            this.appInsightsManager.stopTrackEvent(eventName);
            this.appInsightsManager.trackException(exception);
            throw new Error(NewRelicErrorScenario[NewRelicErrorScenario.ErrorRetrievingData]);
        }
            
        if (response.ok) {
            let data = await response.json();
            if (data.servers !== undefined) {
                return data.servers;
            }
        } else if (response.status == 401) {
            throw new Error(NewRelicErrorScenario[NewRelicErrorScenario.InvalidAPIKey]);
        } else if (response.status == 403) {
            throw new Error(NewRelicErrorScenario[NewRelicErrorScenario.APIAccessDisabled]);
        } else {
            throw new Error(NewRelicErrorScenario[NewRelicErrorScenario.ErrorRetrievingData]);
        }
    }
}

export enum NewRelicErrorScenario {
    InvalidAPIKey,
    APIAccessDisabled,
    ErrorRetrievingData
}