## Files
- `CongressMemberFeatures.bills.json`

    Bill IDs satisfying the following filtering criteria:
    - Congress 109--115
    - Bill metadata contains either keyword: Taiwan, China
    - Bill has associated voting records

- `CongressMemberFeatures.output.csv`

    Each row represents a congress member. The first column is the govtrack ID
of the congress member. From the second column on is a list of voting records,
where each column corresponds to a bill in `CongressMemberFeatures.bills.json`
(in the same order). A value of 1 indicates an "yea" vote, -1 indicates a "nay", and
0 indicates a "present" vote or "did not vote". 
