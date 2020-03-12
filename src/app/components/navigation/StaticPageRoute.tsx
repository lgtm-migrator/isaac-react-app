import {TrackedRoute} from "./TrackedRoute";
import {Generic} from "../pages/Generic";
import React from "react";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {RouteProps} from "react-router";

export interface StaticPageRouteProps {
    pageId?: string;
    ifUser?: (user: LoggedInUser) => boolean;
}

/**
 * N.B. This has to look to Switch like a Route (so use path and exact), else it will match when
 * it shouldn't. (Switch disregards JSX parsing rules.)
 */
function StaticPageRoute({pageId, ifUser, ...rest}: StaticPageRouteProps & RouteProps) {
    if (pageId === undefined) {
        if (rest.path === undefined || typeof rest.path !== 'string') {
            throw new Error("Can't get pageId for StaticPageRoute: " + JSON.stringify(rest));
        }
        pageId = rest.path.substr(1);
    }
    return <TrackedRoute {...rest} component={Generic} componentProps={{pageIdOverride: pageId}} />;
}

export default StaticPageRoute;
