# SOM
Yet another self-organizing map implementation

## Data file format
In TSV format. Each line represents an input sample to the SOM. 

The first column is the label/ID of the sample.
For example, a congress member's ID number. 

From the second column on is a list of numerical features.
Each feature must be convertable to a floating point data type.
For example, each column can be what the congress member voted regarding a bill:
-1 represents nay, 1 yea, and 0 didn't vote, etc.

Below is an example data file representing color data,
      where the features are R, G, and B values:

```
red     255 0   0
blue    0   0   255
green   0   255 0
white   255 255 255
purple  255 255 0
...
```
