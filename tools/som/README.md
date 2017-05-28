### Data file format
Each line of a data file represents an input sample to the SOM. 
A line contains a number of columns/fields, separated by space characters.
The first column contains the ID/name of the sample.
For example, a congress member's ID number. 
From the second column on is a list of numerical features.
Each feature must be convertable to a floating point data type.
For example, each column can be what the congress member voted regarding a bill:
-1 represents voting against, 1 for voting for, and 0 for didn't vote, etc.
The ordering of the feature values must be consistent across all rows.
This also implies that all rows must have the same number of columns.
Below is an example data file representing color data,
      where the features are R, G, and B values:

```
red 255 0 0
blue 0 0 255
green 0 255 0
white 255 255 255
purple 255 255 0
...
```
