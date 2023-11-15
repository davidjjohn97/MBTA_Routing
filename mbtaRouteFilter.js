// API Key and URLs
const MBTA_API_KEY = "420933daeac64240910d8ec2f9ec2f3b"

const routesApiUrl = "https://api-v3.mbta.com/routes";

const routeApiUrl = `https://api-v3.mbta.com/stops?filter[route]=`;

// Creating types of acceptable routeTypes
const routeTypes = {
    LightRail: 0,
    HeavyRail: 1,
    CommuterRail: 2,
    Bus: 3,
    Ferry: 4,
};

// Function to get stops along a route
// Stops are mapped to improve performance by reducing number of API calls

async function getRouteStops(routeId, routeStopMap) {
    try {
        let stops = routeStopMap.get(routeId);
        if (!stops) {
            const response = await fetch(routeApiUrl + routeId);
            const data = await response.json();
            stops = data.data.map(stop => stop.attributes.name);
            routeStopMap.set(routeId, stops);
        }
        return stops;
    } catch (error) {
        console.error(`Error: Unable to fetch stops - ${error}`);
        return null;
    }
}


// Function to fetch routes by Type [Lightrail, Heavyrail etc]
async function getRoutesByType(inputTypes) {
    try {
        const response = await fetch(routesApiUrl);
        const data = await response.json();

        const routes = data.data
            .filter(route => inputTypes.includes(route.attributes.type))
            .map(route => ({ name: route.attributes.long_name, id: route.id }));
        return routes;
    } catch (error) {
        console.error(`Error: Unable to fetch data - ${error}`);
        return null;
    }
}


// Function to identify stops with multiple connections and return the multi-route stops
async function getRouteConnections(subwayRoutes, routeStopMap) {
    const connections = {};

    for (const route of subwayRoutes) {
        const stops = await getRouteStops(route.id, routeStopMap);

        stops.forEach(stop => {
            if (!connections[stop]) {
                connections[stop] = [];
            }
            connections[stop].push(route.name);
        });
    }

    const multiRouteStops = Object.entries(connections)
        .filter(([stop, routes]) => routes.length > 1)
        .map(([stop, routes]) => ({
            stop: stop,
            routes: routes,
        }));

    return multiRouteStops;
}


// Main function provides solution for 1: 
async function findMyTransit(inputType, startStop, endStop) {
    const subwayRoutes = await getRoutesByType(inputType);
    let routeStopMap = new Map();

    if (subwayRoutes) {
        let subWayRouteNames = []
        subwayRoutes.forEach(route => subWayRouteNames.push(route.name));
        
        console.log("***** TASK: 1 *******************************************************************************************");
        console.log("Subway Routes:", subWayRouteNames.join(', '));

        let maxStopsRoute;
        let maxStopsCount = 0;

        let minStopsRoute;
        let minStopsCount = Infinity;

        for (const route of subwayRoutes) {
            const stops = await getRouteStops(route.id, routeStopMap);

            if (stops.length > maxStopsCount) {
                maxStopsCount = stops.length;
                maxStopsRoute = route;
            }

            if (stops.length < minStopsCount) {
                minStopsCount = stops.length;
                minStopsRoute = route;
            }
        }


        console.log("***** TASK: 2.1 *******************************************************************************************");
        console.log(`Route with the most stops: ${maxStopsRoute.name} (${maxStopsCount} stops)`);

        console.log("***** TASK: 2.2 *******************************************************************************************");
        console.log(`Route with the fewest stops: ${minStopsRoute.name} (${minStopsCount} stops)`);

        // Creating a dictionary of route id and route names
        const routeData = new Map()
        for (const route of subwayRoutes) {
            if(!routeData.get(route.id)){
                routeData.set(route.id,route.name)
            }
        }

        const multiRouteStops = await getRouteConnections(subwayRoutes, routeStopMap);

        // Create Dictionary to hold Routes linked to a specific route 
        // (For Example: In MBTA, routeLinks for Orange Line would be Green Line E, Red Line and Blue Line )
        const routeLinks = new Map()

        console.log("***** TASK: 2.3 *******************************************************************************************");
        console.log("Stops connecting two or more routes:");
        multiRouteStops.forEach(stop => {
            console.log(`${stop.stop} is connected to routes: ${stop.routes.join(', ')}`);
            stop.routes.forEach(route => {
                let linkedRoutes = stop.routes.filter((rt) => rt != route)
                if(!routeLinks.get(route)){
                    routeLinks.set(route,linkedRoutes)
                } else {
                    let temp = routeLinks.get(route)
                    routeLinks.set(route,[...new Set(temp.concat(linkedRoutes))])
                }
            })

        });

        // Identifying which line the given start and stop stations belong to
        let startLine, endLine = null;

        for (let [key, value] of routeStopMap) {
                if(startLine == null && routeStopMap.get(key).includes(startStop)){startLine = key}
                if(endLine == null && routeStopMap.get(key).includes(endStop)){endLine = key}
            }

        // Getting Route Names from Route Ids
        let startLineName = routeData.get(startLine)
        let endLineName = routeData.get(endLine)


        // Store routes used to transit from given start and stop stations
        let travelPlan = [startLineName]

        // Links of start station routes
        let startRouteLinks = routeLinks.get(startLineName)
        while(startLine !== endLine){
            // Filter Links common to route of start and route of end
            const commonLink = routeLinks.get(startLineName).filter(value => routeLinks.get(endLineName).includes(value));
            if(routeLinks.get(startLineName).includes(endLineName)){
                // Break if End station is on a route linked to start station route
                travelPlan.push(routeData.get(endLine));
                break;
            } else if(commonLink){
                // Add the transit link to travel plan while considering the first common link
                travelPlan.push(routeData.get(commonLink[0]));
                travelPlan.push(routeData.get(endLine));
                break;
            } else {
                // Highly impossible edge case where no transit possible
                // No transit system is built to transit to more than 2 connection points
                // Other cases can be added to accomodate such generalised transit systems by changing startline to one of start stations linked routes
                startLine = startRouteLinks.shift();
                if(startLine == undefined){ 
                    console.log("Transit Not Possible");
                    break;
                }
            }
        }

        console.log("***** TASK: 3 *******************************************************************************************");
        console.log(travelPlan.join( ' => '));

    } else {
        console.log(`No Routes of Type ${inputType}`);
    }
}


// Input Parameters
let inputType = [routeTypes.LightRail, routeTypes.HeavyRail];
const startStop = "Ashmont";
const endStop = "Arlington";

// Calling the main function
findMyTransit(inputType, startStop, endStop);
