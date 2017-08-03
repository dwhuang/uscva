#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import json

class CongressMemberFeatures:
    def __init__(self, fname_vote_history, fname_bill_ids, output_path):
        self.congress_members = self.read_vote_history(fname_vote_history)
        self.bill_ids = set(self.read_bill_ids(fname_bill_ids))
        self.output_path = output_path
        #self.bill_indices = {}
        #for i, bill_id in enumerate(self.bill_ids):
        #    self.bill_indices[bill_id] = i


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
        bills = self.bill_ids.intersection(bills_voted)
        # create training samples
        samples = []
        for m in self.congress_members:
            sample = [m['id']]
            for bill_id in bills:
                if bill_id in m['votes']:
                    sample.append(m['votes'][bill_id])
                else:
                    sample.append(0)
            samples.append(sample)
        self.sanity_check(samples)

        with open(self.output_path + '/' + self.__class__.__name__ + '.output.csv', 'w') as fp:
            for sample in samples:
                print(','.join([str(s) for s in sample]), file=fp)


    def sanity_check(self, samples):
        # check if there are single-valued rows
        for sample in samples:
            single_valued = True
            val = sample[1]
            for feature in sample[2:]:
                if feature != val:
                    single_valued = False
                    break
            if single_valued:
                print(sample[0] + " has single-valued features")
        # check if there are single-valued columns
        cols = samples[0][1:]
        single_valued = [True] * len(cols)
        for sample in samples[1:]:
            for i, feature in enumerate(sample[1:]):
                if feature != cols[i]:
                    single_valued[i] = False
        single_valued_col_count = 0
        for i, sv in enumerate(single_valued):
            if sv:
                single_valued_col_count += 1
                print("feature {} has a single value only".format(i))


def main(argv):
    if len(argv) < 4:
        print("Usage: {} vote_extractor_output bill_finder_output output_path".format(argv[0]))
        print()
        print("Example: {} out/VoteExtractor.output.json out/BillFinder.output.json out".format(argv[0]))
        return

    CongressMemberFeatures(argv[1], argv[2], argv[3]).gen()


if __name__ == "__main__":
    main(sys.argv)
