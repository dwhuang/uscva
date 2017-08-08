## Files
- `sbills-feature_ids.json`

    Bill IDs satisfying the following filtering criteria:
    - Congress 109--115
    - Bill metadata contains either keyword: Taiwan, China
    - Bill was voted in the Senate

- `sbills-features.csv`

    Each row represents a congress member. The first column is the govtrack ID
of the congress member. From the second column on is a list of voting records,
where each column corresponds to a bill in the above json file
(in the same order). A value of 1 indicates an "yea" vote, -1 indicates a "nay", and
0 indicates a "present" vote or "did not vote". 

- `sbills-labeled_map.png`

    Labeled U-matrix visualization of a trained SOM. The labels are senator IDs.
    ![Labeled U-matrix](sbills-labeled_map.png)
