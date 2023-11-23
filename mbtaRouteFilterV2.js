// Version 2 refactoring Transit path logic using graphs
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

// Function to fetch routes by Type [Lightrail, Heavyrail etc]
async function addStopsToRoutes(routes, routeStopMap) {
    try {
        let updatedRoutes = await Promise.all(routes.map(async (route) => {
            let stops = await getRouteStops(route.id, routeStopMap);
            return { ...route, stops };
        }));

        return updatedRoutes;
    } catch (error) {
        console.error("Error adding stops to routes:", error);
        throw error;
    }
}


class SubwaySystem {
    constructor(routes) {
        this.graph = this.buildGraph(routes);
    }

    buildGraph(routes) {
        const graph = {};

        routes.forEach(route => {
            const stops = route.stops;

            for (let i = 0; i < stops.length - 1; i++) {
                const currentStop = stops[i];
                const nextStop = stops[i + 1];

                if (!graph[currentStop]) {
                    graph[currentStop] = [];
                }

                graph[currentStop].push({
                    stop: nextStop,
                    route: route.name
                });

                if (!graph[nextStop]) {
                    graph[nextStop] = [];
                }

                graph[nextStop].push({
                    stop: currentStop,
                    route: route.name
                });
            }
        });

        return graph;
    }

    findPath(source, destination, visited = new Set(), path = []) {
        if (source === destination) {
            return path;
        }

        visited.add(source);

        for (const neighbor of this.graph[source] || []) {
            if (!visited.has(neighbor.stop)) {
                const result = this.findPath(neighbor.stop, destination, visited, [...path, neighbor.route]);
                if (result.length > 0) {
                    return result;
                }
            }
        }

        return [];
    }

    displayRailRoute(path) {
        if (path.length === 0) {
            console.log("No rail route found between the stops.");
        } else {
            let uPath = new Set(path)
            const routeString = Array.from(uPath).join(" => ");
            console.log(`Rail Route: ${routeString}`);
        }
    }
}


async function findMyTransit(inputType, startStop, endStop) {

    let routeStopMap = new Map();
    // Get the routes
    let routesData= await getRoutesByType(inputType);

    // Add stop data to each routes
    routesData = await addStopsToRoutes(routesData,routeStopMap)
    const subwaySystem = new SubwaySystem(routesData);  

    // Find the Path
    const path = subwaySystem.findPath(startStop, endStop);
    subwaySystem.displayRailRoute(path);
}

// Input Parameters
let inputType = [routeTypes.LightRail, routeTypes.HeavyRail];


// Add StartStop and EndStop 
const startStop = "Oak Grove";
const endStop = "Riverside";

// Calling the main function
findMyTransit(inputType, startStop, endStop);

