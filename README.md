# Visualizing the Distributions of the US Congressional Votes for Taiwan-Related Bills and Amendments

This project visualizes the voting patterns of the US congress for Taiwan-related bills.
Each congress member is mapped to a location on a 2D map according to his or her voting history. 
**Congress members having similar voting history are mapped to nearby locations on the map, although their absolute locations are arbitrary.**
We focus on bill votes related to Taiwan only, that is, we restrict to bills containing keywords 'Taiwan' or 'China'.
The goal is to provide a quick overview of the distribution of congress members based on their Taiwan-related bill votes.

<h4><a href="https://dwhuang.github.io/uscva/v1/index.html" target="_blank">Take me to the visualizer now >>></a></h4>

## A Quick Introduction

![Sample Map](img/map.png)

In the above screenshot, each congress member is mapped to a cell based on 
his/her voting history for Taiwan-related bills. Congress members
who are mapped to nearby cells have generally similar voting history.
The background colors indicate parties:
red for Republicant, blue for Democrats, and green for other parties. 
A number marked in a cell indicates that multiple congress members are mapped
to the same cell, due to identical or very similar voting history. 

![Cell Info](img/cellinfo.png)

To see who are mapped in a cell, as well as some details about
their voting history, simply mouseover the cell. Voting history is visualized as
a color bar (see the picture above),
where green indicates that the congress member voted 'yes' to a bill,
red indicates a 'no' vote, gray indicates a present vote, and white indicates
no data, mostly likely due to ineligibility to vote.

To allow easy comparison, two cells can be selected (left-click) at the same time.
One can also use mouse drag and wheel to zoom and pan.

The dropdown menu at the top lists available datasets.

## Technical Details

The visualizations are made using self-organizing maps (SOMs), a class of neural network
that learns to project high-dimensional data onto a 2D surface in a nonlinear and topology-preserving fashion.

## References
- Data source: https://www.govtrack.us/developers
- Data format: https://github.com/unitedstates/congress/wiki/votes
- Glossary: https://www.senate.gov/reference/glossary.htm
