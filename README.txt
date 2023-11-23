#BROAD INSTITUTE SOFTWARE ENGINEERING TAKE HOME QUESTIONS - David Johnson

## Task 1: 
Write a program that retrieves data representing all, what we'll call "subway" routes: "Light Rail" (type 0) and “Heavy Rail” (type 1). The program should list their “long names” on the console. 
Partial example of long name output: Red Line, Blue Line, Orange Line... 
There are two ways to filter results for subway-only routes.

Think about the two options below and choose: 
1. Download all results from https://api-v3.mbta.com/routes then filter locally
2. Rely on the server API (i.e., https://api-v3.mbta.com/routes?filter[type]=0,1) to filter before results are received

## Task 2:
Extend your program so it displays the following additional information. 
1. The name of the subway route with the most stops as well as a count of its stops. 2. The name of the subway route with the fewest stops as well as a count of its stops.
3. A list of the stops that connect two or more subway routes along with the relevant route 

## Task 3:
Extend your program again such that the user can provide any two stops on the subway routes you listed for question 1. (Optimal Not required)


## Running the file
- To run the file kindly install node, you can refer to https://nodejs.org/en/download for the same
- use command "node mbtaRouteFilter.js" or "node mbtaRouteFilterV2.js" (for version 2)
- Type of route can be toggled in the same file by including respective enums of routeTypes, however in this case type 2 provides the required solution
- N.B update API Key received from https://api-v3.mbta.com/register

## Explanation for Task 1
### Client side filtering is used in this program due to following reasons:
    - Security: The first and most important reason why server side filtering was not considered is because the given data is publicly available
    - Volume of Data : Dataset is not very large
    - Performance: Client-side filter will offer more responsive output since filtering is handled locally

** Version 2 uses graph logic
