#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Combine the results of VoteExtractor and BillFinder and produce the voting
history (as features) of each congress member.

Generate two files: a json file containing all relevant bill IDs and their
ordering as features, and a tsv file containing feature vectors for the 
congress members.
"""
import sys
import json
from collections import OrderedDict

class CongressMemberFeatures:
    def __init__(self, config):
        fname_vote_history = "{}/{}-votes.json".format(
            config['output_path'],
            config['name'],
        )
        fname_bill_ids = "{}/{}-bills.json".format(
            config['output_path'],
            config['name'],
        )

        self.config = config

        self.congress_members = self.read_vote_history(fname_vote_history)
        if len(self.congress_members) == 0:
            print("Congress member voting records not found")
            raise RuntimeError()

        self.bill_ids = self.read_bill_ids(fname_bill_ids)
        if len(self.bill_ids) == 0:
            print("Bill IDs not found")
            raise RuntimeError()


    def read_vote_history(self, fname):
        with open(fname, 'r') as fp:
            raw = json.load(fp)
        return raw


    def read_bill_ids(self, fname):
        with open(fname, 'r') as fp:
            raw = json.load(fp)
        return raw


    def gen(self):
        # remove unused bill_ids, since some bills were not meant to be voted
        bills_voted = set()
        for m in self.congress_members:
            for bill_voted in m['votes']:
                bills_voted.add(bill_voted)
        # intersect bills_voted with self.bill_ids
        bills = {}
        for id in self.bill_ids.keys():
            if id in bills_voted:
                bills[id] = self.bill_ids[id]
        # sort bill ids using congress number first and then bill type/number
        bills = sorted(bills.items(), key=lambda t: t[0].split('-')[::-1])
        bills = OrderedDict(bills)
        # create training samples
        samples = []
        for m in self.congress_members:
            sample = [m['id']]
            voted_any = False
            for bill_id in bills.keys():
                if bill_id in m['votes']:
                    sample.append(m['votes'][bill_id])
                    voted_any = True
                else:
                    sample.append('')
            if voted_any:
                samples.append(sample)

        with open(
            "{}/{}-features.tsv".format(
                self.config['output_path'],
                self.config['name'],
            ),
            'w',
        ) as fp:
            for sample in samples:
                print('\t'.join([str(s) for s in sample]), file=fp)

        with open(
            "{}/{}-feature_ids.json".format(
                self.config['output_path'],
                self.config['name'],
            ),
            'w',
        ) as fp:
            json.dump(bills, fp, indent=2)


def main(argv):
    if len(argv) < 2:
        print("Usage: {} config".format(argv[0]))
        print("  Generate feature files")
        return

    with open(argv[1], 'r') as fp:
        config = json.load(fp)
        CongressMemberFeatures(config).gen()


if __name__ == "__main__":
    main(sys.argv)
